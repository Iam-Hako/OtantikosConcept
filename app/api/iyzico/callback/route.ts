import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { retrieveIyzicoPaymentResult } from '@/lib/services/iyzico-service';

const ALLOWED_HOSTS = ['www.otantikosconcept.com', 'otantikosconcept.com', 'localhost:3000', '127.0.0.1:3000'];

async function handleCallback(request: Request) {
  let baseUrl = 'https://www.otantikosconcept.com';
  try {
    const rawHost = (request.headers.get('host') || 'www.otantikosconcept.com').toLowerCase();
    const safeHost = ALLOWED_HOSTS.includes(rawHost) ? rawHost : 'www.otantikosconcept.com';
    const proto = safeHost.startsWith('localhost') || safeHost.startsWith('127.0.0.1') ? 'http' : 'https';
    baseUrl = `${proto}://${safeHost}`;

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

    if (!token) {
      return NextResponse.redirect(`${baseUrl}/odeme?error=${encodeURIComponent('Ödeme doğrulama tokenı eksik.')}`, {
        status: 303,
      });
    }

    const paymentResult = await retrieveIyzicoPaymentResult(token, orderNumber);

    if (paymentResult.success) {
      const resolvedOrderNo = paymentResult.orderNumber || orderNumber;
      if (resolvedOrderNo) {
        const existingOrder = await DataService.getOrderById(resolvedOrderNo);
        if (
          existingOrder &&
          typeof paymentResult.paidPrice === 'number' &&
          paymentResult.paidPrice > 0 &&
          paymentResult.paidPrice + 0.05 < Number(existingOrder.total_amount)
        ) {
          await DataService.markOrderFailed(
            resolvedOrderNo,
            `Ödeme tutarı uyuşmazlığı (Ödenen: ${paymentResult.paidPrice}, Beklenen: ${existingOrder.total_amount})`
          );
          return NextResponse.redirect(
            `${baseUrl}/odeme?error=${encodeURIComponent('Ödeme tutarı sipariş tutarıyla eşleşmedi.')}`,
            { status: 303 }
          );
        }
        await DataService.markOrderPaid(resolvedOrderNo, 'credit_card');
      }

      try {
        revalidatePath('/');
        revalidatePath('/admin/siparisler');
        revalidatePath('/admin/kar-zarar');
        revalidatePath('/admin/urunler');
        revalidatePath('/admin/hizli-stok');
        revalidatePath('/siparis-takip');
      } catch {
        // Ignore revalidation error
      }

      return NextResponse.redirect(
        `${baseUrl}/odeme/basarili?order_number=${encodeURIComponent(resolvedOrderNo)}&status=success`,
        { status: 303 }
      );
    } else {
      const resolvedOrderNo = paymentResult.orderNumber || orderNumber;
      if (resolvedOrderNo) {
        await DataService.markOrderFailed(resolvedOrderNo, paymentResult.error || 'Ödeme onaylanamadı.');
      }

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
  try {
    return await handleCallback(request);
  } catch (err: any) {
    console.error('Unhandled iyzico POST callback exception:', err);
    return NextResponse.redirect('https://www.otantikosconcept.com/odeme?error=Islem+hatasi', { status: 303 });
  }
}

export async function GET(request: Request) {
  try {
    return await handleCallback(request);
  } catch (err: any) {
    console.error('Unhandled iyzico GET callback exception:', err);
    return NextResponse.redirect('https://www.otantikosconcept.com/odeme?error=Islem+hatasi', { status: 303 });
  }
}
