export default function IconPrice({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 钱币圆形 */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* 钱币中心圆 */}
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 钱币符号 */}
      <path
        d="M32 22V42M26 26H38C39.1046 26 40 26.8954 40 28V36C40 37.1046 39.1046 38 38 38H26C24.8954 38 24 37.1046 24 36V28C24 26.8954 24.8954 26 26 26Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 光泽效果 */}
      <circle cx="28" cy="28" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
