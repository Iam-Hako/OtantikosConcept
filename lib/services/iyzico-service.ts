import crypto from 'crypto';

// Determine configuration from environment variables
const apiKey = (process.env.IYZICO_API_KEY || '').trim();
const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
const baseUrl = (process.env.IYZICO_BASE_URL || (
  apiKey && !apiKey.startsWith('sandbox-')
    ? 'https://api.iyzipay.com'
    : 'https://sandbox-api.iyzipay.com'
)).trim().replace(/\/+$/, '');

export const isIyzicoConfigured = Boolean(apiKey && secretKey);

export interface IyzicoInitializeParams {
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerIdentityNumber?: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressDetail: string;
    province: string;
    district?: string;
    zipCode?: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    addressDetail: string;
    province: string;
    district?: string;
    zipCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    category?: string;
    price: number;
  }>;
  callbackUrl: string;
  userIp?: string;
}

export interface IyzicoInitializeResult {
  success: boolean;
  token?: string;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  isSimulated?: boolean;
  isPreLaunch?: boolean;
  message?: string;
  error?: string;
}

export interface IyzicoPaymentResult {
  success: boolean;
  orderNumber?: string;
  paymentId?: string;
  paidPrice?: number;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  installment?: number;
  isSimulated?: boolean;
  error?: string;
}

/**
 * Format phone number to E.164 standard required by iyzico (e.g. +905xxxxxxxxx)
 */
function formatIyzicoPhone(phone: string): string {
  if (!phone) return '+905000000000';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('90')) cleaned = cleaned.substring(2);
  if (cleaned.length === 10) return `+90${cleaned}`;
  return '+905000000000';
}

/**
 * Generates official iyzico V2 HMAC-SHA256 authorization headers.
 * Native implementation that completely bypasses Node.js fs.readdirSync
 * and works flawlessly in Vercel Serverless / Lambda environments.
 */
function generateIyzicoV2AuthHeaders(uriPath: string, payload: any) {
  const randomString = Date.now().toString() + Math.random().toString(36).substring(2, 10);
  const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(randomString + uriPath + bodyString)
    .digest('hex');

  const authorizationParams = [
    `apiKey:${apiKey}`,
    `randomKey:${randomString}`,
    `signature:${signature}`,
  ];

  const authValue = 'IYZWSv2 ' + Buffer.from(authorizationParams.join('&')).toString('base64');

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-iyzi-rnd': randomString,
    'x-iyzi-client-version': 'iyzipay-node-2.0.69',
    'Authorization': authValue,
  };
}

/**
 * Initialize iyzico Checkout Form (Ödeme Formu Başlatma)
 */
export async function initializeIyzicoCheckoutForm(
  params: IyzicoInitializeParams
): Promise<IyzicoInitializeResult> {
  // If no credentials configured, return pre-launch response
  if (!isIyzicoConfigured) {
    return {
      success: true,
      isPreLaunch: true,
      message: 'Online kredi kartı satışlarımız ve iyzico Sanal POS entegrasyonumuz çok yakında aktif olacaktır.',
    };
  }

  const nameParts = params.customerName.trim().split(' ');
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0] || 'Müşteri';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Otantikos';

  const gsmNumber = formatIyzicoPhone(params.customerPhone);
  const formattedPrice = Number(params.totalAmount).toFixed(2);

  const basketItems = params.items.map((item, idx) => ({
    id: item.id || `item-${idx + 1}`,
    name: item.name ? item.name.slice(0, 100) : 'Ürün',
    category1: item.category || 'Genel',
    itemType: 'PHYSICAL',
    price: Number(item.price).toFixed(2),
  }));

  const buyer = {
    id: `usr-${params.customerEmail || params.orderNumber}`,
    name: firstName,
    surname: lastName,
    gsmNumber: gsmNumber,
    email: params.customerEmail || 'siparis@otantikosconcept.com',
    identityNumber: params.customerIdentityNumber || '11111111111',
    registrationAddress: (params.shippingAddress.addressDetail || 'Tahtakale Eminönü').slice(0, 250),
    ip: params.userIp || '85.95.230.1',
    city: params.shippingAddress.province || 'İstanbul',
    country: 'Turkey',
    zipCode: params.shippingAddress.zipCode || '34000',
  };

  const shipping = {
    contactName: params.shippingAddress.fullName || params.customerName,
    city: params.shippingAddress.province || 'İstanbul',
    country: 'Turkey',
    address: (params.shippingAddress.addressDetail || 'Tahtakale Eminönü').slice(0, 250),
    zipCode: params.shippingAddress.zipCode || '34000',
  };

  const billing = params.billingAddress ? {
    contactName: params.billingAddress.fullName || params.customerName,
    city: params.billingAddress.province || 'İstanbul',
    country: 'Turkey',
    address: (params.billingAddress.addressDetail || 'Tahtakale Eminönü').slice(0, 250),
    zipCode: params.billingAddress.zipCode || '34000',
  } : shipping;

  const requestPayload: any = {
    locale: 'tr',
    conversationId: params.orderNumber,
    price: formattedPrice,
    paidPrice: formattedPrice,
    currency: 'TRY',
    basketId: params.orderNumber,
    paymentGroup: 'PRODUCT',
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: buyer,
    shippingAddress: shipping,
    billingAddress: billing,
    basketItems: basketItems,
  };

  const endpointPath = '/payment/iyzipos/checkoutform/initialize/auth/ecom';

  try {
    const headers = generateIyzicoV2AuthHeaders(endpointPath, requestPayload);
    const response = await fetch(`${baseUrl}${endpointPath}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
    });

    const result = await response.json();

    if (result.status === 'success') {
      return {
        success: true,
        token: result.token,
        checkoutFormContent: result.checkoutFormContent,
        paymentPageUrl: result.paymentPageUrl,
      };
    } else {
      console.error('[iyzico Direct API Error]', result);
      return {
        success: false,
        error: result.errorMessage || 'Ödeme sistemi yanıt vermedi.',
      };
    }
  } catch (err: any) {
    console.error('[iyzico Service Exception]', err);
    return {
      success: false,
      error: err.message || 'Ödeme servisine bağlanırken bir hata oluştu.',
    };
  }
}

/**
 * Retrieve and verify iyzico Checkout Form payment result (Ödeme Sonucunu Doğrulama)
 */
export async function retrieveIyzicoPaymentResult(
  token: string,
  conversationId?: string
): Promise<IyzicoPaymentResult> {
  // Test simulation check
  if (!isIyzicoConfigured || token.startsWith('sim-token-')) {
    return {
      success: true,
      isSimulated: true,
      orderNumber: conversationId,
      paymentId: `sim-pay-${Date.now()}`,
      cardType: 'CREDIT_CARD',
      cardAssociation: 'MASTER_CARD',
      cardFamily: 'Bonus',
      installment: 1,
    };
  }

  const endpointPath = '/payment/iyzipos/checkoutform/auth/ecom/detail';
  const requestPayload = {
    locale: 'tr',
    conversationId: conversationId || '',
    token: token,
  };

  try {
    const headers = generateIyzicoV2AuthHeaders(endpointPath, requestPayload);
    const response = await fetch(`${baseUrl}${endpointPath}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
    });

    const result = await response.json();

    if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
      return {
        success: true,
        orderNumber: result.basketId || result.conversationId,
        paymentId: result.paymentId,
        paidPrice: Number(result.paidPrice || result.price),
        cardType: result.cardType,
        cardAssociation: result.cardAssociation,
        cardFamily: result.cardFamily,
        installment: result.installment,
      };
    } else {
      console.warn('[iyzico] Payment was not successful:', result.errorMessage);
      return {
        success: false,
        error: result.errorMessage || 'Ödeme tamamlanamadı veya iptal edildi.',
      };
    }
  } catch (err: any) {
    console.error('[iyzico Retrieve Exception]', err);
    return {
      success: false,
      error: err.message || 'Ödeme doğrulama hatası.',
    };
  }
}
