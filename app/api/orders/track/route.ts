import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { DataService } from '@/lib/data/store-data';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { sanitizeInput } from '@/lib/security/sanitize';

function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 7) {
    return `${digits.slice(0, 4)} *** ** ${digits.slice(-2)}`;
  }
  return '***';
}

function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

export async function GET(request: Request) {
  try {
    // 1. Rate Limiting: Max 15 lookups per minute per IP to prevent order enumeration
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'order-track',
      limit: 15,
      windowSeconds: 60,
      errorMessage: 'Çok fazla sipariş sorgusu yapıldı. Lütfen bir süre sonra tekrar deneyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number') || searchParams.get('siparis') || '';
    const emailOrName = searchParams.get('email') || '';

    if (!orderNumber.trim()) {
      return NextResponse.json({ error: 'Sipariş numarası gereklidir.' }, { status: 400 });
    }

    const cleanNumber = sanitizeInput(orderNumber, 40).toUpperCase();
    const cleanVerification = sanitizeInput(emailOrName, 100);

    // Verify if caller is an authorized admin
    const auth = await verifyAdminAuth();
    const isAdmin = auth.isAuthorized;

    // Non-admin callers MUST provide verification (at least 2 characters)
    if (!isAdmin) {
      if (!cleanVerification || cleanVerification.length < 2) {
        return NextResponse.json(
          { error: 'Güvenlik doğrulaması için alıcı adı veya e-posta adresi zorunludur.' },
          { status: 400 }
        );
      }
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanNumber);

    // Helper to sanitize public response
    const sanitizeOrderForPublic = (ord: any) => {
      if (isAdmin) return ord;
      return {
        ...ord,
        guest_email: ord.guest_email ? maskEmail(ord.guest_email) : null,
        guest_phone: ord.guest_phone ? maskPhone(ord.guest_phone) : null,
        shipping_address: ord.shipping_address
          ? {
              ...ord.shipping_address,
              phone: maskPhone(ord.shipping_address.phone),
            }
          : ord.shipping_address,
        billing_address: undefined, // Hide billing identity for public tracking
      };
    };

    // 1. Try Supabase with Admin Client
    try {
      const supabase = createAdminClient();
      let query = supabase.from('orders').select('*, items:order_items(*)');
      if (isUuid) {
        query = query.eq('id', cleanNumber);
      } else {
        query = query.eq('order_number', cleanNumber);
      }
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        if (!isAdmin) {
          const q = cleanVerification.toLowerCase();
          const guestEmail = (data.guest_email || '').toLowerCase();
          const name = (data.shipping_address?.full_name || '').toLowerCase();
          if (!guestEmail.includes(q) && !name.includes(q)) {
            return NextResponse.json({ error: 'E-posta veya isim sipariş ile eşleşmiyor.' }, { status: 403 });
          }
        }
        return NextResponse.json({ success: true, order: sanitizeOrderForPublic(data) });
      }
    } catch {
      // Fallback to in-memory store
    }

    // 2. Fallback to store data service
    const localOrder = await DataService.getOrderById(cleanNumber);
    if (localOrder) {
      if (!isAdmin) {
        const q = cleanVerification.toLowerCase();
        const guestEmail = (localOrder.guest_email || '').toLowerCase();
        const name = (localOrder.shipping_address?.full_name || '').toLowerCase();
        if (!guestEmail.includes(q) && !name.includes(q)) {
          return NextResponse.json({ error: 'E-posta veya isim sipariş ile eşleşmiyor.' }, { status: 403 });
        }
      }
      return NextResponse.json({ success: true, order: sanitizeOrderForPublic(localOrder) });
    }

    return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sipariş sorgulanamadı.' }, { status: 500 });
  }
}
