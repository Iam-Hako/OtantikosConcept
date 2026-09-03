import Iyzipay from 'iyzipay';

// Determine configuration from environment variables
const apiKey = process.env.IYZICO_API_KEY || '';
const secretKey = process.env.IYZICO_SECRET_KEY || '';
const baseUrl = process.env.IYZICO_BASE_URL || (
  process.env.NODE_ENV === 'production' && apiKey && !apiKey.startsWith('sandbox-')
    ? 'https://api.iyzipay.com'
    : 'https://sandbox-api.iyzipay.com'
);

export const isIyzicoConfigured = Boolean(apiKey && secretKey);

// Singleton Iyzipay Client Instance
let iyzipayInstance: Iyzipay | null = null;

function getIyzipayClient(): Iyzipay | null {
  if (!isIyzicoConfigured) return null;
  if (!iyzipayInstance) {
    iyzipayInstance = new Iyzipay({
      apiKey,
      secretKey,
      uri: baseUrl,
    });
  }
  return iyzipayInstance;
}

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
 * Initialize iyzico Checkout Form (Ödeme Formu Başlatma)
 */
export async function initializeIyzicoCheckoutForm(
  params: IyzicoInitializeParams
): Promise<IyzicoInitializeResult> {
  const client = getIyzipayClient();

  // If no credentials configured, return pre-launch response
  if (!client) {
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
    itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    price: Number(item.price).toFixed(2),
  }));

  const buyer = {
    id: `usr-${params.customerEmail || params.orderNumber}`,
    name: firstName,
    surname: lastName,
    gsmNumber: gsmNumber,
    email: params.customerEmail || 'siparis@otantikosconcept.com',
    identityNumber: params.customerIdentityNumber || '11111111111',
    registrationAddress: params.shippingAddress.addressDetail.slice(0, 250),
    ip: params.userIp || '85.95.230.1',
    city: params.shippingAddress.province || 'İstanbul',
    country: 'Turkey',
    zipCode: params.shippingAddress.zipCode || '34000',
  };

  const shipping = {
    contactName: params.shippingAddress.fullName || params.customerName,
    city: params.shippingAddress.province || 'İstanbul',
    country: 'Turkey',
    address: params.shippingAddress.addressDetail.slice(0, 250),
    zipCode: params.shippingAddress.zipCode || '34000',
  };

  const billing = params.billingAddress ? {
    contactName: params.billingAddress.fullName || params.customerName,
    city: params.billingAddress.province || 'İstanbul',
    country: 'Turkey',
    address: params.billingAddress.addressDetail.slice(0, 250),
    zipCode: params.billingAddress.zipCode || '34000',
  } : shipping;

  const request: any = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: params.orderNumber,
    price: formattedPrice,
    paidPrice: formattedPrice,
    currency: Iyzipay.CURRENCY.TRY,
    basketId: params.orderNumber,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9, 12],
    buyer: buyer,
    shippingAddress: shipping,
    billingAddress: billing,
    basketItems: basketItems,
  };

  return new Promise((resolve) => {
    client.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        console.error('[iyzico] checkoutFormInitialize Error:', err);
        return resolve({
          success: false,
          error: err.message || 'iyzico ödeme formu başlatılamadı.',
        });
      }

      if (result.status === 'success') {
        return resolve({
          success: true,
          token: result.token,
          checkoutFormContent: result.checkoutFormContent,
          paymentPageUrl: result.paymentPageUrl,
        });
      } else {
        console.error('[iyzico] checkoutFormInitialize Failed:', result.errorMessage);
        return resolve({
          success: false,
          error: result.errorMessage || 'Ödeme sistemi yanıt vermedi.',
        });
      }
    });
  });
}

/**
 * Retrieve and verify iyzico Checkout Form payment result (Ödeme Sonucunu Doğrulama)
 */
export async function retrieveIyzicoPaymentResult(
  token: string,
  conversationId?: string
): Promise<IyzicoPaymentResult> {
  const client = getIyzipayClient();

  // Test simulation check
  if (!client || token.startsWith('sim-token-')) {
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

  const request = {
    locale: Iyzipay.LOCALE.TR,
    conversationId: conversationId || '',
    token: token,
  };

  return new Promise((resolve) => {
    client.checkoutForm.retrieve(request, (err: any, result: any) => {
      if (err) {
        console.error('[iyzico] checkoutForm.retrieve Error:', err);
        return resolve({
          success: false,
          error: err.message || 'Ödeme doğrulama hatası.',
        });
      }

      if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
        return resolve({
          success: true,
          orderNumber: result.basketId || result.conversationId,
          paymentId: result.paymentId,
          paidPrice: Number(result.paidPrice || result.price),
          cardType: result.cardType,
          cardAssociation: result.cardAssociation,
          cardFamily: result.cardFamily,
          installment: result.installment,
        });
      } else {
        console.warn('[iyzico] Payment was not successful:', result.errorMessage);
        return resolve({
          success: false,
          error: result.errorMessage || 'Ödeme tamamlanamadı veya iptal edildi.',
        });
      }
    });
  });
}
