"use client";

import { useState, useEffect } from "react";
import {
  getLeaderboardByWins,
  getLeaderboardByWinRate,
  getLeaderboardByStrongestCard,
} from "@/lib/db";

type Tab = "wins" | "winRate" | "strongest";

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
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="flex gap-2">
        <TabButton
          active={tab === "wins"}
          onClick={() => setTab("wins")}
          label="Top Wins"
        />
        <TabButton
          active={tab === "winRate"}
          onClick={() => setTab("winRate")}
          label="Best Win Rate"
        />
        <TabButton
          active={tab === "strongest"}
          onClick={() => setTab("strongest")}
          label="Strongest Card"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400 text-center">No data yet</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-sm text-gray-400">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Wallet</th>
                {tab === "wins" && (
                  <th className="p-3 text-right">Total Wins</th>
                )}
                {tab === "winRate" && (
                  <>
                    <th className="p-3 text-right">Win Rate</th>
                    <th className="p-3 text-right">Battles</th>
                  </>
                )}
                {tab === "strongest" && (
                  <>
                    <th className="p-3 text-right">Language</th>
                    <th className="p-3 text-right">Total Stats</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="p-3 text-cyan-400 font-bold">{i + 1}</td>
                  <td className="p-3 font-mono text-sm">
                    {truncateWallet(row.wallet_address)}
                  </td>
                  {tab === "wins" && (
                    <td className="p-3 text-right font-bold">
                      {row.total_wins}
                    </td>
                  )}
                  {tab === "winRate" && (
                    <>
                      <td className="p-3 text-right font-bold">
                        {(row.win_rate * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-gray-400">
                        {row.total_battles}
                      </td>
                    </>
                  )}
                  {tab === "strongest" && (
                    <>
                      <td className="p-3 text-right">{row.language}</td>
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

function TabButton({
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
