import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function CTABanner() {
  return (
    <section className="py-20 bg-gradient-to-br from-stone-900 to-stone-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-primary-50 mb-6">
          Ready to Replace the Template Content?
        </h2>
        <p className="text-lg text-stone-300 mb-10 font-light">
          Replace the copy, imagery, contact paths, and legal details with your approved production content.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-serif font-semibold rounded-lg hover:bg-primary-50 transition-all duration-300 shadow-lg hover:shadow-primary-100/20"
          >
            {siteConfig.catalogCta}
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-serif font-semibold rounded-lg border border-stone-600 hover:bg-stone-800 hover:border-stone-500 transition-all duration-300"
          >
            Open Contact Template
          </Link>
        </div>
      </div>
    </section>
  );
}
