import { siteConfig } from '@/lib/site-config';

export default function TemplateCopyBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-white/90 backdrop-blur ${className}`.trim()}
    >
      {siteConfig.templateCopyLabel}
    </span>
  );
}
