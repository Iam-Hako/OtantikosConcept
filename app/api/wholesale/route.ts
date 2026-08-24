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
    const { company_name, contact_name, email, phone, city, estimated_volume, notes } = body;

    if (!company_name || !contact_name || !email || !phone || !city) {
      return NextResponse.json({ error: 'Eksik zorunlu alanlar' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json({ error: 'Geçersiz e-posta formatı' }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/[^\d+]/g, '').slice(0, 20);
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Geçersiz telefon numarası' }, { status: 400 });
    }

    const cleanCompany = String(company_name).trim().slice(0, 100);
    const cleanContact = String(contact_name).trim().slice(0, 80);
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 100);
    const cleanCity = String(city).trim().slice(0, 50);
    const cleanVolume = estimated_volume ? String(estimated_volume).trim().slice(0, 50) : '100 - 500 Adet';
    const cleanNotes = notes ? String(notes).trim().slice(0, 2000) : '';

    const newReq: WholesaleRequest = {
      id: `ws-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      company_name: cleanCompany,
      contact_name: cleanContact,
      email: cleanEmail,
      phone: cleanPhone,
      city: cleanCity,
      estimated_volume: cleanVolume,
      notes: cleanNotes,
      status: 'beklemede',
      created_at: new Date().toISOString(),
    };

    // 1. Save to server store immediately
    const list = getStoredRequests();
    list.unshift(newReq);
    saveStoredRequests(list);

    // 2. Attempt Supabase sync with admin client
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('wholesale_requests')
        .insert({
          company_name: cleanCompany,
          contact_name: cleanContact,
          email: cleanEmail,
          phone: cleanPhone,
          city: cleanCity,
          estimated_volume: cleanVolume,
          notes: cleanNotes,
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik id veya status' }, { status: 400 });
    }

    const list = getStoredRequests();
    const reqItem = list.find((r) => r.id === id);
    if (reqItem) {
      reqItem.status = status;
      saveStoredRequests(list);
    }

    try {
      const supabase = createAdminClient();
      await supabase
        .from('wholesale_requests')
        .update({ status })
        .eq('id', id);
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
      await supabase
        .from('wholesale_requests')
        .delete()
        .eq('id', id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, message: 'Talep silindi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
