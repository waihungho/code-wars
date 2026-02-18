"use client";

import { useState } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import AbilityIcon from "@/components/AbilityIcon";
import { DIMENSIONS, LANGUAGES, BASE_STATS, ABILITIES } from "@/lib/constants";
import {
  getBurnMaterials,
  getUpgradeCost,
  applyUpgrade,
} from "@/lib/upgrade";
import {
  deleteCard,
  updateCardStats,
  updatePlayerMaterials,
  unequipAllFromCard,
} from "@/lib/db";
import type { Card, Dimension, Language } from "@/lib/types";

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

type VaultMode = "view" | "upgrade" | "burn" | "codex";

export default function CollectionPage() {
  const { connected } = useWallet();
  const { player, cards, refreshCards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [mode, setMode] = useState<VaultMode>("view");
  const [expandedLang, setExpandedLang] = useState<Language | null>(null);
  const [confirmBurn, setConfirmBurn] = useState(false);

  if (!connected || !player) {
    return (
      <div className="text-center mt-20">
        <p className="text-xs font-mono text-gray-600 tracking-wider">// WALLET NOT CONNECTED</p>
        <p className="text-gray-500 mt-2 text-sm">Connect your wallet to access the vault</p>
      </div>
    );
  }

  const handleBurn = async (card: any) => {
    const materials = getBurnMaterials(card.rarity);
    await unequipAllFromCard(card.id);
    await deleteCard(card.id);
    await updatePlayerMaterials(
      player.id,
      (player.materials ?? 0) + materials
    );
    setSelectedCard(null);
    await refreshCards();
    await refreshPlayer();
  };

  const handleUpgrade = async (card: any, dimension: Dimension) => {
    const statKey = dimension === "devExp" ? "dev_exp" : dimension;
    const currentStat = card[statKey] as number;
    const cost = getUpgradeCost(currentStat);

    if ((player.materials ?? 0) >= cost) {
      await updatePlayerMaterials(player.id, player.materials - cost);
    } else {
      return;
    }

    const cardForUpgrade: Card = { ...card, devExp: card.dev_exp };
    const upgraded = applyUpgrade(cardForUpgrade, dimension);
    await updateCardStats(card.id, {
      [statKey]: upgraded[dimension],
    });
    await refreshCards();
    await refreshPlayer();
  };

  const MODES: { key: VaultMode; label: string }[] = [
    { key: "view", label: "VIEW" },
    { key: "upgrade", label: "UPGRADE" },
    { key: "burn", label: "BURN" },
    { key: "codex", label: "CODEX" },
  ];

  const getModeStyle = (m: VaultMode, active: boolean) => {
    if (!active) return "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5";
    switch (m) {
      case "burn": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "upgrade": return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "codex": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      default: return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-purple-400/60 tracking-[0.2em] uppercase mb-1">Card Vault</p>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-purple-400">VAULT</span>
            <span className="text-gray-500 font-normal ml-2 text-base">[{cards.length}]</span>
          </h1>
        </div>
        <div className="flex gap-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setConfirmBurn(false); }}
              className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all border ${getModeStyle(m.key, mode === m.key)}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Codex tab */}
      {mode === "codex" ? (
        <div className="space-y-6 animate-fade-in">
          <p className="text-xs font-mono text-gray-500">
            // Each language wields a unique ability — passive bonuses always active, triggered effects at 30% chance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => {
              const theme = LANGUAGE_THEMES[lang];
              const ability = ABILITIES[lang];
              const base = BASE_STATS[lang];
              const isExpanded = expandedLang === lang;

              return (
                <div
                  key={lang}
                  onClick={() => setExpandedLang(isExpanded ? null : lang)}
                  className={`
                    rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer
                    bg-gradient-to-br ${theme.bg} ${theme.border}
                    hover:border-opacity-80 hover:shadow-lg
                    ${isExpanded ? "ring-1 ring-white/10" : ""}
                  `}
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative w-20 h-28 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <Image src={`/cards/${lang}.png`} alt={lang} fill className="object-cover" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[10px] font-mono ${theme.accent} opacity-60 tracking-wider`}>{theme.title}</p>
                      <h3 className="text-lg font-bold font-mono text-white">{lang}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={theme.accent}><AbilityIcon language={lang} size={20} /></span>
                        <span className={`text-sm font-mono font-bold ${theme.accent}`}>{ability.name}</span>
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 italic mt-1">&quot;{ability.flavorText}&quot;</p>
                    </div>
                  </div>

                  <div className="px-4 pb-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-mono text-green-500/80 bg-green-500/10 px-1.5 py-0.5 rounded tracking-wider shrink-0">PASSIVE</span>
                      <span className="text-xs font-mono text-gray-300">+{ability.passiveBonus * 100}% {DIM_LABELS[ability.passiveDimension]}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded tracking-wider shrink-0">30% TRIGGER</span>
                      <span className="text-xs font-mono text-gray-300">{ability.triggeredDescription}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 animate-slide-up">
                      <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-2">Base Stats</p>
                      <div className="space-y-1.5">
                        {DIMENSIONS.map((dim) => {
                          const val = base[dim];
                          const pct = (val / 10) * 100;
                          return (
                            <div key={dim} className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-gray-500 w-7 shrink-0">{DIM_LABELS[dim]}</span>
                              <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${DIM_COLORS[dim]}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[11px] font-mono text-gray-400 w-5 text-right shrink-0">{val}</span>
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

          <div className="bg-gray-900/30 border border-gray-800/50 rounded-lg p-4">
            <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-2">How Abilities Work</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono text-gray-500">
              <div><span className="text-green-500/80">PASSIVE</span> — Always active during battle. Boosts the specified dimension stat.</div>
              <div><span className="text-amber-500/80">TRIGGERED</span> — 30% chance to activate each battle. Creates dramatic combat shifts.</div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Cards grid */}
          {cards.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xs font-mono text-gray-600 tracking-wider">// VAULT EMPTY</p>
              <p className="text-gray-500 mt-2 text-sm">Summon warriors to fill your vault</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {cards.map((card: any) => (
                <CardDisplay
                  key={card.id}
                  language={card.language}
                  rarity={card.rarity}
                  speed={card.speed}
                  security={card.security}
                  ecosystem={card.ecosystem}
                  scalability={card.scalability}
                  dev_exp={card.dev_exp}
                  selected={selectedCard?.id === card.id}
                  onClick={() => { setSelectedCard(card); setConfirmBurn(false); }}
                  showAbility={mode === "view"}
                />
              ))}
            </div>
          )}

          {/* Upgrade panel */}
          {selectedCard && mode === "upgrade" && (
            <div className="bg-gray-900/50 border border-amber-900/30 rounded-xl p-6 space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-amber-400/60 tracking-wider uppercase">Upgrade Station</p>
                  <p className="font-mono font-bold text-amber-400">{selectedCard.language}</p>
                </div>
                <p className="text-xs font-mono text-gray-500">
                  MAT <span className="text-amber-300">{player.materials}</span>
                </p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {DIMENSIONS.map((dim) => {
                  const statKey = dim === "devExp" ? "dev_exp" : dim;
                  const cost = getUpgradeCost(selectedCard[statKey]);
                  const canAfford = (player.materials ?? 0) >= cost;
                  return (
                    <button
                      key={dim}
                      onClick={() => handleUpgrade(selectedCard, dim)}
                      disabled={!canAfford}
                      className={`p-3 rounded-lg text-center transition-all font-mono border ${
                        canAfford
                          ? "bg-gray-800/50 border-amber-900/30 hover:border-amber-600/50 hover:bg-amber-950/30 cursor-pointer"
                          : "bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      <p className="text-[10px] text-gray-500 tracking-wider">{DIM_LABELS[dim]}</p>
                      <p className="text-lg font-bold text-white">{selectedCard[statKey]}</p>
                      <p className={`text-[10px] ${canAfford ? "text-amber-400" : "text-gray-600"}`}>-{cost} MAT</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Burn panel */}
          {selectedCard && mode === "burn" && (
            <div className="bg-gray-900/50 border border-red-900/30 rounded-xl p-6 text-center space-y-4 animate-slide-up">
              <p className="text-[10px] font-mono text-red-400/60 tracking-wider uppercase">Decompose Warrior</p>
              <p className="font-mono">
                <span className="text-red-400 font-bold">{selectedCard.language}</span>
                <span className="text-gray-600 mx-2">//</span>
                <span className="text-gray-400">{selectedCard.rarity}</span>
              </p>
              <p className="text-sm font-mono text-gray-500">
                Yields <span className="text-amber-400 font-bold">+{getBurnMaterials(selectedCard.rarity)}</span> materials
              </p>
              {!confirmBurn ? (
                <button
                  onClick={() => setConfirmBurn(true)}
                  className="px-8 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase
                    bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-all"
                >
                  DECOMPOSE
                </button>
              ) : (
                <div className="space-y-3 animate-slide-up">
                  <p className="text-xs font-mono text-red-400 font-bold">
                    This action is irreversible. Confirm?
                  </p>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => { handleBurn(selectedCard); setConfirmBurn(false); }}
                      className="px-6 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase
                        bg-red-600/30 text-red-300 border border-red-500/60 hover:bg-red-500/40 transition-all"
                    >
                      CONFIRM DECOMPOSE
                    </button>
                    <button
                      onClick={() => setConfirmBurn(false)}
                      className="px-6 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase
                        bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-700/30 transition-all"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
