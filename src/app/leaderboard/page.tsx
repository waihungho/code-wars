"use client";

import { useState, useEffect } from "react";
import {
  getLeaderboardByWins,
  getLeaderboardByWinRate,
  getLeaderboardByStrongestCard,
} from "@/lib/db";

type Tab = "wins" | "winRate" | "strongest";

const TABS: { key: Tab; label: string }[] = [
  { key: "wins", label: "TOP WINS" },
  { key: "winRate", label: "WIN RATE" },
  { key: "strongest", label: "STRONGEST" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("wins");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        let result;
        switch (tab) {
          case "wins":
            result = await getLeaderboardByWins();
            break;
          case "winRate":
            result = await getLeaderboardByWinRate();
            break;
          case "strongest":
            result = await getLeaderboardByStrongestCard();
            break;
        }
        setData(result ?? []);
      } catch {
        setData([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [tab]);

  const truncateWallet = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-amber-400/60 tracking-[0.2em] uppercase mb-1">Global Rankings</p>
        <h1 className="text-2xl font-bold font-mono">
          <span className="text-amber-400">RANKS</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all border ${
              tab === t.key
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-gray-500 tracking-wider mt-3">LOADING RANKS...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xs font-mono text-gray-600 tracking-wider">// NO DATA</p>
          <p className="text-gray-500 mt-2 text-sm">Battle to populate the leaderboard</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] font-mono text-gray-500 tracking-wider uppercase">
                <th className="p-3 text-left w-12">RANK</th>
                <th className="p-3 text-left">WALLET</th>
                {tab === "wins" && <th className="p-3 text-right">WINS</th>}
                {tab === "winRate" && (
                  <>
                    <th className="p-3 text-right">RATE</th>
                    <th className="p-3 text-right">BATTLES</th>
                  </>
                )}
                {tab === "strongest" && (
                  <>
                    <th className="p-3 text-right">LANG</th>
                    <th className="p-3 text-right">POWER</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {data.map((row: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-gray-800/30 hover:bg-white/[0.02] transition-colors"
                >
                  <td className={`p-3 font-bold ${
                    i === 0 ? "text-amber-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-orange-700" : "text-gray-600"
                  }`}>
                    {i < 3 ? ["I", "II", "III"][i] : i + 1}
                  </td>
                  <td className="p-3 text-gray-400 text-xs">
                    {truncateWallet(row.wallet_address)}
                  </td>
                  {tab === "wins" && (
                    <td className="p-3 text-right font-bold text-amber-400">
                      {row.total_wins}
                    </td>
                  )}
                  {tab === "winRate" && (
                    <>
                      <td className="p-3 text-right font-bold text-green-400">
                        {(row.win_rate * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-gray-500 text-xs">
                        {row.total_battles}
                      </td>
                    </>
                  )}
                  {tab === "strongest" && (
                    <>
                      <td className="p-3 text-right text-gray-400 text-xs">{row.language}</td>
                      <td className="p-3 text-right font-bold text-cyan-400">
                        {row.total_stats}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
