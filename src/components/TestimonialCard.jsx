export default function TestimonialCard({ testimonial }) {
  const {
    clientName, authorName,
    clientCompany, authorCompany,
    clientLocation,
    quote, content,
    role,
  } = testimonial;

  const displayName = clientName || authorName || 'Partner';
  const displayCompany = clientCompany || authorCompany;
  const displayText = quote || content;
  const displayRole = role || 'Wholesale Buyer';

  return (
    <div className="relative bg-white rounded-xl p-7 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4">

      {/* Decorative quote mark */}
      <span className="absolute top-5 right-6 text-5xl text-stone-100 font-serif leading-none select-none" aria-hidden="true">
        &quot;
      </span>

      {/* Role badge */}
      <div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block"></span>
          {displayRole}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="text-stone-700 text-base leading-relaxed flex-1 italic">
        &quot;{displayText}&quot;
      </blockquote>

      {/* Client Info */}
      <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-serif font-semibold text-base">
            {displayName.charAt(0)}
          </span>
        </div>
        <div>
          <div className="font-semibold text-stone-900 text-sm">{displayName}</div>
          <div className="text-xs text-stone-400">
            {displayCompany ? `${displayCompany}${clientLocation ? ` · ${clientLocation}` : ''}` : clientLocation}
          </div>
        </div>
        {/* Verified partner indicator */}
        <div className="ml-auto text-xs text-stone-400 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </div>
      </div>
    </div>
  );
}
