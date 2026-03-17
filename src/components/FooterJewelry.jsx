import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function FooterJewelry() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: 'Quartz Capsule Line', href: '/products/healing-crystal-jewelry' },
      { name: 'Silver Studio Line', href: '/products/925-silver-crystal-jewelry' },
      { name: 'Mindful Ritual Edit', href: '/products/chakra-yoga-jewelry' },
      { name: 'Aroma Companion Series', href: '/products/aromatherapy-jewelry' },
    ],
    company: [
      { name: 'About Template', href: '/about' },
      { name: 'Services', href: '/services' },
      { name: 'Blog', href: '/blog' },
    ],
    support: [
      { name: 'Contact Template', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms & Conditions', href: '/terms-conditions' },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-stone-900 to-stone-800 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1 - Products */}
          <div>
            <h3 className="text-amber-50 font-serif font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-300 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h3 className="text-amber-50 font-serif font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-300 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h3 className="text-amber-50 font-serif font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-amber-300 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h3 className="text-amber-50 font-serif font-semibold mb-4">Template Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="block text-stone-500">Email:</span>
                <a href={`mailto:${siteConfig.contactEmail}`} className="hover:text-amber-300 transition-colors">
                  {siteConfig.contactEmail}
                </a>
              </li>
              <li>
                <span className="block text-stone-500">Template Chat:</span>
                <span>{siteConfig.whatsappLabel}</span>
              </li>
              <li>
                <span className="block text-stone-500">WeChat:</span>
                <span>{siteConfig.wechatId}</span>
              </li>
              <li>
                <span className="block text-stone-500 mt-3">Address:</span>
                <span className="block text-stone-400">
                  {siteConfig.addressLines[0]}<br />
                  {siteConfig.addressLines[1]}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800 mt-12 pt-8 text-center text-sm">
          <p className="text-stone-500">
            Copyright © {currentYear} {siteConfig.legalName}. {siteConfig.templateCopyLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
