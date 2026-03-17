export default function IconChakra({ className = "w-16 h-16" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 外层七脉轮圆 */}
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1" opacity="0.3" />

      {/* 第一层脉轮 - 红色对应位置（上方） */}
      <circle cx="32" cy="10" r="3.5" fill="currentColor" opacity="0.4" />
      <circle cx="32" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 第二层脉轮 - 橙色对应位置（右上） */}
      <circle cx="46" cy="18" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="46" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 第三层脉轮 - 黄色对应位置（右下） */}
      <circle cx="46" cy="46" r="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="46" cy="46" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 第四层脉轮 - 绿色对应位置（下方） */}
      <circle cx="32" cy="54" r="3.5" fill="currentColor" opacity="0.25" />
      <circle cx="32" cy="54" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 第五层脉轮 - 蓝色对应位置（左下） */}
      <circle cx="18" cy="46" r="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="18" cy="46" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 第六层脉轮 - 紫色对应位置（左上） */}
      <circle cx="18" cy="18" r="3.5" fill="currentColor" opacity="0.35" />
      <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.2" fill="none" />

      {/* 中心脉轮 - 冥想点 */}
      <circle cx="32" cy="32" r="5.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.6" />

      {/* 脉轮连接线 */}
      <line x1="32" y1="14" x2="32" y2="50" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />

      {/* 对角线连接 */}
      <line x1="20" y1="20" x2="44" y2="44" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
      <line x1="44" y1="20" x2="20" y2="44" stroke="currentColor" strokeWidth="0.6" opacity="0.15" />
    </svg>
  );
}
