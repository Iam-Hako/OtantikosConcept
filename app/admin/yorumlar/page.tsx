'use client';

import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2 } from 'lucide-react';
import { Review, Product } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const [rList, pList] = await Promise.all([
      DataService.getReviews(),
      DataService.getAllAdminProducts(),
    ]);
    setReviews(rList);
    setProducts(pList);
  };

  const handleToggleApprove = async (id: string, current: boolean) => {
    await DataService.moderateReview(id, !current);
    toast.success(!current ? 'Yorum onaylandı ve yayına alındı.' : 'Yorum yayından kaldırıldı.');
    loadReviews();
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-600" />
          <span>Müşteri Yorum Moderasyon Masası</span>
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Gelen ürün değerlendirmelerini inceleyin, puan ve yorumları onaylayın.
        </p>
      </div>

      {/* Mobile Cards List (< md) */}
      <div className="md:hidden space-y-3">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border border-stone-200">
            Değerlendirme bulunamadı.
          </div>
        ) : (
          reviews.map((r) => {
            const prod = products.find((p) => p.id === r.product_id);
            return (
              <div key={r.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-stone-300'}`} />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    r.is_approved ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-800 bg-rose-50 border-rose-200'
                  }`}>
                    {r.is_approved ? 'Yayında' : 'Gizli / Onay Bekliyor'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-stone-900">{prod?.name || 'Ürün'}</div>
                  <p className="text-stone-600 italic leading-relaxed">"{r.comment}"</p>
                  <div className="text-[10px] text-stone-400 pt-1">
                    {r.user_name} • {formatDate(r.created_at)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleApprove(r.id, r.is_approved)}
                  className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center min-h-[40px] shadow-2xs ${
                    r.is_approved ? 'bg-stone-200 text-stone-800 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {r.is_approved ? 'Yayından Kaldır / Gizle' : 'Yorumu Onayla & Yayınla'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Tarih</th>
                <th className="py-3.5 px-4">Ürün</th>
                <th className="py-3.5 px-4">Müşteri</th>
                <th className="py-3.5 px-4">Puan</th>
                <th className="py-3.5 px-4">Yorum</th>
                <th className="py-3.5 px-4">Durum</th>
                <th className="py-3.5 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {reviews.map((r) => {
                const prod = products.find((p) => p.id === r.product_id);
                return (
                  <tr key={r.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-4 text-stone-400">{formatDate(r.created_at)}</td>
                    <td className="py-3 px-4 font-bold text-stone-900">{prod?.name || r.product_id}</td>
                    <td className="py-3 px-4">{r.user_name}</td>
                    <td className="py-3 px-4">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-stone-300'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">{r.comment}</td>
                    <td className="py-3 px-4">
                      {r.is_approved ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Yayında
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Gizli
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleApprove(r.id, r.is_approved)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                          r.is_approved ? 'bg-stone-200 text-stone-800 hover:bg-stone-300' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {r.is_approved ? 'Gizle' : 'Onayla'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
