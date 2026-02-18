"use client";

import type { Language } from "@/lib/types";

interface AbilityIconProps {
  language: Language;
  size?: number;
  className?: string;
}

export default function AbilityIcon({ language, size = 32, className = "" }: AbilityIconProps) {
  const s = size;
  const stroke = 1.5;

  const icons: Record<Language, React.ReactElement> = {
    // Assembly: register array with voltage arc
    Assembly: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <rect x="8" y="4" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} />
        <rect x="8" y="11" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <line x1="8" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth={stroke} strokeDasharray="2 1" opacity={0.3} />
        <rect x="8" y="18" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <line x1="8" y1="21" x2="14" y2="21" stroke="currentColor" strokeWidth={stroke} strokeDasharray="2 1" opacity={0.3} />
        <rect x="8" y="25" width="6" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} />
        <path d="M20 6 L24 14 L18 20 L26 28" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 28 L22 26 L25 24" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <line x1="4" y1="7" x2="8" y2="7" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="4" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth={1} opacity={0.3} />
      </svg>
    ),

    // C: hexagonal memory grid with piercing arrow
    C: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <polygon points="16,4 22,8 22,14 16,18 10,14 10,8" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <polygon points="16,14 22,18 22,24 16,28 10,24 10,18" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <polygon points="22,8 28,12 28,18 22,22 16,18 16,12" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" opacity={0.8} />
        <path d="M4 4 L14 14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <path d="M4 4 L8 4 M4 4 L4 8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
        <text x="12" y="30" fontSize="5" fontFamily="monospace" fill="currentColor" opacity={0.4}>0xFF</text>
      </svg>
    ),

    // Rust: gear-tooth shield with & cutout
    Rust: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M16 3 L26 9 L26 20 L16 29 L6 20 L6 9 Z" stroke="currentColor" strokeWidth={stroke} />
        <circle cx="16" cy="3" r="1.5" fill="currentColor" opacity={0.6} />
        <circle cx="26" cy="9" r="1.5" fill="currentColor" opacity={0.6} />
        <circle cx="26" cy="20" r="1.5" fill="currentColor" opacity={0.6} />
        <circle cx="6" cy="9" r="1.5" fill="currentColor" opacity={0.6} />
        <circle cx="6" cy="20" r="1.5" fill="currentColor" opacity={0.6} />
        <circle cx="16" cy="29" r="1.5" fill="currentColor" opacity={0.6} />
        <text x="11" y="20" fontSize="14" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.7}>&amp;</text>
        <rect x="13" y="25" width="6" height="4" rx="1" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <circle cx="16" cy="27" r="0.8" fill="currentColor" opacity={0.5} />
      </svg>
    ),

    // Java: atom orbits around diamond
    Java: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth={stroke} opacity={0.3} transform="rotate(0 16 16)" />
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth={stroke} opacity={0.3} transform="rotate(60 16 16)" />
        <ellipse cx="16" cy="16" rx="12" ry="5" stroke="currentColor" strokeWidth={stroke} opacity={0.3} transform="rotate(-60 16 16)" />
        <polygon points="16,10 20,16 16,22 12,16" fill="currentColor" opacity={0.6} />
        <circle cx="26" cy="12" r="1.5" fill="currentColor" opacity={0.5} />
        <circle cx="8" cy="20" r="1" fill="currentColor" opacity={0.4} />
        <circle cx="22" cy="22" r="1.2" fill="currentColor" opacity={0.3} />
      </svg>
    ),

    // Go: parallel forking channels
    Go: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <circle cx="4" cy="16" r="2" fill="currentColor" opacity={0.6} />
        <path d="M6 16 L10 16" stroke="currentColor" strokeWidth={stroke} />
        <path d="M10 16 L14 6" stroke="currentColor" strokeWidth={stroke} opacity={0.7} />
        <path d="M10 16 L14 11" stroke="currentColor" strokeWidth={stroke} opacity={0.8} />
        <path d="M10 16 L14 16" stroke="currentColor" strokeWidth={stroke} />
        <path d="M10 16 L14 21" stroke="currentColor" strokeWidth={stroke} opacity={0.8} />
        <path d="M10 16 L14 26" stroke="currentColor" strokeWidth={stroke} opacity={0.7} />
        {[6, 11, 16, 21, 26].map((y, i) => (
          <g key={i}>
            <line x1="14" y1={y} x2="26" y2={y} stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
            <polygon points={`26,${y-2} 30,${y} 26,${y+2}`} fill="currentColor" opacity={0.6} />
          </g>
        ))}
        <path d="M18 8 Q20 11 18 14" stroke="currentColor" strokeWidth={0.8} opacity={0.2} strokeDasharray="1 1" />
        <path d="M20 18 Q22 21 20 24" stroke="currentColor" strokeWidth={0.8} opacity={0.2} strokeDasharray="1 1" />
      </svg>
    ),

    // JavaScript: event loop spiral with lightning
    JavaScript: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path
          d="M16 6 A10 10 0 1 1 16 26 A7 7 0 1 0 16 10 A4 4 0 1 1 16 22"
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.4}
          fill="none"
        />
        <path d="M16 13 L14 17 L18 17 L15 22" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 22 L17 20" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const r = 14;
          const x = 16 + r * Math.cos((angle * Math.PI) / 180);
          const y = 16 + r * Math.sin((angle * Math.PI) / 180);
          return <line key={i} x1={x} y1={y} x2={x + (x > 16 ? 1.5 : -1.5)} y2={y + (y > 16 ? 1.5 : -1.5)} stroke="currentColor" strokeWidth={1.5} opacity={0.3} />;
        })}
      </svg>
    ),

    // Python: hexagonal portal with module blocks
    Python: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <polygon points="16,2 28,9 28,23 16,30 4,23 4,9" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
        <polygon points="16,5 25,10.5 25,21.5 16,27 7,21.5 7,10.5" stroke="currentColor" strokeWidth={0.8} opacity={0.15} strokeDasharray="2 2" />
        <rect x="12" y="18" width="8" height="5" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.7} />
        <rect x="13" y="13" width="6" height="4" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <rect x="14" y="9" width="4" height="3" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
        <circle cx="9" cy="26" r="0.8" fill="currentColor" opacity={0.2} />
        <circle cx="23" cy="26" r="0.8" fill="currentColor" opacity={0.2} />
        <circle cx="6" cy="16" r="0.8" fill="currentColor" opacity={0.2} />
        <circle cx="26" cy="16" r="0.8" fill="currentColor" opacity={0.2} />
      </svg>
    ),

    // C++: nested template angle brackets
    CPlusPlus: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M6 16 L16 6 L26 16 L16 26 Z" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <path d="M10 16 L16 10 L22 16 L16 22 Z" stroke="currentColor" strokeWidth={stroke} opacity={0.6} />
        <text x="12" y="19" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.7}>++</text>
      </svg>
    ),

    // C#: sharp symbol with grid
    CSharp: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <line x1="10" y1="6" x2="14" y2="26" stroke="currentColor" strokeWidth={2} />
        <line x1="18" y1="6" x2="22" y2="26" stroke="currentColor" strokeWidth={2} />
        <line x1="6" y1="12" x2="26" y2="12" stroke="currentColor" strokeWidth={2} />
        <line x1="6" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth={2} />
      </svg>
    ),

    // Clojure: nested parentheses
    Clojure: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M12 6 A10 10 0 0 0 12 26" stroke="currentColor" strokeWidth={stroke} fill="none" />
        <path d="M20 6 A10 10 0 0 1 20 26" stroke="currentColor" strokeWidth={stroke} fill="none" />
        <circle cx="16" cy="16" r="3" fill="currentColor" opacity={0.5} />
      </svg>
    ),

    // COBOL: mainframe terminal
    COBOL: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <rect x="6" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth={stroke} />
        <line x1="9" y1="9" x2="23" y2="9" stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1="9" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="9" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <rect x="10" y="24" width="12" height="4" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <line x1="16" y1="20" x2="16" y2="24" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
      </svg>
    ),

    // Dart: dart/arrow
    Dart: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M6 26 L26 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        <path d="M26 6 L20 6 M26 6 L26 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity={0.4} />
      </svg>
    ),

    // Delphi: tower/pillar
    Delphi: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M10 28 L10 8 L16 4 L22 8 L22 28" stroke="currentColor" strokeWidth={stroke} />
        <line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <line x1="10" y1="20" x2="22" y2="20" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity={0.5} />
      </svg>
    ),

    // Elixir: potion drop
    Elixir: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M16 4 Q22 14 22 20 A6 6 0 0 1 10 20 Q10 14 16 4" stroke="currentColor" strokeWidth={stroke} />
        <circle cx="16" cy="20" r="2" fill="currentColor" opacity={0.4} />
        <path d="M13 16 Q16 18 19 16" stroke="currentColor" strokeWidth={1} opacity={0.3} />
      </svg>
    ),

    // Erlang: telecom tower
    Erlang: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth={2} />
        <line x1="8" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth={stroke} />
        <line x1="10" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth={stroke} opacity={0.6} />
        <line x1="12" y1="22" x2="20" y2="22" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <circle cx="16" cy="4" r="2" fill="currentColor" opacity={0.6} />
      </svg>
    ),

    // Haskell: lambda with bind arrow
    Haskell: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <text x="6" y="24" fontSize="22" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.7}>λ</text>
        <path d="M22 10 L28 16 L22 22" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <path d="M20 10 L26 16 L20 22" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
      </svg>
    ),

    // Kotlin: K with diamond
    Kotlin: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <polygon points="6,4 26,4 6,26" fill="currentColor" opacity={0.3} />
        <polygon points="6,26 26,26 26,4" fill="currentColor" opacity={0.15} />
        <line x1="6" y1="4" x2="6" y2="26" stroke="currentColor" strokeWidth={2} />
      </svg>
    ),

    // Lua: crescent moon
    Lua: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M18 6 A10 10 0 1 0 18 26 A7 7 0 1 1 18 6" stroke="currentColor" strokeWidth={stroke} fill="none" />
        <circle cx="22" cy="8" r="1.5" fill="currentColor" opacity={0.5} />
      </svg>
    ),

    // MATLAB: matrix grid
    MATLAB: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <rect x="6" y="6" width="20" height="20" rx="2" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <line x1="6" y1="13" x2="26" y2="13" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="6" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="13" y1="6" x2="13" y2="26" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="20" y1="6" x2="20" y2="26" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <path d="M8 24 L12 18 L16 22 L22 10 L26 14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),

    // Pascal: structured block
    Pascal: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <rect x="8" y="4" width="16" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} />
        <rect x="10" y="13" width="12" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} opacity={0.6} />
        <rect x="8" y="22" width="16" height="6" rx="1" stroke="currentColor" strokeWidth={stroke} />
        <line x1="16" y1="10" x2="16" y2="13" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <line x1="16" y1="19" x2="16" y2="22" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
      </svg>
    ),

    // Perl: camel sigil
    Perl: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <text x="6" y="22" fontSize="18" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.6}>$_</text>
        <path d="M22 8 L26 4 L28 8" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <path d="M20 12 Q24 8 28 12" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
      </svg>
    ),

    // PHP: elephant/braces
    PHP: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <text x="4" y="22" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.5}>&lt;?</text>
        <text x="18" y="22" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="currentColor" opacity={0.5}>?&gt;</text>
        <circle cx="16" cy="14" r="6" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <circle cx="16" cy="14" r="2" fill="currentColor" opacity={0.5} />
      </svg>
    ),

    // R: stats chart
    R: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <line x1="6" y1="26" x2="6" y2="4" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <line x1="6" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth={stroke} opacity={0.5} />
        <rect x="9" y="18" width="4" height="8" fill="currentColor" opacity={0.3} />
        <rect x="15" y="12" width="4" height="14" fill="currentColor" opacity={0.4} />
        <rect x="21" y="8" width="4" height="18" fill="currentColor" opacity={0.5} />
        <path d="M9 20 L15 14 L21 10 L27 6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    ),

    // Ruby: gem shape
    Ruby: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <polygon points="16,4 26,12 22,28 10,28 6,12" stroke="currentColor" strokeWidth={stroke} />
        <line x1="6" y1="12" x2="26" y2="12" stroke="currentColor" strokeWidth={stroke} opacity={0.4} />
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth={1} opacity={0.3} />
        <line x1="16" y1="4" x2="10" y2="28" stroke="currentColor" strokeWidth={1} opacity={0.2} />
        <line x1="16" y1="4" x2="22" y2="28" stroke="currentColor" strokeWidth={1} opacity={0.2} />
      </svg>
    ),

    // Scala: staircase
    Scala: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M6 26 L6 20 L12 20 L12 14 L18 14 L18 8 L24 8 L24 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 26 L8 22 L14 22 L14 16 L20 16 L20 10 L26 10 L26 4" stroke="currentColor" strokeWidth={1} opacity={0.3} />
      </svg>
    ),

    // SQL: database cylinders
    SQL: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <ellipse cx="16" cy="8" rx="10" ry="4" stroke="currentColor" strokeWidth={stroke} />
        <line x1="6" y1="8" x2="6" y2="24" stroke="currentColor" strokeWidth={stroke} />
        <line x1="26" y1="8" x2="26" y2="24" stroke="currentColor" strokeWidth={stroke} />
        <ellipse cx="16" cy="24" rx="10" ry="4" stroke="currentColor" strokeWidth={stroke} />
        <ellipse cx="16" cy="16" rx="10" ry="4" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
      </svg>
    ),

    // Swift: swift bird
    Swift: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M26 6 Q16 14 8 18 Q14 16 20 18 Q12 22 6 24 Q18 22 24 16 Q28 12 26 6" stroke="currentColor" strokeWidth={stroke} fill="currentColor" opacity={0.4} />
      </svg>
    ),

    // Solidity: diamond from chain links
    Solidity: (
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none" className={className}>
        <path d="M16 4 L24 16 L16 28 L8 16 Z" stroke="currentColor" strokeWidth={stroke} opacity={0.6} />
        <path d="M16 8 L21 16 L16 24 L11 16 Z" stroke="currentColor" strokeWidth={stroke} opacity={0.3} />
        <ellipse cx="16" cy="8" rx="3" ry="1.5" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <ellipse cx="22" cy="16" rx="1.5" ry="3" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <ellipse cx="16" cy="24" rx="3" ry="1.5" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <ellipse cx="10" cy="16" rx="1.5" ry="3" stroke="currentColor" strokeWidth={1} opacity={0.5} />
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity={0.5} />
        <line x1="4" y1="28" x2="8" y2="28" stroke="currentColor" strokeWidth={0.8} opacity={0.15} />
        <line x1="6" y1="26" x2="6" y2="30" stroke="currentColor" strokeWidth={0.8} opacity={0.15} />
        <line x1="24" y1="28" x2="28" y2="28" stroke="currentColor" strokeWidth={0.8} opacity={0.15} />
        <line x1="26" y1="26" x2="26" y2="30" stroke="currentColor" strokeWidth={0.8} opacity={0.15} />
      </svg>
    ),
  };

  return icons[language] ?? null;
}
