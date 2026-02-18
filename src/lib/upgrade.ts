import { MAX_STAT } from "./constants";
import type { Card, Dimension, Rarity } from "./types";

const BURN_MATERIALS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 3,
  Rare: 8,
  Legendary: 25,
  Mythic: 100,
};

export function getBurnMaterials(rarity: Rarity): number {
  return BURN_MATERIALS[rarity];
}

export function getUpgradeCost(currentStat: number): number {
  return Math.max(1, Math.floor(currentStat / 10) + 1);
}

export function canUpgrade(
  card: Card,
  dimension: Dimension,
  materials: number,
  xp: number
): boolean {
  const currentStat = card[dimension] as number;
  if (currentStat >= MAX_STAT) return false;
  const cost = getUpgradeCost(currentStat);
  return materials >= cost || xp >= cost;
}

export function applyUpgrade(card: Card, dimension: Dimension): Card {
  const currentStat = card[dimension] as number;
  const increment = Math.max(1, Math.floor(Math.random() * 3) + 1);
  const newStat = Math.min(currentStat + increment, MAX_STAT);
  return { ...card, [dimension]: newStat };
}
