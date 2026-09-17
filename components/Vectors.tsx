"use client";

/** Decorative SVG shapes for the neo-brutalist UI */

export function ZigzagLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 12" className={`w-full ${className}`} fill="none">
      <path
        d="M0 6 L10 1 L20 11 L30 1 L40 11 L50 1 L60 11 L70 1 L80 11 L90 1 L100 11 L110 1 L120 11 L130 1 L140 11 L150 1 L160 11 L170 1 L180 11 L190 1 L200 11 L210 1 L220 11 L230 1 L240 11 L250 1 L260 11 L270 1 L280 11 L290 1 L300 11 L310 1 L320 11 L330 1 L340 11 L350 1 L360 11 L370 1 L380 11 L390 1 L400 6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarBurst({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="currentColor">
      <path d="M20 0 L23 15 L40 12 L26 20 L40 28 L23 25 L20 40 L17 25 L0 28 L14 20 L0 12 L17 15 Z" />
    </svg>
  );
}

export function CircleDots({ className = "" }: { className?: string }) {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" className={className} fill="currentColor">
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4].map((col) => (
          <circle key={`${row}-${col}`} cx={6 + col * 12} cy={6 + row * 12} r="2.5" opacity={0.3 + Math.random() * 0.4} />
        ))
      )}
    </svg>
  );
}

export function WavyLine({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 20" className={`w-full ${className}`} fill="none">
      <path
        d="M0 10 Q25 0 50 10 Q75 20 100 10 Q125 0 150 10 Q175 20 200 10 Q225 0 250 10 Q275 20 300 10 Q325 0 350 10 Q375 20 400 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CrossPattern({ className = "" }: { className?: string }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="6" x2="12" y2="18" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="36" y1="6" x2="36" y2="18" />
      <line x1="30" y1="12" x2="42" y2="12" />
      <line x1="12" y1="30" x2="12" y2="42" />
      <line x1="6" y1="36" x2="18" y2="36" />
      <line x1="36" y1="30" x2="36" y2="42" />
      <line x1="30" y1="36" x2="42" y2="36" />
    </svg>
  );
}

export function TripIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" className={className} fill="none">
      {/* Mountains */}
      <path d="M0 130 L40 60 L60 90 L80 40 L120 100 L140 70 L200 130 Z" fill="#1c1c3a" stroke="#2d2d5e" strokeWidth="2" />
      <path d="M80 40 L90 55 L70 55 Z" fill="#c6f135" opacity="0.3" />
      
      {/* Sun */}
      <circle cx="160" cy="35" r="20" fill="#ffe66d" opacity="0.8" />
      <circle cx="160" cy="35" r="14" fill="#ff8a5c" opacity="0.5" />
      
      {/* Road */}
      <path d="M85 130 L95 80 L105 80 L115 130" fill="#2d2d5e" stroke="#3d3d7e" strokeWidth="1.5" />
      <line x1="100" y1="85" x2="100" y2="95" stroke="#ffe66d" strokeWidth="2" strokeDasharray="3 4" />
      <line x1="100" y1="100" x2="100" y2="110" stroke="#ffe66d" strokeWidth="2" strokeDasharray="3 4" />
      <line x1="100" y1="115" x2="100" y2="125" stroke="#ffe66d" strokeWidth="2" strokeDasharray="3 4" />
      
      {/* Car */}
      <rect x="88" y="72" width="24" height="12" rx="4" fill="#ff6b9d" stroke="#1a1a2e" strokeWidth="2" />
      <rect x="90" y="67" width="10" height="8" rx="2" fill="#00e5ff" stroke="#1a1a2e" strokeWidth="1.5" />
      <circle cx="93" cy="85" r="3" fill="#1a1a2e" stroke="#c6f135" strokeWidth="1.5" />
      <circle cx="107" cy="85" r="3" fill="#1a1a2e" stroke="#c6f135" strokeWidth="1.5" />
      
      {/* Trees */}
      <rect x="30" y="100" width="4" height="15" fill="#6b6b8a" />
      <polygon points="22,100 32,70 42,100" fill="#69f0ae" opacity="0.5" stroke="#1a1a2e" strokeWidth="1.5" />
      
      <rect x="155" y="95" width="4" height="20" fill="#6b6b8a" />
      <polygon points="147,95 157,65 167,95" fill="#69f0ae" opacity="0.5" stroke="#1a1a2e" strokeWidth="1.5" />
      
      {/* Stars */}
      <circle cx="30" cy="25" r="1.5" fill="#ffe66d" />
      <circle cx="60" cy="15" r="1" fill="#c6f135" />
      <circle cx="130" cy="20" r="1.5" fill="#ff6b9d" />
      <circle cx="45" cy="40" r="1" fill="#00e5ff" />
      
      {/* Ground line */}
      <line x1="0" y1="130" x2="200" y2="130" stroke="#2d2d5e" strokeWidth="2.5" />
    </svg>
  );
}

export function WalletIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} fill="none">
      <rect x="8" y="20" width="56" height="44" rx="8" fill="#1c1c3a" stroke="#c6f135" strokeWidth="3" />
      <rect x="8" y="20" width="56" height="14" rx="4" fill="#c6f135" opacity="0.2" />
      <circle cx="52" cy="42" r="6" fill="#ff6b9d" stroke="#1a1a2e" strokeWidth="2" />
      <path d="M14 28 L22 28" stroke="#ffe66d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 32 L18 32" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="40" y="14" width="20" height="12" rx="4" fill="#ffe66d" stroke="#1a1a2e" strokeWidth="2" transform="rotate(-10 50 20)" />
    </svg>
  );
}

export function MoneyRain({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 100" className={className} fill="none">
      {/* Rupee symbols falling */}
      <text x="10" y="20" fill="#c6f135" opacity="0.3" fontSize="16" fontWeight="bold">₹</text>
      <text x="40" y="35" fill="#ff6b9d" opacity="0.25" fontSize="12" fontWeight="bold">₹</text>
      <text x="70" y="15" fill="#ffe66d" opacity="0.35" fontSize="20" fontWeight="bold">₹</text>
      <text x="95" y="40" fill="#00e5ff" opacity="0.2" fontSize="14" fontWeight="bold">₹</text>
      <text x="25" y="55" fill="#b388ff" opacity="0.3" fontSize="18" fontWeight="bold">₹</text>
      <text x="60" y="60" fill="#c6f135" opacity="0.2" fontSize="10" fontWeight="bold">₹</text>
      <text x="85" y="70" fill="#ff6b9d" opacity="0.25" fontSize="16" fontWeight="bold">₹</text>
      <text x="15" y="80" fill="#ffe66d" opacity="0.2" fontSize="12" fontWeight="bold">₹</text>
      <text x="50" y="85" fill="#00e5ff" opacity="0.3" fontSize="14" fontWeight="bold">₹</text>
      <text x="105" y="25" fill="#69f0ae" opacity="0.2" fontSize="10" fontWeight="bold">₹</text>
    </svg>
  );
}
