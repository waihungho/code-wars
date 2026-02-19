"use client";

import Image from "next/image";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useGame } from "@/components/GameProvider";
import { LANGUAGES, getCardImagePath } from "@/lib/constants";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function HomePage() {
  const { connected } = useWallet();
  const { player, cards, loading } = useGame();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <p className="text-xs font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
            Programming Language Card Battle
          </p>
          <h1 className="text-6xl md:text-7xl font-bold font-mono tracking-tight">
            <span className="text-cyan-400">CODE</span>
            <span className="text-white">WARS</span>
          </h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
            Collect legendary programming language warriors. Upgrade their power.
            Battle AI opponents. Mint the rarest as Solana NFTs.
          </p>
        </div>

        {/* Scrolling card showcase */}
        <div className="w-full overflow-hidden -mx-4">
          <div className="flex gap-4 animate-[scroll_45s_linear_infinite] hover:[animation-play-state:paused]"
               style={{ width: "max-content" }}>
            {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
              <div key={`${lang}-${i}`} className="relative w-36 h-48 rounded-lg overflow-hidden border border-gray-800/50 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                <Image
                  src={`/cards/${lang}.png`}
                  alt={lang}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-300">{lang}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mythic card showcase — blurred to tease */}
        <div className="w-full space-y-3">
          <p className="text-[10px] font-mono text-fuchsia-400/60 tracking-[0.2em] uppercase text-center">
            Mythic Collection — 0.1% Drop Rate
          </p>
          <div className="w-full overflow-hidden -mx-4">
            <div className="flex gap-4 animate-[scroll-reverse_50s_linear_infinite] hover:[animation-play-state:paused]"
                 style={{ width: "max-content" }}>
              {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
                <div key={`mythic-${lang}-${i}`} className="relative w-36 h-48 rounded-lg overflow-hidden shrink-0 border-[2px] rarity-mythic">
                  <Image
                    src={getCardImagePath(lang, "Mythic")}
                    alt={`Mythic ${lang}`}
                    fill
                    className="object-cover blur-[2px] scale-105"
                    sizes="144px"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-purple-600 text-purple-100 animate-pulse">
                    SSR
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg text-fuchsia-400/60">?</span>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-fuchsia-400/50">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <WalletMultiButton />

        <p className="text-[10px] font-mono text-gray-700 tracking-wider">
          CONNECT WALLET TO BEGIN // SOLANA DEVNET
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-500 tracking-wider">LOADING COMMANDER DATA...</p>
        </div>
      </div>
    );
  }

  const totalPower = cards.reduce(
    (sum: number, c: any) =>
      sum + c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp,
    0
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero banner */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-xs font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
          Programming Language Card Battle
        </p>
        <h1 className="text-5xl md:text-6xl font-bold font-mono tracking-tight">
          <span className="text-cyan-400">CODE</span>
          <span className="text-white">WARS</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
          Collect legendary programming language warriors. Upgrade their power.
          Battle AI opponents. Mint the rarest as Solana NFTs.
        </p>
      </div>

      {/* Scrolling card showcase */}
      <div className="w-full overflow-hidden -mx-4">
        <div className="flex gap-4 animate-[scroll_45s_linear_infinite] hover:[animation-play-state:paused]"
             style={{ width: "max-content" }}>
          {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
            <div key={`${lang}-${i}`} className="relative w-36 h-48 rounded-lg overflow-hidden border border-gray-800/50 shrink-0 opacity-70 hover:opacity-100 transition-opacity">
              <Image
                src={`/cards/${lang}.png`}
                alt={lang}
                fill
                className="object-cover"
                sizes="144px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono text-gray-300">{lang}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mythic card showcase — blurred to tease */}
      <div className="w-full space-y-3">
        <p className="text-[10px] font-mono text-fuchsia-400/60 tracking-[0.2em] uppercase text-center">
          Mythic Collection — 0.1% Drop Rate
        </p>
        <div className="w-full overflow-hidden -mx-4">
          <div className="flex gap-4 animate-[scroll-reverse_50s_linear_infinite] hover:[animation-play-state:paused]"
               style={{ width: "max-content" }}>
            {[...LANGUAGES, ...LANGUAGES].map((lang, i) => (
              <div key={`mythic-${lang}-${i}`} className="relative w-36 h-48 rounded-lg overflow-hidden shrink-0 border-[2px] rarity-mythic">
                <Image
                  src={getCardImagePath(lang, "Mythic")}
                  alt={`Mythic ${lang}`}
                  fill
                  className="object-cover blur-[2px] scale-105"
                  sizes="144px"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-purple-600 text-purple-100 animate-pulse">
                  SSR
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg text-fuchsia-400/60">?</span>
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-fuchsia-400/50">{lang}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commander Dashboard */}
      <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-mono text-cyan-400/60 tracking-[0.2em] uppercase mb-1">Commander Dashboard</p>
          <h1 className="text-2xl font-bold font-mono">
            Welcome back, <span className="text-cyan-400">Commander</span>
          </h1>
        </div>
        <p className="text-[10px] font-mono text-gray-600">
          {player?.wallet_address?.slice(0, 4)}...{player?.wallet_address?.slice(-4)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatBox label="CARDS" value={cards.length} accent="cyan" />
        <StatBox label="POWER" value={totalPower} accent="purple" />
        <StatBox label="XP" value={player?.xp ?? 0} accent="cyan" />
        <StatBox label="MATERIALS" value={player?.materials ?? 0} accent="amber" />
        <StatBox label="PULLS" value={player?.free_pulls_remaining ?? 0} accent="green" />
      </div>

      {/* Recent cards */}
      {cards.length > 0 && (
        <div>
          <p className="text-[10px] font-mono text-gray-500 tracking-wider mb-3 uppercase">
            // Recent acquisitions
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {cards.slice(0, 5).map((card: any) => (
              <div key={card.id} className="relative w-28 h-36 rounded-lg overflow-hidden border border-gray-800 shrink-0">
                <Image
                  src={getCardImagePath(card.language, card.rarity)}
                  alt={card.language}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-1.5 left-2 right-2">
                  <p className="text-[9px] font-mono text-gray-400">{card.rarity}</p>
                  <p className="text-xs font-bold text-white leading-tight">{card.language}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: number; accent: string }) {
  const colors: Record<string, string> = {
    cyan: "border-cyan-900/50 text-cyan-400",
    purple: "border-purple-900/50 text-purple-400",
    amber: "border-amber-900/50 text-amber-400",
    green: "border-green-900/50 text-green-400",
    red: "border-red-900/50 text-red-400",
  };
  const c = colors[accent] ?? colors.cyan;
  return (
    <div className={`bg-gray-900/50 border ${c.split(" ")[0]} rounded-lg p-3`}>
      <p className="text-[10px] font-mono text-gray-500 tracking-wider">{label}</p>
      <p className={`text-xl font-bold font-mono ${c.split(" ")[1]}`}>{value}</p>
    </div>
  );
}

