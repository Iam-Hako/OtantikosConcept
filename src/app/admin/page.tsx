"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_PRODUCTS, Product } from "@/data/mockData";
import { Plus, Edit, Trash2, Package, ShoppingCart, TrendingUp, Search, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState("");

  // Yeni Ürün Ekleme Form State
  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "El Yapımı Seramik",
    categorySlug: "el-yapimi-seramik",
    price: 450,
    stock: 15,
    description: "Doğal zanaat ürünü.",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop"
  });

  const handleDeleteProduct = (id: string) => {
    if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
      setProducts(products.filter((p) => p.id !== id));
      showNotify("Ürün başarıyla silindi.");
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: `prod-${Date.now()}`,
      title: newProduct.title || "Yeni Otantik Ürün",
      slug: (newProduct.title || "yeni-otantik-urun").toLowerCase().replace(/\s+/g, "-"),
      description: newProduct.description,
      price: Number(newProduct.price),
      category: newProduct.category,
      categorySlug: newProduct.categorySlug,
      images: [newProduct.image],
      stock: Number(newProduct.stock),
      rating: 5.0,
      reviewCount: 1,
      variants: [],
      details: ["%100 El Yapımı"]
    };

    setProducts([created, ...products]);
    setIsModalOpen(false);
    showNotify("Yeni ürün mağazaya eklendi!");
  };

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Bildirim Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4" /> {notification}
        </div>
      )}

      {/* Başlık & Ekle Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6DCD3] pb-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51]">Yönetici Paneli</span>
          <h1 className="font-serif text-3xl font-bold text-[#3E2E28] mt-1">OtantikosConcept Admin</h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#C86D51] text-white text-xs font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Yeni Ürün Ekle
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-[#C86D51]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Toplama Ürün Sayısı</span>
            <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-[#C86D51]">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Bugünkü Siparişler</span>
            <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">18 Adet</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm flex items-center gap-4">
          <div className="p-3 bg-[#F8F5F0] rounded-xl text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#7C6354]">Toplam Mağaza Cirosu</span>
            <h3 className="font-serif text-2xl font-bold text-[#3E2E28]">₺48.950,00</h3>
          </div>
        </div>
      </div>

      {/* Ürün Yönetimi Tablosu */}
      <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h3 className="font-serif text-lg font-bold text-[#3E2E28]">Mağaza Katalog Envanteri</h3>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Ürün veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-full py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51]"
            />
            <Search className="w-4 h-4 text-[#7C6354] absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3E2E28]">
            <thead className="bg-[#F8F5F0] text-[#7C6354] uppercase font-bold text-[10px] tracking-wider border-b border-[#E6DCD3]">
              <tr>
                <th className="py-3 px-4">Görsel</th>
                <th className="py-3 px-4">Ürün Adı</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Fiyat</th>
                <th className="py-3 px-4">Stok</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DCD3]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F5F0]/50 transition">
                  <td className="py-3 px-4">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#E6DCD3] bg-gray-50">
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#3E2E28]">
                    <Link href={`/urun/${p.slug}`} className="hover:text-[#C86D51]">
                      {p.title}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-[#7C6354]">{p.category}</td>
                  <td className="py-3 px-4 font-bold">{p.price.toFixed(2)} TL</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      p.stock > 10 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {p.stock} Adet
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition" title="Düzenle">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* YENİ ÜRÜN EKLEME MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-[#E6DCD3]">
            <h3 className="font-serif text-xl font-bold text-[#3E2E28]">Yeni Ürün Ekle</h3>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Ürün Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: El Yapımı Terrakotta Saksı"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Kategori</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                >
                  <option value="El Yapımı Seramik">El Yapımı Seramik</option>
                  <option value="Otantik Ev Tekstili">Otantik Ev Tekstili</option>
                  <option value="Doğal Ahşap & Dekor">Doğal Ahşap & Dekor</option>
                  <option value="Doğal Bakım & Mumlar">Doğal Bakım & Mumlar</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#3E2E28]">Fiyat (TL)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[#3E2E28]">Stok Adedi</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#3E2E28]">Görsel URL</label>
                <input
                  type="text"
                  required
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-[#3E2E28] rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C86D51] text-white rounded-xl font-semibold hover:bg-[#B05B41] transition"
                >
                  Kaydet & Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
