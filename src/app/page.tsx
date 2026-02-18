"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useGame } from "@/components/GameProvider";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <h1 className="text-5xl font-bold text-center">
          <span className="text-cyan-400">Code Wars</span>
        </h1>
        <p className="text-xl text-gray-400 text-center max-w-md">
          Collect, upgrade, and battle programming language cards on Solana
        </p>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const totalBattleStats = cards.reduce(
    (sum: number, c: any) =>
      sum + c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp,
    0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, Commander</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatBox label="Cards Owned" value={cards.length} />
        <StatBox label="Total XP" value={player?.xp ?? 0} />
        <StatBox label="Materials" value={player?.materials ?? 0} />
        <StatBox label="Total Power" value={totalBattleStats} />
        <StatBox
          label="Free Pulls Left"
          value={player?.free_pulls_remaining ?? 0}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}
