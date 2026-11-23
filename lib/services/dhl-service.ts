/**
 * DHL eCommerce Turkey (MNG Kargo Altyapısı) REST API Entegrasyonu
 * 
 * Resmi DHL eCommerce TR (MNG Kargo) 3 Aşamalı Kargo Gönderi & Barkod Sistemi:
 * 1. createRecipient (Plus Command): Varış şube tespiti için alıcı kaydı
 * 2. createOrder (Standart Command): Sipariş ve paket verisinin aktarımı
 * 3. createbarcode (Barcode Command): 10x10 termal ZPL barkod ve gönderi takip no üretimi
 * 4. cancelshipment (Barcode Command): Gönderi iptali
 * 5. trackshipment (Standard Query): Canlı kargo hareket takibi
 */

// Yapılandırma ve Ortam Değişkenleri
const explicitDhlEnv = (process.env.DHL_ECOM_ENV || '').trim().toLowerCase();
const dhlEnv = explicitDhlEnv || 'production'; // Varsayılan olarak canlı API; sandbox için DHL_ECOM_ENV=sandbox ayarlanabilir
const dhlClientId = (process.env.DHL_ECOM_CLIENT_ID || process.env.DHL_API_KEY || process.env.DHL_CLIENT_ID || '').trim();
const dhlClientSecret = (process.env.DHL_ECOM_CLIENT_SECRET || process.env.DHL_API_SECRET || process.env.DHL_CLIENT_SECRET || '').trim();
const dhlCustomerNumber = (process.env.DHL_ECOM_CUSTOMER_NUMBER || process.env.DHL_ACCOUNT_NUMBER || process.env.DHL_CUSTOMER_NUMBER || '').trim();
const dhlPassword = (process.env.DHL_ECOM_PASSWORD || process.env.DHL_API_PASSWORD || '').trim();
const dhlIdentityType = Number(process.env.DHL_ECOM_IDENTITY_TYPE || 1);

const DHL_PROD_URL = 'https://api.mngkargo.com.tr/mngapi/api';
const DHL_SANDBOX_URL = 'https://testapi.mngkargo.com.tr/mngapi/api';

export const DHL_ECOM_BASE_URL = dhlEnv === 'sandbox' ? DHL_SANDBOX_URL : DHL_PROD_URL;

export const isDhlEcomConfigured = Boolean(dhlClientId && dhlClientSecret && dhlCustomerNumber && dhlPassword);
export const isDhlUnifiedTrackingConfigured = Boolean(dhlClientId);

export function getDhlMissingConfigFields(): string[] {
  const missing: string[] = [];
  if (!dhlClientId) missing.push('DHL_ECOM_CLIENT_ID / DHL_API_KEY');
  if (!dhlClientSecret) missing.push('DHL_ECOM_CLIENT_SECRET / DHL_API_SECRET');
  if (!dhlCustomerNumber) missing.push('DHL_ECOM_CUSTOMER_NUMBER');
  if (!dhlPassword) missing.push('DHL_ECOM_PASSWORD');
  return missing;
}

// Gönderici Firma Bilgisi (Otantikos Concept - Eminönü Tahtakale)
export const OTANTIKOS_SHIPPER_INFO = {
  companyName: 'OTANTİKOS HEDİYELİK EŞYA OYUNCAK TİCARET LİMİTED ŞİRKETİ',
  contactName: 'Ahmet Bartuğ Tokmak',
  phone: '05374676590',
  email: 'info@otantikosconcept.com',
  addressLine1: 'Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G',
  cityName: 'İSTANBUL',
  districtName: 'FATİH',
  postalCode: '34116',
  countryCode: 'TR',
};

/**
 * Resmi DHL eCommerce TR Anlaşmalı Desi Fiyat Tarifesi
 * (Şule Gedik - DHL eCom TR Teklifi: Tüm Türkiye hatları tek fiyattır)
 */
export interface DhlDesiRate {
  minDesi: number;
  maxDesi: number;
  basePrice: number; // KDV hariç baz fiyat
}

export const DHL_NEGOTIATED_RATES: DhlDesiRate[] = [
  { minDesi: 0, maxDesi: 2, basePrice: 116.89 },
  { minDesi: 3, maxDesi: 5, basePrice: 129.03 },
  { minDesi: 6, maxDesi: 10, basePrice: 163.64 },
  { minDesi: 11, maxDesi: 15, basePrice: 204.50 },
  { minDesi: 16, maxDesi: 20, basePrice: 235.29 },
  { minDesi: 21, maxDesi: 25, basePrice: 302.08 },
  { minDesi: 26, maxDesi: 30, basePrice: 362.50 },
  { minDesi: 31, maxDesi: 35, basePrice: 450.88 },
  { minDesi: 36, maxDesi: 40, basePrice: 507.01 },
  { minDesi: 41, maxDesi: 45, basePrice: 605.60 },
  { minDesi: 46, maxDesi: 50, basePrice: 681.58 },
];

export const DHL_ADDITIONAL_DESI_RATE = 18.22; // 50 desi üzeri her +1 desi başı

/**
 * Desi değerine göre net maliyeti ve KDV dahil tutarını hesaplar.
 */
export function calculateDhlShippingCost(desi: number) {
  const normalizedDesi = Math.max(0.1, Number(desi) || 1);
  const billableDesi = Math.ceil(normalizedDesi);

  let basePrice = 116.89;
  if (billableDesi <= 50) {
    const tier = DHL_NEGOTIATED_RATES.find(
      (t) => billableDesi >= t.minDesi && billableDesi <= t.maxDesi
    );
    basePrice = tier ? tier.basePrice : 116.89;
  } else {
    const extraDesi = billableDesi - 50;
    basePrice = 681.58 + extraDesi * DHL_ADDITIONAL_DESI_RATE;
  }

  const kdvAmount = Number((basePrice * 0.20).toFixed(2));
  const totalWithKdv = Number((basePrice + kdvAmount).toFixed(2));

  return {
    desi: normalizedDesi,
    billableDesi,
    basePrice: Number(basePrice.toFixed(2)),
    kdvAmount,
    totalWithKdv,
  };
}

/**
 * Sepetteki veya siparişteki ürünlerin toplam desi değerini hesaplar.
 */
export function calculateItemsTotalDesi(
  items: Array<{ quantity: number; product?: any; desi?: number }>
): number {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((acc, item) => {
    const itemDesi = Number(item.desi || item.product?.desi || item.product?.weight_kg) || 1;
    const qty = Number(item.quantity) || 1;
    return acc + (itemDesi * qty);
  }, 0);
  return Number(total.toFixed(2));
}

/**
 * Sepet içeriği ve teslimat türüne göre dinamik DHL kargo ücretini hesaplar
 */
export function calculateDynamicShippingFee(
  items: Array<{ quantity: number; product?: any; desi?: number }>,
  deliveryType: string = 'kargo'
): { totalDesi: number; billableDesi: number; shippingFee: number; isPickup: boolean } {
  const isPickup = deliveryType === 'magaza_teslim';
  if (isPickup || !items || items.length === 0) {
    return {
      totalDesi: 0,
      billableDesi: 0,
      shippingFee: 0,
      isPickup: true,
    };
  }

  const totalDesi = calculateItemsTotalDesi(items);
  const cost = calculateDhlShippingCost(totalDesi);

  return {
    totalDesi,
    billableDesi: cost.billableDesi,
    shippingFee: cost.basePrice,
    isPickup: false,
  };
}

// -------------------------------------------------------------
// JWT Token Yönetimi (8 Saatlik Token Önbellekleme)
// -------------------------------------------------------------
interface DhlTokenCache {
  jwt: string;
  baseUrl: string;
  expiresAt: number;
}
let tokenCache: DhlTokenCache | null = null;

async function requestDhlTokenFromBase(baseUrl: string): Promise<string | null> {
  const res = await fetch(`${baseUrl}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ibm-client-id': dhlClientId,
      'x-ibm-client-secret': dhlClientSecret,
    },
    body: JSON.stringify({
      customerNumber: dhlCustomerNumber,
      password: dhlPassword,
      identityType: dhlIdentityType,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[DHL eCom Token Hatası - ${baseUrl}]`, res.status, errText);
    return null;
  }

  const data = await res.json();
  return data?.jwt || null;
}

export async function getDhlEcomToken(): Promise<{ jwt: string; baseUrl: string } | null> {
  // Eğer geçerli önbellek varsa onu kullan (1 dakika pay bırak)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60000) {
    return { jwt: tokenCache.jwt, baseUrl: tokenCache.baseUrl };
  }

  if (!isDhlEcomConfigured) {
    return null;
  }

  const candidateBases = explicitDhlEnv
    ? [DHL_ECOM_BASE_URL]
    : [DHL_PROD_URL, DHL_SANDBOX_URL];

  for (const base of candidateBases) {
    try {
      const jwt = await requestDhlTokenFromBase(base);
      if (jwt) {
        tokenCache = {
          jwt,
          baseUrl: base,
          expiresAt: Date.now() + 7.5 * 3600 * 1000,
        };
        return { jwt, baseUrl: base };
      }
    } catch (err) {
      console.error(`[DHL eCom Token Bağlantı İstisnası - ${base}]`, err);
    }
  }

  return null;
}

// -------------------------------------------------------------
// Servis Parametreleri ve Yanıt Arayüzleri
// -------------------------------------------------------------
export interface DhlCreateShipmentParams {
  orderNumber: string;
  recipientName: string;
  phone: string;
  email?: string;
  addressLine: string;
  city: string;
  district?: string;
  postalCode?: string;
  countryCode?: string;
  weightInKg?: number;
  desi?: number;
  itemDescription?: string;
  packageCount?: number;
  isCOD?: boolean;
  codAmount?: number;
}

export interface DhlShipmentResult {
  success: boolean;
  trackingNumber?: string;
  referenceId?: string;
  invoiceId?: string;
  barcode?: string;
  zpl?: string;
  labelUrl?: string;
  carrier: string;
  isSimulated?: boolean;
  message?: string;
  error?: string;
}

export interface DhlTrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  statusCode?: string;
}

export interface DhlTrackingResult {
  success: boolean;
  trackingNumber: string;
  status: 'siparis_alindi' | 'kargoya_verildi' | 'dagitimda' | 'teslim_edildi';
  statusDescription: string;
  estimatedDelivery?: string;
  events: DhlTrackingEvent[];
  isSimulated?: boolean;
  error?: string;
}

function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('90')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned || '5551234567';
}

/**
 * 10x10 cm Zebra Termal Yazıcı İçin Örnek ZPL Şablon Üretici (Simülasyon Modu)
 */
function generateSample10x10Zpl(params: {
  orderNumber: string;
  trackingNumber: string;
  barcodeText: string;
  recipientName: string;
  city: string;
  district: string;
  addressLine: string;
  phone: string;
  desi: number;
}): string {
  const today = new Date().toLocaleDateString('tr-TR');
  return `^XA
^MMT
^CI28
^PW831
^LL0959
^LS0
~SD20
^PRB
^FT658,45^A0N,23,28^FH^FDMNG^FS
^FT717,45^A0N,23,31^FH^FDKargo / DHL eCommerce^FS
^FO483,46^GB171,535,2^FS
^FT637,48^A0R,14,14^FH^FDOTANTIKOS CONCEPT HEDIYELIK^FS
^FT619,48^A0R,14,14^FH^FDSuleymaniye Mah. Eminonu FATIH / ISTANBUL^FS
^FT602,450^A0R,17,19^FH^FDTEL: 05374676590^FS
^FT574,450^A0R,20,19^FH^FDTEL: ${params.phone}^FS
^FT574,50^A0R,20,19^FH^FD${params.recipientName.toUpperCase()}^FS
^FT533,49^A0R,17,16^FH^FD${params.addressLine.toUpperCase()} [${params.district.toUpperCase()} / ${params.city.toUpperCase()}]^FS
^FT701,50^A0R,20,19^FH^FD${today}^FS
^FT701,147^A0R,20,19^FH^FDPAKET^FS
^FT680,50^A0R,20,19^FH^FDKg:${params.desi} Ds:${params.desi}^FS
^FT110,568^A0R,17,17^FH^FDREF:${params.orderNumber}^FS
^BY3,3,259^FT147,30^BCR,,N,N^FD>:${params.barcodeText}^FS
^PQ1,0,1,Y^XZ`;
}

// -------------------------------------------------------------
// 3 Aşamalı Kargo Gönderisi Oluşturma (createDhlShipment)
// -------------------------------------------------------------
export async function createDhlShipment(
  params: DhlCreateShipmentParams
): Promise<DhlShipmentResult> {
  const cleanOrderNumber = params.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  const cleanPhone = cleanPhoneNumber(params.phone);
  const city = (params.city || 'İSTANBUL').toUpperCase();
  const district = (params.district || 'FATİH').toUpperCase();
  const finalDesi = Math.max(1, Math.ceil(params.desi || params.weightInKg || 1));
  const finalKg = Math.max(1, Math.ceil(params.weightInKg || finalDesi));

  // Eksik kimlik bilgisi varsa sessizce sahte barkod üretmek yerine açık teşhis döndür
  if (!isDhlEcomConfigured) {
    const missing = getDhlMissingConfigFields();
    return {
      success: false,
      carrier: 'DHL Kargo',
      error: `DHL eCommerce TR gönderi oluşturma bilgileri eksik: ${missing.join(', ')}. (Vercel ortam değişkenlerine bu bilgileri ekleyebilir veya takip numarasını elle girebilirsiniz.)`,
    };
  }

  // Canlı / Sandbox DHL eCommerce API Çağrısı
  try {
    const authToken = await getDhlEcomToken();
    if (!authToken) {
      return {
        success: false,
        carrier: 'DHL Kargo',
        error: 'DHL eCommerce token servisine bağlanılamadı. Müşteri Numarası (DHL_ECOM_CUSTOMER_NUMBER), Şifre (DHL_ECOM_PASSWORD), Client ID ve Client Secret bilgilerini kontrol edin.',
      };
    }

    const { jwt: token, baseUrl: activeBaseUrl } = authToken;
    const commonHeaders = {
      'Authorization': `Bearer ${token}`,
      'x-ibm-client-id': dhlClientId,
      'x-ibm-client-secret': dhlClientSecret,
      'Content-Type': 'application/json',
    };

    // -------------------------------------------------------------
    // Aşama 1: createRecipient (Alıcı Adres Ön Kaydı ve Varış Şube Tespiti)
    // -------------------------------------------------------------
    try {
      await fetch(`${activeBaseUrl}/pluscmdapi/createRecipient`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify({
          recipient: {
            customerId: '',
            refCustomerId: '',
            cityName: city,
            districtName: district,
            cityCode: 0,
            districtCode: 0,
            address: params.addressLine,
            bussinessPhoneNumber: '',
            email: params.email || 'info@otantikosconcept.com',
            taxOffice: '',
            taxNumber: '',
            fullName: params.recipientName,
            homePhoneNumber: '',
            mobilePhoneNumber: cleanPhone,
          },
        }),
      });
    } catch (e) {
      console.warn('[DHL createRecipient uyarısı]', e);
    }

    // -------------------------------------------------------------
    // Aşama 2: createOrder (Sipariş Verisinin Aktarımı)
    // -------------------------------------------------------------
    const orderPayload = {
      order: {
        referenceId: cleanOrderNumber,
        barcode: cleanOrderNumber,
        billOfLandingId: `IRS-${cleanOrderNumber}`,
        isCOD: params.isCOD ? 1 : 0,
        codAmount: params.isCOD ? Number(params.codAmount || 0) : 0,
        shipmentServiceType: 1, // 1: Standart Teslimat
        packagingType: 3, // 3: Paket
        content: params.itemDescription || 'Otantikos Concept Hediyelik Eşya',
        smsPreference1: 1, // Varış şubesinde alıcıya SMS
        smsPreference2: 0,
        smsPreference3: 0,
        paymentType: 1, // 1: Gönderici Öder
        deliveryType: 1, // 1: Adrese Teslim
        description: 'Otantikos Sipariş Hazırlık',
        marketPlaceShortCode: '',
        marketPlaceSaleCode: '',
        pudoId: '',
      },
      orderPieceList: [
        {
          barcode: `${cleanOrderNumber}-P1`,
          desi: finalDesi,
          kg: finalKg,
          content: params.itemDescription || 'Hediyelik Eşya ve Oyuncak',
        },
      ],
      recipient: {
        customerId: '',
        refCustomerId: '',
        cityName: city,
        districtName: district,
        cityCode: 0,
        districtCode: 0,
        address: params.addressLine,
        bussinessPhoneNumber: '',
        email: params.email || 'info@otantikosconcept.com',
        taxOffice: '',
        taxNumber: '',
        fullName: params.recipientName,
        homePhoneNumber: '',
        mobilePhoneNumber: cleanPhone,
      },
    };

    const orderRes = await fetch(`${activeBaseUrl}/standardcmdapi/createOrder`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(orderPayload),
    });

    const orderText = await orderRes.text();
    let orderJson: any = null;
    try {
      orderJson = JSON.parse(orderText);
    } catch {
      orderJson = null;
    }

    const orderApiError =
      orderJson?.error?.description ||
      orderJson?.errorMessage ||
      (orderJson?.isSuccess === false ? orderJson?.message : null);

    // Duplicate order error on retry can still proceed to createbarcode
    const isAlreadyCreatedOrder =
      typeof orderText === 'string' &&
      (orderText.toLowerCase().includes('already') || orderText.toLowerCase().includes('mevcut') || orderText.toLowerCase().includes('duplicate'));

    if ((!orderRes.ok || orderApiError) && !isAlreadyCreatedOrder) {
      console.error('[DHL createOrder Hatası]', orderText);
      return {
        success: false,
        carrier: 'DHL Kargo',
        error: `DHL createOrder Hatası (${orderRes.status}): ${orderApiError || orderText}`,
      };
    }

    // -------------------------------------------------------------
    // Aşama 3: createbarcode (10x10 ZPL Barkod ve Takip No Üretimi)
    // -------------------------------------------------------------
    const barcodePayload = {
      referenceId: cleanOrderNumber,
      billOfLandingId: `IRS-${cleanOrderNumber}`,
      isCOD: params.isCOD ? 1 : 0,
      codAmount: params.isCOD ? Number(params.codAmount || 0) : 0,
      printReferenceBarcodeOnError: 1,
      message: 'Otantikos Concept',
      additionalContent1: cleanOrderNumber,
      additionalContent2: '',
      additionalContent3: '',
      additionalContent4: '',
      packagingType: 3,
      orderPieceList: [
        {
          barcode: `${cleanOrderNumber}-P1`,
          desi: finalDesi,
          kg: finalKg,
          content: 'Hediyelik Eşya',
        },
      ],
    };

    const barcodeRes = await fetch(`${activeBaseUrl}/barcodecmdapi/createbarcode`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(barcodePayload),
    });

    const barcodeText = await barcodeRes.text();
    let barcodeData: any = null;
    try {
      barcodeData = JSON.parse(barcodeText);
    } catch {
      barcodeData = null;
    }

    const resultItem = Array.isArray(barcodeData) ? barcodeData[0] : barcodeData;
    const barcodeApiError =
      resultItem?.error?.description ||
      resultItem?.errorMessage ||
      (resultItem?.isSuccess === false ? resultItem?.message : null);

    if (!barcodeRes.ok || barcodeApiError) {
      console.error('[DHL createbarcode Hatası]', barcodeText);
      return {
        success: false,
        carrier: 'DHL Kargo',
        error: `DHL createbarcode Hatası (${barcodeRes.status}): ${barcodeApiError || barcodeText}`,
      };
    }

    const barcodeObj = resultItem?.barcodes?.[0];
    const zplString = barcodeObj?.value || '';
    const visualBarcode = barcodeObj?.barcode || '';
    const trackingNumber =
      resultItem?.shipmentId ||
      resultItem?.trackingNumber ||
      resultItem?.invoiceId ||
      visualBarcode ||
      resultItem?.referenceId ||
      cleanOrderNumber;

    return {
      success: true,
      trackingNumber: String(trackingNumber),
      referenceId: cleanOrderNumber,
      invoiceId: resultItem?.invoiceId,
      barcode: visualBarcode,
      zpl: zplString,
      labelUrl: `https://kargotakip.mngkargo.com.tr/?k=${encodeURIComponent(String(trackingNumber))}`,
      carrier: 'DHL Kargo',
    };
  } catch (err: any) {
    console.error('[DHL eCom Gönderi İstisnası]', err);
    return {
      success: false,
      carrier: 'DHL Kargo',
      error: err.message || 'DHL eCommerce servisine bağlanılamadı.',
    };
  }
}

/**
 * Gönderi İptali (cancelshipment)
 */
export async function cancelDhlShipment(referenceId: string, shipmentId?: string): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!isDhlEcomConfigured) {
    return { success: true, message: 'Yerel gönderi kaydı iptal edildi.' };
  }

  try {
    const authToken = await getDhlEcomToken();
    if (!authToken) return { success: false, error: 'DHL token alınamadı.' };

    const cleanRef = referenceId.trim();
    const cleanShipment = (shipmentId || referenceId).trim();

    const res = await fetch(`${authToken.baseUrl}/barcodecmdapi/cancelshipment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken.jwt}`,
        'x-ibm-client-id': dhlClientId,
        'x-ibm-client-secret': dhlClientSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceId: cleanRef,
        shipmentId: cleanShipment,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    return { success: true, message: 'Gönderi DHL eCommerce sisteminde iptal edildi.' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

function mapMngStatusToOrderStatus(rawStatus: any, rawDesc: string = ''): DhlTrackingResult['status'] {
  const s = `${String(rawStatus || '')} ${rawDesc}`.toLowerCase();
  if (s.includes('teslim edildi') || s.includes('delivered') || s === '5') {
    return 'teslim_edildi';
  }
  if (s.includes('dağıtım') || s.includes('dagitim') || s.includes('kurye') || s.includes('out for delivery') || s === '4') {
    return 'dagitimda';
  }
  if (s.includes('hazır') || s.includes('kayıt') || s.includes('pre-transit') || s === '0') {
    return 'siparis_alindi';
  }
  return 'kargoya_verildi';
}

/**
 * Gönderi Takip Sorgusu (DHL eCommerce TR / MNG + DHL Unified Tracking API)
 */
export async function trackDhlShipment(trackingNumberOrRefId: string): Promise<DhlTrackingResult> {
  const cleanCode = trackingNumberOrRefId.trim();

  // 1. Önce DHL eCommerce TR (MNG) API'den sorgula
  if (isDhlEcomConfigured) {
    try {
      const authToken = await getDhlEcomToken();
      if (authToken) {
        const res = await fetch(`${authToken.baseUrl}/standardquery/trackshipment/${encodeURIComponent(cleanCode)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken.jwt}`,
            'x-ibm-client-id': dhlClientId,
            'x-ibm-client-secret': dhlClientSecret,
          },
        });

        if (res.ok) {
          const raw = await res.json();
          const item = Array.isArray(raw) ? raw[0] : raw;
          if (item && (item.shipmentStatus || item.shipmentStatusExplanation || item.statusDescription || item.shipmentId || item.movements || item.shipmentMovements)) {
            const rawEvents: any[] =
              item.shipmentMovements ||
              item.movements ||
              item.events ||
              item.history ||
              [];

            const parsedEvents: DhlTrackingEvent[] = Array.isArray(rawEvents)
              ? rawEvents.map((ev: any) => ({
                  timestamp: ev.eventDateTime || ev.actionDate || ev.date || ev.timestamp || new Date().toISOString(),
                  location: ev.location || ev.branchName || ev.unitName || ev.cityName || 'DHL eCommerce TR',
                  description: ev.description || ev.eventExplanation || ev.actionExplanation || ev.statusExplanation || 'Kargo hareketi',
                  statusCode: ev.statusCode || ev.eventCode || undefined,
                }))
              : [];

            const desc =
              item.shipmentStatusExplanation ||
              item.statusDescription ||
              item.shipmentStatus ||
              'DHL eCommerce TR güvencesiyle sevkiyat halinde.';

            return {
              success: true,
              trackingNumber: String(item.trackingNumber || item.shipmentId || cleanCode),
              status: mapMngStatusToOrderStatus(item.shipmentStatusCode ?? item.shipmentStatus, desc),
              statusDescription: desc,
              estimatedDelivery: item.estimatedDeliveryDate || item.deliveryDate || undefined,
              events: parsedEvents,
            };
          }
        }
      }
    } catch (err) {
      console.warn('[DHL eCom Track uyarısı]', err);
    }
  }

  // 2. DHL Unified Shipment Tracking API (api-eu.dhl.com - tek DHL_API_KEY kullanan entegrasyonlar için)
  if (isDhlUnifiedTrackingConfigured) {
    try {
      const unifiedRes = await fetch(
        `https://api-eu.dhl.com/track/shipments?trackingNumber=${encodeURIComponent(cleanCode)}&language=tr`,
        {
          method: 'GET',
          headers: {
            'DHL-API-Key': dhlClientId,
            'Accept': 'application/json',
          },
        }
      );

      if (unifiedRes.ok) {
        const unifiedData = await unifiedRes.json();
        const shipment = unifiedData?.shipments?.[0];
        if (shipment) {
          const statusObj = shipment.status || {};
          const rawEvents: any[] = Array.isArray(shipment.events) ? shipment.events : [];
          const parsedEvents: DhlTrackingEvent[] = rawEvents.map((ev: any) => ({
            timestamp: ev.timestamp || new Date().toISOString(),
            location: ev.location?.address?.addressLocality || ev.location?.address?.countryCode || 'DHL Transfer Merkezi',
            description: ev.description || ev.status || 'Kargo hareketi',
            statusCode: ev.statusCode || undefined,
          }));

          const desc = statusObj.description || statusObj.status || 'DHL taşıma sürecinde.';
          return {
            success: true,
            trackingNumber: String(shipment.id || cleanCode),
            status: mapMngStatusToOrderStatus(statusObj.statusCode, desc),
            statusDescription: desc,
            estimatedDelivery: shipment.estimatedTimeOfDelivery || undefined,
            events: parsedEvents,
          };
        }
      }
    } catch (err) {
      console.warn('[DHL Unified Track uyarısı]', err);
    }
  }

  return {
    success: true,
    trackingNumber: cleanCode,
    status: 'kargoya_verildi',
    statusDescription: 'Kargo takip numarası kaydedildi. Şube kabul ve transfer hareketleri kargo firması sistemine düştükçe burada güncellenecektir.',
    events: [],
  };
}
