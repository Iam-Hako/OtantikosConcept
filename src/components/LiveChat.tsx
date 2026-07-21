"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Sparkles, User, ChevronLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface ChatMessage {
  id: string;
  sender: "user" | "support";
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportChat {
  userEmail: string;
  userName: string;
  lastUpdated: string;
  messages: ChatMessage[];
}

export default function LiveChat() {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Tüm sohbetler (Admin Modu için)
  const [allChats, setAllChats] = useState<Record<string, SupportChat>>({});
  const [selectedCustomerEmail, setSelectedCustomerEmail] = useState<string | null>(null);

  // Müşteri Tekli Sohbeti
  const [chatData, setChatData] = useState<SupportChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeEmail = user ? user.email : guestEmail;
  const activeName = user ? user.name : guestName;

  // Sunucudan ve LocalStorage'dan tüm sohbetleri çek
  const loadChats = async () => {
    try {
      let chats: Record<string, SupportChat> = {};
      const res = await fetch("/api/site-data");
      const data = await res.json();

      if (data.success && data.data?.supportChats) {
        chats = data.data.supportChats;
      } else {
        const raw = localStorage.getItem("otantikos_support_chats");
        if (raw) chats = JSON.parse(raw);
      }

      setAllChats(chats);

      if (activeEmail && chats[activeEmail.toLowerCase()]) {
        setChatData(chats[activeEmail.toLowerCase()]);
        setHasStarted(true);
      }

      if (selectedCustomerEmail && chats[selectedCustomerEmail.toLowerCase()]) {
        // Sohbet güncel tutuluyor
      } else if (!selectedCustomerEmail && Object.keys(chats).length > 0) {
        setSelectedCustomerEmail(Object.keys(chats)[0]);
      }
    } catch (e) {
      console.error("Chat loading error:", e);
    }
  };

  useEffect(() => {
    if (user) {
      setHasStarted(true);
    }
    loadChats();
  }, [user, activeEmail]);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 800);
    const handleStorage = () => loadChats();

    window.addEventListener("storage", handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isOpen, activeEmail, selectedCustomerEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages, selectedCustomerEmail, allChats]);

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;
    setHasStarted(true);
    initNewChat(guestName.trim(), guestEmail.trim().toLowerCase());
  };

  const initNewChat = (name: string, email: string) => {
    const initialMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "support",
      senderName: "Otantikos Canlı Destek",
      text: `Merhaba ${name}! OtantikosConcept canlı destek hattına hoş geldiniz. Size nasıl yardımcı olabiliriz?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newChat: SupportChat = {
      userEmail: email,
      userName: name,
      lastUpdated: new Date().toISOString(),
      messages: [initialMessage],
    };

    setChatData(newChat);
    saveChatToStorage(email, newChat);
  };

  const saveChatToStorage = async (email: string, chatObj: SupportChat) => {
    try {
      const updatedAll = { ...allChats, [email.toLowerCase()]: chatObj };
      setAllChats(updatedAll);
      localStorage.setItem("otantikos_support_chats", JSON.stringify(updatedAll));
      
      // Global Sunucuya Gönder (Tüm Cihazlar İçin)
      await fetch("/api/site-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-chat",
          payload: { userEmail: email, chat: chatObj },
        }),
      });

      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Save chat error:", e);
    }
  };

  // Müşteri Mesaj Gönderdiğinde
  const handleCustomerSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeEmail) return;

    const email = activeEmail.toLowerCase();
    let currentChat = chatData;

    if (!currentChat) {
      currentChat = {
        userEmail: email,
        userName: activeName || "Müşteri",
        lastUpdated: new Date().toISOString(),
        messages: [],
      };
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      senderName: activeName || "Müşteri",
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedChat: SupportChat = {
      ...currentChat,
      lastUpdated: new Date().toISOString(),
      messages: [...currentChat.messages, newMessage],
    };

    setChatData(updatedChat);
    saveChatToStorage(email, updatedChat);
    setInputMessage("");
  };

  // Admin Müşteriye Yanıt Gönderdiğinde (Sağ alttaki balondan)
  const handleAdminSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedCustomerEmail) return;

    const targetEmail = selectedCustomerEmail.toLowerCase();
    const currentChat = allChats[targetEmail];
    if (!currentChat) return;

    const replyMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "support",
      senderName: `Otantikos Destek (${user?.name || "Admin"})`,
      text: inputMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedChat: SupportChat = {
      ...currentChat,
      lastUpdated: new Date().toISOString(),
      messages: [...currentChat.messages, replyMessage],
    };

    saveChatToStorage(targetEmail, updatedChat);
    setInputMessage("");
  };

  const totalUnreadCount = Object.values(allChats).reduce((acc, c) => {
    const lastMsg = c.messages[c.messages.length - 1];
    return lastMsg && lastMsg.sender === "user" ? acc + 1 : acc;
  }, 0);

  const activeAdminChat = selectedCustomerEmail ? allChats[selectedCustomerEmail.toLowerCase()] : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 bg-[#C86D51] text-white rounded-full shadow-2xl hover:bg-[#B05B41] transition-all duration-300 border-2 border-white w-auto max-w-max shrink-0 cursor-pointer font-bold text-xs"
        aria-label="Canlı Destek"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide pr-1">
          {isAdmin ? "Admin Canlı Destek" : "Canlı Destek"}
        </span>

        {/* Bildirim Rozeti (Yetkili veya Kullanıcı İçin) */}
        {isAdmin && totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {totalUnreadCount}
          </span>
        )}
      </button>

      {/* Canlı Destek Penceresi */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-20 right-4 md:right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E6DCD3] overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Üst Header */}
          <div className="bg-[#3E2E28] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAdmin && selectedCustomerEmail ? (
                <button
                  onClick={() => setSelectedCustomerEmail(null)}
                  className="p-1 hover:bg-[#4A3B32] rounded-full transition"
                  title="Listeye Dön"
                >
                  <ChevronLeft className="w-5 h-5 text-[#D8C7B5]" />
                </button>
              ) : (
                <div className="relative w-9 h-9 rounded-full bg-[#C86D51] flex items-center justify-center font-bold text-white shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#3E2E28] rounded-full"></span>
                </div>
              )}
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight flex items-center gap-1.5">
                  {isAdmin ? "Admin Destek Masası 👑" : "Otantikos Canlı Destek"}
                </h3>
                <span className="text-[10px] text-[#D8C7B5] font-sans flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Çevrim içi • 7/24 Aktif
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#D8C7B5] hover:text-white hover:bg-[#4A3B32] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MODE 1: YÖNETİCİ / ADMİN MODU */}
          {isAdmin ? (
            !selectedCustomerEmail ? (
              /* Admin Sohbet Listesi Ekranı */
              <div className="flex-1 flex flex-col bg-[#F8F5F0]">
                <div className="p-3 bg-amber-50 border-b border-amber-200 text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Müşteri canlı destek talepleri aşağıda listelenmiştir.</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-[#E6DCD3]">
                  {Object.values(allChats).length > 0 ? (
                    Object.values(allChats).map((chat) => {
                      const lastMsg = chat.messages[chat.messages.length - 1];
                      const isUnread = lastMsg && lastMsg.sender === "user";

                      return (
                        <button
                          key={chat.userEmail}
                          onClick={() => setSelectedCustomerEmail(chat.userEmail)}
                          className="w-full p-3.5 text-left hover:bg-white transition flex items-center justify-between group"
                        >
                          <div className="space-y-0.5 max-w-[70%]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#3E2E28] truncate">{chat.userName}</span>
                              {isUnread && (
                                <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping"></span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#7C6354] truncate">{chat.userEmail}</p>
                            {lastMsg && (
                              <p className="text-[11px] text-[#3E2E28] font-medium truncate italic mt-0.5">
                                "{lastMsg.text}"
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] bg-[#C86D51] text-white font-bold px-2 py-1 rounded-full shadow-sm group-hover:scale-105 transition">
                            Yanıtla &rarr;
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-[#7C6354] space-y-2">
                      <p>Henüz gelen canlı destek talebi yok.</p>
                      <p className="text-[10px] text-gray-500">Müşteriler mesaj attığında burada anında görünecektir.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Admin Seçili Müşteri Mesajlaşma Ekranı */
              <>
                <div className="bg-[#EAE0D5] px-4 py-2 text-xs font-bold text-[#3E2E28] border-b border-[#D8C7B5] flex justify-between items-center">
                  <span>Müşteri: {activeAdminChat?.userName} ({activeAdminChat?.userEmail})</span>
                  <button onClick={() => setSelectedCustomerEmail(null)} className="text-[10px] text-[#C86D51] underline">
                    Tüm Listeye Dön
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F5F0]/60">
                  {activeAdminChat?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "support" ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[9px] text-[#7C6354] mb-0.5 px-1 font-semibold">{msg.senderName}</span>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          msg.sender === "support"
                            ? "bg-[#3E2E28] text-white rounded-br-none"
                            : "bg-white text-[#3E2E28] border border-[#E6DCD3] rounded-bl-none font-medium"
                        }`}
                      >
                        {msg.text}
                        <span className="block text-[8px] text-right mt-1 opacity-70">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Admin Yanıt Yazma Formu */}
                <form onSubmit={handleAdminSendMessage} className="p-3 bg-white border-t border-[#E6DCD3] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Müşteriye yanıt yazınız..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2 bg-[#C86D51] text-white rounded-xl hover:bg-[#B05B41] disabled:opacity-50 transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )
          ) : (
            /* MODE 2: NORMAL MÜŞTERİ MODU */
            !hasStarted && !user ? (
              <form onSubmit={handleStartGuestChat} className="p-6 flex-1 flex flex-col justify-center space-y-4 text-xs bg-[#F8F5F0]">
                <div className="text-center space-y-1 mb-2">
                  <h4 className="font-serif text-base font-bold text-[#3E2E28]">Destek Ekibi ile Görüşün</h4>
                  <p className="text-[#7C6354]">Sohbete başlamak için bilgilerinizi giriniz.</p>
                </div>

                <div>
                  <label className="block font-semibold text-[#3E2E28] mb-1">Adınız Soyadınız</label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-white border border-[#D8C7B5] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3E2E28] mb-1">E-Posta Adresiniz</label>
                  <input
                    type="email"
                    required
                    placeholder="E-Posta Adresi"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-white border border-[#D8C7B5] rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C86D51] text-white font-bold rounded-xl hover:bg-[#B05B41] transition shadow-md"
                >
                  Sohbeti Başlat
                </button>
              </form>
            ) : (
              <>
                {/* Mesaj Akış Alanı */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F8F5F0]/60">
                  {chatData?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[9px] text-[#7C6354] mb-0.5 px-1 font-semibold">{msg.senderName}</span>
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          msg.sender === "user"
                            ? "bg-[#C86D51] text-white rounded-br-none"
                            : "bg-white text-[#3E2E28] border border-[#E6DCD3] rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                        <span
                          className={`block text-[8px] text-right mt-1 opacity-70 ${
                            msg.sender === "user" ? "text-white" : "text-[#7C6354]"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Mesaj Yazma Alanı */}
                <form onSubmit={handleCustomerSendMessage} className="p-3 bg-white border-t border-[#E6DCD3] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Mesajınızı yazın..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2 bg-[#C86D51] text-white rounded-xl hover:bg-[#B05B41] disabled:opacity-50 transition shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )
          )}

        </div>
      )}
    </>
  );
}
