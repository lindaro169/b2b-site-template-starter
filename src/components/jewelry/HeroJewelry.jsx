import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function HeroJewelry() {
  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden bg-[#140f0c] pt-24 pb-20">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,126,0.16),_transparent_38%),linear-gradient(180deg,_rgba(22,15,12,0.78)_0%,_rgba(22,15,12,0.94)_100%)]" />
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full border border-white/10 bg-white/[0.02]" />
        <div className="absolute right-[-6rem] bottom-[-5rem] h-80 w-80 rounded-full border border-[#d1a676]/10 bg-[#d1a676]/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.28em] text-stone-300 sm:text-sm">
            Mock Hero Subtitle | Replace Before Publishing
          </p>

          <h1 className="mb-6 font-serif text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            Mock Homepage Title
            <span className="mt-2 block text-stone-200">for Your B2B Template</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-8 text-stone-200 sm:text-lg">
            {siteConfig.templateCopyDescription}
          </p>

          <div className="flex justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-semibold text-stone-900 transition-all hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(255,255,255,0.2)]"
            >
              {siteConfig.catalogCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
