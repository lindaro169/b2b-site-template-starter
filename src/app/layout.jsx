import { Suspense } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';
import Analytics from '@/components/Analytics';
import CookieConsent from '@/components/CookieConsent';
import VisitorTracker from '@/components/VisitorTracker';
import WhatsAppButton from '@/components/WhatsAppButton';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

export const metadata = {
  title: `${siteConfig.brandName} | Mock Wholesale Jewelry Template`,
  description: siteConfig.companyDescription,
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      }
    ],
    apple: '/favicon.svg'
  },
  manifest: '/favicon_io/site.webmanifest',
  openGraph: {
    siteName: siteConfig.brandName,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white text-gray-900" suppressHydrationWarning>
        {/* Analytics - GDPR 合规，仅在用户同意后加载 */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>

        <LayoutWrapper>
          {children}
        </LayoutWrapper>

        {/* Cookie 同意横幅 */}
        <CookieConsent />

        {/* Quick contact 浮动按钮 */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
