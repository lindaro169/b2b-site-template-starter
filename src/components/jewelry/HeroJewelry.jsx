import Image from 'next/image';
import Link from 'next/link';
import IconMOQ from '@/components/icons/IconMOQ';
import IconCertified from '@/components/icons/IconCertified';
import IconFastShip from '@/components/icons/IconFastShip';
import TemplateCopyBadge from '@/components/TemplateCopyBadge';
import { siteConfig } from '@/lib/site-config';

export default function HeroJewelry() {
  return (
    <section className="relative min-h-[700px] flex items-center pt-24 pb-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={siteConfig.scenePlaceholder}
          alt="Demo catalog placeholder scene"
          fill
          priority
          className="object-cover scale-105"
          sizes="100vw"
        />

        {/* Layer 1: Cinematic Vignette (Focus on center, dark edges) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/10 via-black/40 to-black/80"></div>

        {/* Layer 2: Vertical Gradient (Darker top for Nav, Darker bottom for Trust Badges) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-5xl mx-auto">
          <TemplateCopyBadge className="mb-6" />

          {/* H2 - "Eyebrow" Subtitle Style - Luxury Standard */}
          <h2 className="text-xs sm:text-sm md:text-base text-stone-200 mb-6 font-medium tracking-[0.2em] uppercase drop-shadow-md">
            Template Catalog Preview <span className="opacity-50 mx-2">|</span> Placeholder Imagery <span className="opacity-50 mx-2">|</span> Replace Before Publishing
          </h2>

          {/* H1 - High Impact Serif */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white mb-10 drop-shadow-xl leading-tight">
            Structured Layout for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-white to-stone-200">
              Publish-Ready Template Collections
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-3xl text-lg font-light leading-relaxed text-stone-200">
            {siteConfig.templateCopyDescription}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">{siteConfig.catalogCta}</span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-medium rounded-full border border-white/30 hover:bg-white/20 transition-all hover:scale-105"
            >
              Open Contact Template
            </Link>
          </div>

          {/* Trust Indicators - Glassmorphism Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl max-w-4xl mx-auto hover:bg-black/40 transition-colors duration-500">
            <div className="flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
              <IconMOQ className="w-10 h-10 text-stone-200" />
              <div className="text-center">
                <p className="text-stone-200 font-medium text-sm tracking-wide uppercase">Template Minimums</p>
                <p className="text-stone-400 text-xs">Replace with your approved thresholds</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
              <IconCertified className="w-10 h-10 text-stone-200" />
              <div className="text-center">
                <p className="text-stone-200 font-medium text-sm tracking-wide uppercase">Trust Proof</p>
                <p className="text-stone-400 text-xs">Swap in verified claims only</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 transition-transform hover:-translate-y-1">
              <IconFastShip className="w-10 h-10 text-stone-200" />
              <div className="text-center">
                <p className="text-stone-200 font-medium text-sm tracking-wide uppercase">Delivery Notice</p>
                <p className="text-stone-400 text-xs">Replace with your live SLA</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
