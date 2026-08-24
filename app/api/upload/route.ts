import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const timestamp = Date.now();
    const cleanOriginalName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${timestamp}-${cleanOriginalName}`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    // Upload to Supabase Storage 'product-images' bucket
    const res = await fetch(`${supabaseUrl}/storage/v1/object/product-images/${filename}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Storage upload error:', err);
      return NextResponse.json({ error: 'Yükleme başarısız oldu.' }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload handler exception:', error);
    return NextResponse.json({ error: error.message || 'Yükleme sırasında hata oluştu.' }, { status: 500 });
  }
}
