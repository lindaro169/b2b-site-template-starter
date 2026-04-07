'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) {
      return;
    }

    const path = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    void fetch('/api/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ path }),
    }).catch((error) => {
      console.warn('Failed to record visit path:', error);
    });
  }, [pathname, searchParams]);

  useEffect(() => {
    const path = `${pathname || '/'}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;

    const finalizeVisit = () => {
      const payload = JSON.stringify({ path, finalize: true });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/visit', new Blob([payload], { type: 'application/json' }));
        return;
      }

      void fetch('/api/visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        keepalive: true,
        body: payload,
      }).catch(() => undefined);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        finalizeVisit();
      }
    };

    const handlePageHide = () => {
      finalizeVisit();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [pathname, searchParams]);

  return null;
}
