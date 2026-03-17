'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ensureVisitorTracking, syncVisitorTrackingCurrentPage } from '@/lib/visitor-tracking';

export default function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const search = searchParams?.toString();
    const nextUrl = `${window.location.origin}${pathname || '/'}${search ? `?${search}` : ''}`;
    ensureVisitorTracking(nextUrl);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncVisitorTrackingCurrentPage();
      }
    };

    const handlePageHide = () => {
      syncVisitorTrackingCurrentPage();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  return null;
}
