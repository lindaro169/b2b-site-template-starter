'use client';

import { useEffect, useRef, useCallback } from 'react';

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

  const renderWidget = useCallback(() => {
    if (window.turnstile && containerRef.current) {
      const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        console.error('❌ NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY is not configured');
        console.log('Available env keys:', Object.keys(process.env).filter(k => k.includes('CLOUDFLARE')));
        return;
      }

      // Check if widget already exists in this container
      if (widgetIdRef.current !== null) {
        return;
      }

      console.log('✅ Rendering Turnstile widget with site key:', siteKey.substring(0, 10) + '...');

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
