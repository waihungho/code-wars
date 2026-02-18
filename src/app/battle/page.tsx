"use client";

import { useState } from "react";
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
} from "@/lib/db";
import type { Card, Dimension, BattleResult } from "@/lib/types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

export default function BattlePage() {
  const { connected } = useWallet();
  const { player, cards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [fighting, setFighting] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to battle
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        You need cards to battle — go pull some first!
      </div>
    );
  }

  const handleBattle = async () => {
    if (!selectedCard) return;

    setFighting(true);
    setBattleResult(null);

    const ai = generateAiOpponent(difficulty);
    const dimensions = pickRandomDimensions();

    const cardForBattle: Card = {
      ...selectedCard,
      devExp: selectedCard.dev_exp,
    };

    const result = resolveBattle(cardForBattle, ai.stats, dimensions);
    result.aiLanguage = ai.language;
    result.aiStats = ai.stats;

    await insertBattleLog({
      player_id: player.id,
      player_card_id: selectedCard.id,
      ai_language: ai.language,
      ai_stats: ai.stats,
      dimensions_picked: dimensions,
      result: result.result,
      xp_earned: result.xpEarned,
    });

    if (result.xpEarned > 0) {
      await updatePlayerAfterBattle(player.id, result.xpEarned);
    }

    setTimeout(() => {
      setBattleResult(result);
      setFighting(false);
      refreshPlayer();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Battle</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <option key={d} value={d}>
                Lv.{d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Select Your Card</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
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
          disabled={!selectedCard || fighting}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-lg font-bold transition-colors"
        >
          {fighting ? "Fighting..." : "Battle!"}
        </button>
      </div>

      {battleResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 animate-fade-in">
          <div
            className={`text-center text-3xl font-bold ${
              battleResult.result === "win"
                ? "text-green-400"
                : battleResult.result === "lose"
                  ? "text-red-400"
                  : "text-yellow-400"
            }`}
          >
            {battleResult.result === "win"
              ? "Victory!"
              : battleResult.result === "lose"
                ? "Defeat"
                : "Draw"}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {battleResult.dimensionsPicked.map((dim) => {
              const playerStat =
                selectedCard[dim === "devExp" ? "dev_exp" : dim];
              const aiStat = battleResult.aiStats[dim];
              const winner =
                playerStat > aiStat
                  ? "player"
                  : aiStat > playerStat
                    ? "ai"
                    : "tie";
              return (
                <div
                  key={dim}
                  className={`p-4 rounded-lg border text-center ${
                    winner === "player"
                      ? "border-green-600 bg-green-950"
                      : winner === "ai"
                        ? "border-red-600 bg-red-950"
                        : "border-yellow-600 bg-yellow-950"
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {DIMENSION_LABELS[dim]}
                  </p>
                  <div className="flex justify-between">
                    <span className="font-bold">{playerStat}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-bold">{aiStat}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-gray-400">
            vs AI {battleResult.aiLanguage} | XP earned:{" "}
            <span className="text-cyan-400">{battleResult.xpEarned}</span>
          </div>
        </div>
      )}
    </div>
  );
}
