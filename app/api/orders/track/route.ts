import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyAdminAuth, getAuthenticatedSessionUser } from '@/lib/supabase/auth-guard';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
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
  if (local.length <= 2) return `${local[0] || '*'}*@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
}

function maskTextWords(text?: string | null, keepFirstWords = 0): string {
  if (!text) return '';
  return text
    .split(/\s+/)
    .map((w, idx) => (idx >= keepFirstWords && w.length > 2 ? `${w.slice(0, 2)}***` : w))
    .join(' ');
}

function matchesOrderVerification(ord: any, verification: string): boolean {
  const q = normalizeTurkish(verification.trim());
  if (!q || q.length < 3) return false;

  const guestEmail = (ord.guest_email || '').trim().toLowerCase();
  if (guestEmail && guestEmail === verification.trim().toLowerCase()) {
    return true;
  }

  const fullName = normalizeTurkish(ord.shipping_address?.full_name || ord.guest_name || '');
  if (!fullName) return false;
  if (fullName === q) return true;

  // Also allow matching by full first name or full last name token (min 3 chars)
  const nameTokens = fullName.split(/\s+/).filter((tok) => tok.length >= 3);
  return nameTokens.some((tok) => tok === q);
}

export async function GET(request: Request) {
  try {
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'order-track',
      limit: 20,
      windowSeconds: 60,
      errorMessage: 'Çok fazla sipariş sorgusu yapıldı. Lütfen bir süre sonra tekrar deneyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const rawOrderParam = searchParams.get('order_number') || searchParams.get('siparis') || '';
    const emailOrName = searchParams.get('email') || '';

    if (!rawOrderParam.trim()) {
      return NextResponse.json({ error: 'Sipariş numarası gereklidir.' }, { status: 400 });
    }

    const cleanRaw = sanitizeInput(rawOrderParam, 50).trim();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanRaw);
    const cleanNumber = isUuid ? cleanRaw.toLowerCase() : cleanRaw.toUpperCase();
    const cleanVerification = sanitizeInput(emailOrName, 100).trim();

    const auth = await verifyAdminAuth();
    const isAdmin = auth.isAuthorized;
    const sessionUser = auth.user || (await getAuthenticatedSessionUser());

    const isSessionOwnerOfOrder = (ord: any): boolean => {
      if (!sessionUser || !ord) return false;
      if (ord.user_id && sessionUser.id && ord.user_id === sessionUser.id) return true;
      if (
        sessionUser.email &&
        ord.guest_email &&
        String(ord.guest_email).trim().toLowerCase() === String(sessionUser.email).trim().toLowerCase()
      ) {
        return true;
      }
      return false;
    };

    const sanitizeOrderResponse = (ord: any, isOwner: boolean) => {
      if (isAdmin) return ord;
      if (isOwner) {
        const { admin_notes: _adminNotes, ...rest } = ord;
        return rest;
      }
      return {
        ...ord,
        user_id: null,
        admin_notes: null,
        guest_email: ord.guest_email ? maskEmail(ord.guest_email) : null,
        guest_phone: ord.guest_phone ? maskPhone(ord.guest_phone) : null,
        shipping_address: ord.shipping_address
          ? {
              ...ord.shipping_address,
              full_name: maskTextWords(ord.shipping_address.full_name, 0),
              full_address: maskTextWords(ord.shipping_address.full_address, 1),
              address_detail: maskTextWords(ord.shipping_address.address_detail, 1),
              phone: maskPhone(ord.shipping_address.phone),
              identity_number: undefined,
              tax_number: undefined,
            }
          : ord.shipping_address,
        billing_address: undefined,
      };
    };

    let foundOrder: any = null;

    const queryOrderFromClient = async (client: any) => {
      const selectWithSlug = '*, items:order_items(*, product:products(slug))';
      const selectBase = '*, items:order_items(*)';

      const tryFetch = async (col: string, val: string) => {
        const res1 = await client.from('orders').select(selectWithSlug).eq(col, val).maybeSingle();
        if (!res1.error) return res1.data;
        const res2 = await client.from('orders').select(selectBase).eq(col, val).maybeSingle();
        return !res2.error ? res2.data : null;
      };

      if (isUuid) {
        return await tryFetch('id', cleanNumber);
      }
      const byOrderNo = await tryFetch('order_number', cleanNumber);
      if (byOrderNo) return byOrderNo;
      // Also allow looking up directly by cargo tracking_number
      const byTrackNo = await tryFetch('tracking_number', cleanRaw);
      if (byTrackNo) return byTrackNo;
      if (cleanNumber !== cleanRaw) {
        return await tryFetch('tracking_number', cleanNumber);
      }
      return null;
    };

    // 1. Try Supabase with Admin Client
    try {
      const supabase = createAdminClient();
      foundOrder = await queryOrderFromClient(supabase);
      if (foundOrder && Array.isArray(foundOrder.items)) {
        for (const it of foundOrder.items) {
          if (!it.product_slug && it.product?.slug) {
            it.product_slug = it.product.slug;
          }
        }
      }
    } catch {
      // Fallback
    }

    // 2. Try Supabase with SSR Cookie Client
    if (!foundOrder) {
      try {
        const serverSupabase = await createServerClient();
        foundOrder = await queryOrderFromClient(serverSupabase);
        if (foundOrder && Array.isArray(foundOrder.items)) {
          for (const it of foundOrder.items) {
            if (!it.product_slug && it.product?.slug) {
              it.product_slug = it.product.slug;
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    // 3. Fallback to in-memory store
    if (!foundOrder) {
      const allOrders = await DataService.getOrders();
      foundOrder =
        allOrders.find(
          (o) =>
            o.id.toLowerCase() === cleanNumber.toLowerCase() ||
            o.order_number.toUpperCase() === cleanNumber.toUpperCase() ||
            (o.tracking_number || '').trim().toUpperCase() === cleanNumber.toUpperCase()
        ) || null;
    }

    if (!foundOrder) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    const isOwner = isSessionOwnerOfOrder(foundOrder);

    if (!isAdmin && !isOwner) {
      if (!cleanVerification || cleanVerification.length < 3) {
        return NextResponse.json(
          { error: 'Güvenlik doğrulaması için sipariş e-posta adresinizi veya alıcı adını giriniz.' },
          { status: 400 }
        );
      }
      if (!matchesOrderVerification(foundOrder, cleanVerification)) {
        return NextResponse.json(
          { error: 'E-posta veya alıcı adı sipariş ile eşleşmiyor.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: sanitizeOrderResponse(foundOrder, isOwner),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sipariş sorgulanamadı.' }, { status: 500 });
  }
}
