export default function IconInquiry({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 信封 */}
      <rect
        x="8"
        y="18"
        width="48"
        height="28"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.06"
      />

      {/* 信封盖 */}
      <path
        d="M8 18L32 34L56 18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 信纸线条 */}
      <line x1="18" y1="28" x2="46" y2="28" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="18" y1="34" x2="46" y2="34" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="18" y1="40" x2="42" y2="40" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />

      {/* 发送箭头 */}
      <path
        d="M48 12L56 20L48 28"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
