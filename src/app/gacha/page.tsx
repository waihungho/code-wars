"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { generateCard } from "@/lib/gacha";
import { insertCard, decrementPulls } from "@/lib/db";

export default function GachaPage() {
  const { connected } = useWallet();
  const { player, refreshCards, refreshPlayer } = useGame();
  const [pulledCard, setPulledCard] = useState<any | null>(null);
  const [pulling, setPulling] = useState(false);
  const [revealing, setRevealing] = useState(false);

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to pull cards
      </div>
    );
  }

  const handlePull = async () => {
    if (player.free_pulls_remaining <= 0) return;

    setPulling(true);
    setPulledCard(null);
    setRevealing(false);

    try {
      await decrementPulls(player.id);

      const cardData = generateCard(player.id);
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

      setTimeout(() => {
        setPulledCard(saved);
        setRevealing(true);
        setPulling(false);
      }, 1500);

      await refreshPlayer();
      await refreshCards();
    } catch (err) {
      console.error("Pull failed:", err);
      setPulling(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <h1 className="text-3xl font-bold">Gacha — Pull Cards</h1>

      <p className="text-gray-400">
        Free pulls remaining today:{" "}
        <span className="text-cyan-400 font-bold">
          {player.free_pulls_remaining}
        </span>
      </p>

      <button
        onClick={handlePull}
        disabled={pulling || player.free_pulls_remaining <= 0}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-lg font-bold transition-colors"
      >
        {pulling ? "Pulling..." : "Pull Card"}
      </button>

      {pulling && !pulledCard && (
        <div className="animate-pulse text-4xl">🎴</div>
      )}

      {revealing && pulledCard && (
        <div className="animate-fade-in max-w-xs mx-auto">
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
      )}
    </div>
  );
}
