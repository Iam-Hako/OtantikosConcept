'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  ShieldPlus, 
  ShieldMinus, 
  Search, 
  RefreshCw, 
  Mail, 
  Phone, 
  Calendar, 
  AlertTriangle, 
  Check, 
  X, 
  ArrowLeft,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import { actionGetUsers, actionUpdateUserRole, AdminUserListItem } from '@/app/actions/ecommerce-actions';

function KullanicilarContent() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');

  // Confirmation Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [targetRole, setTargetRole] = useState<'admin' | 'customer'>('admin');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await actionGetUsers();
      if (res.success) {
        setUsers(res.data);
        if (res.currentUserId) {
          setCurrentUserId(res.currentUserId);
        }
      } else {
        toast.error('Kullanıcı listesi alınamadı: ' + (res.error || 'Bilinmeyen hata'));
      }
    } catch {
      toast.error('Sunucu ile bağlantı kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false;
      }

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = (u.full_name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);

      return matchName || matchEmail || matchPhone;
    });
  }, [users, searchQuery, roleFilter]);

  // Counts
  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);
  const customerCount = useMemo(() => users.filter((u) => u.role === 'customer').length, [users]);

  // Open modal
  const openConfirmModal = (user: AdminUserListItem, newRole: 'admin' | 'customer') => {
    setSelectedUser(user);
    setTargetRole(newRole);
  };

  // Close modal
  const closeConfirmModal = () => {
    if (isUpdating) return;
    setSelectedUser(null);
  };

  // Execute Role Update
  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;
    setIsUpdating(true);

    try {
      const res = await actionUpdateUserRole(selectedUser.id, targetRole);
      if (res.success) {
        toast.success(
          targetRole === 'admin' 
            ? `${selectedUser.full_name || selectedUser.email} başarıyla Admin yapıldı.` 
            : `${selectedUser.full_name || selectedUser.email} yetkisi Müşteri olarak güncellendi.`
        );

        // Optimistic UI update
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, role: targetRole } : u))
        );
        setSelectedUser(null);
      } else {
        toast.error('Yetki güncellenemedi: ' + (res.error || 'Bilinmeyen hata'));
      }
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper for user avatar initials
  const getInitials = (name?: string | null, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'OT';
  };

  // Helper for Turkish date formatting
  const formatTurkishDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
                Kullanıcılar & Yetki Masası
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                RBAC Güvenlik Sistemi
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Sitede kayıtlı tüm gerçek kullanıcıları listeleyin ve tek tıkla Admin veya Müşteri yetkisi atayın.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
            title="Listeyi Yenile"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>

          <Link
            href="/admin"
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Panoya Dön</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setRoleFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            roleFilter === 'all' 
              ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div>
            <div className={`text-xs font-semibold ${roleFilter === 'all' ? 'text-stone-400' : 'text-stone-500'}`}>
              Toplam Kayıtlı Kullanıcı
            </div>
            <div className="text-2xl font-black mt-1 font-serif">
              {isLoading ? '...' : users.length}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            roleFilter === 'all' ? 'bg-stone-800 text-amber-400' : 'bg-stone-100 text-stone-700'
          }`}>
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setRoleFilter('admin')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            roleFilter === 'admin' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-md' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-amber-300'
          }`}
        >
          <div>
            <div className={`text-xs font-semibold ${roleFilter === 'admin' ? 'text-amber-100' : 'text-stone-500'}`}>
              Yöneticiler (Admin)
            </div>
            <div className="text-2xl font-black mt-1 font-serif text-amber-700 dark:text-inherit">
              {isLoading ? '...' : adminCount}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            roleFilter === 'admin' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-700'
          }`}>
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setRoleFilter('customer')}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            roleFilter === 'customer' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-stone-900 border-stone-200 hover:border-blue-300'
          }`}
        >
          <div>
            <div className={`text-xs font-semibold ${roleFilter === 'customer' ? 'text-blue-100' : 'text-stone-500'}`}>
              Standart Müşteriler
            </div>
            <div className="text-2xl font-black mt-1 font-serif text-blue-700 dark:text-inherit">
              {isLoading ? '...' : customerCount}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            roleFilter === 'customer' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
          }`}>
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        
        {/* Search & Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, e-posta veya telefon ile arayın..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 font-medium placeholder-stone-400 focus:outline-none focus:border-amber-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl self-start md:self-auto text-xs font-semibold">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                roleFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Tümü ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                roleFilter === 'admin' ? 'bg-white text-amber-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>Adminler ({adminCount})</span>
            </button>
            <button
              onClick={() => setRoleFilter('customer')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                roleFilter === 'customer' ? 'bg-white text-blue-800 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Müşteriler ({customerCount})</span>
            </button>
          </div>

        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr className="text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3.5 px-5">Kullanıcı Bilgisi</th>
                <th className="py-3.5 px-4">İletişim</th>
                <th className="py-3.5 px-4">Kayıt Tarihi</th>
                <th className="py-3.5 px-4 text-center">Mevcut Yetki</th>
                <th className="py-3.5 px-5 text-right">Yetki İşlemleri</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                      <span>Kullanıcılar Supabase veritabanından getiriliyor...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-stone-300" />
                      <span className="font-semibold text-stone-600">
                        {searchQuery ? 'Aramanıza uygun kullanıcı bulunamadı.' : 'Henüz kayıtlı kullanıcı bulunmuyor.'}
                      </span>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-amber-700 hover:underline font-bold text-xs mt-1"
                        >
                          Aramayı Temizle
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = currentUserId === u.id;
                  const isAdmin = u.role === 'admin';
                  const initials = getInitials(u.full_name, u.email);

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/80 transition group">
                      
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                            isAdmin 
                              ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                              : 'bg-stone-100 text-stone-700 border border-stone-200'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                              <span>{u.full_name || 'İsimsiz Kullanıcı'}</span>
                              {isSelf && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-stone-900 text-white">
                                  SİZ
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono">
                              ID: {u.id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-stone-700 font-medium">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1 text-[11px] text-stone-500">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-stone-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{formatTurkishDate(u.created_at)}</span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>🔴 Admin (Yönetici)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>🔵 Müşteri</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        {isSelf ? (
                          <span 
                            className="px-3 py-1.5 rounded-xl bg-stone-100 text-stone-400 font-bold text-[11px] border border-stone-200 inline-flex items-center gap-1 cursor-not-allowed"
                            title="Aktif oturum açtığınız kendi hesabınızın yetkisini kaldıramazsınız."
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                            <span>Korumalı (Siz)</span>
                          </span>
                        ) : isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openConfirmModal(u, 'customer')}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            <ShieldMinus className="w-3.5 h-3.5 text-rose-600" />
                            <span>Yetkiyi Kaldır</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openConfirmModal(u, 'admin')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            <ShieldPlus className="w-3.5 h-3.5" />
                            <span>Admin Yap</span>
                          </button>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            Gösterilen: <strong className="text-stone-900">{filteredUsers.length}</strong> / Toplam: <strong className="text-stone-900">{users.length}</strong> kullanıcı
          </div>
          <div className="text-[11px] text-stone-400">
            * Yetki değişiklikleri anında Supabase Auth ve Profil tablolarına işlenir.
          </div>
        </div>

      </div>

      {/* CONFIRMATION MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in zoom-in-95 duration-150">
            
            {/* Modal Icon & Title */}
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl shrink-0 ${
                targetRole === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {targetRole === 'admin' ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  {targetRole === 'admin' ? 'Admin Yetkisi Onayı' : 'Admin Yetkisi Geri Alınıyor'}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedUser.full_name || selectedUser.email}
                </p>
              </div>
            </div>

            {/* Warning Box */}
            <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
              targetRole === 'admin'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              {targetRole === 'admin' ? (
                <span>
                  Bu kullanıcıya <strong>Admin (Yönetici)</strong> yetkisi vermek istediğinize emin misiniz? Kullanıcı; ürünleri, siparişleri, fiyat/stok bilgilerini ve tüm site ayarlarını tam yetkiyle yönetebilecektir.
                </span>
              ) : (
                <span>
                  Bu kullanıcının Admin yetkisini geri alıp <strong>Standart Müşteri</strong> seviyesine düşürmek istediğinize emin misiniz? Kullanıcının yönetim paneline (`/admin`) erişimi anında kesilecektir.
                </span>
              )}
            </div>

            {/* Target User Card */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-600">Hedef Kullanıcı:</span>
              <span className="font-bold text-stone-900">{selectedUser.email}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isUpdating}
                onClick={closeConfirmModal}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleConfirmRoleChange}
                className={`px-4 py-2.5 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center gap-1.5 disabled:opacity-50 ${
                  targetRole === 'admin' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : targetRole === 'admin' ? (
                  <>
                    <ShieldPlus className="w-3.5 h-3.5" />
                    <span>Evet, Admin Yap</span>
                  </>
                ) : (
                  <>
                    <ShieldMinus className="w-3.5 h-3.5" />
                    <span>Evet, Yetkiyi Kaldır</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function KullanicilarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-stone-500">Kullanıcılar yükleniyor...</div>}>
      <KullanicilarContent />
    </Suspense>
  );
}
