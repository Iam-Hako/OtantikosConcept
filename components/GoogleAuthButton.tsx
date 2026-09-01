'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/store/auth-context';
import { toast } from 'sonner';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
          }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  mode?: 'login' | 'register';
  redirectTo?: string;
  className?: string;
}

export default function GoogleAuthButton({
  mode = 'login',
  redirectTo = '/',
  className = '',
}: GoogleAuthButtonProps) {
  const { loginWithGoogleIdToken, loginWithGoogle } = useAuth();
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hiddenBtnRef = useRef<HTMLDivElement>(null);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '797932289173-sg1h5sh4funqejbopla8m96gf6qlsst6.apps.googleusercontent.com';

  useEffect(() => {
    // 1. Check if Google SDK script already exists
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initGoogleSdk();
      };
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGoogleSdk();
    } else {
      existingScript.addEventListener('load', () => {
        initGoogleSdk();
      });
    }

    function initGoogleSdk() {
      if (!window.google?.accounts?.id) return;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              setIsProcessing(true);
              const res = await loginWithGoogleIdToken(response.credential, redirectTo);
              setIsProcessing(false);
              if (!res.success) {
                // If ID token login has issue, fallback
                loginWithGoogle(redirectTo);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          context: mode === 'register' ? 'signup' : 'signin',
        });

        setIsSdkLoaded(true);

        // Render official button in hidden container to allow programmatic click
        if (hiddenBtnRef.current) {
          hiddenBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(hiddenBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 320,
            locale: 'tr',
          });
        }
      } catch (err) {
        console.warn('Google SDK init error:', err);
      }
    }
  }, [clientId, mode, redirectTo]);

  const handleButtonClick = () => {
    if (isProcessing) return;

    // Try triggering Google popup directly via rendered button iframe
    if (hiddenBtnRef.current) {
      const googleIframeButton = hiddenBtnRef.current.querySelector('div[role="button"]') as HTMLElement;
      if (googleIframeButton) {
        googleIframeButton.click();
        return;
      }
    }

    // Try Google prompt
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt blocked or skipped, fallback to standard OAuth flow
          loginWithGoogle(redirectTo);
        }
      });
    } else {
      // Fallback
      loginWithGoogle(redirectTo);
    }
  };

  const label = mode === 'register' ? 'Google ile Kayıt Ol' : 'Google ile Giriş Yap';

  return (
    <div className={`relative w-full ${className}`}>
      {/* Hidden container where official Google Button is rendered */}
      <div
        ref={hiddenBtnRef}
        className="absolute inset-0 opacity-0 pointer-events-auto z-10 flex items-center justify-center overflow-hidden cursor-pointer"
        aria-hidden="true"
      />

      {/* Styled visible button */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isProcessing}
        className="relative w-full py-3.5 px-4 bg-white border border-stone-300 hover:bg-stone-50 active:scale-95 text-stone-700 text-xs font-bold rounded-xl shadow-2xs transition flex items-center justify-center gap-3 min-h-[48px] disabled:opacity-50"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span>{isProcessing ? 'Giriş yapılıyor...' : label}</span>
      </button>
    </div>
  );
}
