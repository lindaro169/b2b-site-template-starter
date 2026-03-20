// Placeholder material SVG icons with generic shapes
export const CrystalIcons = {
  // Template Material 01 - soft geometric crystal
  roseQuartz: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="roseQuartzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffc0cb" />
          <stop offset="100%" stopColor="#ff69b4" />
        </linearGradient>
        <filter id="crystalShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Main crystal body */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#roseQuartzGrad)" filter="url(#crystalShadow)" />
      {/* Highlight */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.3" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#roseQuartzGrad)" />
    </svg>
  ),

  // Template Material 02 - layered crystal cluster
  amethyst: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="amethystGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#da70d6" />
          <stop offset="100%" stopColor="#8b5fbf" />
        </linearGradient>
        <filter id="crystalShadow2">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Main crystal */}
      <polygon points="35,25 65,25 75,45 65,75 35,75 25,45" fill="url(#amethystGrad)" filter="url(#crystalShadow2)" />
      {/* Highlight */}
      <polygon points="42,35 58,35 62,50 58,65 42,65 38,50" fill="#fff" opacity="0.25" />
      {/* Side crystals */}
      <polygon points="15,50 25,40 25,70" fill="url(#amethystGrad)" opacity="0.8" />
      <polygon points="85,50 75,40 75,70" fill="url(#amethystGrad)" opacity="0.8" />
      {/* Point */}
      <polygon points="50,75 45,105 55,105" fill="url(#amethystGrad)" />
    </svg>
  ),

  // Template Material 03 - bright neutral crystal
  clearQuartz: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="clearQuartzGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f5f5" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
        <filter id="crystalShadow3">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      {/* Main crystal body */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#clearQuartzGrad)" stroke="#d0d0d0" strokeWidth="1.5" filter="url(#crystalShadow3)" />
      {/* Highlight */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.4" />
      {/* Inner lines for clarity effect */}
      <line x1="50" y1="20" x2="50" y2="80" stroke="#e8e8e8" strokeWidth="0.5" opacity="0.6" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#clearQuartzGrad)" stroke="#d0d0d0" strokeWidth="1.5" />
    </svg>
  ),

  // Template Material 04 - dark elongated crystal
  blackTourmaline: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="blackTourmalineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2a2a2a" />
          <stop offset="100%" stopColor="#000" />
        </linearGradient>
        <filter id="crystalShadow4">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.4" />
        </filter>
      </defs>
      {/* Main crystal - more elongated */}
      <polygon points="38,15 62,15 72,50 62,85 38,85 28,50" fill="url(#blackTourmalineGrad)" filter="url(#crystalShadow4)" />
      {/* Highlight */}
      <polygon points="45,25 55,25 58,50 55,75 45,75 42,50" fill="#444" opacity="0.3" />
      {/* Ridges */}
      <line x1="50" y1="15" x2="50" y2="85" stroke="#555" strokeWidth="0.8" opacity="0.4" />
      {/* Point */}
      <polygon points="50,85 45,110 55,110" fill="url(#blackTourmalineGrad)" />
    </svg>
  ),

  // Template Material 05 - pale reflective crystal
  moonstone: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="moonstoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f8ff" />
          <stop offset="50%" stopColor="#e6f2ff" />
          <stop offset="100%" stopColor="#d0e8ff" />
        </linearGradient>
        <filter id="crystalShadow5">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
        </filter>
      </defs>
      {/* Main crystal */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#moonstoneGrad)" stroke="#c0d8ff" strokeWidth="1" filter="url(#crystalShadow5)" />
      {/* Opalescent highlight */}
      <circle cx="50" cy="45" r="15" fill="#fff" opacity="0.2" />
      {/* Outer highlight */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.35" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#moonstoneGrad)" stroke="#c0d8ff" strokeWidth="1" />
    </svg>
  ),

  // Template Material 06 - dark iridescent crystal
  labradorite: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="labradoriteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#16213e" />
        </linearGradient>
        <filter id="crystalShadow6">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Main crystal */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#labradoriteGrad)" filter="url(#crystalShadow6)" />
      {/* Blue iridescence */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#4169e1" opacity="0.2" />
      {/* Additional iridescence */}
      <ellipse cx="50" cy="40" rx="12" ry="8" fill="#6495ed" opacity="0.15" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#labradoriteGrad)" />
    </svg>
  ),

  // Template Material 07 - bright teal crystal
  turquoise: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="turquoiseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#40e0d0" />
          <stop offset="100%" stopColor="#00ced1" />
        </linearGradient>
        <filter id="crystalShadow7">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Main crystal */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#turquoiseGrad)" filter="url(#crystalShadow7)" />
      {/* Highlight */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.3" />
      {/* Veins for natural look */}
      <line x1="40" y1="35" x2="45" y2="65" stroke="#00a8cc" strokeWidth="0.5" opacity="0.4" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#turquoiseGrad)" />
    </svg>
  ),

  // Template Material 08 - warm amber crystal
  citrine: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="citrineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ffa500" />
        </linearGradient>
        <filter id="crystalShadow8">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Main crystal body */}
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#citrineGrad)" filter="url(#crystalShadow8)" />
      {/* Highlight */}
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.35" />
      {/* Inner glow */}
      <ellipse cx="50" cy="50" rx="10" ry="15" fill="#ffed4e" opacity="0.15" />
      {/* Point */}
      <polygon points="50,80 45,105 55,105" fill="url(#citrineGrad)" />
    </svg>
  ),

  // Template Material 09 - green rod crystal
  greenTourmaline: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="greenTourmalineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#228b22" />
          <stop offset="100%" stopColor="#006400" />
        </linearGradient>
        <filter id="crystalShadow9">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Main crystal - needle-like */}
      <polygon points="40,10 60,10 68,50 60,90 40,90 32,50" fill="url(#greenTourmalineGrad)" filter="url(#crystalShadow9)" />
      {/* Highlight */}
      <polygon points="45,20 55,20 58,50 55,80 45,80 42,50" fill="#90ee90" opacity="0.25" />
      {/* Striations for natural look */}
      <line x1="50" y1="10" x2="50" y2="90" stroke="#1a5c1a" strokeWidth="0.8" opacity="0.4" />
      <line x1="45" y1="15" x2="45" y2="85" stroke="#1a5c1a" strokeWidth="0.5" opacity="0.3" />
      <line x1="55" y1="15" x2="55" y2="85" stroke="#1a5c1a" strokeWidth="0.5" opacity="0.3" />
      {/* Point */}
      <polygon points="50,90 45,110 55,110" fill="url(#greenTourmalineGrad)" />
    </svg>
  ),

  // Generic crystal fallback
  generic: (
    <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="genericGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0c0c0" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="url(#genericGrad)" />
      <polygon points="40,30 60,30 65,50 60,65 40,65 35,50" fill="#fff" opacity="0.2" />
      <polygon points="50,80 45,105 55,105" fill="url(#genericGrad)" />
    </svg>
  ),
};

export const getCrystalIcon = (crystalName) => {
  const iconMap = {
    'Template Material 01': CrystalIcons.roseQuartz,
    'Template Material 02': CrystalIcons.amethyst,
    'Template Material 03': CrystalIcons.clearQuartz,
    'Template Material 04': CrystalIcons.blackTourmaline,
    'Template Material 05': CrystalIcons.moonstone,
    'Template Material 06': CrystalIcons.labradorite,
    'Template Material 07': CrystalIcons.turquoise,
    'Template Material 08': CrystalIcons.citrine,
    'Template Material 09': CrystalIcons.greenTourmaline,
  };

  return iconMap[crystalName] || CrystalIcons.generic;
};
