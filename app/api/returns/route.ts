import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { ReturnRequest } from '@/lib/types/ecommerce';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'returns.json');

declare global {
  var __otantikos_returns: ReturnRequest[] | undefined;
}

function getStoredReturns(): ReturnRequest[] {
  if (globalThis.__otantikos_returns && Array.isArray(globalThis.__otantikos_returns)) {
    return globalThis.__otantikos_returns;
  }
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__otantikos_returns = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading returns file:', err);
  }
  globalThis.__otantikos_returns = [];
  return [];
}

function saveStoredReturns(list: ReturnRequest[]) {
  globalThis.__otantikos_returns = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing returns file:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  // If requesting all returns without user_id, must be authenticated Admin
  if (!userId) {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    let query = supabase.from('returns').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  const stored = getStoredReturns();
  if (userId) {
    return NextResponse.json(stored.filter((r) => r.user_id === userId));
  }
  return NextResponse.json(stored);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, order_item_id, user_id, reason, details } = body;

    if (!order_id || !reason) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    const cleanReason = String(reason).trim().slice(0, 100);
    const cleanDetails = details ? String(details).trim().slice(0, 1000) : '';

    const newRet: ReturnRequest = {
      id: `ret-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id,
      order_item_id: order_item_id || null,
      user_id: user_id || null,
      reason: cleanReason,
      details: cleanDetails,
      status: 'talep_alindi',
      admin_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const list = getStoredReturns();
    list.unshift(newRet);
    saveStoredReturns(list);

    try {
      const supabase = createAdminClient();
      await supabase.from('returns').insert({
        order_id,
        order_item_id: newRet.order_item_id,
        user_id: newRet.user_id,
        reason: cleanReason,
        details: cleanDetails,
        status: 'talep_alindi',
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, return_request: newRet });
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
    const { id, status, admin_response } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik id veya status' }, { status: 400 });
    }

    const validStatuses = new Set(['talep_alindi', 'onaylandi', 'kargo_bekleniyor', 'inceleniyor', 'tamamlandi', 'reddedildi']);
    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: 'Geçersiz iade durumu' }, { status: 400 });
    }

    const list = getStoredReturns();
    const item = list.find((r) => r.id === id);
    if (item) {
      item.status = status;
      if (admin_response !== undefined) item.admin_response = String(admin_response).trim().slice(0, 1000);
      item.updated_at = new Date().toISOString();
      saveStoredReturns(list);
    }

    try {
      const supabase = createAdminClient();
      await supabase.from('returns').update({
        status,
        admin_response: admin_response !== undefined ? String(admin_response).trim().slice(0, 1000) : undefined,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, return_request: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
