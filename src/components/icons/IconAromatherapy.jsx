export default function IconAromatherapy({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 精油瓶身 */}
      <rect x="26" y="28" width="12" height="18" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />

      {/* 瓶盖 */}
      <rect x="28" y="24" width="8" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.15" />
      <rect x="27" y="22" width="10" height="2" rx="0.5" fill="currentColor" opacity="0.25" />

      {/* 液体效果 */}
      <path
        d="M26 40Q26 45, 32 46Q38 45, 38 40L36 38Q32 39, 28 38Z"
        fill="currentColor"
        opacity="0.2"
      />

      {/* 精油液体指示 */}
      <line x1="28" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* 上升的香气雾 - 第一组 */}
      <path
        d="M24 20C24 16, 26 12, 28 8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* 上升的香气雾 - 第二组 */}
      <path
        d="M32 18C32 14, 32 10, 32 6"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />

      {/* 上升的香气雾 - 第三组 */}
      <path
        d="M40 20C40 16, 38 12, 36 8"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* 香气雾散发圆点 */}
      <circle cx="26" cy="10" r="1.2" fill="currentColor" opacity="0.3" />
      <circle cx="32" cy="6" r="1.5" fill="currentColor" opacity="0.35" />
      <circle cx="38" cy="10" r="1.2" fill="currentColor" opacity="0.3" />

      {/* 散发光线效果 */}
      <line x1="22" y1="12" x2="18" y2="8" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />
      <line x1="42" y1="12" x2="46" y2="8" stroke="currentColor" strokeWidth="0.8" opacity="0.25" strokeLinecap="round" />

      {/* 瓶底 */}
      <line x1="26" y1="46" x2="38" y2="46" stroke="currentColor" strokeWidth="1.2" />
      <path d="M27 46Q32 48, 37 46" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.4" />

      {/* 装饰线条 */}
      <circle cx="32" cy="33" r="5" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.2" />
    </svg>
  );
}
