// In-memory store for email verification codes (Server-Side)
export interface OTPRecord {
  code: string;
  expiresAt: number;
}

const globalStore = global as unknown as {
  otpCache?: Map<string, OTPRecord>;
};

if (!globalStore.otpCache) {
  globalStore.otpCache = new Map<string, OTPRecord>();
}

export const otpCache = globalStore.otpCache;

export function setOTP(email: string, code: string, durationMinutes = 10) {
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  otpCache.set(email.toLowerCase().trim(), { code, expiresAt });
}

export function verifyOTP(email: string, code: string): { valid: boolean; message?: string } {
  const cleanEmail = email.toLowerCase().trim();
  const record = otpCache.get(cleanEmail);

  if (!record) {
    return { valid: false, message: "Bu e-posta adresi için doğrulama kodu talep edilmemiş veya süresi dolmuş." };
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(cleanEmail);
    return { valid: false, message: "Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod talep edin." };
  }

  if (record.code !== code.trim()) {
    return { valid: false, message: "Girdiğiniz 6 haneli doğrulama kodu hatalı!" };
  }

  // Kod doğru, önbellekten sil
  otpCache.delete(cleanEmail);
  return { valid: true };
}
