export default function IconCrystal({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外层晶体轮廓 */}
      <path
        d="M32 6L14 18L14 32L18 48L32 56L46 48L50 32L50 18L32 6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />

      {/* 中层晶体 */}
      <path
        d="M32 12L22 20L22 32L26 44L32 50L38 44L42 32L42 20L32 12Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.15"
      />

      {/* 内层晶体 */}
      <path
        d="M32 18L26 24L26 32L30 40L32 44L34 40L38 32L38 24L32 18Z"
        stroke="currentColor"
        strokeWidth="1"
        fill="currentColor"
        fillOpacity="0.3"
      />

      {/* 光泽效果 */}
      <line x1="32" y1="6" x2="32" y2="56" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="18" y1="18" x2="46" y2="48" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1="46" y1="18" x2="18" y2="48" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />

      {/* 底部光线 */}
      <circle cx="32" cy="52" r="3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
