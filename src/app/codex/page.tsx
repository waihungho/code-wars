"use client";

import { useState } from "react";
import Image from "next/image";
import { LANGUAGES, DIMENSIONS, BASE_STATS, ABILITIES } from "@/lib/constants";
import AbilityIcon from "@/components/AbilityIcon";
import type { Language, Dimension } from "@/lib/types";

const LANGUAGE_THEMES: Record<string, { accent: string; bg: string; border: string; title: string }> = {
  Assembly:   { accent: "text-amber-400",   bg: "from-amber-950/80 to-amber-900/40",     border: "border-amber-700/50",   title: "The Ironclad Vanguard" },
  C:          { accent: "text-blue-400",    bg: "from-slate-950/80 to-blue-950/40",      border: "border-blue-700/50",    title: "The Ancient Grandmaster" },
  CPlusPlus:  { accent: "text-blue-300",    bg: "from-blue-950/80 to-indigo-950/40",     border: "border-blue-600/50",    title: "The Template Titan" },
  CSharp:     { accent: "text-violet-400",  bg: "from-violet-950/80 to-purple-950/40",   border: "border-violet-700/50",  title: "The Unified Champion" },
  Clojure:    { accent: "text-green-400",   bg: "from-green-950/80 to-teal-950/40",      border: "border-green-700/50",   title: "The Immutable Sage" },
  COBOL:      { accent: "text-stone-400",   bg: "from-stone-950/80 to-gray-900/40",      border: "border-stone-700/50",   title: "The Legacy Guardian" },
  Dart:       { accent: "text-sky-400",     bg: "from-sky-950/80 to-cyan-950/40",        border: "border-sky-700/50",     title: "The Flutter Knight" },
  Delphi:     { accent: "text-red-400",     bg: "from-red-950/80 to-rose-950/40",        border: "border-red-700/50",     title: "The RAD Pioneer" },
  Elixir:     { accent: "text-purple-300",  bg: "from-purple-950/80 to-indigo-950/40",   border: "border-purple-600/50",  title: "The Phoenix Alchemist" },
  Erlang:     { accent: "text-rose-400",    bg: "from-rose-950/80 to-red-950/40",        border: "border-rose-700/50",    title: "The Telecom Sentinel" },
  Go:         { accent: "text-cyan-400",    bg: "from-cyan-950/80 to-slate-950/40",      border: "border-cyan-700/50",    title: "The Concurrency Master" },
  Haskell:    { accent: "text-indigo-400",  bg: "from-indigo-950/80 to-violet-950/40",   border: "border-indigo-700/50",  title: "The Pure Logician" },
  Java:       { accent: "text-purple-400",  bg: "from-purple-950/80 to-violet-950/40",   border: "border-purple-700/50",  title: "The Omni-Archmage" },
  JavaScript: { accent: "text-yellow-400",  bg: "from-yellow-950/80 to-amber-950/40",    border: "border-yellow-700/50",  title: "The Async Ninja" },
  Kotlin:     { accent: "text-orange-300",  bg: "from-orange-950/80 to-violet-950/40",   border: "border-orange-600/50",  title: "The Null Slayer" },
  Lua:        { accent: "text-blue-400",    bg: "from-blue-950/80 to-slate-950/40",      border: "border-blue-700/50",    title: "The Embedded Phantom" },
  MATLAB:     { accent: "text-orange-400",  bg: "from-orange-950/80 to-amber-950/40",    border: "border-orange-700/50",  title: "The Matrix Architect" },
  Pascal:     { accent: "text-teal-400",    bg: "from-teal-950/80 to-cyan-950/40",       border: "border-teal-700/50",    title: "The Structured Elder" },
  Perl:       { accent: "text-slate-300",   bg: "from-slate-900/80 to-gray-950/40",      border: "border-slate-600/50",   title: "The Regex Warlock" },
  PHP:        { accent: "text-indigo-300",  bg: "from-indigo-950/80 to-blue-950/40",     border: "border-indigo-600/50",  title: "The Web Sovereign" },
  Python:     { accent: "text-lime-400",    bg: "from-lime-950/80 to-green-950/40",      border: "border-lime-700/50",    title: "The Serpent Oracle" },
  R:          { accent: "text-sky-300",     bg: "from-sky-950/80 to-blue-950/40",        border: "border-sky-600/50",     title: "The Data Diviner" },
  Ruby:       { accent: "text-red-400",     bg: "from-red-950/80 to-pink-950/40",        border: "border-red-700/50",     title: "The Gem Enchantress" },
  Rust:       { accent: "text-orange-400",  bg: "from-orange-950/80 to-stone-950/40",    border: "border-orange-700/50",  title: "The Ironclad Warmage" },
  Scala:      { accent: "text-red-300",     bg: "from-red-950/80 to-stone-950/40",       border: "border-red-600/50",     title: "The Fusion Sorcerer" },
  Solidity:   { accent: "text-fuchsia-400", bg: "from-fuchsia-950/80 to-purple-950/40",  border: "border-fuchsia-700/50", title: "The Smart Inquisitor" },
  SQL:        { accent: "text-emerald-400", bg: "from-emerald-950/80 to-green-950/40",   border: "border-emerald-700/50", title: "The Query Commander" },
  Swift:      { accent: "text-orange-400",  bg: "from-orange-950/80 to-red-950/40",      border: "border-orange-700/50",  title: "The Protocol Witness" },
};

const DIM_LABELS: Record<Dimension, string> = {
  speed: "SPD",
  security: "SEC",
  ecosystem: "ECO",
  scalability: "SCL",
  devExp: "DEV",
};

const DIM_COLORS: Record<Dimension, string> = {
  speed: "from-red-500 to-orange-400",
  security: "from-blue-500 to-cyan-400",
  ecosystem: "from-green-500 to-emerald-400",
  scalability: "from-violet-500 to-purple-400",
  devExp: "from-yellow-500 to-amber-400",
};

export default function CodexPage() {
  const [expanded, setExpanded] = useState<Language | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-cyan-400/60 tracking-[0.2em] uppercase mb-1">Ability Encyclopedia</p>
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-cyan-400">CODEX</span>
        </h1>
        <p className="text-xs font-mono text-gray-500 mt-2">
          // Each language wields a unique ability in battle — passive bonuses always active, triggered effects at 30% chance
        </p>
      </div>

      {/* Language grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LANGUAGES.map((lang) => {
          const theme = LANGUAGE_THEMES[lang];
          const ability = ABILITIES[lang];
          const base = BASE_STATS[lang];
          const isExpanded = expanded === lang;

          return (
            <div
              key={lang}
              onClick={() => setExpanded(isExpanded ? null : lang)}
              className={`
                rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer
                bg-gradient-to-br ${theme.bg} ${theme.border}
                hover:border-opacity-80 hover:shadow-lg
                ${isExpanded ? "ring-1 ring-white/10" : ""}
              `}
            >
              {/* Top section: art + info */}
              <div className="flex gap-4 p-4">
                {/* Card art thumbnail */}
                <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={`/cards/${lang}.png`}
                    alt={lang}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-mono ${theme.accent} opacity-60 tracking-wider`}>
                    {theme.title}
                  </p>
                  <h3 className="text-lg font-bold font-mono text-white">{lang}</h3>

                  {/* Ability name with icon */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={theme.accent}>
                      <AbilityIcon language={lang} size={20} />
                    </span>
                    <span className={`text-sm font-mono font-bold ${theme.accent}`}>
                      {ability.name}
                    </span>
                  </div>

                  {/* Flavor text */}
                  <p className="text-[10px] font-mono text-gray-500 italic mt-1">
                    &quot;{ability.flavorText}&quot;
                  </p>
                </div>
              </div>

              {/* Ability details */}
              <div className="px-4 pb-3 space-y-2">
                {/* Passive */}
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-mono text-green-500/80 bg-green-500/10 px-1.5 py-0.5 rounded tracking-wider shrink-0">
                    PASSIVE
                  </span>
                  <span className="text-xs font-mono text-gray-300">
                    +{ability.passiveBonus * 100}% {DIM_LABELS[ability.passiveDimension]}
                  </span>
                </div>

                {/* Triggered */}
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded tracking-wider shrink-0">
                    30% TRIGGER
                  </span>
                  <span className="text-xs font-mono text-gray-300">
                    {ability.triggeredDescription}
                  </span>
                </div>
              </div>

              {/* Expanded: base stats */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-slide-up">
                  <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-2">Base Stats</p>
                  <div className="space-y-1.5">
                    {DIMENSIONS.map((dim) => {
                      const val = base[dim];
                      const pct = (val / 10) * 100;
                      return (
                        <div key={dim} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-500 w-7 shrink-0">
                            {DIM_LABELS[dim]}
                          </span>
                          <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${DIM_COLORS[dim]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-gray-400 w-5 text-right shrink-0">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/30 border border-gray-800/50 rounded-lg p-4">
        <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-2">How Abilities Work</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-gray-500">
          <div>
            <span className="text-green-500/80">PASSIVE</span> — Always active during battle. Boosts the specified dimension stat.
          </div>
          <div>
            <span className="text-amber-500/80">TRIGGERED</span> — 30% chance to activate each battle. Creates dramatic combat shifts.
          </div>
        </div>
      </div>
    </div>
  );
}
