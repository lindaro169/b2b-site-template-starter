import HeaderJewelry from '@/components/HeaderJewelry';
import FooterJewelry from '@/components/FooterJewelry';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

export const metadata = {
  title: `${siteConfig.brandName} | Mock Wholesale Jewelry Template`,
  description: siteConfig.companyDescription,
  openGraph: {
    siteName: siteConfig.brandName,
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900">
        <HeaderJewelry />
        <main className="min-h-screen">
          {children}
        </main>
        <FooterJewelry />
      </body>
    </html>
  );
}
