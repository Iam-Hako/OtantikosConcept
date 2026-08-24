'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams?.get('redirect') || '/';
  const isSafe = /^\/(?!\/|\\)[a-zA-Z0-9_\-\/\?&=%#\.]*$/.test(rawRedirect);
  const safeRedirect = isSafe ? rawRedirect : '/';
  const authError = searchParams?.get('error');

  const { loginWithEmail, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (authError) {
      toast.error(
        authError === 'auth-failed'
          ? 'Giriş işlemi tamamlanamadı veya iptal edildi.'
          : decodeURIComponent(authError)
      );
    }
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await loginWithEmail(email, password);
    setIsLoading(false);
    if (res.success) {
      router.push(safeRedirect);
    } else {
      toast.error(res.error || 'Giriş yapılamadı.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6 pb-20">
      <div className="text-center space-y-2">
        <div className="relative w-14 h-14 mx-auto bg-stone-900 rounded-2xl p-2 border border-stone-800 shadow-md">
          <Image src="/images/logo.webp" alt="Otantikos Logo" fill sizes="56px" className="object-contain p-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
          Hesabınıza Giriş Yapın
        </h1>
        <p className="text-xs text-stone-500">
          Siparişlerinizi ve hesap bilgilerinizi güvenle yönetin.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
        <button
          type="button"
          onClick={() => loginWithGoogle(safeRedirect)}
          className="w-full py-3.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 active:scale-95 text-stone-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-3 min-h-[48px]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google ile Giriş Yap</span>
        </button>

        <div className="flex items-center gap-3 text-stone-400 text-xs">
          <div className="flex-1 h-px bg-stone-200" />
          <span>veya E-Posta ile</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">E-Posta Adresiniz</label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@ornek.com"
                className="w-full text-base sm:text-xs p-3 pl-10 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Şifreniz</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-base sm:text-xs p-3 pl-10 pr-10 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-stone-900 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center min-h-[48px] disabled:opacity-50"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500 space-y-1">
          <div>
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="text-amber-700 font-bold hover:underline">
              Hemen Kayıt Olun
            </Link>
          </div>
          <div>
            <Link href="/siparis-takip" className="text-stone-400 hover:text-stone-700">
              Misafir Sipariş Takibi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
