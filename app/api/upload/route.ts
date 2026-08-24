import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'mp4', 'webm', 'mov']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150 MB

export async function POST(request: Request) {
  // 1. Admin Authentication Check
  const auth = await verifyAdminAuth();
  if (!auth.isAuthorized) {
    return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  try {
    const contentTypeHeader = request.headers.get('content-type') || '';

    // 2. JSON Request for Direct Presigned Upload (for large videos & photos)
    if (contentTypeHeader.includes('application/json')) {
      const body = await request.json();
      const rawName = String(body.filename || 'media').trim();
      const contentType = String(body.contentType || '').toLowerCase().trim();

      // Validate Extension
      const parts = rawName.split('.');
      const ext = (parts.pop() || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `Geçersiz dosya uzantısı (.${ext}). İzin verilenler: jpg, png, webp, gif, mp4, webm, mov.` },
          { status: 400 }
        );
      }

      if (contentType && !ALLOWED_MIME_TYPES.has(contentType)) {
        return NextResponse.json(
          { error: `Geçersiz dosya türü (${contentType}). Yalnızca güvenli görsel ve video dosyaları yüklenebilir.` },
          { status: 400 }
        );
      }

      const baseName = parts.join('.').slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const filename = `${Date.now()}-${baseName || 'file'}.${ext}`;

      const presignRes = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/product-images/${filename}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expiresIn: 3600,
        }),
      });

      if (!presignRes.ok) {
        const errText = await presignRes.text();
        console.error('Presign generation failed:', errText);
        return NextResponse.json({ error: 'Yükleme bağlantısı oluşturulamadı.' }, { status: 500 });
      }

      const presignData = await presignRes.json();
      const fullUploadUrl = `${supabaseUrl}/storage/v1${presignData.url}`;
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${filename}`;

      return NextResponse.json({
        success: true,
        uploadUrl: fullUploadUrl,
        publicUrl: publicUrl,
        filename: filename,
      });
    }

    // 3. Multipart FormData Upload (for small files)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Dosya boyutu 150MB sınırını aşıyor.' }, { status: 400 });
    }

    const parts = file.name.split('.');
    const ext = (parts.pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Geçersiz dosya uzantısı (.${ext}). İzin verilenler: jpg, png, webp, gif, mp4, webm, mov.` },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: `Geçersiz dosya türü (${file.type}). Yalnızca güvenli görsel ve video dosyaları yüklenebilir.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const baseName = parts.join('.').slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const filename = `${timestamp}-${baseName || 'file'}.${ext}`;

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
      publicUrl: publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Upload handler exception:', error);
    return NextResponse.json({ error: error.message || 'Yükleme sırasında hata oluştu.' }, { status: 500 });
  }
}
