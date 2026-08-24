'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, Check, X, Send, MessageSquare } from 'lucide-react';
import { Question, Product } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminQAQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const [qList, pList] = await Promise.all([
      DataService.getQuestions(),
      DataService.getAllAdminProducts(),
    ]);
    setQuestions(qList);
    setProducts(pList);
  };

  const handleAnswerSubmit = async (questionId: string) => {
    if (!answerText.trim()) return;
    await DataService.answerAndApproveQuestion(questionId, answerText, true);
    toast.success('Soru yanıtlandı ve sitede yayınlandı!');
    setActiveQuestion(null);
    setAnswerText('');
    loadQuestions();
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-amber-600" />
          <span>Ürün Soru-Cevap Moderasyon Masası</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Müşterilerden gelen ürün sorularını yanıtlayın ve sitede yayınlanmasını onaylayın.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Ürün</th>
                <th className="py-3.5 px-4">Müşteri</th>
                <th className="py-3.5 px-4">Soru</th>
                <th className="py-3.5 px-4">Yanıt / Durum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {questions.map((q) => {
                const prod = products.find((p) => p.id === q.product_id);
                return (
                  <tr key={q.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 text-stone-400">{formatDate(q.created_at)}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{prod?.name || q.product_id}</td>
                    <td className="py-3 px-4">{q.user_name}</td>
                    <td className="py-3 px-4 max-w-xs">{q.question_text}</td>
                    <td className="py-3 px-4">
                      {q.is_approved ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Onaylı & Yayında
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Yanıt Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveQuestion(q);
                          setAnswerText(q.answer_text || '');
                        }}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition"
                      >
                        {q.answer_text ? 'Düzenle' : 'Yanıtla'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Modal */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-slide-up text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900">Soruyu Yanıtla & Onayla</h3>
              <button onClick={() => setActiveQuestion(null)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1">
              <div><strong>Soran:</strong> {activeQuestion.user_name}</div>
              <div><strong>Soru:</strong> {activeQuestion.question_text}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Otantikos Yetkili Yanıtı *</label>
              <textarea
                rows={3}
                required
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Müşteriye verilecek resmi yanıt..."
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveQuestion(null)}
                className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={() => handleAnswerSubmit(activeQuestion.id)}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
              >
                Yanıtı Kaydet & Yayınla
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
