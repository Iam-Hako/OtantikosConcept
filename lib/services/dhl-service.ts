/**
 * DHL Express / eCommerce REST API Client & Infrastructure
 * 
 * Supports both DHL Express MyDHL API and standard DHL eCommerce shipping flows.
 * When credentials are not yet entered, it functions in simulated fallback mode
 * to enable seamless UI workflow testing. Once DHL_API_KEY and DHL_API_SECRET
 * are supplied in .env.local, it connects directly to live DHL endpoints.
 */

const dhlApiKey = process.env.DHL_API_KEY || '';
const dhlApiSecret = process.env.DHL_API_SECRET || '';
const dhlAccountNumber = process.env.DHL_ACCOUNT_NUMBER || '';
const dhlBaseUrl = process.env.DHL_BASE_URL || (
  dhlApiKey && !dhlApiKey.startsWith('test_')
    ? 'https://express.api.dhl.com/mydhlapi'
    : 'https://express.api.dhl.com/mydhlapi/test'
);

export const isDhlConfigured = Boolean(dhlApiKey && dhlApiSecret);

// Shipper (Otantikos Concept - Eminönü Tahtakale)
export const OTANTIKOS_SHIPPER_INFO = {
  companyName: 'OTANTİKOS HEDİYELİK EŞYA OYUNCAK TİCARET LİMİTED ŞİRKETİ',
  contactName: 'Ahmet Bartuğ Tokmak',
  phone: '+905077737777',
  email: 'siparis@otantikosconcept.com',
  addressLine1: 'Süleymaniye Mah. Uzunçarşı Cad.',
  addressLine2: 'Tamburacı ve Görenli Han No: 187 / 2G',
  cityName: 'İstanbul',
  districtName: 'Fatih / Eminönü',
  postalCode: '34116',
  countryCode: 'TR',
};

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
  itemDescription?: string;
  packageCount?: number;
}

export interface DhlShipmentResult {
  success: boolean;
  trackingNumber?: string;
  dispatchConfirmationNumber?: string;
  labelPdfBase64?: string;
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

/**
 * Format phone to international E.164 without spaces
 */
function formatPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (!cleaned.startsWith('90') && cleaned.length === 10) cleaned = `90${cleaned}`;
  return `+${cleaned}`;
}

/**
 * Create a new shipment and generate official DHL AWB tracking number & label
 */
export async function createDhlShipment(
  params: DhlCreateShipmentParams
): Promise<DhlShipmentResult> {
  // If credentials are not yet configured, return simulated AWB for seamless testing
  if (!isDhlConfigured) {
    const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
    const simulatedAwb = `DHL-${randomSuffix}`;

    return {
      success: true,
      trackingNumber: simulatedAwb,
      dispatchConfirmationNumber: `DISPATCH-${Date.now()}`,
      carrier: 'DHL Kargo',
      labelUrl: `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${simulatedAwb}`,
      isSimulated: true,
      message: 'DHL API anahtarları henüz tanımlanmadığı için test simülasyon takip numarası üretildi. Anahtarlar girildiğinde resmi DHL AWB barkodu canlı basılacaktır.',
    };
  }

  try {
    const payload = {
      plannedShippingDateAndTime: new Date().toISOString(),
      pickup: {
        isRequested: false,
      },
      productCode: 'N', // Standard Domestic / Express delivery
      accounts: [
        {
          typeCode: 'shipper',
          number: dhlAccountNumber,
        },
      ],
      customerDetails: {
        shipperDetails: {
          postalAddress: {
            postalCode: OTANTIKOS_SHIPPER_INFO.postalCode,
            cityName: OTANTIKOS_SHIPPER_INFO.cityName,
            countryCode: OTANTIKOS_SHIPPER_INFO.countryCode,
            addressLine1: OTANTIKOS_SHIPPER_INFO.addressLine1,
            addressLine2: OTANTIKOS_SHIPPER_INFO.addressLine2,
          },
          contactInformation: {
            email: OTANTIKOS_SHIPPER_INFO.email,
            phone: OTANTIKOS_SHIPPER_INFO.phone,
            companyName: OTANTIKOS_SHIPPER_INFO.companyName,
            fullName: OTANTIKOS_SHIPPER_INFO.contactName,
          },
        },
        receiverDetails: {
          postalAddress: {
            postalCode: params.postalCode || '34000',
            cityName: params.city || 'İstanbul',
            countryCode: params.countryCode || 'TR',
            addressLine1: params.addressLine.slice(0, 45),
            addressLine2: params.district ? params.district.slice(0, 45) : '',
          },
          contactInformation: {
            email: params.email || 'musteri@otantikosconcept.com',
            phone: formatPhone(params.phone),
            fullName: params.recipientName,
          },
        },
      },
      content: {
        packages: [
          {
            weight: params.weightInKg || 0.5,
            dimensions: {
              length: 20,
              width: 15,
              height: 10,
            },
            customerReferences: [
              {
                value: params.orderNumber,
                typeCode: 'CU',
              },
            ],
            description: params.itemDescription || 'Otantikos Concept Hediyelik Eşya ve Aksesuar',
          },
        ],
        isCustomsDeclarable: false,
        description: 'Hediyelik Eşya / Aksesuar',
        incoterm: 'DAP',
        unitOfMeasurement: 'metric',
      },
      outputImageProperties: {
        printerDPI: 300,
        encodingFormat: 'pdf',
        imageOptions: [
          {
            typeCode: 'label',
            templateName: 'ECOM26_84_001',
            isRequested: true,
          },
        ],
      },
    };

    const authHeader = 'Basic ' + Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString('base64');
    const response = await fetch(`${dhlBaseUrl}/shipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[DHL API Error]', data);
      return {
        success: false,
        carrier: 'DHL Kargo',
        error: data.detail || data.message || 'DHL gönderisi oluşturulurken bir hata oluştu.',
      };
    }

    const trackingNumber = data.shipmentTrackingNumber || data.trackingNumber;
    const documents = data.documents || [];
    const labelDoc = documents.find((d: any) => d.typeCode === 'label');

    return {
      success: true,
      trackingNumber,
      dispatchConfirmationNumber: data.dispatchConfirmationNumber,
      labelPdfBase64: labelDoc ? labelDoc.content : undefined,
      labelUrl: `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${trackingNumber}`,
      carrier: 'DHL Kargo',
    };
  } catch (err: any) {
    console.error('[DHL Service Exception]', err);
    return {
      success: false,
      carrier: 'DHL Kargo',
      error: err.message || 'DHL servisine bağlanılamadı.',
    };
  }
}

/**
 * Retrieve real-time tracking events from DHL for a tracking number
 */
export async function trackDhlShipment(
  trackingNumber: string
): Promise<DhlTrackingResult> {
  const cleanTracking = trackingNumber.trim();

  // If credentials are not configured or it is a simulated tracking code
  if (!isDhlConfigured || cleanTracking.startsWith('DHL-') || cleanTracking.startsWith('sim-')) {
    return {
      success: true,
      trackingNumber: cleanTracking,
      status: 'kargoya_verildi',
      statusDescription: 'Gönderi DHL Tahtakale Transfer Merkezinde İşlem Gördü',
      estimatedDelivery: '1-2 İş Günü',
      isSimulated: true,
      events: [
        {
          timestamp: new Date().toISOString(),
          location: 'İstanbul Tahtakale DHL Şubesi',
          description: 'Gönderi kabul edildi, barkod okundu ve transfer aracına yüklendi.',
          statusCode: 'PU',
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          location: 'Eminönü / İstanbul',
          description: 'Kargo etiketi oluşturuldu ve paket hazırlandı.',
          statusCode: 'CR',
        },
      ],
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString('base64');
    const response = await fetch(`${dhlBaseUrl}/shipments/${encodeURIComponent(cleanTracking)}/tracking`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        trackingNumber: cleanTracking,
        status: 'kargoya_verildi',
        statusDescription: 'Kargo hareket bilgisi bekleniyor.',
        events: [],
        error: errData.detail || 'DHL takip sorgusu yanıt vermedi.',
      };
    }

    const data = await response.json();
    const shipment = data.shipments?.[0];

    if (!shipment) {
      return {
        success: false,
        trackingNumber: cleanTracking,
        status: 'kargoya_verildi',
        statusDescription: 'Kayıt bulunamadı.',
        events: [],
      };
    }

    const events: DhlTrackingEvent[] = (shipment.events || []).map((ev: any) => ({
      timestamp: ev.date && ev.time ? `${ev.date}T${ev.time}` : ev.timestamp || new Date().toISOString(),
      location: ev.serviceArea?.[0]?.description || ev.location || 'DHL Transfer Merkezi',
      description: ev.description || 'Kargo işlemi tamamlandı.',
      statusCode: ev.typeCode,
    }));

    let status: DhlTrackingResult['status'] = 'kargoya_verildi';
    const lastCode = events[0]?.statusCode?.toUpperCase() || '';

    if (lastCode === 'OK' || lastCode === 'DL') {
      status = 'teslim_edildi';
    } else if (lastCode === 'WC' || lastCode === 'OD') {
      status = 'dagitimda';
    }

    return {
      success: true,
      trackingNumber: cleanTracking,
      status,
      statusDescription: shipment.status?.description || 'DHL güvencesiyle sevkiyat halinde.',
      estimatedDelivery: shipment.estimatedTimeOfDelivery,
      events,
    };
  } catch (err: any) {
    return {
      success: false,
      trackingNumber: cleanTracking,
      status: 'kargoya_verildi',
      statusDescription: 'Takip bilgisi sorgulanırken hata oluştu.',
      events: [],
      error: err.message,
    };
  }
}
