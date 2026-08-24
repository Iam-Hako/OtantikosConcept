'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Volume2, VolumeX, ShieldCheck, Sparkles, User, Minimize2 } from 'lucide-react';
import { LiveChatMessage } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { sounds } from '@/lib/utils/sound';
import { useAuth } from '@/lib/store/auth-context';

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize session from localStorage or create new
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('otantikos_chat_session_id');
      const savedName = localStorage.getItem('otantikos_chat_name');
      const savedEmail = localStorage.getItem('otantikos_chat_email');

      if (savedSession) {
        setSessionId(savedSession);
        if (savedName) setCustomerName(savedName);
        if (savedEmail) setCustomerEmail(savedEmail);
        setHasStarted(true);

        // Fetch existing messages
        DataService.getChatSession(savedSession).then((session) => {
          if (session?.messages) {
            setMessages(session.messages);
          }
        });
      } else {
        const newId = `sess-${Date.now()}`;
        setSessionId(newId);
        if (user) {
          setCustomerName(user.full_name || '');
          setCustomerEmail(user.email || '');
        }
      }
    } catch {
      // Ignore
    }
  }, [user]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    localStorage.setItem('otantikos_chat_session_id', sessionId);
    localStorage.setItem('otantikos_chat_name', customerName);
    if (customerEmail) localStorage.setItem('otantikos_chat_email', customerEmail);

    setHasStarted(true);

    // Initial greeting
    const greeting: LiveChatMessage = {
      id: `msg-bot-1`,
      session_id: sessionId,
      sender_type: 'admin',
      message_text: `Merhaba ${customerName}! Otantikos Concept canlı destek hattına hoş geldiniz. Eminönü Tahtakale merkezimizden size nasıl yardımcı olabiliriz?`,
      created_at: new Date().toISOString(),
    };
    setMessages([greeting]);
    if (soundEnabled) sounds.playChatNotification();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');

    // Add customer message
    const msg = await DataService.sendMessage(
      sessionId,
      'customer',
      userMsg,
      customerName,
      customerEmail
    );
    setMessages((prev) => [...prev, msg]);

    // Simulate smart auto-responder after brief delay if admin is away
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      let replyText = "Mesajınız Eminönü Tahtakale müşteri temsilcimize iletildi. En kısa sürede yanıtlayacağız.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('kargo') || lower.includes('teslimat')) {
        replyText = "Siparişleriniz aynı gün Eminönü depomuzdan anlaşmalı kargo ile sevk edilir. Dilerseniz Tahtakale mağazamızdan ücretsiz elden teslim alabilirsiniz!";
      } else if (lower.includes('kararma') || lower.includes('çelik') || lower.includes('taki')) {
        replyText = "Tüm çelik takı koleksiyonumuz 316L medikal paslanmaz çeliktir. Suya, parfüme ve tere dayanıklıdır; kararmazlık garantilidir.";
      } else if (lower.includes('toptan') || lower.includes('b2b')) {
        replyText = "Toptan alımlarınız için sitemizdeki 'Toptan & B2B' formunu doldurabilir ya da doğrudan Tahtakale toptan satış birimimizle iletişime geçebilirsiniz.";
      }

      const adminReply = await DataService.sendMessage(
        sessionId,
        'admin',
        replyText
      );
      setMessages((prev) => [...prev, adminReply]);
      if (soundEnabled) sounds.playChatNotification();
    }, 1200);
  };

  return (
    <>
      {/* Floating Circular Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 lg:bottom-6 right-5 z-40 bg-gradient-to-tr from-amber-700 to-amber-500 hover:from-amber-800 hover:to-amber-600 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center gap-2 group transition-all duration-300 transform hover:scale-105"
          aria-label="Canlı Destek Başlat"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>
          <span className="hidden sm:inline font-bold text-xs pr-1">Canlı Destek</span>
        </button>
      )}

      {/* Live Chat Window (Popup / Mobile Fullscreen Drawer) */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-6 right-0 sm:right-6 z-50 w-full sm:w-96 sm:max-w-md h-full sm:h-[520px] bg-white sm:rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Sparkles className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Otantikos Canlı Destek
                </h3>
                <p className="text-[11px] text-amber-200/80">Tahtakale Eminönü Masası • Çevrimiçi</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition"
                title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 transition"
                aria-label="Kapat"
              >
                <Minimize2 className="w-4 h-4 hidden sm:block" />
                <X className="w-5 h-5 sm:hidden" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!hasStarted ? (
            /* Lead Capture Form */
            <div className="flex-1 p-6 flex flex-col justify-center bg-stone-50/60">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-3">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-stone-900">Sohbete Başlayın</h4>
                <p className="text-xs text-stone-500 mt-1">
                  Uzman ekibimiz sorularınızı yanıtlamak için hazır.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    E-Posta Adresiniz (İsteğe bağlı)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ahmet@example.com"
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Canlı Görüşmeyi Başlat
                </button>
              </form>
            </div>
          ) : (
            /* Active Messages Stream */
            <div className="flex-1 flex flex-col h-full bg-stone-50/50">
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
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
                            ? 'bg-amber-600 text-white rounded-br-xs'
                            : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                        }`}
                      >
                        {m.message_text}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 px-1">
                        {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-stone-400 bg-white border border-stone-200 px-3 py-2 rounded-xl w-fit">
                    <span className="text-[10px]">Temsilci yazıyor</span>
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition flex items-center justify-center"
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
