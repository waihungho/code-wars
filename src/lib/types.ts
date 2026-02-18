export type Language =
  | "Assembly"
  | "C"
  | "Rust"
  | "Java"
  | "Go"
  | "JavaScript"
  | "Python"
  | "Solidity";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary" | "Mythic";

export type Dimension =
  | "speed"
  | "security"
  | "ecosystem"
  | "scalability"
  | "devExp";

export interface Stats {
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  devExp: number;
}

export interface Card {
  id: string;
  playerId: string;
  language: Language;
  rarity: Rarity;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  devExp: number;
  nftMintAddress: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  walletAddress: string;
  freePullsRemaining: number;
  lastPullReset: string;
  xp: number;
  createdAt: string;
}

export interface BattleResult {
  playerCard: Card;
  aiLanguage: Language;
  aiStats: Stats;
  dimensionsPicked: [Dimension, Dimension, Dimension];
  result: "win" | "lose" | "draw";
  xpEarned: number;
}
