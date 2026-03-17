import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export const metadata = {
  title: `Page Not Found | ${siteConfig.brandName}`,
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary/10 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, the page you are looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors"
          >
            View Products
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-4">Popular pages:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/about" className="text-primary-600 hover:text-primary-700">About Us</Link>
            <Link href="/services" className="text-primary-600 hover:text-primary-700">Services</Link>
            <Link href="/contact" className="text-primary-600 hover:text-primary-700">Contact</Link>
            <Link href="/blog" className="text-primary-600 hover:text-primary-700">Blog</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
