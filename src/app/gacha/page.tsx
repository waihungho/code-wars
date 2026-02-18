"use client";

import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { generateCard } from "@/lib/gacha";
import { insertCard, decrementPulls } from "@/lib/db";
import { RARITY_TIERS, RARITY_ODDS, RARITY_STAT_MULTIPLIERS, ABILITIES } from "@/lib/constants";
import type { Rarity, Language } from "@/lib/types";

const RARITY_STYLES: Record<Rarity, { text: string; border: string; bg: string; bar: string; glow: string; flash: string }> = {
  Common:    { text: "text-gray-400",    border: "border-gray-800/50",    bg: "bg-gray-900/20",     bar: "bg-gray-500",    glow: "rgba(156,163,175,0.3)", flash: "" },
  Uncommon:  { text: "text-green-400",   border: "border-green-900/30",   bg: "bg-green-950/10",    bar: "bg-green-500",   glow: "rgba(74,222,128,0.3)",  flash: "" },
  Rare:      { text: "text-blue-400",    border: "border-blue-900/30",    bg: "bg-blue-950/10",     bar: "bg-blue-500",    glow: "rgba(96,165,250,0.4)",  flash: "bg-blue-500/20" },
  Legendary: { text: "text-amber-400",   border: "border-amber-900/30",   bg: "bg-amber-950/10",    bar: "bg-gradient-to-r from-amber-600 to-yellow-400", glow: "rgba(251,191,36,0.5)", flash: "bg-amber-500/25" },
  Mythic:    { text: "text-fuchsia-400", border: "border-fuchsia-900/30", bg: "bg-fuchsia-950/10",  bar: "bg-gradient-to-r from-fuchsia-600 via-blue-500 to-cyan-400", glow: "rgba(168,85,247,0.5)", flash: "bg-fuchsia-500/25" },
};

type SummonPhase = "idle" | "channeling" | "converging" | "reveal";

/* ── Ambient floating particles ── */
function AmbientParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      left: `${5 + (i * 17) % 90}%`,
      top: `${10 + (i * 23) % 80}%`,
      delay: `${(i * 0.7) % 4}s`,
      duration: `${3 + (i % 3)}s`,
      size: i % 3 === 0 ? 3 : 2,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="ambient-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ── Summoning circle with rotating rings ── */
function SummonCircle({ phase }: { phase: SummonPhase }) {
  const isActive = phase === "channeling" || phase === "converging";
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Outer ring */}
      <div
        className={`summon-ring w-48 h-48 border-cyan-500/30 top-0 left-0 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-30"}`}
        style={{ animationDuration: "4s" }}
      />
      {/* Middle ring — reverse */}
      <div
        className={`summon-ring-reverse w-36 h-36 border-purple-500/30 top-6 left-6 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-30"}`}
        style={{ animationDuration: "3s" }}
      />
      {/* Inner ring */}
      <div
        className={`summon-ring w-24 h-24 border-cyan-400/40 top-12 left-12 transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-20"}`}
        style={{ animationDuration: "2s" }}
      />
      {/* Core glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full transition-all duration-700 ${
        phase === "converging"
          ? "bg-cyan-400/20 shadow-[0_0_60px_rgba(6,182,212,0.5)] scale-110"
          : isActive
            ? "bg-cyan-400/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
            : "bg-gray-800/30"
      }`} />

      {/* Rune symbols */}
      {isActive && (
        <>
          {["◇", "△", "○", "☆", "◈", "⬡"].map((rune, i) => (
            <div
              key={i}
              className="absolute text-cyan-400/30 text-xs font-mono"
              style={{
                top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 6)}%`,
                left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 6)}%`,
                transform: "translate(-50%, -50%)",
                animation: `rune-float ${2 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            >
              {rune}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ── Energy particles converging to center ── */
function ConvergeParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 80 + (i % 3) * 30;
      return {
        cx: `${Math.cos(angle) * dist}px`,
        cy: `${Math.sin(angle) * dist}px`,
        delay: `${(i * 0.1)}s`,
        color: i % 3 === 0 ? "bg-cyan-400" : i % 3 === 1 ? "bg-purple-400" : "bg-blue-400",
      };
    }), []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className={`energy-particle ${p.color}`}
          style={{
            "--cx": p.cx,
            "--cy": p.cy,
            animationDelay: p.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Summoning terminal log ── */
function SummonLog({ step, language, rarity }: { step: number; language?: string; rarity?: string }) {
  const lines = [
    { text: "$ summon --chamber=alpha --protocol=gacha", color: "text-cyan-500/70" },
    { text: "  Initializing summoning matrix...", color: "text-gray-600" },
    { text: "  Scanning warrior database... 8 languages indexed", color: "text-gray-600" },
    { text: "  Rolling rarity dice... seed=0x" + Math.random().toString(16).slice(2, 10), color: "text-purple-400/70" },
    { text: language ? `  ✓ Warrior locked: ${language}` : "  Locking warrior...", color: language ? "text-green-400/70" : "text-gray-600" },
    { text: rarity ? `  ✓ Rarity confirmed: ${rarity}` : "  Confirming rarity...", color: rarity ? (RARITY_STYLES[rarity as Rarity]?.text ?? "text-gray-400") : "text-gray-600" },
    { text: "  Materializing card...", color: "text-amber-400/70" },
  ];

  return (
    <div className="bg-black/60 border border-gray-800/50 rounded-lg p-3 font-mono text-[10px] text-left max-w-sm mx-auto">
      {lines.slice(0, step).map((line, i) => (
        <div
          key={i}
          className={`animate-code-block ${line.color}`}
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {line.text}
        </div>
      ))}
      {step < 7 && <span className="terminal-cursor text-cyan-400/40" />}
    </div>
  );
}

export default function GachaPage() {
  const { connected } = useWallet();
  const { player, refreshCards, refreshPlayer } = useGame();
  const [pulledCard, setPulledCard] = useState<any | null>(null);
  const [phase, setPhase] = useState<SummonPhase>("idle");
  const [logStep, setLogStep] = useState(0);
  const [showFlash, setShowFlash] = useState(false);

  if (!connected || !player) {
    return (
      <div className="text-center mt-20">
        <p className="text-xs font-mono text-gray-600 tracking-wider">// WALLET NOT CONNECTED</p>
        <p className="text-gray-500 mt-2 text-sm">Connect your wallet to summon cards</p>
      </div>
    );
  }

  const handlePull = async () => {
    if (player.free_pulls_remaining <= 0) return;

    setPulledCard(null);
    setLogStep(0);
    setShowFlash(false);
    setPhase("channeling");

    try {
      await decrementPulls(player.id);
      const cardData = generateCard(player.id);

      // Terminal log stagger during channeling
      setTimeout(() => setLogStep(1), 200);
      setTimeout(() => setLogStep(2), 500);
      setTimeout(() => setLogStep(3), 900);

      // Converging phase
      setTimeout(() => {
        setPhase("converging");
        setLogStep(4);
      }, 1300);

      setTimeout(() => setLogStep(5), 1700);

      const saved = await insertCard({
        player_id: player.id,
        language: cardData.language,
        rarity: cardData.rarity,
        speed: cardData.speed,
        security: cardData.security,
        ecosystem: cardData.ecosystem,
        scalability: cardData.scalability,
        dev_exp: cardData.devExp,
      });

      setTimeout(() => setLogStep(6), 2100);
      setTimeout(() => setLogStep(7), 2400);

      // Reveal phase
      setTimeout(() => {
        const rarity = saved.rarity as Rarity;
        if (rarity === "Rare" || rarity === "Legendary" || rarity === "Mythic") {
          setShowFlash(true);
          setTimeout(() => setShowFlash(false), 600);
        }
        setPulledCard(saved);
        setPhase("reveal");
      }, 2700);

      await refreshPlayer();
      await refreshCards();
    } catch (err) {
      console.error("Pull failed:", err);
      setPhase("idle");
    }
  };

  const pulledRarity = pulledCard?.rarity as Rarity | undefined;
  const rarityStyle = pulledRarity ? RARITY_STYLES[pulledRarity] : null;

  return (
    <div className="max-w-lg mx-auto text-center space-y-8 animate-fade-in relative">
      {/* Screen flash for rare+ cards */}
      {showFlash && rarityStyle?.flash && (
        <div className={`screen-flash ${rarityStyle.flash}`} />
      )}

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Header + action buttons */}
      <div className="relative z-10">
        <p className="text-[10px] font-mono text-cyan-400/60 tracking-[0.2em] uppercase mb-1">Summoning Chamber</p>
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-cyan-400">SUMMON</span> WARRIOR
        </h1>

        {/* Back / Summon Again — shown after reveal */}
        {phase === "reveal" && pulledCard && (
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => { setPhase("idle"); setPulledCard(null); }}
              className="px-6 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase
                bg-gray-800/50 text-gray-400 border border-gray-700 hover:bg-gray-700/50 hover:text-gray-300 transition-all cursor-pointer"
            >
              BACK
            </button>
            {player.free_pulls_remaining > 0 && (
              <button
                onClick={handlePull}
                className="px-6 py-2 rounded-lg text-xs font-mono font-bold tracking-wider uppercase
                  bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 transition-all cursor-pointer"
              >
                SUMMON AGAIN ({player.free_pulls_remaining})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pulls remaining */}
      <div className="relative z-10 bg-gray-900/50 border border-gray-800 rounded-lg p-4 inline-flex items-center gap-4 font-mono text-sm">
        <span className="text-gray-500">DAILY SUMMONS</span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border transition-all duration-500 ${
                i < player.free_pulls_remaining
                  ? "bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  : "bg-gray-800 border-gray-700"
              }`}
            />
          ))}
        </div>
        <span className="text-cyan-400 font-bold">{player.free_pulls_remaining}/3</span>
      </div>

      {/* Summoning circle — only during idle/channeling/converging */}
      {phase !== "reveal" && (
        <div className="relative z-10">
          <SummonCircle phase={phase} />
          {phase === "converging" && <ConvergeParticles />}
        </div>
      )}

      {/* Summon button */}
      {phase === "idle" && (
        <div className="relative z-10">
          <button
            onClick={handlePull}
            disabled={player.free_pulls_remaining <= 0}
            className={`
              relative px-10 py-4 rounded-lg text-sm font-mono font-bold tracking-wider
              transition-all duration-300 uppercase
              ${player.free_pulls_remaining <= 0
                ? "bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed"
                : "bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 hover:border-cyan-400 animate-glow-pulse cursor-pointer"
              }
            `}
          >
            {player.free_pulls_remaining <= 0 ? "NO SUMMONS LEFT" : "SUMMON"}
          </button>
        </div>
      )}

      {/* Terminal log during summoning */}
      {(phase === "channeling" || phase === "converging") && (
        <div className="relative z-10">
          <SummonLog
            step={logStep}
            language={logStep >= 5 ? pulledCard?.language : undefined}
            rarity={logStep >= 6 ? pulledCard?.rarity : undefined}
          />
        </div>
      )}

      {/* Card reveal */}
      {phase === "reveal" && pulledCard && (
        <div className="relative z-10 space-y-4">
          {/* Card with slam animation */}
          <div className="animate-card-slam max-w-[240px] mx-auto">
            <CardDisplay
              language={pulledCard.language}
              rarity={pulledCard.rarity}
              speed={pulledCard.speed}
              security={pulledCard.security}
              ecosystem={pulledCard.ecosystem}
              scalability={pulledCard.scalability}
              dev_exp={pulledCard.dev_exp}
            />
          </div>

          {/* Rarity announcement */}
          <div className="space-y-2">
            <p className={`text-lg font-mono font-bold tracking-wider ${rarityStyle?.text ?? "text-gray-400"} ${
              pulledRarity === "Legendary" || pulledRarity === "Mythic" ? "animate-rarity-glow" : ""
            }`}>
              {pulledRarity === "Mythic" ? "★ MYTHIC ★" : pulledRarity === "Legendary" ? "✦ LEGENDARY ✦" : pulledRarity?.toUpperCase()}
            </p>
            <p className="text-xs font-mono text-gray-500">
              {pulledCard.language} — {ABILITIES[pulledCard.language as Language]?.name}
            </p>
            <p className="text-[10px] font-mono text-gray-600">
              Power: {pulledCard.speed + pulledCard.security + pulledCard.ecosystem + pulledCard.scalability + pulledCard.dev_exp}
            </p>
          </div>

        </div>
      )}

      {/* Rarity drop rates */}
      {phase === "idle" && (
        <div className="relative z-10 w-full max-w-md mx-auto mt-4">
          <p className="text-[9px] font-mono text-gray-600 tracking-wider uppercase mb-3">// Drop Rates</p>
          <div className="space-y-1.5">
            {RARITY_TIERS.map((rarity, idx) => {
              const odds = RARITY_ODDS[rarity];
              const mult = RARITY_STAT_MULTIPLIERS[rarity];
              const pct = (odds * 100);
              const style = RARITY_STYLES[rarity];
              return (
                <div
                  key={rarity}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${style.border} ${style.bg} animate-slide-up`}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <span className={`text-xs font-mono font-bold w-24 text-left ${style.text}`}>{rarity}</span>
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${style.bar}`}
                      style={{ width: `${Math.max(pct, 1.5)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 w-12 text-right">{pct < 1 ? pct.toFixed(1) : pct}%</span>
                  <span className={`text-[9px] font-mono ${style.text} opacity-60 w-10 text-right`}>x{mult}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] font-mono text-gray-700 mt-2 tracking-wider">
            stat multiplier shown at right — higher rarity = stronger warriors
          </p>
        </div>
      )}
    </div>
  );
}
