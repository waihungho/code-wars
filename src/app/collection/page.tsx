"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { DIMENSIONS } from "@/lib/constants";
import {
  getBurnMaterials,
  getUpgradeCost,
  applyUpgrade,
} from "@/lib/upgrade";
import {
  deleteCard,
  updateCardStats,
  updatePlayerMaterials,
} from "@/lib/db";
import type { Card, Dimension } from "@/lib/types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

export default function CollectionPage() {
  const { connected } = useWallet();
  const { player, cards, refreshCards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [mode, setMode] = useState<"view" | "upgrade" | "burn">("view");

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to view your collection
      </div>
    );
  }

  const handleBurn = async (card: any) => {
    const materials = getBurnMaterials(card.rarity);
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

    const cardForUpgrade: Card = {
      ...card,
      devExp: card.dev_exp,
    };
    const upgraded = applyUpgrade(cardForUpgrade, dimension);
    await updateCardStats(card.id, {
      [statKey]: upgraded[dimension],
    });
    await refreshCards();
    await refreshPlayer();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Collection ({cards.length})</h1>
        <div className="flex gap-2">
          <ModeButton
            active={mode === "view"}
            onClick={() => setMode("view")}
            label="View"
          />
          <ModeButton
            active={mode === "upgrade"}
            onClick={() => setMode("upgrade")}
            label="Upgrade"
          />
          <ModeButton
            active={mode === "burn"}
            onClick={() => setMode("burn")}
            label="Burn"
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No cards yet — go pull some!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>
      )}

      {selectedCard && mode === "upgrade" && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">
            Upgrade {selectedCard.language}
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {DIMENSIONS.map((dim) => {
              const statKey = dim === "devExp" ? "dev_exp" : dim;
              const cost = getUpgradeCost(selectedCard[statKey]);
              return (
                <button
                  key={dim}
                  onClick={() => handleUpgrade(selectedCard, dim)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                >
                  <p className="text-xs text-gray-400">
                    {DIMENSION_LABELS[dim]}
                  </p>
                  <p className="font-bold">{selectedCard[statKey]}</p>
                  <p className="text-xs text-cyan-400">Cost: {cost}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCard && mode === "burn" && (
        <div className="bg-gray-900 border border-red-900 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">
            Burn {selectedCard.language} ({selectedCard.rarity})?
          </h2>
          <p className="text-gray-400">
            You will receive{" "}
            <span className="text-cyan-400 font-bold">
              {getBurnMaterials(selectedCard.rarity)}
            </span>{" "}
            materials
          </p>
          <button
            onClick={() => handleBurn(selectedCard)}
            className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition-colors"
          >
            Burn Card
          </button>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-cyan-600 text-white"
          : "bg-gray-800 text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
