'use client';

/**
 * 珠宝类SVG图标组件
 * 风格: 半3D现代风格 - 类似高端珠宝品牌
 */

export function BraceletIcon({ className = 'w-16 h-16' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 品牌玫瑰金渐变 - 符合新的颜色系统 #b8956a */}
        <radialGradient id="braceletGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#dbb896" />
          <stop offset="100%" stopColor="#b8956a" />
        </radialGradient>

        {/* 珠子高光效果 */}
        <radialGradient id="braceletHighlight" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#ffffff" opacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" opacity="0" />
        </radialGradient>

        {/* 白色背景圆形阴影 */}
        <filter id="shadowBg">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* 白色背景圆形 - 提高对比度 */}
      <circle cx="60" cy="60" r="58" fill="white" filter="url(#shadowBg)" />

      {/* 手链主体 - 珠子环形排列 */}
      {/* 左上珠子 */}
      <circle cx="30" cy="30" r="12" fill="url(#braceletGradient)" />
      <circle cx="30" cy="30" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="26" cy="26" r="3" fill="url(#braceletHighlight)" />

      {/* 上方珠子 */}
      <circle cx="60" cy="15" r="12" fill="url(#braceletGradient)" />
      <circle cx="60" cy="15" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="56" cy="11" r="3" fill="url(#braceletHighlight)" />

      {/* 右上珠子 */}
      <circle cx="90" cy="30" r="12" fill="url(#braceletGradient)" />
      <circle cx="90" cy="30" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="94" cy="26" r="3" fill="url(#braceletHighlight)" />

      {/* 右方珠子 */}
      <circle cx="105" cy="60" r="12" fill="url(#braceletGradient)" />
      <circle cx="105" cy="60" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="109" cy="56" r="3" fill="url(#braceletHighlight)" />

      {/* 右下珠子 */}
      <circle cx="90" cy="90" r="12" fill="url(#braceletGradient)" />
      <circle cx="90" cy="90" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="94" cy="94" r="3" fill="url(#braceletHighlight)" />

      {/* 下方珠子 */}
      <circle cx="60" cy="105" r="12" fill="url(#braceletGradient)" />
      <circle cx="60" cy="105" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="64" cy="109" r="3" fill="url(#braceletHighlight)" />

      {/* 左下珠子 */}
      <circle cx="30" cy="90" r="12" fill="url(#braceletGradient)" />
      <circle cx="30" cy="90" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="26" cy="94" r="3" fill="url(#braceletHighlight)" />

      {/* 左方珠子 */}
      <circle cx="15" cy="60" r="12" fill="url(#braceletGradient)" />
      <circle cx="15" cy="60" r="12" stroke="#9d7857" strokeWidth="0.8" opacity="0.6" />
      <circle cx="11" cy="56" r="3" fill="url(#braceletHighlight)" />

      {/* 连接线 - 玫瑰金 */}
      <path
        d="M 42 22 Q 60 10 78 22"
        stroke="#b8956a"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M 97 42 Q 110 60 97 78"
        stroke="#b8956a"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M 78 98 Q 60 110 42 98"
        stroke="#b8956a"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
      />
      <path
        d="M 23 78 Q 10 60 23 42"
        stroke="#b8956a"
        strokeWidth="1.2"
        opacity="0.5"
        fill="none"
      />
    </svg>
  );
}

export function NecklaceIcon({ className = 'w-16 h-16' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* 项链链条渐变 - 玫瑰金 #b8956a */}
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#dbb896" />
          <stop offset="50%" stopColor="#b8956a" />
          <stop offset="100%" stopColor="#dbb896" />
        </linearGradient>

        {/* 吊坠主体渐变 - 翡翠绿 #3a8a6d */}
        <radialGradient id="pendantGradient" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#6fb59b" />
          <stop offset="60%" stopColor="#3a8a6d" />
          <stop offset="100%" stopColor="#2d6d57" />
        </radialGradient>

        {/* 高光效果 */}
        <radialGradient id="highlightGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ffffff" opacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" opacity="0" />
        </radialGradient>

        {/* 阴影滤镜 - 翡翠绿阴影 */}
        <filter id="shadowFilter">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3a8a6d" floodOpacity="0.4" />
        </filter>

        {/* 白色背景圆形阴影 */}
        <filter id="shadowBgNecklace">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* 白色背景圆形 - 提高对比度 */}
      <circle cx="60" cy="60" r="58" fill="white" filter="url(#shadowBgNecklace)" />

      {/* 项链链条 - 左边优雅的S形 (缩短) */}
      <path
        d="M 30 28 Q 35 35 38 48"
        stroke="url(#chainGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 项链链条 - 右边对称的S形 (缩短) */}
      <path
        d="M 90 28 Q 85 35 82 48"
        stroke="url(#chainGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* 链条装饰珠 - 左侧 (玫瑰金) */}
      <circle cx="32" cy="32" r="1.5" fill="#b8956a" opacity="0.8" />
      <circle cx="36" cy="42" r="1.2" fill="#b8956a" opacity="0.7" />

      {/* 链条装饰珠 - 右侧 (玫瑰金) */}
      <circle cx="88" cy="32" r="1.5" fill="#b8956a" opacity="0.8" />
      <circle cx="84" cy="42" r="1.2" fill="#b8956a" opacity="0.7" />

      {/* 吊坠连接环 - 玫瑰金 (位置调整) */}
      <circle cx="60" cy="55" r="4.5" fill="none" stroke="#b8956a" strokeWidth="2" />
      <circle cx="60" cy="55" r="2" fill="#b8956a" />

      {/* 吊坠主体 - 优雅的泪滴形 (位置调整) */}
      <path
        d="M 60 59 C 50 71 47 83 50 98 C 52 105 56 111 60 113 C 64 111 68 105 70 98 C 73 83 70 71 60 59 Z"
        fill="url(#pendantGradient)"
        filter="url(#shadowFilter)"
      />

      {/* 吊坠外轮廓 (位置调整) */}
      <path
        d="M 60 59 C 50 71 47 83 50 98 C 52 105 56 111 60 113 C 64 111 68 105 70 98 C 73 83 70 71 60 59 Z"
        stroke="#2d6d57"
        strokeWidth="1.2"
        fill="none"
      />

      {/* 吊坠中心切面线 - 玫瑰金 (位置调整) */}
      <line x1="60" y1="59" x2="60" y2="113" stroke="#b8956a" strokeWidth="0.8" opacity="0.6" />

      {/* 吊坠侧面切面线 - 亮翡翠绿 (位置调整) */}
      <line x1="52" y1="78" x2="68" y2="78" stroke="#6fb59b" strokeWidth="0.6" opacity="0.5" />
      <line x1="51" y1="91" x2="69" y2="91" stroke="#6fb59b" strokeWidth="0.6" opacity="0.4" />

      {/* 吊坠高光效果 (位置调整) */}
      <ellipse cx="57" cy="78" rx="2.5" ry="4" fill="url(#highlightGradient)" />
      <circle cx="58" cy="68" r="1.2" fill="white" opacity="0.7" />

      {/* 吊坠底部光点 (位置调整) */}
      <circle cx="60" cy="108" r="0.8" fill="white" opacity="0.6" />
    </svg>
  );
}

export function AllProductsIcon({ className = 'w-16 h-16' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="productGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>

      {/* 产品卡片 1 */}
      <rect x="10" y="10" width="40" height="50" rx="4" fill="url(#productGradient)" opacity="0.9" />
      <rect x="10" y="10" width="40" height="50" rx="4" stroke="#a855f7" strokeWidth="1" />
      <circle cx="30" cy="28" r="8" fill="#a855f7" opacity="0.6" />

      {/* 产品卡片 2 */}
      <rect x="60" y="15" width="40" height="50" rx="4" fill="url(#productGradient)" opacity="0.8" />
      <rect x="60" y="15" width="40" height="50" rx="4" stroke="#a855f7" strokeWidth="1" />
      <circle cx="80" cy="33" r="8" fill="#a855f7" opacity="0.5" />

      {/* 产品卡片 3 */}
      <rect x="35" y="70" width="40" height="50" rx="4" fill="url(#productGradient)" opacity="0.85" />
      <rect x="35" y="70" width="40" height="50" rx="4" stroke="#a855f7" strokeWidth="1" />
      <circle cx="55" cy="88" r="8" fill="#a855f7" opacity="0.55" />

      {/* 装饰标记 */}
      <circle cx="45" cy="112" r="1" fill="#a855f7" opacity="0.4" />
      <circle cx="60" cy="115" r="1" fill="#a855f7" opacity="0.4" />
      <circle cx="75" cy="112" r="1" fill="#a855f7" opacity="0.4" />
    </svg>
  );
}
