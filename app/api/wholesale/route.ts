import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { WholesaleRequest } from '@/lib/types/ecommerce';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { sanitizeInput, isValidEmail } from '@/lib/security/sanitize';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'wholesale_requests.json');

declare global {
  var __otantikos_wholesale_requests: WholesaleRequest[] | undefined;
}

function normalizeWholesaleRow(r: any): WholesaleRequest {
  const rawNotes = String(r.notes || '');
  let extractedAddress = r.address || r.city || '';
  let cleanNotes = rawNotes;

  const bracketMatch = rawNotes.match(/^\[Adres:\s*([^\]]+)\]\s*([\s\S]*)$/);
  if (bracketMatch) {
    if (!extractedAddress) extractedAddress = bracketMatch[1].trim();
    cleanNotes = bracketMatch[2].trim();
  } else if (rawNotes.startsWith('Adres:')) {
    const addrOnly = rawNotes.replace(/^Adres:\s*/i, '').trim();
    if (!extractedAddress) extractedAddress = addrOnly;
    if (cleanNotes === `Adres: ${extractedAddress}`) {
      cleanNotes = '';
    }
  }

  return {
    id: r.id,
    company_name: r.company_name || r.contact_name || 'Müşteri',
    contact_name: r.contact_name || r.company_name || 'Müşteri',
    email: r.email || '',
    phone: r.phone || '',
    city: r.city || extractedAddress || '',
    address: extractedAddress || r.city || '',
    estimated_volume: r.estimated_volume || undefined,
    notes: cleanNotes,
    admin_notes: r.admin_notes || '',
    status: r.status || 'beklemede',
    created_at: r.created_at || new Date().toISOString(),
    updated_at: r.updated_at || undefined,
  };
}

function getStoredRequests(): WholesaleRequest[] {
  if (globalThis.__otantikos_wholesale_requests && Array.isArray(globalThis.__otantikos_wholesale_requests)) {
    return globalThis.__otantikos_wholesale_requests;
  }
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeWholesaleRow);
        globalThis.__otantikos_wholesale_requests = normalized;
        return normalized;
      }
    }
  } catch (err) {
    console.error('Error reading wholesale file:', err);
  }
  globalThis.__otantikos_wholesale_requests = [];
  return [];
}

function saveStoredRequests(list: WholesaleRequest[]) {
  globalThis.__otantikos_wholesale_requests = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch {
    // Ignore read-only filesystem on serverless
  }
}

export async function GET() {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }

    let dbRows: WholesaleRequest[] = [];

    // 1. Try with Admin / JWT-forwarded Client
    try {
      const supabaseAdmin = createAdminClient();
      const { data, error } = await supabaseAdmin
        .from('wholesale_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        dbRows = data.map(normalizeWholesaleRow);
      }
    } catch {
      // Fallback
    }

    // 2. If empty, also try with explicit SSR cookie client
    if (dbRows.length === 0) {
      try {
        const serverSupabase = await createServerClient();
        const { data, error } = await serverSupabase
          .from('wholesale_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          dbRows = data.map(normalizeWholesaleRow);
        }
      } catch {
        // Fallback
      }
    }

    // Merge DB rows with any in-memory/file stored fallback rows (deduplicated by id)
    const stored = getStoredRequests();
    const mergedMap = new Map<string, WholesaleRequest>();
    for (const item of dbRows) {
      if (item && item.id) mergedMap.set(item.id, item);
    }
    for (const item of stored) {
      if (item && item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, normalizeWholesaleRow(item));
      }
    }

    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Talepler alınamadı.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'wholesale-request',
      limit: 5,
      windowSeconds: 300,
      errorMessage: 'Çok fazla toptan teklif talebi gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { contact_name, phone, address, notes, company_name, email, city, estimated_volume } = body;

    const cleanContact = sanitizeInput(contact_name || company_name || '', 80);
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '').slice(0, 20);
    const cleanAddress = sanitizeInput(address || city || '', 300);
    const cleanNotes = notes ? sanitizeInput(notes, 2000) : '';
    const cleanEmail = email && isValidEmail(email) ? String(email).trim().toLowerCase().slice(0, 100) : '';

    if (!cleanContact) {
      return NextResponse.json({ error: 'Lütfen isim ve soyisim giriniz.' }, { status: 400 });
    }

    const digits = String(phone || '').replace(/\D/g, '');
    const isValidPhone =
      (digits.length === 11 && digits.startsWith('05')) ||
      (digits.length === 10 && digits.startsWith('5')) ||
      (digits.length === 12 && digits.startsWith('905'));

    if (!isValidPhone) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir cep telefonu numarası giriniz (05XX XXX XX XX formatında).' },
        { status: 400 }
      );
    }

    const std11 =
      digits.length === 12 && digits.startsWith('905')
        ? '0' + digits.slice(2)
        : digits.length === 10 && digits.startsWith('5')
        ? '0' + digits
        : digits;
    const formattedPhone = `${std11.slice(0, 4)} ${std11.slice(4, 7)} ${std11.slice(7, 9)} ${std11.slice(9, 11)}`;

    if (!cleanAddress) {
      return NextResponse.json({ error: 'Lütfen teslimat / şehir adresi giriniz.' }, { status: 400 });
    }

    // Generate a real UUID v4 upfront so INSERT never needs .select('id') (which would trigger SELECT RLS and fail for non-admin visitors!)
    const reqUuid = crypto.randomUUID();
    const fallbackEmail = cleanEmail || `${std11 || 'talep'}@otantikosconcept.com`;
    const nowIso = new Date().toISOString();

    const newReq: WholesaleRequest = {
      id: reqUuid,
      contact_name: cleanContact,
      company_name: cleanContact,
      phone: formattedPhone,
      address: cleanAddress,
      city: cleanAddress,
      email: fallbackEmail,
      notes: cleanNotes,
      status: 'beklemede',
      admin_notes: '',
      created_at: nowIso,
    };

    // 1. Save to server memory/file store immediately
    const list = getStoredRequests();
    list.unshift(newReq);
    saveStoredRequests(list);

    // 2. Persist to Supabase WITHOUT .select() so INSERT RLS ("WITH CHECK (TRUE)") succeeds for all visitors
    let savedToDb = false;
    try {
      const supabase = createAdminClient();
      const insertPayload: Record<string, any> = {
        id: reqUuid,
        company_name: cleanContact,
        contact_name: cleanContact,
        email: fallbackEmail,
        phone: formattedPhone,
        city: cleanAddress,
        estimated_volume: estimated_volume ? sanitizeInput(String(estimated_volume), 100) : 'Belirtilmedi',
        notes: cleanNotes || `Teslimat Adresi: ${cleanAddress}`,
        status: 'beklemede',
      };

      let { error } = await supabase.from('wholesale_requests').insert(insertPayload);

      // Retry without estimated_volume if column doesn't exist in older schema
      if (error && error.message?.includes('estimated_volume')) {
        delete insertPayload.estimated_volume;
        const retry = await supabase.from('wholesale_requests').insert(insertPayload);
        error = retry.error;
      }

      if (!error) {
        savedToDb = true;
      } else {
        console.error('[Wholesale POST Supabase Insert Error]', error.message);
      }
    } catch (dbErr) {
      console.error('[Wholesale POST Exception]', dbErr);
    }

    try {
      revalidatePath('/admin/toptan-talepler');
      revalidatePath('/admin');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, request: newReq, savedToDb });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const list = getStoredRequests();
    const reqItem = list.find((r) => r.id === id);
    if (reqItem) {
      if (status) reqItem.status = status;
      if (admin_notes !== undefined) reqItem.admin_notes = admin_notes;
      reqItem.updated_at = nowIso;
      saveStoredRequests(list);
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const updateData: Record<string, any> = { updated_at: nowIso };
      if (status) updateData.status = status;
      if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

      try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('wholesale_requests').update(updateData).eq('id', id);
        if (error) {
          const serverSupabase = await createServerClient();
          await serverSupabase.from('wholesale_requests').update(updateData).eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    try {
      revalidatePath('/admin/toptan-talepler');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, request: reqItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    let list = getStoredRequests();
    list = list.filter((r) => r.id !== id);
    saveStoredRequests(list);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin.from('wholesale_requests').delete().eq('id', id);
        if (error) {
          const serverSupabase = await createServerClient();
          await serverSupabase.from('wholesale_requests').delete().eq('id', id);
        }
      } catch {
        // Fallback
      }
    }

    try {
      revalidatePath('/admin/toptan-talepler');
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true, message: 'Talep silindi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
