import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { retrieveIyzicoPaymentResult } from '@/lib/services/iyzico-service';

async function handleCallback(request: Request) {
  const url = new URL(request.url);
  let orderNumber = url.searchParams.get('order_number') || '';
  let token = url.searchParams.get('token') || '';

  // Extract form-data or urlencoded token from POST body if present
  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const formToken = formData.get('token');
        if (formToken && typeof formToken === 'string') {
          token = formToken;
        }
      } else if (contentType.includes('application/json')) {
        const json = await request.json();
        if (json.token) token = json.token;
        if (json.order_number) orderNumber = json.order_number;
      }
    } catch {
      // Ignore body parsing error if body empty
    }
  }

  const host = request.headers.get('host') || 'www.otantikosconcept.com';
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${proto}://${host}`;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/odeme?error=${encodeURIComponent('Ödeme doğrulama tokenı eksik.')}`, {
      status: 303,
    });
  }

  try {
    const paymentResult = await retrieveIyzicoPaymentResult(token, orderNumber);

    if (paymentResult.success) {
      const resolvedOrderNo = paymentResult.orderNumber || orderNumber;
      if (resolvedOrderNo) {
        const order = await DataService.getOrderByNumber(resolvedOrderNo);
        if (order) {
          await DataService.updateOrderStatus(order.id, 'hazirlaniyor');
        }
      }

      try {
        revalidatePath('/');
        revalidatePath('/admin/siparisler');
        revalidatePath('/admin/kar-zarar');
        revalidatePath('/siparis-takip');
      } catch {
        // Ignore revalidation error
      }

      return NextResponse.redirect(
        `${baseUrl}/odeme/basarili?order_number=${encodeURIComponent(resolvedOrderNo)}&status=success`,
        { status: 303 }
      );
    } else {
      return NextResponse.redirect(
        `${baseUrl}/odeme?error=${encodeURIComponent(paymentResult.error || 'Ödeme onaylanamadı.')}`,
        { status: 303 }
      );
    }
  } catch (err: any) {
    console.error('iyzico callback error:', err);
    return NextResponse.redirect(
      `${baseUrl}/odeme?error=${encodeURIComponent('Ödeme sonucunu işlerken bir hata oluştu.')}`,
      { status: 303 }
    );
  }
}

export async function POST(request: Request) {
  return handleCallback(request);
}

export async function GET(request: Request) {
  return handleCallback(request);
}
