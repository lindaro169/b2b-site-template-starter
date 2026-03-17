'use client';

export function BraceletIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="6" fill="currentColor" />
      <circle cx="50" cy="20" r="6" fill="currentColor" />
      <circle cx="70" cy="30" r="6" fill="currentColor" />
      <circle cx="80" cy="50" r="6" fill="currentColor" />
      <circle cx="70" cy="70" r="6" fill="currentColor" />
      <circle cx="50" cy="80" r="6" fill="currentColor" />
      <circle cx="30" cy="70" r="6" fill="currentColor" />
      <circle cx="20" cy="50" r="6" fill="currentColor" />

      <path d="M36 26 Q43 23 50 20 Q57 23 64 26" stroke="currentColor" strokeWidth="2" />
      <path d="M74 36 Q77 43 80 50 Q77 57 74 64" stroke="currentColor" strokeWidth="2" />
      <path d="M64 74 Q57 77 50 80 Q43 77 36 74" stroke="currentColor" strokeWidth="2" />
      <path d="M26 64 Q23 57 20 50 Q23 43 26 36" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function NecklaceIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Necklace chain */}
      <path d="M20 20 Q50 30 80 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Chain links */}
      <circle cx="30" cy="22" r="1.5" fill="currentColor" />
      <circle cx="40" cy="26" r="1.5" fill="currentColor" />
      <circle cx="50" cy="30" r="1.5" fill="currentColor" />
      <circle cx="60" cy="26" r="1.5" fill="currentColor" />
      <circle cx="70" cy="22" r="1.5" fill="currentColor" />

      {/* Pendant - Diamond shape */}
      <path d="M50 35 L58 50 L50 70 L42 50 Z" fill="currentColor" opacity="0.7" />
      <path d="M50 35 L58 50 L50 70 L42 50 Z" stroke="currentColor" strokeWidth="1.5" />

      {/* Sparkles */}
      <circle cx="46" cy="50" r="1.5" fill="currentColor" />
      <circle cx="54" cy="50" r="1.5" fill="currentColor" />
      <circle cx="50" cy="53" r="1" fill="currentColor" />
    </svg>
  );
}

export function DiamondIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Diamond outline */}
      <path d="M50 15 L75 50 L50 85 L25 50 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />

      {/* Inner diamond facets */}
      <line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="25" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="37" y1="32" x2="63" y2="68" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="63" y1="32" x2="37" y2="68" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Sparkle points */}
      <circle cx="50" cy="30" r="1.5" fill="currentColor" />
      <circle cx="60" cy="50" r="1.5" fill="currentColor" />
      <circle cx="50" cy="70" r="1.5" fill="currentColor" />
      <circle cx="40" cy="50" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CrystalIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Crystal prism */}
      <path d="M50 10 L70 35 L65 80 L35 80 L30 35 Z" fill="currentColor" opacity="0.2" />
      <path d="M50 10 L70 35 L65 80 L35 80 L30 35 Z" stroke="currentColor" strokeWidth="2.5" />

      {/* Facets */}
      <line x1="50" y1="10" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="30" y1="35" x2="70" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <line x1="50" y1="10" x2="35" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="50" y1="10" x2="65" y2="80" stroke="currentColor" strokeWidth="1" opacity="0.4" />

      {/* Light reflection */}
      <circle cx="45" cy="25" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="55" cy="40" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function HeartIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Heart shape */}
      <path
        d="M50 85 C25 70 10 55 10 40 C10 25 20 15 30 15 C38 15 45 22 50 28 C55 22 62 15 70 15 C80 15 90 25 90 40 C90 55 75 70 50 85 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M50 85 C25 70 10 55 10 40 C10 25 20 15 30 15 C38 15 45 22 50 28 C55 22 62 15 70 15 C80 15 90 25 90 40 C90 55 75 70 50 85 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Heart shine */}
      <circle cx="35" cy="35" r="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

export function StarIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Star outline */}
      <path
        d="M50 10 L61 40 L92 40 L68 60 L79 90 L50 70 L21 90 L32 60 L8 40 L39 40 Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M50 10 L61 40 L92 40 L68 60 L79 90 L50 70 L21 90 L32 60 L8 40 L39 40 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />

      {/* Star sparkle */}
      <circle cx="50" cy="25" r="2" fill="currentColor" />
      <circle cx="65" cy="55" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SphereIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sphere */}
      <circle cx="50" cy="50" r="35" fill="currentColor" opacity="0.2" />
      <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2.5" />

      {/* Shading curves */}
      <path d="M40 20 Q50 25 60 20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <path d="M30 50 Q35 50 40 52" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />

      {/* Highlight */}
      <circle cx="35" cy="35" r="5" fill="currentColor" opacity="0.6" />
      <circle cx="35" cy="35" r="3" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

export function FlowerIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Flower petals */}
      <circle cx="50" cy="25" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="70" cy="35" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="75" cy="55" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="65" cy="75" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="45" cy="80" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="25" cy="70" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="20" cy="50" r="8" fill="currentColor" opacity="0.7" />
      <circle cx="30" cy="30" r="8" fill="currentColor" opacity="0.7" />

      {/* Flower center */}
      <circle cx="50" cy="50" r="10" fill="currentColor" opacity="0.9" />
      <circle cx="50" cy="50" r="6" fill="white" opacity="0.8" />
    </svg>
  );
}
