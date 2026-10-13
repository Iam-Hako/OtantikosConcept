'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TURKISH_PROVINCES } from '@/lib/data/provinces-and-districts';
import { MapPin, Navigation, Building2, Home, Search, ChevronDown, Check, Loader2 } from 'lucide-react';

export interface TurkishAddressState {
  province: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  apartmentNo: string;
  fullAddress: string;
  courierNote?: string;
}

interface TurkishAddressSelectorProps {
  value: TurkishAddressState;
  onChange: (updated: TurkishAddressState) => void;
  disabled?: boolean;
}

export default function TurkishAddressSelector({
  value,
  onChange,
  disabled = false,
}: TurkishAddressSelectorProps) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);

  const [streetOptions, setStreetOptions] = useState<string[]>([]);
  const [isLoadingStreets, setIsLoadingStreets] = useState(false);
  const [isStreetDropdownOpen, setIsStreetDropdownOpen] = useState(false);
  const streetDropdownRef = useRef<HTMLDivElement>(null);

  // Update district options whenever province changes
  useEffect(() => {
    const found = TURKISH_PROVINCES.find((p) => p.name === value.province);
    if (found) {
      setDistricts(found.districts);
    } else {
      setDistricts([]);
    }
  }, [value.province]);

  // Fetch neighborhoods whenever province and district change
  useEffect(() => {
    if (!value.province || !value.district) {
      setNeighborhoods([]);
      return;
    }

    let isMounted = true;
    setIsLoadingNeighborhoods(true);

    const cleanDist = value.district.replace(/\s*\(.*?\)/, '').trim();

    fetch(`/api/address/neighborhoods?province=${encodeURIComponent(value.province)}&district=${encodeURIComponent(cleanDist)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.neighborhoods && Array.isArray(data.neighborhoods)) {
            setNeighborhoods(data.neighborhoods);
          } else {
            setNeighborhoods([]);
          }
        }
      })
      .catch((err) => {
        console.warn('[Neighborhoods Load Notice]', err);
        if (isMounted) setNeighborhoods([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingNeighborhoods(false);
      });

    return () => {
      isMounted = false;
    };
  }, [value.province, value.district]);

  // Fetch streets whenever neighborhood changes
  useEffect(() => {
    if (!value.province || !value.district || !value.neighborhood) {
      setStreetOptions([]);
      return;
    }

    let isMounted = true;
    setIsLoadingStreets(true);

    const cleanDist = value.district.replace(/\s*\(.*?\)/, '').trim();

    fetch(
      `/api/address/streets?province=${encodeURIComponent(value.province)}&district=${encodeURIComponent(
        cleanDist
      )}&neighborhood=${encodeURIComponent(value.neighborhood)}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data.streets && Array.isArray(data.streets)) {
            setStreetOptions(data.streets);
          } else {
            setStreetOptions([]);
          }
        }
      })
      .catch((err) => {
        console.warn('[Streets Load Notice]', err);
        if (isMounted) setStreetOptions([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStreets(false);
      });

    return () => {
      isMounted = false;
    };
  }, [value.province, value.district, value.neighborhood]);

  // Live debounced search when user types in street field
  useEffect(() => {
    if (!value.province || !value.district || !value.neighborhood) {
      return;
    }
    const query = (value.street || '').trim();
    if (query.length < 2) return;

    const timer = setTimeout(() => {
      const cleanDist = value.district.replace(/\s*\(.*?\)/, '').trim();
      fetch(
        `/api/address/streets?province=${encodeURIComponent(value.province)}&district=${encodeURIComponent(
          cleanDist
        )}&neighborhood=${encodeURIComponent(value.neighborhood)}&query=${encodeURIComponent(query)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.streets && Array.isArray(data.streets) && data.streets.length > 0) {
            setStreetOptions((prev) => {
              const merged = Array.from(new Set([...data.streets, ...prev])).sort((a, b) =>
                a.localeCompare(b, 'tr')
              );
              return merged;
            });
          }
        })
        .catch(() => {});
    }, 350);

    return () => clearTimeout(timer);
  }, [value.province, value.district, value.neighborhood, value.street]);

  // Close street dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (streetDropdownRef.current && !streetDropdownRef.current.contains(event.target as Node)) {
        setIsStreetDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute composite full address
  const buildFullAddress = (state: TurkishAddressState) => {
    const parts = [];
    if (state.neighborhood) parts.push(state.neighborhood);
    if (state.street) parts.push(state.street);
    if (state.buildingNo) parts.push(`No: ${state.buildingNo}`);
    if (state.apartmentNo) parts.push(`Daire: ${state.apartmentNo}`);
    if (state.courierNote) parts.push(`(${state.courierNote})`);
    return parts.join(' ').trim();
  };

  const updateState = (partial: Partial<TurkishAddressState>) => {
    const next = { ...value, ...partial };
    // Automatically regenerate fullAddress string if structural parts changed
    if (
      partial.neighborhood !== undefined ||
      partial.street !== undefined ||
      partial.buildingNo !== undefined ||
      partial.apartmentNo !== undefined ||
      partial.courierNote !== undefined
    ) {
      next.fullAddress = buildFullAddress(next);
    }
    onChange(next);
  };

  const handleProvinceSelect = (newProvince: string) => {
    const found = TURKISH_PROVINCES.find((p) => p.name === newProvince);
    const newDistrict = found && found.districts.length > 0 ? found.districts[0] : '';
    updateState({
      province: newProvince,
      district: newDistrict,
      neighborhood: '',
      street: '',
      buildingNo: '',
      apartmentNo: '',
    });
  };

  const handleDistrictSelect = (newDistrict: string) => {
    updateState({
      district: newDistrict,
      neighborhood: '',
      street: '',
      buildingNo: '',
      apartmentNo: '',
    });
  };

  const handleNeighborhoodSelect = (newNeighborhood: string) => {
    updateState({
      neighborhood: newNeighborhood,
      street: '',
    });
  };

  // Filtered street options based on what the user types in street input
  const filteredStreets = streetOptions.filter((s) =>
    s.toLowerCase().includes((value.street || '').toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Row 1: İl & İlçe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. İl Seçimi */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#e60012]" />
            <span>İl (Şehir) *</span>
          </label>
          <div className="relative">
            <select
              value={value.province}
              disabled={disabled}
              onChange={(e) => handleProvinceSelect(e.target.value)}
              className="w-full text-xs p-2.5 pr-8 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] appearance-none font-medium cursor-pointer transition disabled:opacity-60"
            >
              {TURKISH_PROVINCES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 2. İlçe Seçimi */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#e60012]" />
            <span>İlçe *</span>
          </label>
          <div className="relative">
            <select
              value={value.district}
              disabled={disabled || districts.length === 0}
              onChange={(e) => handleDistrictSelect(e.target.value)}
              className="w-full text-xs p-2.5 pr-8 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] appearance-none font-medium cursor-pointer transition disabled:opacity-60"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Row 2: Mahalle & Sokak / Cadde */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 3. Mahalle Seçimi (Açılır Kaydırılabilir Menü) */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#e60012]" />
              <span>Mahalle / Köy *</span>
            </span>
            {isLoadingNeighborhoods && (
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Yükleniyor...
              </span>
            )}
          </label>
          <div className="relative">
            <select
              value={value.neighborhood}
              disabled={disabled || isLoadingNeighborhoods}
              onChange={(e) => handleNeighborhoodSelect(e.target.value)}
              className="w-full text-xs p-2.5 pr-8 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] appearance-none font-medium cursor-pointer transition disabled:opacity-60"
            >
              <option value="">
                {isLoadingNeighborhoods
                  ? 'Mahalleler yükleniyor...'
                  : neighborhoods.length > 0
                  ? 'Mahallenizi Seçiniz...'
                  : 'Mahalle Seçiniz'}
              </option>
              {neighborhoods.map((hood) => (
                <option key={hood} value={hood}>
                  {hood}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* 4. Sokak / Cadde Seçimi (Akıllı Açılır & Aranabilir Menü) */}
        <div ref={streetDropdownRef} className="relative">
          <label className="block text-[11px] font-bold text-stone-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5 text-[#e60012]" />
              <span>Cadde / Sokak *</span>
            </span>
            {isLoadingStreets ? (
              <span className="text-[10px] text-stone-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Sokaklar Aranıyor...
              </span>
            ) : streetOptions.length > 0 ? (
              <span className="text-[10px] text-emerald-600 font-semibold">
                ✓ {streetOptions.length} Cadde/Sokak Listelendi
              </span>
            ) : null}
          </label>

          <div className="relative">
            <input
              type="text"
              required
              disabled={disabled || !value.neighborhood}
              placeholder={
                !value.neighborhood
                  ? 'Önce mahalle seçiniz...'
                  : streetOptions.length > 0
                  ? 'Listeden seçin veya sokak adını yazın...'
                  : 'Sokak / Cadde adını giriniz...'
              }
              value={value.street}
              onChange={(e) => {
                updateState({ street: e.target.value });
                setIsStreetDropdownOpen(true);
              }}
              onFocus={() => {
                if (streetOptions.length > 0) {
                  setIsStreetDropdownOpen(true);
                }
              }}
              className="w-full text-xs p-2.5 pr-8 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] font-medium transition disabled:opacity-60"
            />
            <button
              type="button"
              disabled={disabled || !value.neighborhood || streetOptions.length === 0}
              onClick={() => setIsStreetDropdownOpen(!isStreetDropdownOpen)}
              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              title="Sokak Listesini Aç"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Street Dropdown Menu */}
          {isStreetDropdownOpen && (streetOptions.length > 0 || (value.street && value.street.trim().length > 0)) && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-300 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-stone-100 text-xs">
              {value.street && value.street.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsStreetDropdownOpen(false)}
                  className="w-full text-left p-2.5 bg-amber-50/80 hover:bg-amber-100 text-amber-950 font-semibold flex items-center justify-between transition cursor-pointer border-b border-amber-200"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span>✍️</span>
                    <span className="text-stone-600 font-normal">Yazdığınız haliyle kullan:</span>
                    <span className="text-[#e60012] font-bold">&quot;{value.street}&quot;</span>
                  </span>
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 ml-1" />
                </button>
              )}

              <div className="p-2 bg-stone-50 text-[10px] text-stone-500 font-bold sticky top-0 flex items-center justify-between">
                <span>{value.neighborhood} Önerilen Cadde ve Sokakları:</span>
                <span>{filteredStreets.length} sonuç</span>
              </div>

              {filteredStreets.length === 0 ? (
                <div className="p-3 text-stone-500 text-center text-[11px] bg-stone-50/50">
                  {value.street ? (
                    <span>Listede eşleşen sokak bulunamadı. Yazdığınız <b>&quot;{value.street}&quot;</b> adrese eklenecektir.</span>
                  ) : (
                    <span>Aramak için sokak adını yazmaya başlayabilirsiniz.</span>
                  )}
                </div>
              ) : (
                filteredStreets.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      updateState({ street: st });
                      setIsStreetDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 hover:bg-red-50 hover:text-[#e60012] transition flex items-center justify-between cursor-pointer ${
                      value.street === st ? 'bg-red-50/80 font-bold text-[#e60012]' : 'text-stone-800'
                    }`}
                  >
                    <span>{st}</span>
                    {value.street === st && <Check className="w-3.5 h-3.5 text-[#e60012]" />}
                  </button>
                ))
              )}
            </div>
          )}
          <p className="text-[10px] text-stone-400 mt-1">
            💡 Listeden seçebilir veya sokak adınızı doğrudan klavyenizle yazabilirsiniz.
          </p>
        </div>
      </div>

      {/* Row 3: Bina No, Daire/Kat & Kurye Notu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Bina / Kapı No */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            Bina / Kapı No *
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="Örn: 14 veya 14/A"
            value={value.buildingNo}
            onChange={(e) => updateState({ buildingNo: e.target.value })}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] font-medium"
          />
        </div>

        {/* Daire / Kat No */}
        <div>
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            Daire / Kat No *
          </label>
          <input
            type="text"
            required
            disabled={disabled}
            placeholder="Örn: D: 5, Kat: 2"
            value={value.apartmentNo}
            onChange={(e) => updateState({ apartmentNo: e.target.value })}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] font-medium"
          />
        </div>

        {/* Kurye / Zil Notu */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-bold text-stone-700 mb-1">
            Kurye / Zil Notu
          </label>
          <input
            type="text"
            disabled={disabled}
            placeholder="Örn: Eczanenin üstü, zile basınız"
            value={value.courierNote || ''}
            onChange={(e) => updateState({ courierNote: e.target.value })}
            className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#e60012] font-medium"
          />
        </div>
      </div>

      {/* Row 4: Otomatik Birleştirilen Tam Adres Özeti */}
      {value.fullAddress && (
        <div className="p-3 bg-stone-50/90 rounded-xl border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="font-bold text-stone-900 block text-[10px] uppercase tracking-wider text-stone-400">
              Kargo Teslimat Adresi Özeti:
            </span>
            <span className="font-medium text-stone-800 break-words leading-relaxed">
              {value.fullAddress} {value.district} / {value.province}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
