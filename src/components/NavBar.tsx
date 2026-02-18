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
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/gacha", label: "Gacha" },
  { href: "/battle", label: "Battle" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { player } = useGame();

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-cyan-400">
            Code Wars
          </Link>
          <div className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? "text-cyan-400 font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {player && (
            <span className="text-sm text-gray-400">
              XP: {player.xp} | Materials: {player.materials}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
