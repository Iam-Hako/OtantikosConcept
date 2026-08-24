import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { WholesaleRequest } from '@/lib/types/ecommerce';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'wholesale_requests.json');

declare global {
  var __otantikos_wholesale_requests: WholesaleRequest[] | undefined;
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
        globalThis.__otantikos_wholesale_requests = parsed;
        return parsed;
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
  } catch (err) {
    console.error('Error writing wholesale file:', err);
  }
}

export async function GET() {
  // Admin Authentication Required to view customer wholesale leads
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('wholesale_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Supabase fallback
  }

  const stored = getStoredRequests();
  return NextResponse.json(stored);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contact_name, phone, address, notes, company_name, email, city } = body;

    const cleanContact = String(contact_name || company_name || '').trim().slice(0, 80);
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '').slice(0, 20);
    const cleanAddress = String(address || city || '').trim().slice(0, 300);
    const cleanNotes = notes ? String(notes).trim().slice(0, 2000) : '';
    const cleanEmail = email ? String(email).trim().toLowerCase().slice(0, 100) : '';

    if (!cleanContact) {
      return NextResponse.json({ error: 'Lütfen isim ve soyisim giriniz.' }, { status: 400 });
    }

    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Lütfen geçerli bir telefon numarası giriniz (en az 10 hane).' }, { status: 400 });
    }

    if (!cleanAddress) {
      return NextResponse.json({ error: 'Lütfen teslimat / şehir adresi giriniz.' }, { status: 400 });
    }

    const newReq: WholesaleRequest = {
      id: `ws-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      contact_name: cleanContact,
      company_name: cleanContact,
      phone: cleanPhone,
      address: cleanAddress,
      city: cleanAddress,
      email: cleanEmail,
      notes: cleanNotes,
      status: 'beklemede',
      admin_notes: '',
      created_at: new Date().toISOString(),
    };

    // 1. Save to server store immediately
    const list = getStoredRequests();
    list.unshift(newReq);
    saveStoredRequests(list);

    // 2. Attempt Supabase sync with admin client
    try {
      const supabase = createAdminClient();
      const fallbackEmail = cleanEmail || `${cleanPhone.replace(/\D/g, '') || 'talep'}@otantikosconcept.com`;
      const { data, error } = await supabase
        .from('wholesale_requests')
        .insert({
          company_name: cleanContact,
          contact_name: cleanContact,
          email: fallbackEmail,
          phone: cleanPhone,
          city: cleanAddress,
          notes: cleanNotes ? `[Adres: ${cleanAddress}] ${cleanNotes}` : `Adres: ${cleanAddress}`,
          status: 'beklemede',
        })
        .select('id')
        .maybeSingle();

      if (!error && data?.id) {
        newReq.id = data.id;
        saveStoredRequests(list);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, request: newReq });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  // Admin Authentication Required
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    const list = getStoredRequests();
    const reqItem = list.find((r) => r.id === id);
    if (reqItem) {
      if (status) reqItem.status = status;
      if (admin_notes !== undefined) reqItem.admin_notes = admin_notes;
      reqItem.updated_at = new Date().toISOString();
      saveStoredRequests(list);
    }

    try {
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const updateData: any = {};
        if (status) updateData.status = status;
        await supabase
          .from('wholesale_requests')
          .update(updateData)
          .eq('id', id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, request: reqItem });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // Admin Authentication Required
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    let list = getStoredRequests();
    list = list.filter((r) => r.id !== id);
    saveStoredRequests(list);

    try {
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await supabase
          .from('wholesale_requests')
          .delete()
          .eq('id', id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, message: 'Talep silindi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
