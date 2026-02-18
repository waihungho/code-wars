"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useGame } from "./GameProvider";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/", label: "HQ", icon: ">" },
  { href: "/collection", label: "VAULT", icon: "#" },
  { href: "/gacha", label: "SUMMON", icon: "*" },
  { href: "/battle", label: "ARENA", icon: "!" },
  { href: "/leaderboard", label: "RANKS", icon: "^" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { player } = useGame();

  return (
    <nav className="border-b border-cyan-900/30 bg-gray-950/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-cyan-400 font-mono text-xs opacity-50 group-hover:opacity-100 transition-opacity">[</span>
            <span className="text-lg font-bold font-mono tracking-tight text-cyan-400">
              CODE<span className="text-white">WARS</span>
            </span>
            <span className="text-cyan-400 font-mono text-xs opacity-50 group-hover:opacity-100 transition-opacity">]</span>
          </Link>
          <div className="flex gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all ${
                  pathname === item.href
                    ? "bg-cyan-400/10 text-cyan-400 border border-cyan-400/30"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="opacity-50 mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {player && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-400/70">
                XP <span className="text-cyan-300 font-bold">{player.xp}</span>
              </span>
              <span className="text-gray-700">|</span>
              <span className="text-amber-400/70">
                MAT <span className="text-amber-300 font-bold">{player.materials}</span>
              </span>
            </div>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
