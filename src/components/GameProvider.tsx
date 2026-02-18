"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getOrCreatePlayer, getPlayerCards, resetDailyLimits } from "@/lib/db";
import type { Card } from "@/lib/types";

interface GameState {
  player: any | null;
  cards: any[];
  loading: boolean;
  refreshCards: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
}

const GameContext = createContext<GameState>({
  player: null,
  cards: [],
  loading: true,
  refreshCards: async () => {},
  refreshPlayer: async () => {},
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

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      refreshPlayer().then(() => setLoading(false));
    } else {
      setPlayer(null);
      setCards([]);
      setLoading(false);
    }
  }, [connected, publicKey, refreshPlayer]);

  useEffect(() => {
    if (player) {
      refreshCards();
    }
  }, [player, refreshCards]);

  return (
    <GameContext.Provider
      value={{ player, cards, loading, refreshCards, refreshPlayer }}
    >
      {children}
    </GameContext.Provider>
  );
}
