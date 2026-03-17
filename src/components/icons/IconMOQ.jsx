export default function IconMOQ({ className = "w-12 h-12" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 左侧包裹 */}
      <rect
        x="10"
        y="18"
        width="18"
        height="28"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* 左侧包裹装饰线 */}
      <line x1="10" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="15" y1="30" x2="23" y2="30" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="15" y1="35" x2="23" y2="35" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />

      {/* 左侧包裹带子 */}
      <path d="M19 18V46" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <path d="M10 32H28" stroke="currentColor" strokeWidth="1" opacity="0.5" />

      {/* 右侧包裹 */}
      <rect
        x="36"
        y="20"
        width="18"
        height="26"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />

      {/* 右侧包裹装饰 */}
      <line x1="36" y1="26" x2="54" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="41" y1="32" x2="49" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      <line x1="41" y1="37" x2="49" y2="37" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />

      {/* 右侧包裹带子 */}
      <path d="M45 20V46" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />

      {/* 上方的+符号或增加指示 */}
      <circle cx="32" cy="12" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.6" />
      <line x1="29" y1="12" x2="35" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="32" y1="9" x2="32" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />

      {/* 底部箭头表示数量 */}
      <path d="M28 50L32 54L36 50" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </svg>
  );
}
