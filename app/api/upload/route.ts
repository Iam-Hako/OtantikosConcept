import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'avif',
  'mp4',
  'webm',
  'mov',
  'm4v',
  'mkv',
  'avi',
  '3gp',
  'ogg',
]);

const EXT_TO_MIME: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mkv: 'video/x-matroska',
  avi: 'video/x-msvideo',
  '3gp': 'video/3gpp',
  ogg: 'video/ogg',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250 MB

function resolveSafeMimeType(ext: string, providedType?: string): string {
  if (providedType && providedType !== 'application/octet-stream' && providedType.trim() !== '') {
    return providedType.toLowerCase().split(';')[0].trim();
  }
  return EXT_TO_MIME[ext] || 'application/octet-stream';
}

export async function POST(request: Request) {
  try {
    // 1. Admin Authentication Check
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json({ error: auth.error || 'Yetkisiz erişim.' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tuphsfeowfcyzzciyvav.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const contentTypeHeader = request.headers.get('content-type') || '';

    // 2. JSON Request for Direct Presigned Upload (for large videos & photos)
    if (contentTypeHeader.includes('application/json')) {
      const body = await request.json();
      const rawName = String(body.filename || 'media').trim();

      // Validate Extension
      const parts = rawName.split('.');
      const ext = (parts.pop() || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `Geçersiz dosya uzantısı (.${ext}). İzin verilenler: jpg, png, webp, mp4, webm, mov, m4v.` },
          { status: 400 }
        );
      }

      const safeMime = resolveSafeMimeType(ext, body.contentType);
      const baseName = parts.join('.').slice(0, 50).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const filename = `${Date.now()}-${baseName || 'file'}.${ext}`;

      // Try primary bucket 'product-images', fallback to 'products' if needed
      const bucketsToTry = ['product-images', 'products'];
      let signedUrl: string | null = null;
      let usedBucket = 'product-images';

      for (const bucket of bucketsToTry) {
        try {
          const presignRes = await fetch(`${supabaseUrl}/storage/v1/object/upload/sign/${bucket}/${filename}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              expiresIn: 7200,
            }),
          });

          if (presignRes.ok) {
            const presignData = await presignRes.json();
            if (presignData?.url) {
              signedUrl = `${supabaseUrl}/storage/v1${presignData.url}`;
              usedBucket = bucket;
              break;
            }
          }
        } catch {
          // Continue to next bucket
        }
      }

      if (!signedUrl) {
        return NextResponse.json({ error: 'Yükleme bağlantısı oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 });
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${usedBucket}/${filename}`;

      return NextResponse.json({
        success: true,
        uploadUrl: signedUrl,
        publicUrl: publicUrl,
        filename: filename,
        contentType: safeMime,
      });
    }

    // 3. Multipart FormData Upload (for small files)
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Dosya boyutu 250MB sınırını aşıyor.' }, { status: 400 });
    }

    const parts = file.name.split('.');
    const ext = (parts.pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Geçersiz dosya uzantısı (.${ext}). İzin verilenler: jpg, png, webp, mp4, webm, mov, m4v.` },
        { status: 400 }
      );
    }

    const safeMime = resolveSafeMimeType(ext, file.type);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const randomToken = crypto.randomBytes(6).toString('hex');
    const baseName = parts.join('.').slice(0, 40).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const filename = `${timestamp}-${randomToken}-${baseName || 'file'}.${ext}`;

    const bucketsToTry = ['product-images', 'products'];
    let uploadSuccess = false;
    let usedBucket = 'product-images';

    for (const bucket of bucketsToTry) {
      try {
        const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${filename}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${serviceKey}`,
            'Content-Type': safeMime,
            'x-upsert': 'true',
          },
          body: buffer,
        });

        if (res.ok) {
          uploadSuccess = true;
          usedBucket = bucket;
          break;
        }
      } catch {
        // Try next bucket
      }
    }

    if (!uploadSuccess) {
      return NextResponse.json({ error: 'Yükleme başarısız oldu. Sunucu veya depolama bağlantısı kurulamadı.' }, { status: 500 });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${usedBucket}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      name: file.name,
      size: file.size,
      type: safeMime,
    });
  } catch (error: any) {
    console.error('Upload handler exception:', error);
    return NextResponse.json({ error: error.message || 'Yükleme sırasında hata oluştu.' }, { status: 500 });
  }
}
