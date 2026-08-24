'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MessageCircle, 
  Send, 
  User, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  Search, 
  X, 
  Mail, 
  Clock, 
  Copy, 
  Archive, 
  CheckCheck,
  Phone,
  FileText
} from 'lucide-react';
import { LiveChatSession, LiveChatMessage } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { sounds } from '@/lib/utils/sound';
import { formatDate } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function deduplicateMessages(messages: LiveChatMessage[]): LiveChatMessage[] {
  if (!Array.isArray(messages)) return [];
  const seenIds = new Set<string>();
  const result: LiveChatMessage[] = [];

  for (const m of messages) {
    if (!m) continue;
    if (m.id && seenIds.has(m.id)) continue;

    const isDuplicate = result.some(
      (existing) =>
        existing.sender_type === m.sender_type &&
        existing.message_text.trim() === m.message_text.trim() &&
        Math.abs(new Date(existing.created_at).getTime() - new Date(m.created_at).getTime()) < 3000
    );

    if (!isDuplicate) {
      if (m.id) seenIds.add(m.id);
      result.push(m);
    }
  }
  return result;
}

export default function AdminLiveChatPage() {
  const [sessions, setSessions] = useState<LiveChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<LiveChatSession | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  
  const activeSessionRef = useRef<LiveChatSession | null>(null);
  activeSessionRef.current = activeSession;

  const soundEnabledRef = useRef<boolean>(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const loadSessions = useCallback(async (isBackground = false) => {
    try {
      const rawList = await DataService.getChatSessions();
      const list = rawList.map((s) => ({
        ...s,
        messages: s.messages ? deduplicateMessages(s.messages) : [],
      }));
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

    // 3. Background Polling Fallback (Every 3 seconds)
    const interval = setInterval(() => {
      loadSessions(true);
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
  }, [loadSessions]);

  const scrollToBottom = useCallback(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    const t = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(t);
  }, [activeSession?.session_id, activeSession?.messages?.length, scrollToBottom]);

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
    setTimeout(scrollToBottom, 100);
  };

  const handleToggleStatus = async (status: 'active' | 'closed') => {
    if (!activeSession) return;
    try {
      await DataService.updateChatSessionStatus(activeSession.session_id, status);
      toast.success(status === 'closed' ? 'Görüşme sonlandırıldı & arşive alındı' : 'Görüşme yeniden aktif edildi');
      await loadSessions(false);
    } catch {
      toast.error('Durum güncellenirken hata oluştu');
    }
  };

  const handleDeleteSession = async () => {
    if (!activeSession) return;
    if (confirm(`"${activeSession.customer_name}" müşterisine ait canlı sohbet kaydını kalıcı olarak silmek istiyor musunuz?`)) {
      try {
        await DataService.deleteChatSession(activeSession.session_id);
        toast.success('Görüşme kaydı silindi');
        setActiveSession(null);
        setMobileView('list');
        await loadSessions(false);
      } catch {
        toast.error('Görüşme silinirken hata oluştu');
      }
    }
  };

  const handleCopyTranscript = () => {
    if (!activeSession || !activeSession.messages) return;
    const text = activeSession.messages.map(m => {
      const role = m.sender_type === 'admin' ? 'Yetkili' : activeSession.customer_name;
      const time = new Date(m.created_at).toLocaleString('tr-TR');
      return `[${time}] ${role}: ${m.message_text}`;
    }).join('\n');

    navigator.clipboard.writeText(`--- Otantikos Canlı Destek Görüşme Dökümü ---\nMüşteri: ${activeSession.customer_name} (${activeSession.customer_email || 'Misafir'})\nOturum: ${activeSession.session_id}\nTarih: ${new Date(activeSession.created_at).toLocaleString('tr-TR')}\n\n${text}`);
    toast.success('Görüşme metni panoya kopyalandı');
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      if (filterStatus === 'active' && s.status === 'closed') return false;
      if (filterStatus === 'closed' && s.status !== 'closed') return false;

      if (searchQuery.trim()) {
        const q = normalizeTurkish(searchQuery.trim().toLowerCase());
        const nameMatch = normalizeTurkish((s.customer_name || '').toLowerCase()).includes(q);
        const emailMatch = normalizeTurkish((s.customer_email || '').toLowerCase()).includes(q);
        const idMatch = s.session_id.toLowerCase().includes(q);
        const msgMatch = s.messages?.some(m => normalizeTurkish(m.message_text.toLowerCase()).includes(q));
        if (!nameMatch && !emailMatch && !idMatch && !msgMatch) return false;
      }

      return true;
    });
  }, [sessions, filterStatus, searchQuery]);

  const activeCount = sessions.filter(s => s.status !== 'closed').length;
  const closedCount = sessions.filter(s => s.status === 'closed').length;

  return (
    <div className="space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            <span>Canlı Destek & Geçmiş Görüşmeler Masası</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Müşterilerle anlık yazışın, Tahtakale ürün ve sipariş sorularını yanıtlayın, tüm geçmiş sohbetleri inceleyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs self-start sm:self-auto min-h-[38px] hover:bg-stone-50 transition"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span>{soundEnabled ? 'Sesli Uyarı: Açık' : 'Sesli Uyarı: Kapalı'}</span>
          </button>
        </div>
      </div>

      {/* Main Chat Grid with Master-Detail on Mobile */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-140px)] min-h-[500px]">
        
        {/* Left: Chat Sessions List & Filter Drawer (4 Cols) */}
        <div className={`lg:col-span-5 xl:col-span-4 border-r border-stone-200 flex flex-col h-full overflow-hidden bg-stone-50/50 ${
          mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}>
          
          {/* Status Tabs */}
          <div className="p-3 border-b border-stone-200 bg-white flex items-center gap-1 shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                filterStatus === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>Tümü</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === 'all' ? 'bg-white/20' : 'bg-stone-200'}`}>
                {sessions.length}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                filterStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Aktif</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === 'active' ? 'bg-white/20' : 'bg-stone-200'}`}>
                {activeCount}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 ${
                filterStatus === 'closed'
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <span>Geçmiş</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStatus === 'closed' ? 'bg-white/20' : 'bg-stone-200'}`}>
                {closedCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-stone-200 bg-stone-50 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İsim, e-posta veya mesaj ara..."
                className="w-full text-base sm:text-xs pl-8 pr-7 py-2 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stone-100">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                {searchQuery ? 'Aramaya uygun görüşme bulunamadı.' : 'Bu kategoride görüşme bulunmuyor.'}
              </div>
            ) : (
              filteredSessions.map((s) => {
                const isSelected = activeSession?.session_id === s.session_id;
                const lastMsg = s.messages?.[s.messages.length - 1];
                const isLastMsgCustomer = lastMsg?.sender_type === 'customer';
                const isClosed = s.status === 'closed';

                return (
                  <button
                    key={s.id || s.session_id}
                    onClick={() => {
                      setActiveSession(s);
                      setMobileView('chat');
                    }}
                    className={`w-full p-4 text-left transition flex items-start gap-3 min-h-[64px] active:scale-[0.99] relative ${
                      isSelected ? 'bg-amber-100/70 border-l-4 border-amber-600 shadow-xs' : 'hover:bg-stone-100'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isClosed ? 'bg-stone-200 text-stone-700' : 'bg-amber-200 text-amber-950'
                      }`}>
                        {s.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                        isClosed ? 'bg-stone-400' : 'bg-emerald-500'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-stone-900 truncate">{s.customer_name}</span>
                        <span className="text-[10px] text-stone-400 shrink-0">
                          {new Date(s.updated_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                          isClosed ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isClosed ? 'Sonlandı' : 'Aktif'}
                        </span>
                        {s.customer_email && (
                          <span className="text-[10px] text-stone-500 truncate">{s.customer_email}</span>
                        )}
                      </div>

                      <p className={`text-[11px] truncate mt-1.5 ${
                        isLastMsgCustomer && !isClosed ? 'font-bold text-amber-900' : 'text-stone-600'
                      }`}>
                        {lastMsg ? `${lastMsg.sender_type === 'admin' ? 'Siz: ' : ''}${lastMsg.message_text}` : 'Mesaj yok'}
                      </p>
                    </div>

                    {isLastMsgCustomer && !isClosed && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0 self-center" title="Müşteri yanıt bekliyor" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation (8 Cols) */}
        <div className={`lg:col-span-7 xl:col-span-8 flex flex-col h-full overflow-hidden bg-white min-h-0 ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}>
          {activeSession ? (
            <>
              {/* Conversation Header & Management Controls */}
              <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold"
                  >
                    ← Liste
                  </button>

                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                      {activeSession.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${
                      activeSession.status === 'closed' ? 'bg-stone-400' : 'bg-emerald-500'
                    }`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-900">{activeSession.customer_name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        activeSession.status === 'closed' ? 'bg-stone-200 text-stone-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {activeSession.status === 'closed' ? 'Sonlandırıldı' : 'Aktif Sohbet'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                      {activeSession.customer_email ? (
                        <a 
                          href={`mailto:${activeSession.customer_email}`} 
                          className="text-amber-700 hover:underline flex items-center gap-1 font-medium"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{activeSession.customer_email}</span>
                        </a>
                      ) : (
                        <span>Misafir Ziyaretçi</span>
                      )}
                      <span>•</span>
                      <span>Oturum: {activeSession.session_id}</span>
                      <span>•</span>
                      <span>{new Date(activeSession.created_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Header Action Tools */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={handleCopyTranscript}
                    className="p-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold transition flex items-center gap-1"
                    title="Görüşme Metnini Kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline">Döküm</span>
                  </button>

                  {activeSession.status !== 'closed' ? (
                    <button
                      onClick={() => handleToggleStatus('closed')}
                      className="p-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      title="Görüşmeyi Sonlandır & Arşive Al"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Sonlandır</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus('active')}
                      className="p-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                      title="Görüşmeyi Yeniden Aktif Et"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Yeniden Aç</span>
                    </button>
                  )}

                  <button
                    onClick={handleDeleteSession}
                    className="p-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs transition"
                    title="Görüşmeyi Kalıcı Olarak Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Closed Warning Banner if archived */}
              {activeSession.status === 'closed' && (
                <div className="bg-amber-50/80 border-b border-amber-200/60 p-2.5 px-4 text-xs text-amber-900 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Archive className="w-4 h-4 text-amber-700" />
                    <span>Bu görüşme sonlandırılmıştır. Yazacağınız yeni mesajla görüşme otomatik olarak yeniden açılacaktır.</span>
                  </div>
                  <button
                    onClick={() => handleToggleStatus('active')}
                    className="text-xs font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    Aktif Et
                  </button>
                </div>
              )}

              {/* Messages Feed */}
              <div ref={feedRef} className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5 bg-stone-50/40 text-xs scroll-smooth">
                {activeSession.messages?.map((m) => {
                  const isSenderAdmin = m.sender_type === 'admin';
                  return (
                    <div key={m.id} className={`flex flex-col ${isSenderAdmin ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-2xs leading-relaxed ${
                          isSenderAdmin
                            ? 'bg-amber-600 text-white rounded-br-xs font-medium'
                            : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 px-1 flex items-center gap-1">
                        {isSenderAdmin ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-amber-600" />
                            <span>Yetkili (Siz) • </span>
                          </>
                        ) : (
                          <span>{activeSession.customer_name} • </span>
                        )}
                        {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input Form */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-t border-stone-200 flex gap-2 shrink-0 z-10">
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-stone-50/30">
              <MessageCircle className="w-12 h-12 text-stone-300 mb-3" />
              <h4 className="text-sm font-bold text-stone-700">Görüşme Seçiniz</h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm">
                Sol listeden geçmiş veya aktif bir canlı destek oturumuna tıklayarak mesajlaşmayı görüntüleyin.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

