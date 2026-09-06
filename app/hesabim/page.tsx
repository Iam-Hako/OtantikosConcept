'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  Package, 
  RotateCcw, 
  MapPin, 
  LogOut, 
  Truck, 
  Plus,
  Home,
  Briefcase,
  Phone,
  Edit3,
  Trash2,
  CheckCircle2,
  Building,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { Order, ReturnRequest, UserAddress } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { TURKISH_PROVINCES } from '@/lib/data/provinces-and-districts';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function AccountPage() {
  const { user, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'returns' | 'profile'>('orders');

  // RMA Return Request Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('Beden/Ölçü Uygunsuzluğu');
  const [returnDetails, setReturnDetails] = useState('');

  // Address Modal & Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Address Fields
  const [addrTitle, setAddrTitle] = useState('Ev Adresim');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrProvince, setAddrProvince] = useState('İstanbul');
  const [addrDistrict, setAddrDistrict] = useState('Fatih');
  const [addrNeighborhood, setAddrNeighborhood] = useState('');
  const [addrDetail, setAddrDetail] = useState('');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  const currentUserId = user?.id || 'guest';

  // Load orders, returns, and addresses
  useEffect(() => {
    async function loadUserData() {
      try {
        const [orderList, returnList, addressList] = await Promise.all([
          user?.id ? DataService.getOrders(user.id) : Promise.resolve([]),
          user?.id ? DataService.getReturns(user.id) : Promise.resolve([]),
          DataService.getUserAddresses(currentUserId),
        ]);
        setOrders(orderList);
        setReturns(returnList);
        setAddresses(addressList);
      } catch (err) {
        // Fallback
      }
    }
    loadUserData();
  }, [user?.id, currentUserId]);

  // District options based on chosen province
  const currentProvinceData = TURKISH_PROVINCES.find((p) => p.name === addrProvince) || TURKISH_PROVINCES[0];
  const districtList = currentProvinceData ? currentProvinceData.districts : [];

  const handleProvinceChange = (newProv: string) => {
    setAddrProvince(newProv);
    const pData = TURKISH_PROVINCES.find((p) => p.name === newProv);
    if (pData && pData.districts.length > 0) {
      setAddrDistrict(pData.districts[0]);
    }
  };

  const handleOpenNewAddress = () => {
    setEditingAddress(null);
    setAddrTitle('Ev Adresim');
    setAddrFullName(user?.full_name || '');
    setAddrPhone(user?.phone || '');
    setAddrProvince('İstanbul');
    setAddrDistrict('Fatih');
    setAddrNeighborhood('');
    setAddrDetail('');
    setAddrPostalCode('');
    setAddrIsDefault(addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddress(addr);
    setAddrTitle(addr.title || 'Ev Adresim');
    setAddrFullName(addr.full_name || '');
    setAddrPhone(addr.phone || '');
    setAddrProvince(addr.province || 'İstanbul');
    setAddrDistrict(addr.district || 'Fatih');
    setAddrNeighborhood(addr.neighborhood || '');
    setAddrDetail(addr.address_detail || '');
    setAddrPostalCode(addr.postal_code || '');
    setAddrIsDefault(!!addr.is_default);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName.trim() || !addrPhone.trim() || !addrDetail.trim()) {
      toast.error('Lütfen ad soyad, telefon ve açık adres alanlarını eksiksiz doldurunuz.');
      return;
    }

    setIsSavingAddress(true);
    try {
      await DataService.saveUserAddress({
        id: editingAddress?.id,
        user_id: currentUserId,
        title: addrTitle.trim() || 'Adresim',
        full_name: addrFullName.trim(),
        phone: addrPhone.trim(),
        province: addrProvince,
        district: addrDistrict,
        neighborhood: addrNeighborhood.trim(),
        address_detail: addrDetail.trim(),
        postal_code: addrPostalCode.trim(),
        is_default: addrIsDefault,
      });

      const updated = await DataService.getUserAddresses(currentUserId);
      setAddresses(updated);
      setIsAddressModalOpen(false);
      toast.success(editingAddress ? 'Adresiniz başarıyla güncellendi!' : 'Yeni teslimat adresi başarıyla kaydedildi!');
    } catch {
      toast.error('Adres kaydedilirken bir hata oluştu.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) return;
    try {
      await DataService.deleteUserAddress(addressId, currentUserId);
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success('Adres başarıyla silindi.');
    } catch {
      toast.error('Adres silinemedi.');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await DataService.setDefaultUserAddress(currentUserId, addressId);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          is_default: a.id === addressId,
        }))
      );
      toast.success('Varsayılan teslimat adresiniz güncellendi.');
    } catch {
      toast.error('Varsayılan adres güncellenemedi.');
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;

    const newRet = await DataService.createReturn({
      order_id: selectedOrderForReturn.id,
      user_id: user?.id || null,
      reason: returnReason,
      details: returnDetails,
    });

    setReturns((prev) => {
      const filtered = prev.filter((r) => r.id !== newRet.id && !r.id.startsWith('ret-'));
      return [newRet, ...filtered];
    });
    setIsReturnModalOpen(false);
    setReturnDetails('');
    toast.success('İade / Değişim talebiniz başarıyla oluşturuldu!', {
      description: 'Talebiniz Otantikos yetkililerimizce incelenip yanıtlanacaktır.',
    });
    setActiveTab('returns');
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 pb-24 lg:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 sm:pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-lg sm:text-xl shadow-2xs">
            {user?.full_name?.charAt(0) || 'M'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 leading-tight">
              {user?.full_name || 'Müşteri Hesabım'}
            </h1>
            <p className="text-xs text-stone-500">{user?.email || 'Giriş yapılmadı'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {user && (
            <button
              onClick={logout}
              className="px-3.5 py-2.5 border border-stone-300 text-stone-700 hover:text-rose-600 hover:bg-rose-50 active:scale-95 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 min-h-[40px] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs with Horizontal Scroll for Mobile */}
      <div className="flex gap-2 border-b border-stone-200 overflow-x-auto scrollbar-none whitespace-nowrap -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] cursor-pointer ${
            activeTab === 'orders'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Siparişlerim ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Kayıtlı Adreslerim ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] cursor-pointer ${
            activeTab === 'returns'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>İade & Değişim Masası ({returns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold transition border-b-2 flex items-center gap-2 shrink-0 min-h-[44px] cursor-pointer ${
            activeTab === 'profile'
              ? 'border-orange-600 text-orange-700'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil ve Bilgilerim</span>
        </button>
      </div>

      {/* 1. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">Kayıtlı Siparişiniz Bulunmuyor</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4">Tahtakale koleksiyonumuzdan ilk siparişinizi verin.</p>
              <Link href="/kategori/tum-urunler" className="inline-flex px-5 py-3 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl transition min-h-[44px] items-center">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400">Sipariş No: </span>
                    <strong className="font-mono text-stone-900">{ord.order_number}</strong>
                    <span className="text-stone-400 ml-2 sm:ml-3">{formatDate(ord.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-900 font-bold rounded-full capitalize text-[11px] border border-orange-200">
                      {ord.status.replace('_', ' ')}
                    </span>

                    <Link
                      href={`/siparis-takip?order_number=${ord.order_number}`}
                      className="text-orange-700 font-bold hover:underline flex items-center gap-1 min-h-[36px]"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Kargo İzle</span>
                    </Link>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100">
                  {ord.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{item.product_name}</div>
                        <div className="text-[11px] text-stone-500">
                          {item.quantity} Adet {item.variant_name ? `(${item.variant_name})` : ''} • Adet: {formatPrice(item.unit_price || item.price)}
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">{formatPrice(item.total_price || item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="text-stone-600">
                    Teslimat: <strong>{ord.delivery_type === 'pickup' ? 'Tahtakale Mağaza Teslim' : `${ord.shipping_address?.province || ''} / ${ord.shipping_address?.district || ''}`}</strong>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <div>
                      <span className="text-stone-400">Toplam: </span>
                      <strong className="text-sm sm:text-base font-black text-orange-700">{formatPrice(ord.total_amount)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderForReturn(ord);
                        setIsReturnModalOpen(true);
                      }}
                      className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-bold rounded-xl text-xs transition min-h-[40px] cursor-pointer"
                    >
                      İade Talebi Aç
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. SAVED ADDRESSES TAB */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-stone-900">Kayıtlı Açık Adreslerim</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Siparişlerinizde DHL Kargo teslimatı için kullanacağınız açık adresleri buradan ekleyebilir ve düzenleyebilirsiniz.
              </p>
            </div>
            <button
              onClick={handleOpenNewAddress}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Açık Adres Ekle</span>
            </button>
          </div>

          {/* Addresses Grid */}
          {addresses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Henüz Kayıtlı Bir Açık Adresiniz Yok</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto mb-5">
                Hızlı ve güvenli kargo gönderimleri için ev veya iş yeri açık adresinizi şimdi ekleyin.
              </p>
              <button
                onClick={handleOpenNewAddress}
                className="inline-flex px-5 py-3 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl transition min-h-[44px] items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>İlk Adresinizi Ekleyin</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isHome = addr.title?.toLowerCase().includes('ev');
                const isWork = addr.title?.toLowerCase().includes('iş') || addr.title?.toLowerCase().includes('is');
                const TitleIcon = isHome ? Home : isWork ? Briefcase : Building;

                return (
                  <div
                    key={addr.id}
                    className={`relative bg-white rounded-2xl p-5 border transition shadow-2xs flex flex-col justify-between gap-4 ${
                      addr.is_default
                        ? 'border-orange-500 ring-2 ring-orange-500/10'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                            <TitleIcon className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xs sm:text-sm text-stone-900">{addr.title}</h3>
                          </div>
                        </div>

                        {addr.is_default ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Varsayılan Teslimat</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] font-bold text-stone-500 hover:text-orange-600 transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Varsayılan Yap</span>
                          </button>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="pt-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-stone-900 font-bold">
                          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{addr.full_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-600">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{addr.phone}</span>
                        </div>

                        <div className="flex items-start gap-2 text-stone-700 mt-2">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5 leading-relaxed">
                            <p className="font-medium text-stone-900">{addr.address_detail}</p>
                            <p className="text-stone-500 text-[11px]">
                              {addr.neighborhood ? `${addr.neighborhood} Mah., ` : ''}
                              {addr.district} / {addr.province}
                              {addr.postal_code ? ` • ${addr.postal_code}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => handleOpenEditAddress(addr)}
                        className="px-3 py-1.5 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold rounded-lg border border-stone-200 transition flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Edit3 className="w-3 h-3 text-stone-500" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg border border-rose-200 transition flex items-center gap-1.5 cursor-pointer text-[11px]"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. RETURNS (RMA) TAB */}
      {activeTab === 'returns' && (
        <div className="space-y-4">
          {returns.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-2xs">
              <RotateCcw className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-900">Aktif İade/Değişim Talebiniz Yok</h3>
              <p className="text-xs text-stone-500 mt-1">Siparişlerim sekmesinden dilediğiniz sipariş için 14 gün yasal iade talebi oluşturabilirsiniz.</p>
            </div>
          ) : (
            returns.map((ret) => (
              <div key={ret.id} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-stone-900">Talep #{ret.id}</span>
                    <span className="text-stone-400 ml-2">Tarih: {formatDate(ret.created_at)}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                    ret.status === 'onaylandi' ? 'bg-emerald-100 text-emerald-800' :
                    ret.status === 'reddedildi' ? 'bg-rose-100 text-rose-800' : 'bg-orange-100 text-orange-900'
                  }`}>
                    {ret.status.toUpperCase()}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl space-y-1">
                  <div><strong>Neden:</strong> {ret.reason}</div>
                  {ret.details && <div><strong>Açıklama:</strong> {ret.details}</div>}
                </div>

                {ret.admin_response && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <strong>Yönetici Yanıtı:</strong> {ret.admin_response}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 max-w-lg space-y-4 text-xs shadow-2xs">
          <h3 className="text-sm font-bold text-stone-900">Kullanıcı Bilgileri</h3>
          <div className="space-y-2 text-stone-700">
            <div><strong>Ad Soyad:</strong> {user?.full_name || 'Tanımlanmamış'}</div>
            <div><strong>E-Posta:</strong> {user?.email}</div>
            <div><strong>Hesap Türü:</strong> {user?.role === 'admin' ? 'Yönetici (Admin)' : 'Standart Müşteri'}</div>
            <div><strong>Kayıtlı Adres Sayısı:</strong> {addresses.length} adet</div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92dvh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm sm:text-base text-stone-900">
                  {editingAddress ? 'Açık Adresi Düzenle' : 'Yeni Açık Adres Ekle'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddressModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSaveAddress} className="space-y-4">
              
              {/* Preset Buttons & Title */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                  Adres Başlığı *
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {['Ev Adresim', 'İş Yeri', 'Yazlık'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAddrTitle(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                        addrTitle === preset
                          ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                  placeholder="Örn: Ev Adresim, İş Yeri..."
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                />
              </div>

              {/* Recipient Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Alıcı Ad Soyad *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    placeholder="Ad Soyad"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Telefon Numarası *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  />
                </div>
              </div>

              {/* Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    İl *
                  </label>
                  <select
                    value={addrProvince}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  >
                    {TURKISH_PROVINCES.map((prov) => (
                      <option key={prov.name} value={prov.name}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    İlçe *
                  </label>
                  <select
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  >
                    {districtList.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Neighborhood & Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Mahalle / Semt
                  </label>
                  <input
                    type="text"
                    value={addrNeighborhood}
                    onChange={(e) => setAddrNeighborhood(e.target.value)}
                    placeholder="Örn: Süleymaniye Mah."
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    value={addrPostalCode}
                    onChange={(e) => setAddrPostalCode(e.target.value)}
                    placeholder="Örn: 34116"
                    className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                  />
                </div>
              </div>

              {/* Open Address Detail */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Açık Adres (Cadde, Sokak, Bina No, Daire, Kat vb.) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                  placeholder="Cadde, sokak adı, bina ve kapı numarası, daire, kat ve kurye için açık teslimat tarifi..."
                  className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition leading-relaxed"
                />
              </div>

              {/* Default Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="addrIsDefault"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 text-orange-600 rounded border-stone-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="addrIsDefault" className="text-xs font-medium text-stone-800 cursor-pointer select-none">
                  Bu adresi varsayılan teslimat adresi olarak ayarla
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="w-1/3 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="w-2/3 py-3 bg-orange-600 hover:bg-orange-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition min-h-[44px] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingAddress ? 'Kaydediliyor...' : editingAddress ? 'Değişiklikleri Kaydet' : 'Adresi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RMA RETURN REQUEST MODAL */}
      {isReturnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-orange-700" />
                <span>İade & Değişim Talebi</span>
              </h3>
              <button 
                onClick={() => setIsReturnModalOpen(false)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              <strong>{selectedOrderForReturn.order_number}</strong> numaralı siparişiniz için 14 gün koşulsuz iade/değişim talebi oluşturuyorsunuz.
            </p>

            <form onSubmit={handleCreateReturn} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Talep Nedeni *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                >
                  <option value="Beden/Ölçü Uygunsuzluğu">Beden / Ölçü Uygunsuzluğu (Farklı model ile değişim)</option>
                  <option value="Vazgeçtim / Cayma Hakkı">Vazgeçtim / 14 Gün Yasal Cayma Hakkı</option>
                  <option value="Kargo Hasarlı / Kusurlu Ürün">Kargo Hasarlı veya Kusurlu Ürün</option>
                  <option value="Yanlış Ürün Gönderimi">Yanlış Ürün Gönderimi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Açıklama ve Talebiniz *</label>
                <textarea
                  rows={3}
                  required
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="İade veya değişim ile ilgili detaylı notunuzu yazınız..."
                  className="w-full text-base sm:text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-orange-600 text-stone-900 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition min-h-[48px] cursor-pointer"
              >
                Talebi Gönder
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
