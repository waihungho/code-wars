import {
  LANGUAGES,
  RARITY_TIERS,
  RARITY_ODDS,
  BASE_STATS,
  RARITY_STAT_MULTIPLIERS,
  MAX_STAT,
} from "./constants";
import type { Language, Rarity, Stats, Card } from "./types";

export function rollRarity(roll?: number): Rarity {
  const r = roll ?? Math.random();
  let cumulative = 0;
  for (const rarity of RARITY_TIERS) {
    cumulative += RARITY_ODDS[rarity];
    if (r < cumulative) return rarity;
  }
  return "Common";
}

export function generateCardStats(language: Language, rarity: Rarity): Stats {
  const base = BASE_STATS[language];
  const multiplier = RARITY_STAT_MULTIPLIERS[rarity];
  const randomize = (val: number) => {
    const min = Math.floor(val * multiplier * 0.8);
    const max = Math.ceil(val * multiplier * 1.2);
    const result = min + Math.floor(Math.random() * (max - min + 1));
    return Math.min(result, MAX_STAT);
  };
  return {
    speed: randomize(base.speed),
    security: randomize(base.security),
    ecosystem: randomize(base.ecosystem),
    scalability: randomize(base.scalability),
    devExp: randomize(base.devExp),
  };
}

export function generateCard(playerId: string): Omit<Card, "id" | "createdAt"> {
  const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
  const rarity = rollRarity();
  const stats = generateCardStats(language, rarity);
  return {
    playerId,
    language,
    rarity,
    ...stats,
    nftMintAddress: null,
  };
}
