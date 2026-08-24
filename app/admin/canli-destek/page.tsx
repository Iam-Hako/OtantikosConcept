'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Send, User, Sparkles, Volume2, VolumeX, Check } from 'lucide-react';
import { LiveChatSession, LiveChatMessage } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { sounds } from '@/lib/utils/sound';
import { formatDate } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AdminLiveChatPage() {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveChatSession | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  
  const activeSessionRef = useRef<LiveChatSession | null>(null);
  activeSessionRef.current = activeSession;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const loadSessions = useCallback(async (isBackground = false) => {
    try {
      const list = await DataService.getChatSessions();
      setSessions(list);

      const currentActive = activeSessionRef.current;
      if (list.length > 0) {
        if (!currentActive) {
          setActiveSession(list[0]);
        } else {
          const updated = list.find((s) => s.session_id === currentActive.session_id);
          if (updated) {
            if (
              isBackground &&
              updated.messages &&
              currentActive.messages &&
              updated.messages.length > currentActive.messages.length
            ) {
              const lastM = updated.messages[updated.messages.length - 1];
              if (lastM.sender_type === 'customer' && soundEnabledRef.current) {
                sounds.playChatNotification();
              }
            }
            setActiveSession(updated);
          }
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadSessions(false);

    // 1. BroadcastChannel for instant local cross-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('otantikos_live_chat');
        bc.onmessage = (event) => {
          if (event.data?.type === 'new_message') {
            const newM = event.data.message as LiveChatMessage;
            if (newM.sender_type === 'customer' && soundEnabledRef.current) {
              sounds.playChatNotification();
            }
            loadSessions(true);
          }
        };
      } catch {
        // Ignore
      }
    }

    // 2. Supabase Realtime Channel for zero-latency incoming messages
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel('admin-live-chat')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_chat_messages',
          },
          (payload) => {
            const newM = payload.new as LiveChatMessage;
            if (newM.sender_type === 'customer' && soundEnabledRef.current) {
              sounds.playChatNotification();
            }
            loadSessions(true);
          }
        )
        .subscribe();
    } catch {
      // Fallback
    }

    // 3. Background Polling Fallback (Every 2.5 seconds)
    const interval = setInterval(() => {
      loadSessions(true);
    }, 2500);

    return () => {
      clearInterval(interval);
      if (bc) {
        try {
          bc.close();
        } catch {
          // Ignore
        }
      }
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Ignore
        }
      }
    };
  }, [loadSessions]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [activeSession?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeSession) return;

    const reply = adminReplyText.trim();
    setAdminReplyText('');

    await DataService.sendMessage(
      activeSession.session_id,
      'admin',
      reply
    );

    await loadSessions(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            <span>Canlı Destek Masası</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Müşterilerle anlık yazışın, Tahtakale ürün ve sipariş sorularını canlı yanıtlayın.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto min-h-[38px]"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          <span>{soundEnabled ? 'Sesli Uyarı: Açık' : 'Sesli Uyarı: Kapalı'}</span>
        </button>
      </div>

      {/* Main Chat Grid with Master-Detail on Mobile */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs grid grid-cols-1 lg:grid-cols-12 h-[calc(100dvh-200px)] min-h-[500px]">
        
        {/* Left: Chat Sessions List (4 Cols) */}
        <div className={`lg:col-span-4 border-r border-stone-200 flex flex-col bg-stone-50/50 ${
          mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-stone-700">
            Aktif Görüşmeler ({sessions.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">Aktif canlı görüşme bulunmuyor.</div>
            ) : (
              sessions.map((s) => {
                const isSelected = activeSession?.session_id === s.session_id;
                const lastMsg = s.messages?.[s.messages.length - 1];

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSession(s);
                      setMobileView('chat');
                    }}
                    className={`w-full p-4 text-left transition flex items-start gap-3 min-h-[56px] active:scale-[0.98] ${
                      isSelected ? 'bg-amber-100/70 border-l-4 border-amber-600' : 'hover:bg-stone-100'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                      {s.customer_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 truncate">{s.customer_name}</span>
                        <span className="text-[9px] text-stone-400">
                          {new Date(s.updated_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {s.customer_email && (
                        <div className="text-[10px] text-stone-500 truncate">{s.customer_email}</div>
                      )}
                      <p className="text-[11px] text-stone-600 truncate mt-1">
                        {lastMsg ? lastMsg.message_text : 'Mesaj yok'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation (8 Cols) */}
        <div className={`lg:col-span-8 flex flex-col bg-white ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          {activeSession ? (
            <>
              {/* Header */}
              <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-bold mr-1"
                  >
                    ← Liste
                  </button>
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {activeSession.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-stone-900">{activeSession.customer_name}</h3>
                    <p className="text-[10px] text-stone-500">{activeSession.customer_email || 'Misafir Müşteri'} • Canlı Bağlantı</p>
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div ref={feedRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/30 text-xs">
                {activeSession.messages?.map((m) => {
                  const isSenderAdmin = m.sender_type === 'admin';
                  return (
                    <div key={m.id} className={`flex flex-col ${isSenderAdmin ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-2xs leading-relaxed ${
                          isSenderAdmin
                            ? 'bg-amber-600 text-white rounded-br-xs font-medium'
                            : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 px-1">
                        {isSenderAdmin ? 'Yetkili • ' : 'Müşteri • '}
                        {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Müşteriye anlık yanıt yazın..."
                  className="flex-1 text-base sm:text-xs px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
                <button
                  type="submit"
                  disabled={!adminReplyText.trim()}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>Yanıtla</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-stone-400">
              Görüşme seçiniz
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
