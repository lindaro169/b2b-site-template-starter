export default function IconSilver({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 项链链条 */}
      <path
        d="M16 20Q20 10, 32 10Q44 10, 48 20"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 左侧链条 */}
      <line x1="16" y1="20" x2="16" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* 右侧链条 */}
      <line x1="48" y1="20" x2="48" y2="40" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />

      {/* 中心吊坠 - 晶体和银饰组合 */}
      {/* 外层银质框 */}
      <circle cx="32" cy="40" r="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />

      {/* 内层晶体 */}
      <path
        d="M32 32L28 36L28 42L32 46L36 42L36 36L32 32Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        fillOpacity="0.25"
      />

      {/* 银质光泽 */}
      <circle cx="29" cy="37" r="1.5" fill="currentColor" opacity="0.5" />

      {/* 链条圆点装饰 */}
      <circle cx="20" cy="25" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="44" cy="25" r="1.2" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="35" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="46" cy="35" r="0.8" fill="currentColor" opacity="0.4" />

      {/* 底部装饰 */}
      <path
        d="M25 50Q32 54, 39 50"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
