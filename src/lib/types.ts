export type Language =
  | "Assembly"
  | "C"
  | "CPlusPlus"
  | "CSharp"
  | "Clojure"
  | "COBOL"
  | "Dart"
  | "Delphi"
  | "Elixir"
  | "Erlang"
  | "Go"
  | "Haskell"
  | "Java"
  | "JavaScript"
  | "Kotlin"
  | "Lua"
  | "MATLAB"
  | "Pascal"
  | "Perl"
  | "PHP"
  | "Python"
  | "R"
  | "Ruby"
  | "Rust"
  | "Scala"
  | "Solidity"
  | "SQL"
  | "Swift";

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

export interface Ability {
  name: string;
  flavorText: string;
  passiveDimension: Dimension;
  passiveBonus: number;
  triggeredDescription: string;
  triggerChance: number;
}

export interface AbilityTriggerResult {
  triggered: boolean;
  abilityName: string;
  description: string;
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
  dailyBattles: number;
  createdAt: string;
}

export interface BattleResult {
  playerCard: Card;
  aiLanguage: Language;
  aiStats: Stats;
  dimensionsPicked: [Dimension, Dimension, Dimension];
  result: "win" | "lose" | "draw";
  xpEarned: number;
  abilityTriggered: AbilityTriggerResult | null;
  isPracticeMode: boolean;
}

export type SlotType = "stat_boost" | "ability_enhancement" | "utility" | "ai_core" | "consumable";

export interface EquipmentItem {
  id: string;
  name: string;
  slotType: SlotType;
  effectType: string;
  effectValue: Record<string, number | string>;
  solPrice: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  playerId: string;
  itemId: string;
  purchasedAt: string;
}

export interface CardEquipment {
  id: string;
  cardId: string;
  inventoryId: string;
  slotType: SlotType;
  equippedAt: string;
}

export interface SolTransaction {
  id: string;
  playerId: string;
  txSignature: string;
  solAmount: number;
  itemId: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
}
