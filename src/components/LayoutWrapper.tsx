'use client';

import { usePathname } from 'next/navigation';
import HeaderJewelry from '@/components/HeaderJewelry';
import FooterJewelry from '@/components/FooterJewelry';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname === '/login';
  const shouldHideHeaderFooter = isAdminRoute || isLoginRoute;

  return (
    <>
      {!shouldHideHeaderFooter && <HeaderJewelry />}
      <main className="min-h-screen">
        {children}
      </main>
      {!shouldHideHeaderFooter && <FooterJewelry />}
    </>
  );
}
