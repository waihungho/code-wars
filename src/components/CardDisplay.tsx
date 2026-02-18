"use client";

import Image from "next/image";
import { DIMENSIONS, ABILITIES } from "@/lib/constants";
import type { Dimension, Language } from "@/lib/types";

const LANGUAGE_THEMES: Record<string, { border: string; glow: string; bg: string; accent: string; title: string }> = {
  Assembly:   { border: "border-amber-700",   glow: "shadow-amber-600/40",   bg: "from-amber-950/90 to-amber-900/60",   accent: "text-amber-400",   title: "The Ironclad Vanguard" },
  C:          { border: "border-blue-600",     glow: "shadow-blue-500/40",    bg: "from-slate-950/90 to-blue-950/60",    accent: "text-blue-400",    title: "The Ancient Grandmaster" },
  Rust:       { border: "border-orange-600",   glow: "shadow-orange-500/40",  bg: "from-orange-950/90 to-stone-950/60",  accent: "text-orange-400",  title: "The Ironclad Warmage" },
  Java:       { border: "border-purple-600",   glow: "shadow-purple-500/40",  bg: "from-purple-950/90 to-violet-950/60", accent: "text-purple-400",  title: "The Omni-Archmage" },
  Go:         { border: "border-cyan-500",     glow: "shadow-cyan-400/40",    bg: "from-cyan-950/90 to-slate-950/60",    accent: "text-cyan-400",    title: "The Concurrency Master" },
  JavaScript: { border: "border-yellow-500",   glow: "shadow-yellow-400/40",  bg: "from-yellow-950/90 to-amber-950/60",  accent: "text-yellow-400",  title: "The Async Ninja" },
  Python:     { border: "border-lime-500",     glow: "shadow-lime-400/40",    bg: "from-lime-950/90 to-green-950/60",    accent: "text-lime-400",    title: "The Serpent Oracle" },
  Solidity:   { border: "border-fuchsia-600",  glow: "shadow-fuchsia-500/40", bg: "from-fuchsia-950/90 to-purple-950/60",accent: "text-fuchsia-400", title: "The Smart Inquisitor" },
};

const RARITY_BADGE: Record<string, { label: string; color: string }> = {
  Common:    { label: "C",   color: "bg-gray-600 text-gray-200" },
  Uncommon:  { label: "UC",  color: "bg-green-700 text-green-200" },
  Rare:      { label: "R",   color: "bg-blue-700 text-blue-200" },
  Legendary: { label: "SR",  color: "bg-yellow-600 text-yellow-100" },
  Mythic:    { label: "SSR", color: "bg-purple-600 text-purple-100 animate-pulse" },
};

const DIMENSION_LABELS: Record<Dimension, { label: string; short: string }> = {
  speed:       { label: "SPD", short: "SPD" },
  security:    { label: "SEC", short: "SEC" },
  ecosystem:   { label: "ECO", short: "ECO" },
  scalability: { label: "SCL", short: "SCL" },
  devExp:      { label: "DEV", short: "DEV" },
};

function getRarityClasses(rarity: string, theme: typeof LANGUAGE_THEMES.C) {
  switch (rarity) {
    case "Common":
      return {
        wrapper: `border border-gray-700 bg-gradient-to-b ${theme.bg} shadow-md shadow-black/40`,
        hasGlow: false,
        hasHolo: false,
      };
    case "Uncommon":
      return {
        wrapper: `border-2 border-green-500/60 bg-gradient-to-b ${theme.bg} shadow-lg shadow-green-900/20`,
        hasGlow: false,
        hasHolo: false,
      };
    case "Rare":
      return {
        wrapper: `border-2 border-blue-400/70 bg-gradient-to-b ${theme.bg} rarity-rare`,
        hasGlow: false,
        hasHolo: false,
      };
    case "Legendary":
      return {
        wrapper: `border-[3px] rarity-legendary`,
        hasGlow: true,
        hasHolo: false,
      };
    case "Mythic":
      return {
        wrapper: `border-[3px] rarity-mythic`,
        hasGlow: true,
        hasHolo: true,
      };
    default:
      return {
        wrapper: `border border-gray-700 bg-gradient-to-b ${theme.bg}`,
        hasGlow: false,
        hasHolo: false,
      };
  }
}

interface CardDisplayProps {
  language: string;
  rarity: string;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  dev_exp: number;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
  showAbility?: boolean;
}

export default function CardDisplay({
  language,
  rarity,
  speed,
  security,
  ecosystem,
  scalability,
  dev_exp,
  compact = false,
  onClick,
  selected = false,
  showAbility = false,
}: CardDisplayProps) {
  const stats = { speed, security, ecosystem, scalability, devExp: dev_exp };
  const totalPower = speed + security + ecosystem + scalability + dev_exp;
  const theme = LANGUAGE_THEMES[language] ?? LANGUAGE_THEMES.C;
  const badge = RARITY_BADGE[rarity] ?? RARITY_BADGE.Common;
  const rarityStyle = getRarityClasses(rarity, theme);
  const ability = ABILITIES[language as Language];

  return (
    <div className="relative">
      {/* Outer glow element for Legendary/Mythic */}
      {rarityStyle.hasGlow && (
        <div
          className={
            rarity === "Mythic"
              ? "rarity-mythic-glow"
              : "rarity-legendary-glow"
          }
        />
      )}

      <div
        onClick={onClick}
        className={`
          relative rounded-xl overflow-hidden transition-all duration-300
          ${rarityStyle.wrapper}
          ${onClick ? "cursor-pointer hover:scale-[1.03] hover:shadow-xl" : ""}
          ${selected ? "ring-2 ring-white/80 scale-[1.02]" : ""}
        `}
      >
        {/* Holographic overlay for Mythic */}
        {rarityStyle.hasHolo && <div className="holo-overlay" />}

        {/* Card art */}
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image
            src={`/cards/${language}.png`}
            alt={language}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Rarity badge top-right */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${badge.color}`}>
            {badge.label}
          </div>

          {/* Power rating bottom-left */}
          <div className="absolute bottom-2 left-3">
            <p className={`text-xs font-mono ${theme.accent} opacity-80`}>{theme.title}</p>
            <h3 className="text-lg font-bold text-white leading-tight">{language}</h3>
          </div>

          {/* Total power bottom-right */}
          <div className="absolute bottom-2 right-3 text-right">
            <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">PWR</p>
            <p className={`text-lg font-bold font-mono ${theme.accent}`}>{totalPower}</p>
          </div>
        </div>

        {/* Ability name bar */}
        {!compact && ability && (
          <div className="px-3 py-1.5 border-b border-white/5">
            <p className={`text-[10px] font-mono ${theme.accent} tracking-wider truncate`}>
              {ability.name}
            </p>
            {showAbility && (
              <p className="text-[9px] font-mono text-gray-500 italic truncate mt-0.5">
                {ability.flavorText}
              </p>
            )}
          </div>
        )}

        {/* Stats bar */}
        {!compact && (
          <div className="px-3 py-2.5 space-y-1.5">
            {DIMENSIONS.map((dim) => {
              const val = stats[dim];
              const maxDisplay = Math.max(totalPower / 5 * 2, 30);
              const pct = Math.min((val / maxDisplay) * 100, 100);
              return (
                <div key={dim} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-500 w-7 shrink-0">
                    {DIMENSION_LABELS[dim].short}
                  </span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        dim === "speed" ? "from-red-500 to-orange-400" :
                        dim === "security" ? "from-blue-500 to-cyan-400" :
                        dim === "ecosystem" ? "from-green-500 to-emerald-400" :
                        dim === "scalability" ? "from-violet-500 to-purple-400" :
                        "from-yellow-500 to-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-gray-300 w-8 text-right shrink-0">
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
