import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';
import { Review } from '@/lib/types/ecommerce';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'reviews.json');

declare global {
  var __otantikos_reviews: Review[] | undefined;
}

function getStoredReviews(): Review[] {
  if (globalThis.__otantikos_reviews && Array.isArray(globalThis.__otantikos_reviews)) {
    return globalThis.__otantikos_reviews;
  }
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__otantikos_reviews = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading reviews file:', err);
  }
  globalThis.__otantikos_reviews = [];
  return [];
}

function saveStoredReviews(list: Review[]) {
  globalThis.__otantikos_reviews = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing reviews file:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  // If requesting all reviews without product_id, must be authenticated Admin
  if (!productId) {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId).eq('is_approved', true);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  const stored = getStoredReviews();
  if (productId) {
    return NextResponse.json(stored.filter((r) => r.product_id === productId && r.is_approved));
  }
  return NextResponse.json(stored);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, user_name, user_id, rating, comment } = body;

    if (!product_id || !user_name || !comment) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    const cleanUserName = String(user_name).trim().slice(0, 80);
    const cleanComment = String(comment).trim().slice(0, 1000);
    const clampedRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const newRev: Review = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id,
      user_id: user_id && UUID_REGEX.test(user_id) ? user_id : null,
      user_name: cleanUserName,
      rating: clampedRating,
      comment: cleanComment,
      is_approved: false, // Requires admin moderation
      created_at: new Date().toISOString(),
    };

    const list = getStoredReviews();
    list.unshift(newRev);
    saveStoredReviews(list);

    try {
      const supabase = createAdminClient();
      let prodDbId = product_id;
      if (!UUID_REGEX.test(product_id)) {
        const { data: pFound } = await supabase.from('products').select('id').eq('slug', product_id).maybeSingle();
        if (pFound?.id) prodDbId = pFound.id;
      }

      if (UUID_REGEX.test(prodDbId)) {
        const { data: insData } = await supabase.from('reviews').insert({
          product_id: prodDbId,
          user_id: newRev.user_id,
          user_name: cleanUserName,
          rating: clampedRating,
          comment: cleanComment,
          is_approved: false,
        }).select('id').maybeSingle();

        if (insData?.id) {
          newRev.id = insData.id;
          saveStoredReviews(list);
        }
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, review: newRev });
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
    const { id, is_approved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    const list = getStoredReviews();
    const item = list.find((r) => r.id === id);
    if (item) {
      item.is_approved = Boolean(is_approved);
      saveStoredReviews(list);
    }

    try {
      const supabase = createAdminClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(id)) {
        await supabase.from('reviews').update({ is_approved: Boolean(is_approved) }).eq('id', id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, review: item });
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

    let list = getStoredReviews();
    list = list.filter((r) => r.id !== id);
    saveStoredReviews(list);

    try {
      const supabase = createAdminClient();
      const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (UUID_REGEX.test(id)) {
        await supabase.from('reviews').delete().eq('id', id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, message: 'Yorum silindi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
