import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function generateOrderNumber(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `OTN-2026-${randomDigits}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLocaleLowerCase('tr-TR')
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

/**
 * Converts Google Drive, YouTube, and Vimeo video links to embedded responsive preview URL
 */
export function convertGoogleDriveVideoUrl(url: string): string {
  if (!url) return '';
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

  return trimmed;
}
