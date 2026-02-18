"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getOrCreatePlayer, getPlayerCards, getPlayerInventory, resetDailyLimits } from "@/lib/db";
import type { Card } from "@/lib/types";

interface GameState {
  player: any | null;
  cards: any[];
  inventory: any[];
  loading: boolean;
  refreshCards: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
  refreshInventory: () => Promise<void>;
}

const GameContext = createContext<GameState>({
  player: null,
  cards: [],
  inventory: [],
  loading: true,
  refreshCards: async () => {},
  refreshPlayer: async () => {},
  refreshInventory: async () => {},
});

export function useGame() {
  return useContext(GameContext);
}

export default function GameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { publicKey, connected } = useWallet();
  const [player, setPlayer] = useState<any | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPlayer = useCallback(async () => {
    if (!publicKey) return;
    const p = await getOrCreatePlayer(publicKey.toBase58());
    await resetDailyLimits(p.id);
    const updated = await getOrCreatePlayer(publicKey.toBase58());
    setPlayer(updated);
  }, [publicKey]);

  const refreshCards = useCallback(async () => {
    if (!player) return;
    const c = await getPlayerCards(player.id);
    setCards(c ?? []);
  }, [player]);

  const refreshInventory = useCallback(async () => {
    if (!player) return;
    const inv = await getPlayerInventory(player.id);
    setInventory(inv ?? []);
  }, [player]);

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      refreshPlayer().then(() => setLoading(false));
    } else {
      setPlayer(null);
      setCards([]);
      setInventory([]);
      setLoading(false);
    }
  }, [connected, publicKey, refreshPlayer]);

  useEffect(() => {
    if (player) {
      refreshCards();
      refreshInventory();
    }
  }, [player, refreshCards, refreshInventory]);

  return (
    <GameContext.Provider
      value={{ player, cards, inventory, loading, refreshCards, refreshPlayer, refreshInventory }}
    >
      {children}
    </GameContext.Provider>
  );
}
