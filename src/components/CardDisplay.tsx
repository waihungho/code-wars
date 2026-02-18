"use client";

import { DIMENSIONS } from "@/lib/constants";
import type { Dimension } from "@/lib/types";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-gray-600 bg-gray-900",
  Uncommon: "border-green-600 bg-green-950",
  Rare: "border-blue-600 bg-blue-950",
  Legendary: "border-yellow-500 bg-yellow-950",
  Mythic: "border-purple-500 bg-purple-950 shadow-lg shadow-purple-500/20",
};

const LANGUAGE_EMOJI: Record<string, string> = {
  Assembly: "🔧",
  C: "⚡",
  Rust: "🦀",
  Java: "☕",
  Go: "🐹",
  JavaScript: "🟨",
  Python: "🐍",
  Solidity: "💎",
};

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

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
}: CardDisplayProps) {
  const stats = { speed, security, ecosystem, scalability, devExp: dev_exp };
  const totalPower = speed + security + ecosystem + scalability + dev_exp;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 p-4 transition-all ${
        RARITY_COLORS[rarity] ?? RARITY_COLORS.Common
      } ${onClick ? "cursor-pointer hover:scale-105" : ""} ${
        selected ? "ring-2 ring-cyan-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{LANGUAGE_EMOJI[language] ?? "💻"}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {rarity}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-3">{language}</h3>
      {!compact && (
        <div className="space-y-1">
          {DIMENSIONS.map((dim) => (
            <div key={dim} className="flex justify-between text-sm">
              <span className="text-gray-400">{DIMENSION_LABELS[dim]}</span>
              <span className="font-mono">{stats[dim]}</span>
            </div>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-cyan-400">{totalPower}</span>
          </div>
        </div>
      )}
    </div>
  );
}
