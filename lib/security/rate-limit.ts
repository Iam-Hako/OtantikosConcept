import { NextResponse } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory token bucket / sliding window store
const rateLimitMap = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired keys every 5 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup > 300_000) {
    lastCleanup = now;
    rateLimitMap.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }
}

/**
 * Extract client IP from headers (supports Cloudflare, Vercel, standard proxies)
 */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const cfIp = headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  return '127.0.0.1';
}

/**
 * Check if a key (e.g. action:ip) exceeds the rate limit
 * @param key unique identifier (e.g. `action:ip`)
 * @param limit maximum requests allowed in window
 * @param windowSeconds window duration in seconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetTime: number } {
  cleanupExpired();

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    const record: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, record);
    return { allowed: true, remaining: limit - 1, resetTime: record.resetTime };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetTime: existing.resetTime };
}

/**
 * Apply rate limit to an API route request. Returns a 429 NextResponse if limit is exceeded, or null if allowed.
 */
export function applyRateLimit(
  request: Request,
  options: {
    limit: number;
    windowSeconds: number;
    actionName: string;
    errorMessage?: string;
  }
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${options.actionName}:${ip}`;
  const result = checkRateLimit(key, options.limit, options.windowSeconds);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      {
        error: options.errorMessage || 'Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyiniz.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, retryAfter)),
          'X-RateLimit-Limit': String(options.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
        },
      }
    );
  }

  return null;
}
