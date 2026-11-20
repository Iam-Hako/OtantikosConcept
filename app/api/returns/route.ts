import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyAdminAuth, getAuthenticatedSessionUser } from '@/lib/supabase/auth-guard';
import { DataService } from '@/lib/data/store-data';
import { ReturnRequest } from '@/lib/types/ecommerce';
import { applyRateLimit } from '@/lib/security/rate-limit';
import { sanitizeInput } from '@/lib/security/sanitize';

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
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Verify caller authorization
    const auth = await verifyAdminAuth();
    if (!userId) {
      // If requesting all returns without user_id, must be authenticated Admin
      if (!auth.isAuthorized) {
        return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
      }
    } else if (!auth.isAuthorized && (!auth.user || auth.user.id !== userId)) {
      // Non-admin can only query their own user_id
      return NextResponse.json({ error: 'Yalnızca kendi iade taleplerinizi görüntüleyebilirsiniz.' }, { status: 403 });
    }

    let dbData: any[] | null = null;
    try {
      const supabase = createAdminClient();
      let query = supabase.from('returns').select('*').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      }
      const { data, error } = await query;
      if (!error && data) {
        dbData = data;
      }
    } catch {
      // Fallback
    }

    if (!dbData || dbData.length === 0) {
      try {
        const serverSupabase = await createServerClient();
        let query = serverSupabase.from('returns').select('*').order('created_at', { ascending: false });
        if (userId) {
          query = query.eq('user_id', userId);
        }
        const { data, error } = await query;
        if (!error && data) {
          dbData = data;
        }
      } catch {
        // Fallback
      }
    }

    const stored = getStoredReturns();
    const mergedMap = new Map<string, any>();
    (dbData || []).forEach((r) => mergedMap.set(r.id, r));
    stored.forEach((r) => {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    });
    const merged = Array.from(mergedMap.values());
    if (userId) {
      return NextResponse.json(merged.filter((r) => r.user_id === userId));
    }
    return NextResponse.json(merged);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'İade talepleri getirilemedi.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 5 return requests per 5 minutes per IP
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'return-request',
      limit: 5,
      windowSeconds: 300,
      errorMessage: 'Çok fazla iade talebi gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const { order_id, order_item_id, user_id, reason, details } = body;

    if (!order_id || !reason) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    const cleanReason = sanitizeInput(reason, 100);
    const cleanDetails = details ? sanitizeInput(details, 1000) : '';
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Prevent duplicate open return requests for the same order
    const list = getStoredReturns();
    const existingOpenReturn = list.find(
      (r) =>
        r.order_id === order_id &&
        (order_item_id ? r.order_item_id === order_item_id : true) &&
        r.status !== 'reddedildi' &&
        r.status !== 'tamamlandi'
    );
    if (existingOpenReturn) {
      return NextResponse.json({
        error: 'Bu sipariş için halen işlemde olan bir iade talebiniz bulunmaktadır.',
        existing_return: existingOpenReturn,
      }, { status: 409 });
    }

    const sessionUser = await getAuthenticatedSessionUser();
    const verifiedUserId = sessionUser?.id && UUID_REGEX.test(sessionUser.id) ? sessionUser.id : null;
    const generatedId = crypto.randomUUID();

    const newRet: ReturnRequest = {
      id: generatedId,
      order_id,
      order_item_id: order_item_id || null,
      user_id: verifiedUserId,
      reason: cleanReason,
      details: cleanDetails,
      status: 'talep_alindi',
      admin_response: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    list.unshift(newRet);
    saveStoredReturns(list);

    try {
      const supabase = createAdminClient();
      let orderDbId = order_id;
      if (!UUID_REGEX.test(order_id)) {
        const { data: ordFound } = await supabase.from('orders').select('id').eq('order_number', order_id).maybeSingle();
        if (ordFound?.id) orderDbId = ordFound.id;
      }

      if (UUID_REGEX.test(orderDbId)) {
        await supabase.from('returns').insert({
          id: generatedId,
          order_id: orderDbId,
          order_item_id: newRet.order_item_id && UUID_REGEX.test(newRet.order_item_id) ? newRet.order_item_id : null,
          user_id: newRet.user_id,
          reason: cleanReason,
          details: cleanDetails,
          status: 'talep_alindi',
        });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, return_request: newRet });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Admin Authentication Required
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, admin_response } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Eksik id veya status' }, { status: 400 });
    }

    // Synchronize via central DataService (performs automatic restock if iade_edildi)
    await DataService.updateReturnStatus(id, status, admin_response);

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
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let validDbStatus = status;
      if (status === 'kargo_bekleniyor' || status === 'inceleniyor') validDbStatus = 'talep_alindi';

      if (UUID_REGEX.test(id)) {
        await supabase.from('returns').update({
          status: validDbStatus,
          admin_response: admin_response !== undefined ? String(admin_response).trim().slice(0, 1000) : undefined,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, return_request: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
