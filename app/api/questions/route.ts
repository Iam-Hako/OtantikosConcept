import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { Question } from '@/lib/types/ecommerce';

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'questions.json');

declare global {
  var __otantikos_questions: Question[] | undefined;
}

function getStoredQuestions(): Question[] {
  if (globalThis.__otantikos_questions && Array.isArray(globalThis.__otantikos_questions)) {
    return globalThis.__otantikos_questions;
  }
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__otantikos_questions = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading questions file:', err);
  }
  globalThis.__otantikos_questions = [];
  return [];
}

function saveStoredQuestions(list: Question[]) {
  globalThis.__otantikos_questions = list;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing questions file:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');

  try {
    const supabase = createAdminClient();
    let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
    if (productId) {
      query = query.eq('product_id', productId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  const stored = getStoredQuestions();
  if (productId) {
    return NextResponse.json(stored.filter((q) => q.product_id === productId));
  }
  return NextResponse.json(stored);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, user_name, user_email, user_id, question_text } = body;

    if (!product_id || !user_name || !question_text) {
      return NextResponse.json({ error: 'Eksik alanlar' }, { status: 400 });
    }

    const newQ: Question = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      product_id,
      user_id: user_id || null,
      user_name,
      user_email: user_email || null,
      question_text,
      answer_text: null,
      is_approved: false,
      created_at: new Date().toISOString(),
      answered_at: null,
    };

    const list = getStoredQuestions();
    list.unshift(newQ);
    saveStoredQuestions(list);

    try {
      const supabase = createAdminClient();
      await supabase.from('questions').insert({
        product_id,
        user_id: newQ.user_id,
        user_name,
        user_email: newQ.user_email,
        question_text,
        is_approved: false,
      });
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, question: newQ });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, answer_text, is_approved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    const list = getStoredQuestions();
    const item = list.find((q) => q.id === id);
    if (item) {
      if (answer_text !== undefined) {
        item.answer_text = answer_text;
        item.answered_at = new Date().toISOString();
      }
      if (is_approved !== undefined) {
        item.is_approved = Boolean(is_approved);
      }
      saveStoredQuestions(list);
    }

    try {
      const supabase = createAdminClient();
      const updates: any = {};
      if (answer_text !== undefined) {
        updates.answer_text = answer_text;
        updates.answered_at = new Date().toISOString();
      }
      if (is_approved !== undefined) {
        updates.is_approved = Boolean(is_approved);
      }
      await supabase.from('questions').update(updates).eq('id', id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, question: item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Eksik id' }, { status: 400 });
    }

    let list = getStoredQuestions();
    list = list.filter((q) => q.id !== id);
    saveStoredQuestions(list);

    try {
      const supabase = createAdminClient();
      await supabase.from('questions').delete().eq('id', id);
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, message: 'Soru silindi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
