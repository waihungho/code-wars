"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import {
  pickRandomDimensions,
  generateAiOpponent,
  resolveBattle,
} from "@/lib/battle";
import {
  insertBattleLog,
  updatePlayerAfterBattle,
  getPlayerDailyBattles,
  getCardEquipment,
} from "@/lib/db";
import { MAX_DAILY_BATTLES, ABILITIES, EQUIPMENT_CATALOG } from "@/lib/constants";
import { BATTLE_CODE, getAllCode } from "@/lib/battle-code";
import type { Card, Dimension, BattleResult, Language, EquipmentItem } from "@/lib/types";

/* ── Label maps ── */

const DIM_LABELS: Record<Dimension, string> = {
  speed: "SPD",
  security: "SEC",
  ecosystem: "ECO",
  scalability: "SCL",
  devExp: "DEV",
};

const DIM_NAMES: Record<Dimension, string> = {
  speed: "EXECUTION SPEED",
  security: "MEMORY SAFETY",
  ecosystem: "PACKAGE ECOSYSTEM",
  scalability: "CONCURRENCY",
  devExp: "DEVELOPER EXPERIENCE",
};

const DIM_ICONS: Record<Dimension, string> = {
  speed: "⚡",
  security: "🛡",
  ecosystem: "📦",
  scalability: "🔀",
  devExp: "✨",
};

/* ── Syntax color hint per language ── */

const LANG_COLORS: Record<string, { keyword: string; str: string; comment: string; accent: string }> = {
  Assembly:   { keyword: "text-amber-300",   str: "text-amber-200",   comment: "text-amber-800",   accent: "border-amber-700/40" },
  C:          { keyword: "text-blue-300",    str: "text-green-300",   comment: "text-gray-600",     accent: "border-blue-700/40" },
  Rust:       { keyword: "text-orange-300",  str: "text-green-300",   comment: "text-gray-600",     accent: "border-orange-700/40" },
  Java:       { keyword: "text-purple-300",  str: "text-green-300",   comment: "text-gray-600",     accent: "border-purple-700/40" },
  Go:         { keyword: "text-cyan-300",    str: "text-green-300",   comment: "text-gray-600",     accent: "border-cyan-700/40" },
  JavaScript: { keyword: "text-yellow-300",  str: "text-green-300",   comment: "text-gray-600",     accent: "border-yellow-700/40" },
  Python:     { keyword: "text-lime-300",    str: "text-green-300",   comment: "text-gray-600",     accent: "border-lime-700/40" },
  Solidity:   { keyword: "text-fuchsia-300", str: "text-green-300",   comment: "text-gray-600",     accent: "border-fuchsia-700/40" },
  CPlusPlus:  { keyword: "text-sky-300",     str: "text-sky-300",     comment: "text-gray-600",     accent: "border-sky-700/40" },
  CSharp:     { keyword: "text-violet-300",  str: "text-violet-300",  comment: "text-gray-600",     accent: "border-violet-700/40" },
  Clojure:    { keyword: "text-green-300",   str: "text-green-300",   comment: "text-gray-600",     accent: "border-green-700/40" },
  COBOL:      { keyword: "text-slate-300",   str: "text-slate-300",   comment: "text-gray-600",     accent: "border-slate-700/40" },
  Dart:       { keyword: "text-teal-300",    str: "text-teal-300",    comment: "text-gray-600",     accent: "border-teal-700/40" },
  Delphi:     { keyword: "text-red-300",     str: "text-red-300",     comment: "text-gray-600",     accent: "border-red-700/40" },
  Elixir:     { keyword: "text-purple-300",  str: "text-purple-300",  comment: "text-gray-600",     accent: "border-purple-700/40" },
  Erlang:     { keyword: "text-rose-300",    str: "text-rose-300",    comment: "text-gray-600",     accent: "border-rose-700/40" },
  Haskell:    { keyword: "text-violet-300",  str: "text-violet-300",  comment: "text-gray-600",     accent: "border-violet-700/40" },
  Kotlin:     { keyword: "text-orange-300",  str: "text-orange-300",  comment: "text-gray-600",     accent: "border-orange-700/40" },
  Lua:        { keyword: "text-indigo-300",  str: "text-indigo-300",  comment: "text-gray-600",     accent: "border-indigo-700/40" },
  MATLAB:     { keyword: "text-amber-300",   str: "text-amber-300",   comment: "text-gray-600",     accent: "border-amber-700/40" },
  Pascal:     { keyword: "text-sky-300",     str: "text-sky-300",     comment: "text-gray-600",     accent: "border-sky-700/40" },
  Perl:       { keyword: "text-teal-300",    str: "text-teal-300",    comment: "text-gray-600",     accent: "border-teal-700/40" },
  PHP:        { keyword: "text-indigo-300",  str: "text-indigo-300",  comment: "text-gray-600",     accent: "border-indigo-700/40" },
  R:          { keyword: "text-blue-300",    str: "text-blue-300",    comment: "text-gray-600",     accent: "border-blue-700/40" },
  Ruby:       { keyword: "text-rose-300",    str: "text-rose-300",    comment: "text-gray-600",     accent: "border-rose-700/40" },
  Scala:      { keyword: "text-red-300",     str: "text-red-300",     comment: "text-gray-600",     accent: "border-red-700/40" },
  SQL:        { keyword: "text-cyan-300",    str: "text-cyan-300",    comment: "text-gray-600",     accent: "border-cyan-700/40" },
  Swift:      { keyword: "text-orange-300",  str: "text-orange-300",  comment: "text-gray-600",     accent: "border-orange-700/40" },
};

/* ── Helper: color a code line with basic heuristics ── */

function colorLine(line: string, lang: string) {
  const c = LANG_COLORS[lang] ?? LANG_COLORS.C;
  if (line.trimStart().startsWith("//") || line.trimStart().startsWith("#") && !line.includes("include") && !line.includes("import")
    || line.trimStart().startsWith(";") || line.trimStart().startsWith("/*") || line.trimStart().startsWith("*")
    || line.trimStart().startsWith("///")) {
    return c.comment;
  }
  if (line.includes('"') || line.includes("'") || line.includes("`")) {
    return c.str;
  }
  return c.keyword;
}

/* ── Scrolling code wall component ── */

function CodeWall({
  language,
  lines,
  side,
  speed = 20,
  showExecLine = true,
  height = "h-80",
}: {
  language: string;
  lines: string[];
  side: "left" | "right";
  speed?: number;
  showExecLine?: boolean;
  height?: string;
}) {
  const borderColor = side === "left" ? "border-cyan-800/40" : "border-red-800/40";
  const labelColor = side === "left" ? "text-cyan-500" : "text-red-500";
  const dotColor = side === "left" ? "bg-cyan-500" : "bg-red-500";
  const execLineColor = side === "left" ? "bg-cyan-400/8" : "bg-red-400/8";

  return (
    <div className={`flex-1 rounded-lg border ${borderColor} bg-black/70 overflow-hidden flex flex-col`}>
      {/* Tab bar */}
      <div className="px-3 py-1.5 border-b border-gray-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span className={`text-[9px] font-mono ${labelColor} tracking-wider`}>{language.toLowerCase()}.src</span>
        </div>
        <span className="text-[8px] font-mono text-gray-700">{lines.length} lines</span>
      </div>

      {/* Scrolling code area */}
      <div className={`relative ${height} overflow-hidden`}>
        {showExecLine && (
          <div className={`exec-line ${execLineColor}`} />
        )}
        <div
          className="code-scroll"
          style={{ animationDuration: `${speed}s` }}
        >
          {/* Duplicate lines for seamless loop */}
          {[...lines, ...lines].map((line, i) => (
            <div key={i} className="flex gap-2 px-3 py-px hover:bg-white/[0.02] transition-colors">
              <span className="text-[8px] text-gray-700 w-5 text-right shrink-0 select-none font-mono">
                {(i % lines.length) + 1}
              </span>
              <span className={`text-[10px] font-mono whitespace-pre ${colorLine(line, language)}`}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Static code pane (for dimension reveal) ── */

function DimCodePane({
  language,
  lines,
  side,
  isWinner,
}: {
  language: string;
  lines: string[];
  side: "left" | "right";
  isWinner: boolean;
}) {
  const winBg = isWinner
    ? side === "left" ? "bg-green-950/10" : "bg-green-950/10"
    : "";
  const dotColor = side === "left" ? "bg-cyan-500/80" : "bg-red-500/80";
  const labelColor = side === "left" ? "text-cyan-500/60" : "text-red-500/60";

  return (
    <div className={`flex-1 p-3 ${winBg} ${side === "left" ? "border-r border-gray-800/20" : ""}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
        <span className={`text-[8px] font-mono ${labelColor} tracking-wider`}>{language}</span>
        {isWinner && <span className="text-[8px] font-mono text-green-500 tracking-wider ml-auto">WIN</span>}
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          className="flex gap-1.5 animate-line-appear"
          style={{ animationDelay: `${i * 0.04}s` }}
        >
          <span className="text-[8px] text-gray-700 w-4 text-right shrink-0 select-none font-mono">{i + 1}</span>
          <span className={`text-[10px] font-mono whitespace-pre ${colorLine(line, language)}`}>{line}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Code rain background ── */

function CodeRain({ language }: { language: string }) {
  const allLines = useMemo(() => getAllCode(language), [language]);
  const cols = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      left: `${3 + i * 10}%`,
      delay: `${i * 0.4}s`,
      duration: `${3 + (i % 4) * 0.6}s`,
      text: Array.from({ length: 10 }, (_, j) => allLines[(i * 7 + j) % allLines.length]).join("\n"),
    }));
  }, [allLines]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cols.map((col, i) => (
        <div
          key={i}
          className="code-rain-col"
          style={{ left: col.left, animationDelay: col.delay, animationDuration: col.duration }}
        >
          {col.text}
        </div>
      ))}
    </div>
  );
}

/* ── Benchmark output stream ── */

function BenchmarkOutput({
  playerLang,
  aiLang,
  dims,
  playerCard,
  aiStats,
}: {
  playerLang: string;
  aiLang: string;
  dims: Dimension[];
  playerCard: any;
  aiStats: Record<Dimension, number>;
}) {
  const lines = useMemo(() => {
    const output: { text: string; color: string; delay: number }[] = [];
    output.push({ text: `$ codewars benchmark --rounds ${dims.length}`, color: "text-gray-500", delay: 0 });
    output.push({ text: `  Linking ${playerLang} vs ${aiLang}...`, color: "text-gray-600", delay: 0.15 });
    output.push({ text: "", color: "", delay: 0.2 });

    dims.forEach((dim, i) => {
      const sk = dim === "devExp" ? "dev_exp" : dim;
      const pVal = playerCard[sk];
      const aVal = aiStats[dim];
      const winner = pVal > aVal ? "player" : aVal > pVal ? "ai" : "tie";
      const base = 0.3 + i * 0.5;
      output.push({ text: `  [${DIM_LABELS[dim]}] ${DIM_NAMES[dim]}`, color: "text-gray-500", delay: base });
      output.push({
        text: `    ${playerLang}: ${pVal} | ${aiLang}: ${aVal}`,
        color: winner === "player" ? "text-green-400/80" : winner === "ai" ? "text-red-400/80" : "text-yellow-400/80",
        delay: base + 0.15,
      });
      output.push({
        text: `    → ${winner === "player" ? playerLang + " wins" : winner === "ai" ? aiLang + " wins" : "draw"}`,
        color: winner === "player" ? "text-green-500" : winner === "ai" ? "text-red-500" : "text-yellow-500",
        delay: base + 0.25,
      });
    });

    return output;
  }, [playerLang, aiLang, dims, playerCard, aiStats]);

  return (
    <div className="bg-black/60 border border-gray-800/50 rounded-lg p-3 font-mono text-[10px]">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`animate-output ${line.color}`}
          style={{ animationDelay: `${line.delay}s` }}
        >
          {line.text || "\u00A0"}
        </div>
      ))}
    </div>
  );
}

type BattlePhase = "idle" | "compile" | "clash" | "dimensions" | "result";

/* ── Main component ── */

export default function BattlePage() {
  const { connected } = useWallet();
  const { player, cards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [difficulty, setDifficulty] = useState(1);
  const [dailyBattles, setDailyBattles] = useState(0);
  const [revealedDims, setRevealedDims] = useState(0);
  const [aiPreview, setAiPreview] = useState<{ language: Language } | null>(null);
  const [compileStep, setCompileStep] = useState(0);

  useEffect(() => {
    if (player) {
      getPlayerDailyBattles(player.id).then(setDailyBattles);
    }
  }, [player]);

  if (!connected || !player) {
    return (
      <div className="text-center mt-20">
        <p className="text-xs font-mono text-gray-600 tracking-wider">// WALLET NOT CONNECTED</p>
        <p className="text-gray-500 mt-2 text-sm">Connect your wallet to enter the arena</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center mt-20">
        <p className="text-xs font-mono text-red-400/60 tracking-wider">// NO WARRIORS FOUND</p>
        <p className="text-gray-500 mt-2 text-sm">Summon cards first before entering battle</p>
      </div>
    );
  }

  const isPractice = dailyBattles >= MAX_DAILY_BATTLES;

  const handleBattle = async () => {
    if (!selectedCard) return;

    setBattleResult(null);
    setRevealedDims(0);
    setCompileStep(0);
    setPhase("compile");

    const ai = generateAiOpponent(difficulty);
    const dimensions = pickRandomDimensions();
    setAiPreview({ language: ai.language });

    // Load equipped items for this card
    const cardEquip = await getCardEquipment(selectedCard.id);
    const { getPlayerInventory: getInv } = await import("@/lib/db");
    const invItems = await getInv(player.id);
    const resolvedItems: EquipmentItem[] = [];
    for (const eq of cardEquip) {
      const invItem = invItems?.find((i: any) => i.id === eq.inventory_id);
      if (invItem) {
        const catalogItem = EQUIPMENT_CATALOG.find(c => c.id === invItem.item_id);
        if (catalogItem) resolvedItems.push(catalogItem);
      }
    }

    const cardForBattle: Card = { ...selectedCard, devExp: selectedCard.dev_exp };
    const result = resolveBattle(cardForBattle, ai.stats, dimensions, resolvedItems);
    result.aiLanguage = ai.language;
    result.aiStats = ai.stats;
    result.isPracticeMode = isPractice;
    if (isPractice) result.xpEarned = 0;

    await insertBattleLog({
      player_id: player.id,
      player_card_id: selectedCard.id,
      ai_language: ai.language,
      ai_stats: ai.stats,
      dimensions_picked: dimensions,
      result: result.result,
      xp_earned: result.xpEarned,
    });
    await updatePlayerAfterBattle(player.id, result.xpEarned);

    // Phase: compile terminal stagger
    setTimeout(() => setCompileStep(1), 300);
    setTimeout(() => setCompileStep(2), 700);
    setTimeout(() => setCompileStep(3), 1100);
    setTimeout(() => setCompileStep(4), 1500);
    setTimeout(() => setCompileStep(5), 1900);
    setTimeout(() => setCompileStep(6), 2300);

    // Phase: clash with scrolling code walls
    setTimeout(() => setPhase("clash"), 2800);

    // Phase: dimension code battles
    setTimeout(() => {
      setBattleResult(result);
      setPhase("dimensions");
      setTimeout(() => setRevealedDims(1), 800);
      setTimeout(() => setRevealedDims(2), 2000);
      setTimeout(() => setRevealedDims(3), 3200);
      // Phase: result
      setTimeout(() => {
        setPhase("result");
        setDailyBattles((prev) => prev + 1);
        refreshPlayer();
      }, 4200);
    }, 5000);
  };

  const playerLang = selectedCard?.language ?? "C";
  const aiLang = aiPreview?.language ?? "C";
  const playerCode = BATTLE_CODE[playerLang] ?? BATTLE_CODE.C;
  const aiCode = BATTLE_CODE[aiLang] ?? BATTLE_CODE.C;
  const playerAllCode = useMemo(() => getAllCode(playerLang), [playerLang]);
  const aiAllCode = useMemo(() => getAllCode(aiLang), [aiLang]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-red-400/60 tracking-[0.2em] uppercase mb-1">Battle Arena</p>
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-red-400">Compile, Execute</span> & Fight
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono tracking-wider ${
            isPractice
              ? "bg-gray-800/50 border-gray-700 text-gray-500"
              : "bg-red-950/30 border-red-900/30 text-red-400"
          }`}>
            <span>{isPractice ? "PRACTICE MODE" : `${dailyBattles}/${MAX_DAILY_BATTLES} TODAY`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-500 tracking-wider">LVL</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition-all ${
                    d === difficulty
                      ? "bg-red-500/30 text-red-400 border border-red-500/50"
                      : d <= difficulty
                        ? "bg-red-950/30 text-red-600 border border-red-900/30"
                        : "bg-gray-900 text-gray-700 border border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── IDLE: Card selection ── */}
      {phase === "idle" && (
        <>
          <div>
            <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-3 uppercase">// Select your warrior</p>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
                  compact
                  selected={selectedCard?.id === card.id}
                  onClick={() => setSelectedCard(card)}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={handleBattle}
              disabled={!selectedCard}
              className={`px-10 py-4 rounded-lg text-sm font-mono font-bold tracking-wider uppercase transition-all duration-300
                ${!selectedCard
                  ? "bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed"
                  : "bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:border-red-400 shadow-lg shadow-red-900/30 cursor-pointer"}`}
            >
              {!selectedCard ? "SELECT WARRIOR" : isPractice ? "PRACTICE" : "COMPILE & EXECUTE"}
            </button>
            {isPractice && (
              <p className="text-[10px] font-mono text-gray-600 mt-2 tracking-wider">Ranked battles reset at 00:00 UTC</p>
            )}
          </div>
        </>
      )}

      {/* ── COMPILE: Extended terminal boot sequence ── */}
      {phase === "compile" && selectedCard && (
        <div className="space-y-4">
          <div className="bg-black/70 border border-cyan-900/30 rounded-xl p-5 font-mono text-xs relative overflow-hidden">
            <div className="scan-line" />

            {/* Terminal chrome */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="text-gray-600 text-[10px] tracking-wider">CODEWARS://BATTLE_ENGINE v3.0.0</span>
            </div>

            <div className="space-y-1.5">
              {compileStep >= 0 && (
                <div className="animate-code-block">
                  <span className="text-gray-600">$</span>{" "}
                  <span className="text-cyan-500/70">init --arena-mode=ranked --lvl={difficulty}</span>
                </div>
              )}
              {compileStep >= 1 && (
                <div className="animate-code-block">
                  <span className="text-gray-600">$</span>{" "}
                  <span className="text-cyan-400/70">load --warrior &quot;{selectedCard.language}&quot; --rarity={selectedCard.rarity}</span>
                </div>
              )}
              {compileStep >= 2 && (
                <div className="animate-code-block">
                  <span className="text-gray-600">$</span>{" "}
                  <span className="text-red-400/70">scan --opponent &quot;{aiPreview?.language ?? "???"}&quot; --analyzing...</span>
                </div>
              )}
              {compileStep >= 3 && (
                <div className="animate-code-block">
                  <span className="text-gray-600">$</span>{" "}
                  <span className="text-amber-400/70">link --ability &quot;{ABILITIES[selectedCard.language as Language]?.name}&quot; --trigger=auto</span>
                </div>
              )}
              {compileStep >= 4 && (
                <div className="animate-code-block">
                  <span className="text-gray-600">$</span>{" "}
                  <span className="text-purple-400/70">compile --optimize=3 --target=battle --simd --lto</span>
                </div>
              )}
              {compileStep >= 5 && (
                <div className="animate-code-block text-green-400/60 text-[10px] mt-2">
                  ✓ Compiled {playerAllCode.length} lines of {playerLang} source
                </div>
              )}
              {compileStep >= 5 && (
                <div className="animate-code-block text-green-400/60 text-[10px]">
                  ✓ Compiled {aiAllCode.length} lines of {aiLang} source
                </div>
              )}
              {compileStep >= 6 && (
                <div className="animate-code-block mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 text-[10px] tracking-wider">READY</span>
                    <div className="flex-1 bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div className="compile-bar" />
                    </div>
                  </div>
                  <span className="text-gray-600 text-[10px]">Executing battle protocol...</span>
                </div>
              )}
            </div>
          </div>

          {/* Source code preview — both warriors loading */}
          {compileStep >= 4 && (
            <div className="flex gap-3 animate-slide-up">
              <CodeWall
                language={playerLang}
                lines={playerAllCode}
                side="left"
                speed={15}
                height="h-48"
              />
              <CodeWall
                language={aiLang}
                lines={aiAllCode}
                side="right"
                speed={18}
                height="h-48"
              />
            </div>
          )}
        </div>
      )}

      {/* ── CLASH: Full-screen code rain + cards + tall scrolling code walls ── */}
      {phase === "clash" && selectedCard && (
        <div className="space-y-4 relative">
          {/* Background code rain */}
          <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
            <CodeRain language={playerLang} />
          </div>

          {/* Card face-off */}
          <div className="relative z-10 flex items-center justify-center gap-10 py-6">
            <div className="text-center animate-slide-left">
              <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-cyan-500/50 mx-auto mb-2 shadow-lg shadow-cyan-900/30">
                <Image src={`/cards/${selectedCard.language}.png`} alt={selectedCard.language} fill className="object-cover" sizes="144px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-sm font-mono font-bold text-cyan-400">{selectedCard.language}</p>
              <p className="text-[9px] font-mono text-cyan-600">{ABILITIES[selectedCard.language as Language]?.name}</p>
            </div>

            <div className="animate-clash relative">
              <span className="text-5xl font-mono font-black text-white animate-glitch">VS</span>
              <div className="energy-ring w-20 h-20 border-red-500/60 -top-5 -left-5" style={{ animationDelay: "0s" }} />
              <div className="energy-ring w-20 h-20 border-cyan-500/60 -top-5 -left-5" style={{ animationDelay: "0.5s" }} />
              <div className="energy-ring w-20 h-20 border-purple-500/60 -top-5 -left-5" style={{ animationDelay: "1s" }} />
            </div>

            <div className="text-center animate-slide-right">
              <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-red-500/50 mx-auto mb-2 shadow-lg shadow-red-900/30">
                <Image src={`/cards/${aiPreview?.language ?? "C"}.png`} alt={aiPreview?.language ?? "AI"} fill className="object-cover" sizes="144px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-sm font-mono font-bold text-red-400">{aiPreview?.language ?? "???"}</p>
              <p className="text-[9px] font-mono text-red-600">{aiPreview ? ABILITIES[aiPreview.language]?.name : ""}</p>
            </div>
          </div>

          {/* Tall scrolling code walls — full source battle */}
          <div className="relative z-10 flex gap-3">
            <CodeWall
              language={playerLang}
              lines={playerAllCode}
              side="left"
              speed={12}
              height="h-96"
            />
            <div className="flex flex-col items-center justify-center gap-2 shrink-0">
              <span className="text-[9px] font-mono text-gray-700 tracking-widest animate-pulse">EXEC</span>
              <div className="w-px h-24 bg-gradient-to-b from-cyan-500/30 via-purple-500/30 to-red-500/30" />
              <span className="text-[9px] font-mono text-gray-700 tracking-widest animate-pulse">EVAL</span>
            </div>
            <CodeWall
              language={aiLang}
              lines={aiAllCode}
              side="right"
              speed={14}
              height="h-96"
            />
          </div>

          <p className="relative z-10 text-center text-[10px] font-mono text-gray-600 animate-pulse tracking-widest mt-2">
            <span className="text-purple-400/60">await</span> arena.benchmark(<span className="text-cyan-400/60">{playerLang}</span>, <span className="text-red-400/60">{aiLang}</span>)<span className="terminal-cursor text-cyan-400/60" />
          </p>
        </div>
      )}

      {/* ── DIMENSIONS + RESULT: Dense code battle reveals ── */}
      {(phase === "dimensions" || phase === "result") && battleResult && selectedCard && (
        <div className="space-y-4">
          {/* Final result — shown at top */}
          {phase === "result" && (() => {
            const isWin = battleResult.result === "win";
            const isLose = battleResult.result === "lose";
            const roundsWon = battleResult.dimensionsPicked.filter((d) => {
              const sk = d === "devExp" ? "dev_exp" : d;
              return selectedCard[sk] > battleResult.aiStats[d];
            }).length;
            const accentColor = isWin ? "green" : isLose ? "red" : "yellow";

            return (
              <div className="relative overflow-hidden rounded-2xl border border-white/5">
                {/* Full-width screen flash */}
                <div className={`absolute inset-0 animate-result-flash pointer-events-none ${
                  isWin ? "bg-green-500/30" : isLose ? "bg-red-500/30" : "bg-yellow-500/30"
                }`} />

                {/* Radial glow background */}
                <div className={`absolute inset-0 pointer-events-none ${
                  isWin ? "bg-[radial-gradient(ellipse_at_center,rgba(74,222,128,0.1)_0%,transparent_70%)]"
                    : isLose ? "bg-[radial-gradient(ellipse_at_center,rgba(248,113,113,0.1)_0%,transparent_70%)]"
                    : "bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.1)_0%,transparent_70%)]"
                }`} />

                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`absolute w-1 h-1 rounded-full ${
                        isWin ? "bg-green-400" : isLose ? "bg-red-400" : "bg-yellow-400"
                      }`}
                      style={{
                        left: `${8 + (i * 7.5)}%`,
                        bottom: "20%",
                        opacity: 0,
                        animation: `result-particle ${1.5 + (i % 3) * 0.5}s ${i * 0.15}s ease-out infinite`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative z-10 py-10 px-6 text-center space-y-4">
                  {/* Command line */}
                  <div className="font-mono text-sm text-gray-500 animate-fade-in">
                    <span className="text-gray-700">{"> "}</span>
                    {playerLang}.<span className={`text-${accentColor}-400`}>fight</span>(<span className="text-red-400">{aiLang}</span>)
                  </div>

                  {/* Main result title */}
                  <p className={`text-7xl font-black font-mono tracking-widest animate-result-pulse ${
                    isWin ? "text-green-400 animate-victory"
                      : isLose ? "text-red-400 animate-defeat"
                      : "text-yellow-400 animate-victory"
                  }`}>
                    {isWin ? "VICTORY" : isLose ? "DEFEAT" : "DRAW"}
                  </p>

                  {/* XP earned - big and glowing */}
                  <div className="animate-xp-glow">
                    {battleResult.isPracticeMode ? (
                      <p className="text-lg font-mono text-gray-600">
                        <span className="text-purple-400/40">return</span> {"{ "}xp: <span className="text-gray-500">0</span>{" }"}
                      </p>
                    ) : (
                      <p className="text-lg font-mono">
                        <span className="text-purple-400/60">return</span>{" "}
                        <span className="text-gray-600">{"{"}</span> xp:{" "}
                        <span className={`text-2xl font-bold ${isWin ? "text-green-400" : isLose ? "text-red-400" : "text-yellow-400"}`}>
                          +{battleResult.xpEarned}
                        </span>
                        {" "}<span className="text-gray-600">{"}"}</span>
                      </p>
                    )}
                  </div>

                  {/* Rounds indicator dots */}
                  <div className="flex items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
                    {battleResult.dimensionsPicked.map((d, i) => {
                      const sk = d === "devExp" ? "dev_exp" : d;
                      const won = selectedCard[sk] > battleResult.aiStats[d];
                      const tied = selectedCard[sk] === battleResult.aiStats[d];
                      return (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            won ? "bg-green-500/40 border-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
                              : tied ? "bg-yellow-500/30 border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.3)]"
                              : "bg-red-500/30 border-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]"
                          }`} />
                          <span className="text-[8px] font-mono text-gray-600 uppercase">R{i + 1}</span>
                        </div>
                      );
                    })}
                    <span className="text-xs font-mono text-gray-600 ml-2">
                      {roundsWon}/{battleResult.dimensionsPicked.length} won
                    </span>
                  </div>

                  {/* Fight again button */}
                  <button
                    onClick={() => { setPhase("idle"); setBattleResult(null); setAiPreview(null); setCompileStep(0); }}
                    className={`animate-button-rise mt-2 px-10 py-3 rounded-xl text-sm font-mono font-bold tracking-wider uppercase
                      transition-all cursor-pointer border ${
                      isWin
                        ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]"
                        : isLose
                          ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_0_20px_rgba(248,113,113,0.2)]"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                    }`}
                  >
                    <span className="text-gray-600 mr-2">$</span> FIGHT AGAIN
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Matchup header */}
          <div className="flex items-center justify-center gap-10">
            <div className="text-center animate-slide-left">
              <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-cyan-500/50 mx-auto mb-2 shadow-lg shadow-cyan-900/30">
                <Image src={`/cards/${selectedCard.language}.png`} alt={selectedCard.language} fill className="object-cover" sizes="144px" />
              </div>
              <p className="text-sm font-mono font-bold text-cyan-400">{selectedCard.language}</p>
            </div>
            <span className="text-2xl font-mono font-black text-gray-600 animate-clash">VS</span>
            <div className="text-center animate-slide-right">
              <div className="relative w-36 h-48 rounded-xl overflow-hidden border-2 border-red-500/50 mx-auto mb-2 shadow-lg shadow-red-900/30">
                <Image src={`/cards/${battleResult.aiLanguage}.png`} alt={battleResult.aiLanguage} fill className="object-cover" sizes="144px" />
              </div>
              <p className="text-sm font-mono font-bold text-red-400">{battleResult.aiLanguage}</p>
            </div>
          </div>

          {/* Dimension code battles — expanded code panes */}
          <div className="space-y-3">
            {battleResult.dimensionsPicked.map((dim, idx) => {
              const statKey = dim === "devExp" ? "dev_exp" : dim;
              const playerStat = selectedCard[statKey];
              const aiStat = battleResult.aiStats[dim];
              const winner = playerStat > aiStat ? "player" : aiStat > playerStat ? "ai" : "tie";
              const isRevealed = idx < revealedDims;

              const pLines = playerCode[dim] ?? playerCode.speed;
              const aLines = aiCode[dim] ?? aiCode.speed;

              return (
                <div
                  key={dim}
                  className={`rounded-xl border overflow-hidden transition-all duration-500 ${
                    !isRevealed
                      ? "border-gray-800/40 bg-gray-950/40"
                      : winner === "player"
                        ? "border-green-800/40 bg-green-950/10"
                        : winner === "ai"
                          ? "border-red-800/40 bg-red-950/10"
                          : "border-yellow-800/40 bg-yellow-950/10"
                  }`}
                >
                  {/* Dimension header */}
                  <div className={`px-4 py-2 border-b flex items-center justify-between ${
                    isRevealed
                      ? winner === "player" ? "border-green-900/30" : winner === "ai" ? "border-red-900/30" : "border-yellow-900/30"
                      : "border-gray-800/30"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-gray-600">{String(idx + 1).padStart(2, "0")}</span>
                      <span className="text-sm">{DIM_ICONS[dim]}</span>
                      <span className={`text-[10px] font-mono tracking-wider font-bold ${
                        isRevealed
                          ? winner === "player" ? "text-green-400" : winner === "ai" ? "text-red-400" : "text-yellow-400"
                          : "text-gray-600"
                      }`}>
                        {DIM_NAMES[dim]}
                      </span>
                    </div>
                    {isRevealed ? (
                      <div className="flex items-center gap-3">
                        {/* Benchmark bars */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono text-cyan-500/60">{playerLang}</span>
                          <div className="w-20 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bench-bar bg-cyan-500/60"
                              style={{ "--bench-pct": `${Math.min(playerStat * 5, 100)}%` } as React.CSSProperties}
                            />
                          </div>
                          <span className={`text-sm font-mono font-bold ${winner === "player" ? "text-green-400" : "text-gray-500"}`}>{playerStat}</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${
                          winner === "player" ? "text-green-500" : winner === "ai" ? "text-red-500" : "text-yellow-500"
                        }`}>
                          {winner === "player" ? ">" : winner === "ai" ? "<" : "="}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-mono font-bold ${winner === "ai" ? "text-red-400" : "text-gray-500"}`}>{aiStat}</span>
                          <div className="w-20 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bench-bar bg-red-500/60"
                              style={{ "--bench-pct": `${Math.min(aiStat * 5, 100)}%`, animationDelay: "0.2s" } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-red-500/60">{aiLang}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-700">?</span>
                        <span className="text-xs font-mono text-gray-800">vs</span>
                        <span className="text-sm font-mono text-gray-700">?</span>
                        <span className="terminal-cursor text-gray-700" />
                      </div>
                    )}
                  </div>

                  {/* Full code panes — show complete ~15-20 line snippets */}
                  {isRevealed && (
                    <div className="flex gap-0">
                      <DimCodePane
                        language={playerLang}
                        lines={pLines}
                        side="left"
                        isWinner={winner === "player"}
                      />
                      <DimCodePane
                        language={aiLang}
                        lines={aLines}
                        side="right"
                        isWinner={winner === "ai"}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Benchmark output stream */}
          {phase === "result" && (
            <BenchmarkOutput
              playerLang={playerLang}
              aiLang={aiLang}
              dims={battleResult.dimensionsPicked}
              playerCard={selectedCard}
              aiStats={battleResult.aiStats}
            />
          )}

          {/* Ability trigger */}
          {phase === "result" && battleResult.abilityTriggered && (
            <div className="bg-amber-950/20 border border-amber-700/30 rounded-lg p-4 animate-code-block">
              <div className="font-mono text-xs">
                <span className="text-gray-600">{"// "}</span>
                <span className="text-amber-500/60 text-[9px] tracking-wider">ABILITY TRIGGERED</span>
              </div>
              <div className="font-mono text-xs mt-2">
                <span className="text-purple-400">trigger</span>
                <span className="text-gray-700">(</span>
                <span className="text-amber-400 font-bold">&quot;{battleResult.abilityTriggered.abilityName}&quot;</span>
                <span className="text-gray-700">)</span>
                <span className="text-gray-600 ml-2">{"// "}{battleResult.abilityTriggered.description}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
