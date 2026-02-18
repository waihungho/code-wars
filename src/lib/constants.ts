import type { Language, Rarity, Dimension, Stats } from "./types";

export const LANGUAGES: Language[] = [
  "Assembly",
  "C",
  "Rust",
  "Java",
  "Go",
  "JavaScript",
  "Python",
  "Solidity",
];

export const DIMENSIONS: Dimension[] = [
  "speed",
  "security",
  "ecosystem",
  "scalability",
  "devExp",
];

export const RARITY_TIERS: Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Legendary",
  "Mythic",
];

export const BASE_STATS: Record<Language, Stats> = {
  Assembly: { speed: 10, security: 3, ecosystem: 2, scalability: 4, devExp: 1 },
  C: { speed: 9, security: 2, ecosystem: 7, scalability: 5, devExp: 3 },
  Rust: { speed: 9, security: 10, ecosystem: 6, scalability: 8, devExp: 4 },
  Java: { speed: 6, security: 7, ecosystem: 10, scalability: 8, devExp: 5 },
  Go: { speed: 7, security: 6, ecosystem: 6, scalability: 9, devExp: 7 },
  JavaScript: { speed: 5, security: 3, ecosystem: 10, scalability: 6, devExp: 8 },
  Python: { speed: 3, security: 4, ecosystem: 10, scalability: 4, devExp: 10 },
  Solidity: { speed: 4, security: 5, ecosystem: 5, scalability: 3, devExp: 5 },
};

export const RARITY_ODDS: Record<Rarity, number> = {
  Common: 0.5,
  Uncommon: 0.3,
  Rare: 0.15,
  Legendary: 0.045,
  Mythic: 0.005,
};

export const RARITY_STAT_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 1.2,
  Rare: 1.5,
  Legendary: 2.0,
  Mythic: 3.0,
};

export const MAX_STAT = 1000;
export const FREE_PULLS_PER_DAY = 3;
export const BATTLE_DIMENSIONS_COUNT = 3;
export const MIN_BATTLES_FOR_WINRATE = 10;
