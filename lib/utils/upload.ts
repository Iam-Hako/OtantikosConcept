/**
 * High-speed direct client uploader for unlimited size videos & photos
 * Bypasses Vercel 4.5MB serverless limits using Supabase signed direct uploads
 */
export async function uploadMediaFile(file: File): Promise<string> {
  try {
    // 1. Get presigned upload URL from server
    const presignRes = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      }),
    });

    if (presignRes.ok) {
      const { uploadUrl, publicUrl } = await presignRes.json();

      if (uploadUrl && publicUrl) {
        // 2. Direct binary stream upload to Supabase Storage
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (uploadRes.ok) {
          return publicUrl;
        }
      }
    }
  } catch (err) {
    console.warn('Presigned upload failed, trying FormData fallback...', err);
  }

  // 3. Fallback to multipart FormData upload
  const formData = new FormData();
  formData.append('file', file);
  const fallbackRes = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!fallbackRes.ok) {
    const errorJson = await fallbackRes.json().catch(() => ({}));
    throw new Error(errorJson.error || 'Dosya yükleme başarısız oldu.');
  }

  const data = await fallbackRes.json();
  return data.publicUrl || data.url;
}
