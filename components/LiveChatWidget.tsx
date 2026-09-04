'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Volume2, VolumeX, Sparkles, User, Minimize2, RotateCcw } from 'lucide-react';
import { LiveChatMessage, LiveChatSession } from '@/lib/types/ecommerce';
import { DataService, deduplicateLiveChatMessages } from '@/lib/data/store-data';
import { sounds } from '@/lib/utils/sound';
import { useAuth } from '@/lib/store/auth-context';
import { createClient } from '@/lib/supabase/client';

const CHAT_COOKIE_NAME = 'otantikos_chat_sess';

function getChatCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + CHAT_COOKIE_NAME + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setChatCookie(sessionId: string) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + 30 * 864e5).toUTCString();
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${CHAT_COOKIE_NAME}=${encodeURIComponent(sessionId)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

function removeChatCookie() {
  if (typeof document === 'undefined') return;
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  document.cookie = `${CHAT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
}

export default function LiveChatWidget() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isRestoring, setIsRestoring] = useState<boolean>(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  // Do not render live chat widget on admin screens
  const isAdminRoute = pathname ? pathname.startsWith('/admin') : false;

  // 1. Restore previous session on initial mount
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        let existingSession: LiveChatSession | null = null;
        const cookieSessId = getChatCookie();

        if (cookieSessId) {
          existingSession = await DataService.getChatSession(cookieSessId);
        }

        if (!existingSession && user?.email) {
          existingSession = await DataService.getChatSessionByEmail(user.email);
        }

        if (!isMounted) return;

        if (existingSession && existingSession.session_id) {
          setSessionId(existingSession.session_id);
          setCustomerName(existingSession.customer_name || user?.full_name || '');
          setCustomerEmail(existingSession.customer_email || user?.email || '');
          if (existingSession.messages && existingSession.messages.length > 0) {
            setMessages(deduplicateLiveChatMessages(existingSession.messages));
            setHasStarted(true);
          }
          setChatCookie(existingSession.session_id);
        } else {
          const newId = cookieSessId || `sess-${Date.now()}`;
          setSessionId(newId);
          if (user) {
            if (user.full_name) setCustomerName(user.full_name);
            if (user.email) setCustomerEmail(user.email);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setIsRestoring(false);
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Reset unread count when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // 2. Realtime Supabase Subscription + Polling Fallback
  useEffect(() => {
    if (!sessionId || isAdminRoute) return;

    // 1. Initial Load if started
    if (hasStarted) {
      DataService.getChatSession(sessionId).then((session) => {
        if (session?.messages && session.messages.length > 0) {
          setMessages(deduplicateLiveChatMessages(session.messages));
        }
      });
    }

    // 2. BroadcastChannel for instant local cross-tab sync
    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('otantikos_live_chat');
        bc.onmessage = (event) => {
          if (event.data?.sessionId === sessionId && event.data?.message) {
            const newM = event.data.message as LiveChatMessage;
            setMessages((prev) => {
              const updated = deduplicateLiveChatMessages([...prev, newM]);
              if (newM.sender_type === 'admin') {
                if (soundEnabledRef.current) sounds.playChatNotification();
                if (!isOpenRef.current) setUnreadCount((c) => c + 1);
              }
              return updated;
            });
          }
        };
      } catch {
        // Ignore
      }
    }

    // 3. Supabase Realtime Channel
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`chat-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'live_chat_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          (payload) => {
            const newM = payload.new as LiveChatMessage;
            setMessages((prev) => {
              const updated = deduplicateLiveChatMessages([...prev, newM]);
              if (newM.sender_type === 'admin') {
                if (soundEnabledRef.current) sounds.playChatNotification();
                if (!isOpenRef.current) setUnreadCount((c) => c + 1);
              }
              return updated;
            });
          }
        )
        .subscribe();
    } catch {
      // Fallback
    }

    // 4. Background Sync Polling (Every 3 seconds)
    const interval = setInterval(async () => {
      if (!hasStarted) return;
      const sess = await DataService.getChatSession(sessionId);
      if (sess && sess.messages) {
        const fetchedMessages = deduplicateLiveChatMessages(sess.messages);
        setMessages((prev) => {
          const merged = deduplicateLiveChatMessages([...prev, ...fetchedMessages]);
          if (merged.length > prev.length) {
            const lastMsg = merged[merged.length - 1];
            if (lastMsg.sender_type === 'admin') {
              if (soundEnabledRef.current) sounds.playChatNotification();
              if (!isOpenRef.current) setUnreadCount((c) => c + (merged.length - prev.length));
            }
          }
          return merged;
        });
      }
    }, 3000);

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
  }, [sessionId, hasStarted, isAdminRoute]);

  // Safe inner-container scroll
  useEffect(() => {
    if (isOpen && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (isAdminRoute) {
    return null;
  }

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    setHasStarted(true);
    setChatCookie(sessionId);

    const greetingText = `Merhaba ${customerName}! Otantikos Concept canlı destek hattına hoş geldiniz. Eminönü Tahtakale merkezimizden size nasıl yardımcı olabiliriz?`;
    
    const greetingMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      session_id: sessionId,
      sender_type: 'admin',
      message_text: greetingText,
      created_at: new Date().toISOString(),
    };

    setMessages([greetingMsg]);
    if (soundEnabled) sounds.playChatNotification();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setChatCookie(sessionId);

    const tempId = `temp-${Date.now()}`;
    const tempMsg: LiveChatMessage = {
      id: tempId,
      session_id: sessionId,
      sender_type: 'customer',
      message_text: userMsg,
      created_at: new Date().toISOString(),
    };

    // Optimistic single bubble
    setMessages((prev) => deduplicateLiveChatMessages([...prev, tempMsg]));

    const msg = await DataService.sendMessage(
      sessionId,
      'customer',
      userMsg,
      customerName,
      customerEmail
    );

    // Replace optimistic bubble in-place with real server message
    setMessages((prev) =>
      deduplicateLiveChatMessages(
        prev.map((m) => (m.id === tempId || (m.sender_type === 'customer' && m.message_text === userMsg && m.id?.startsWith('temp-')) ? msg : m))
      )
    );
  };

  const handleResetChat = () => {
    if (confirm('Mevcut canlı destek sohbet geçmişinizi sıfırlayıp yeni bir görüşme başlatmak istiyor musunuz?')) {
      removeChatCookie();
      const newId = `sess-${Date.now()}`;
      setSessionId(newId);
      setMessages([]);
      setHasStarted(false);
      if (user) {
        if (user.full_name) setCustomerName(user.full_name);
        if (user.email) setCustomerEmail(user.email);
      }
    }
  };

  return (
    <>
      {/* Floating Circular Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 bg-gradient-to-tr from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 active:scale-95 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center justify-center gap-2 group transition-transform duration-200"
          aria-label="Canlı Destek Başlat"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 ? (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {unreadCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
            )}
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">
            {unreadCount > 0 ? `${unreadCount} Yeni Mesaj` : 'Canlı Destek'}
          </span>
        </button>
      )}

      {/* Live Chat Window Modal / Sheet */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-0 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto z-50 w-full sm:w-96 sm:max-w-md h-[100dvh] sm:h-[540px] bg-white sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white p-4 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Otantikos Canlı Destek
                </h3>
                <p className="text-[11px] text-amber-200/80">Tahtakale Masası • Çevrimiçi</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasStarted && (
                <button
                  onClick={handleResetChat}
                  className="p-2 rounded-xl hover:bg-white/10 text-stone-300 transition"
                  title="Yeni Sohbet Başlat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl hover:bg-white/10 text-stone-300 transition"
                title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-stone-300 transition"
                aria-label="Kapat"
              >
                <Minimize2 className="w-4 h-4 hidden sm:block" />
                <X className="w-5 h-5 sm:hidden" />
              </button>
            </div>
          </div>

          {/* Body */}
          {isRestoring ? (
            <div className="flex-1 p-8 flex items-center justify-center text-xs text-stone-400">
              Canlı sohbet geçmişi yükleniyor...
            </div>
          ) : !hasStarted ? (
            /* Lead Capture Form */
            <div className="flex-1 p-6 flex flex-col justify-center bg-stone-50/60 overflow-y-auto">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-3 shadow-2xs">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Sohbete Başlayın</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Tahtakale Eminönü ekibimiz canlı sorularınızı yanıtlamak için hazır.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-base sm:text-xs p-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    E-Posta Adresiniz (İsteğe bağlı)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full text-base sm:text-xs p-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition min-h-[44px]"
                >
                  Canlı Görüşmeyi Başlat
                </button>
              </form>
            </div>
          ) : (
            /* Active Messages Stream */
            <div className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-hidden">
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 text-xs"
              >
                {messages.map((m) => {
                  const isUser = m.sender_type === 'customer';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-2xs leading-relaxed ${
                          isUser
                            ? 'bg-amber-600 text-white rounded-br-xs font-medium'
                            : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 px-1">
                        {isUser ? 'Siz • ' : 'Yetkili • '}
                        {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 text-base sm:text-xs px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 disabled:opacity-40 text-white rounded-xl shadow-xs transition flex items-center justify-center min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
}
