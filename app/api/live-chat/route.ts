import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data/store-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (sessionId) {
    const session = await DataService.getChatSession(sessionId);
    return NextResponse.json(session);
  }

  const sessions = await DataService.getChatSessions();
  return NextResponse.json(sessions);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, sender_type, message_text, customer_name, customer_email } = body;

    const msg = await DataService.sendMessage(
      session_id,
      sender_type,
      message_text,
      customer_name,
      customer_email
    );

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
