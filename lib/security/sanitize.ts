/**
 * Security & Sanitization Utilities
 */

/**
 * Strips HTML tags, script tags, control characters and null bytes from text.
 * Prevents Stored XSS, injection, and formatting corruption.
 */
export function sanitizeInput(text: unknown, maxLength = 1000): string {
  if (text === null || text === undefined) return '';
  let str = String(text);

  // 1. Remove null bytes and control characters (except newline \n, carriage return \r, and tab \t)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Strip HTML tags: <...> and encoded &lt;...&gt;
  str = str.replace(/<[^>]*>?/gm, '');
  str = str.replace(/&lt;.*?&gt;/gim, '');

  // 3. Normalize Unicode
  str = str.normalize('NFC').trim();

  // 4. Enforce max length
  if (maxLength > 0 && str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str;
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  // RFC 5322 compatible regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validates Web Push endpoint URL to prevent SSRF (Server-Side Request Forgery).
 * Must be HTTPS and cannot point to private IP networks, cloud metadata, or localhost.
 */
export function isSafePushEndpoint(endpoint: unknown): boolean {
  if (typeof endpoint !== 'string') return false;
  const trimmed = endpoint.trim();
  if (!trimmed.startsWith('https://')) return false;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return false;

    const hostname = url.hostname.toLowerCase();

    // Block localhost, IP formats, and dangerous internal hostnames
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal'
    ) {
      return false;
    }

    // Block IPv4 loopback & private networks
    // 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16 (AWS/GCP metadata)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const octet1 = parseInt(ipMatch[1], 10);
      const octet2 = parseInt(ipMatch[2], 10);
      if (octet1 === 127) return false; // Loopback
      if (octet1 === 10) return false; // Private 10.0.0.0/8
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false; // Private 172.16.0.0/12
      if (octet1 === 192 && octet2 === 168) return false; // Private 192.168.0.0/16
      if (octet1 === 169 && octet2 === 254) return false; // Link-local / Cloud metadata
      if (octet1 === 0) return false; // 0.0.0.0
    }

    // Block IPv6 loopback / private
    if (hostname === '[::1]' || hostname === '::1' || hostname.startsWith('fe80:') || hostname.startsWith('fc00:')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
