export default function IconLeadTime({ className = "w-4 h-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 时钟圆形 */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.08"
      />

      {/* 时钟外框 */}
      <circle cx="32" cy="32" r="14" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 时钟中心点 */}
      <circle cx="32" cy="32" r="1.8" fill="currentColor" opacity="0.6" />

      {/* 时针（指向11点） */}
      <line
        x1="32"
        y1="32"
        x2="30"
        y2="22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* 分针（指向2点） */}
      <line
        x1="32"
        y1="32"
        x2="40"
        y2="35"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* 刻度点 */}
      <circle cx="32" cy="18" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="42" cy="32" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="32" cy="46" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="22" cy="32" r="0.8" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
