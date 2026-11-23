import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | null | undefined): string {
  const num = typeof price === 'number' ? price : Number(price || 0);
  const safeNum = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNum);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
}

export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

export function generateOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 7; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OTN-${new Date().getFullYear()}-${rand}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLocaleLowerCase('tr-TR')
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function safeDecodeURIComponent(str: string | null | undefined): string {
  if (!str) return '';
  try {
    return decodeURIComponent(str);
  } catch {
    try {
      return decodeURI(str);
    } catch {
      return String(str);
    }
  }
}


/**
 * Converts any Google Drive sharing link into high-speed Google User Content CDN link
 * e.g. https://drive.google.com/file/d/1AbC2d.../view -> https://lh3.googleusercontent.com/d/1AbC2d...
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }

  return trimmed;
}

const ALLOWED_VIDEO_HOSTS = new Set([
  'drive.google.com',
  'docs.google.com',
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'player.vimeo.com',
  'vimeo.com',
  'tuphsfeowfcyzzciyvav.supabase.co',
]);

/**
 * Converts Google Drive, YouTube, and Vimeo video links to embedded responsive preview URL,
 * or returns valid direct video URLs (e.g. Supabase Storage mp4/webm/mov).
 */
export function convertGoogleDriveVideoUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // 1. Google Drive Video
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://drive.google.com/file/d/${fileDMatch[1]}/preview`;
    }
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
    }
  }

  // 2. YouTube Video (watch?v= or youtu.be/ or shorts/)
  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
  }

  // 3. Vimeo Video
  if (trimmed.includes('vimeo.com')) {
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
  }

  // 4. Direct Video Files & Supabase Storage
  const cleanPath = trimmed.split('?')[0].toLowerCase();
  if (
    cleanPath.endsWith('.mp4') ||
    cleanPath.endsWith('.webm') ||
    cleanPath.endsWith('.mov') ||
    cleanPath.endsWith('.ogg') ||
    trimmed.includes('/storage/v1/object/public/') ||
    trimmed.includes('supabase.co/storage')
  ) {
    return trimmed;
  }

  // 5. Fallback: only permit HTTPS on valid hostnames
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' && (ALLOWED_VIDEO_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith('.supabase.co'))) {
      return trimmed;
    }
  } catch {
    return '';
  }

  return trimmed;
}

export function formatOrderPaymentSummary(
  paymentMethod?: string | null,
  paymentStatus?: string | null
): { label: string; shortLabel: string; badgeClass: string; isPaid: boolean } {
  const method = (paymentMethod || 'credit_card').toLowerCase().trim();
  const status = (paymentStatus || 'pending').toLowerCase().trim();

  if (status === 'refunded') {
    return {
      label: 'Ücret İade Edildi',
      shortLabel: 'İade Edildi',
      badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
      isPaid: false,
    };
  }

  if (status === 'failed') {
    return {
      label: 'Ödeme Başarısız / İptal',
      shortLabel: 'Ödeme Başarısız',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      isPaid: false,
    };
  }

  if (method === 'admin_test') {
    return {
      label: status === 'paid' ? 'Yönetici Test Siparişi (Ödendi)' : 'Yönetici Test Siparişi',
      shortLabel: 'Yönetici Test',
      badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
      isPaid: status === 'paid',
    };
  }

  if (method === 'magaza_nakit' || method === 'pickup' || method === 'cash') {
    return {
      label: status === 'paid' ? 'Mağazada Nakit / POS ile Ödendi' : 'Mağazada Ödenecek (Nakit / POS)',
      shortLabel: status === 'paid' ? 'Nakit / POS Ödendi' : 'Mağazada Ödeme',
      badgeClass: status === 'paid'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
      isPaid: status === 'paid',
    };
  }

  if (method === 'bank_transfer' || method === 'havale' || method === 'eft') {
    return {
      label: status === 'paid' ? 'Havale / EFT ile Ödendi' : 'Havale / EFT (Onay Bekliyor)',
      shortLabel: status === 'paid' ? 'Havale Ödendi' : 'Havale Bekliyor',
      badgeClass: status === 'paid'
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
      isPaid: status === 'paid',
    };
  }

  if (status === 'paid') {
    return {
      label: 'Kredi Kartı ile Ödendi (iyzico)',
      shortLabel: 'Kredi Kartı ile Ödendi',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isPaid: true,
    };
  }

  return {
    label: 'Kredi Kartı (Ödeme Bekleniyor)',
    shortLabel: 'Ödeme Bekleniyor',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    isPaid: false,
  };
}

export function formatOrderStatusLabel(status?: string | null): string {
  switch (status) {
    case 'siparis_alindi':
      return 'Sipariş Alındı';
    case 'hazirlaniyor':
      return 'Hazırlanıyor';
    case 'kargoya_verildi':
      return 'Kargoya Verildi';
    case 'teslim_edildi':
      return 'Teslim Edildi';
    case 'iptal_edildi':
      return 'İptal Edildi';
    default:
      return String(status || '').replace('_', ' ');
  }
}

export function buildCargoTrackingExternalUrl(
  trackingNumber?: string | null,
  trackingCarrier?: string | null
): string {
  const code = (trackingNumber || '').trim();
  const carrier = (trackingCarrier || '').toLowerCase();
  if (!code) return '#';
  if (carrier.includes('mng') || (carrier.includes('dhl') && /^\d{8,14}$/.test(code))) {
    return `https://kargotakip.mngkargo.com.tr/?k=${encodeURIComponent(code)}`;
  }
  if (carrier.includes('dhl')) {
    return `https://www.dhl.com/tr-tr/home/tracking.html?tracking-id=${encodeURIComponent(code)}`;
  }
  if (carrier.includes('yurti')) {
    return `https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=${encodeURIComponent(code)}`;
  }
  if (carrier.includes('aras')) {
    return `https://www.araskargo.com.tr/tr/kargo-takip?kargoTakipNo=${encodeURIComponent(code)}`;
  }
  if (carrier.includes('ptt')) {
    return `https://gonderitakip.ptt.gov.tr/Track/Verify?q=${encodeURIComponent(code)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent((trackingCarrier || 'kargo') + ' ' + code)}`;
}
