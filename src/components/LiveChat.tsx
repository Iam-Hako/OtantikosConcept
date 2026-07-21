"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, CheckCheck, Sparkles } from "lucide-react";
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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [chatData, setChatData] = useState<SupportChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeEmail = user ? user.email : guestEmail;
  const activeName = user ? user.name : guestName;

  // LocalStorage'dan sohbet verisini çek
  const loadChat = () => {
    if (!activeEmail) return;
    try {
      const raw = localStorage.getItem("otantikos_support_chats");
      if (raw) {
        const chats: Record<string, SupportChat> = JSON.parse(raw);
        if (chats[activeEmail.toLowerCase()]) {
          setChatData(chats[activeEmail.toLowerCase()]);
          setHasStarted(true);
        }
      }
    } catch (e) {
      console.error("Chat loading error:", e);
    }
  };

  useEffect(() => {
    if (user) {
      setHasStarted(true);
      loadChat();
    }
  }, [user]);

  // Her 1.5 saniyede bir sohbeti senkronize et (Admin yanıt verdiğinde kullanıcı anında görsün)
  useEffect(() => {
    if (!isOpen || !activeEmail) return;
    loadChat();
    const interval = setInterval(loadChat, 1500);
    return () => clearInterval(interval);
  }, [isOpen, activeEmail]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

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

  const saveChatToStorage = (email: string, chatObj: SupportChat) => {
    try {
      const raw = localStorage.getItem("otantikos_support_chats");
      const chats: Record<string, SupportChat> = raw ? JSON.parse(raw) : {};
      chats[email.toLowerCase()] = chatObj;
      localStorage.setItem("otantikos_support_chats", JSON.stringify(chats));
    } catch (e) {
      console.error("Save chat error:", e);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
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

  return (
    <>
      {/* Canlı Destek Açma Balonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-[#C86D51] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:bg-[#B05B41] hover:scale-105 transition-all duration-300 flex items-center gap-2 border-2 border-white group"
        aria-label="Canlı Destek"
      >
        <MessageSquare className="w-6 h-6 animate-pulse" />
        <span className="hidden sm:inline-block text-xs font-bold tracking-wide pr-1">Canlı Destek</span>
      </button>

      {/* Canlı Destek Penceresi */}
      {isOpen && (
        <div className="fixed bottom-20 md:bottom-20 right-4 md:right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#E6DCD3] overflow-hidden flex flex-col h-[480px] animate-in slide-in-from-bottom-5 duration-300">
          
          {/* Üst Header */}
          <div className="bg-[#3E2E28] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-[#C86D51] flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#3E2E28] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold leading-tight">Otantikos Müşteri Desteği</h3>
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

          {/* Form Ekranı (Oturum Açılmamış ve Sohbet Başlatılmamışsa) */}
          {!hasStarted && !user ? (
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
                  placeholder="Örn: Ayşe Yılmaz"
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
                  placeholder="ornek@email.com"
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
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#E6DCD3] flex items-center gap-2">
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
          )}

        </div>
      )}
    </>
  );
}
