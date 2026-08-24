import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createAdminClient } from '@/lib/supabase/admin';
import { LiveChatMessage, LiveChatSession } from '@/lib/types/ecommerce';

// Server-side persistent live chat store (Shared across all devices, browsers, and tabs)
const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'live_chat_sessions.json');

declare global {
  var __otantikos_chat_sessions: LiveChatSession[] | undefined;
}

function getStoredSessions(): LiveChatSession[] {
  if (globalThis.__otantikos_chat_sessions && Array.isArray(globalThis.__otantikos_chat_sessions)) {
    return globalThis.__otantikos_chat_sessions;
  }

  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__otantikos_chat_sessions = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading chat sessions file:', err);
  }

  globalThis.__otantikos_chat_sessions = [];
  return [];
}

function saveStoredSessions(sessions: LiveChatSession[]) {
  globalThis.__otantikos_chat_sessions = sessions;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing chat sessions file:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  // Try Supabase first if tables exist
  try {
    const supabase = createAdminClient();
    if (sessionId) {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`*, messages:live_chat_messages(*)`)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (!error && data) {
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          data.last_message = data.messages[data.messages.length - 1] || null;
        }
        return NextResponse.json(data);
      }
    } else {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`*, messages:live_chat_messages(*)`)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        data.forEach((s: any) => {
          if (s.messages && Array.isArray(s.messages)) {
            s.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            s.last_message = s.messages[s.messages.length - 1] || null;
          }
        });
        return NextResponse.json(data);
      }
    }
  } catch {
    // Supabase fallback
  }

  // Server-side persistent file/memory fallback
  const sessions = getStoredSessions();
  if (sessionId) {
    const session = sessions.find((s) => s.session_id === sessionId) || null;
    return NextResponse.json(session);
  }

  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, sender_type, message_text, customer_name, customer_email } = body;

    if (!session_id || !sender_type || !message_text) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      session_id,
      sender_type,
      message_text,
      created_at: new Date().toISOString(),
    };

    // 1. Update server-side persistent store
    const sessions = getStoredSessions();
    let session = sessions.find((s) => s.session_id === session_id);

    if (!session) {
      session = {
        id: `chat-${session_id}`,
        session_id,
        customer_name: customer_name || 'Ziyaretçi',
        customer_email: customer_email || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [newMsg],
        last_message: newMsg,
      };
      sessions.unshift(session);
    } else {
      session.messages = session.messages || [];
      session.messages.push(newMsg);
      session.last_message = newMsg;
      session.updated_at = new Date().toISOString();
      if (customer_name && session.customer_name === 'Ziyaretçi') {
        session.customer_name = customer_name;
      }
      if (customer_email && !session.customer_email) {
        session.customer_email = customer_email;
      }
    }

    saveStoredSessions(sessions);

    // 2. Attempt Supabase sync
    try {
      const supabase = createAdminClient();
      await supabase
        .from('live_chat_sessions')
        .upsert({
          session_id,
          customer_name: session.customer_name,
          customer_email: session.customer_email,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });

      await supabase
        .from('live_chat_messages')
        .insert({
          session_id,
          sender_type,
          message_text,
        });
    } catch {
      // Supabase table may not be initialized yet
    }

    return NextResponse.json({ success: true, message: newMsg, session });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
