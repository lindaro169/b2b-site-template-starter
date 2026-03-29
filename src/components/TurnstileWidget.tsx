'use client';

import { useEffect, useRef, useCallback } from 'react';
import { siteConfig } from '@/lib/site-config';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  containerId?: string;
}

export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  containerId = 'cf-turnstile-widget',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onSuccess, onError, onExpire });

  // Update callbacks ref without triggering re-render
  useEffect(() => {
    callbacksRef.current = { onSuccess, onError, onExpire };
  }, [onSuccess, onError, onExpire]);

  useEffect(() => {
    if (!siteConfig.localPreviewMode) {
      return;
    }

    callbacksRef.current.onSuccess(siteConfig.templateTurnstileToken);
  }, [onSuccess]);

  const renderWidget = useCallback(() => {
    if (siteConfig.localPreviewMode) {
      return;
    }

    if (window.turnstile && containerRef.current) {
      const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        console.error('❌ NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is not configured');
        return;
      }

      // Check if widget already exists in this container
      if (widgetIdRef.current !== null) {
        return;
      }

      // Render the Turnstile widget
      try {
        const widgetId = window.turnstile.render(`#${containerId}`, {
          sitekey: siteKey,
          theme,
          size,
          callback: (token: string) => {
            console.log('✅ Turnstile token received');
            callbacksRef.current.onSuccess(token);
          },
          'error-callback': () => {
            console.log('❌ Turnstile error');
            callbacksRef.current.onError?.();
          },
          'expired-callback': () => {
            console.log('⏱ Turnstile token expired');
            callbacksRef.current.onExpire?.();
          },
        });

        widgetIdRef.current = widgetId;
      } catch (error) {
        console.error('❌ Error rendering Turnstile:', error);
      }
    } else {
      console.warn('⚠️  Turnstile script not ready or container not found');
      console.log('window.turnstile:', !!window.turnstile);
      console.log('containerRef.current:', !!containerRef.current);
    }
  }, [containerId, theme, size]);

  useEffect(() => {
    if (siteConfig.localPreviewMode) {
      return;
    }

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Give the script time to execute
      setTimeout(renderWidget, 100);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Turnstile script');
    };

    console.log('Loading Turnstile script...');
    document.head.appendChild(script);

    return () => {
      // Cleanup: only remove widget, don't remove script (it's global)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (error) {
          console.warn('Error removing Turnstile widget:', error);
        }
      }
    };
  }, [renderWidget]);

  if (siteConfig.localPreviewMode) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '20px 0',
          minHeight: '65px',
        }}
      >
        <div className="w-full rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm text-stone-500">
          本地模板预览已启用占位验证，不会加载真实 Turnstile 配置。
        </div>
      </div>
    );
  }

  return (
    <div
      id={containerId}
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '20px 0',
        minHeight: '65px',
      }}
    />
  );
}

// Type definitions for Turnstile
// Uses shared global Turnstile types in `src/types/turnstile.d.ts`
