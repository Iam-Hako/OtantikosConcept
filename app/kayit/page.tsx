'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/store/auth-context';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, loginWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isStrongPassword = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    if (!isStrongPassword) {
      toast.error('Şifreniz en az 8 karakter olmalı, harf ve rakam içermelidir.');
      return;
    }

    setIsLoading(true);
    const res = await signUpWithEmail(email, password, fullName);
    setIsLoading(false);
    if (res.success) {
      toast.success('Hesabınız başarıyla oluşturuldu!');
      router.push('/');
    } else {
      toast.error(res.error || 'Kayıt oluşturulamadı.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6 pb-20">
      
      <div className="text-center space-y-2">
        <div className="relative w-14 h-14 mx-auto bg-stone-900 rounded-2xl p-2 border border-stone-800 shadow-md">
          <Image src="/images/logo.webp" alt="Otantikos Logo" fill sizes="56px" className="object-contain p-1" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
          Yeni Hesap Oluşturun
        </h1>
        <p className="text-xs text-stone-500">
          Hızlı sipariş, kargo takibi ve size özel avantajlar için kaydolun.
        </p>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
        <GoogleAuthButton mode="register" redirectTo="/" />

        <div className="flex items-center gap-3 text-stone-400 text-xs">
          <div className="flex-1 h-px bg-stone-200" />
          <span>veya Form ile Kayıt</span>
          <div className="flex-1 h-px bg-stone-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Adınız Soyadınız *</label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Ahmet Yılmaz"
                className="w-full text-base sm:text-xs p-3 pl-10 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600 text-stone-900 transition"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 mb-1">E-Posta Adresiniz *</label>
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
            <label className="block text-[11px] font-bold text-stone-700 mb-1">Şifre (En az 6 karakter) *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                minLength={6}
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
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center min-h-[48px] disabled:opacity-50"
          >
            {isLoading ? 'Hesap Açılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-stone-500">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-amber-700 font-bold hover:underline">
            Giriş Yapın
          </Link>
        </div>

      </div>

    </div>
  );
}
