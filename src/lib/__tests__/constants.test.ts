import {
  LANGUAGES,
  BASE_STATS,
  RARITY_TIERS,
  RARITY_ODDS,
  DIMENSIONS,
  MAX_STAT,
  FREE_PULLS_PER_DAY,
  RARITY_STAT_MULTIPLIERS,
} from "../constants";

describe("Game Constants", () => {
  test("has 8 languages", () => {
    expect(LANGUAGES).toHaveLength(8);
    expect(LANGUAGES).toContain("Assembly");
    expect(LANGUAGES).toContain("C");
    expect(LANGUAGES).toContain("Rust");
    expect(LANGUAGES).toContain("Java");
    expect(LANGUAGES).toContain("Go");
    expect(LANGUAGES).toContain("JavaScript");
    expect(LANGUAGES).toContain("Python");
    expect(LANGUAGES).toContain("Solidity");
  });

  test("has 5 dimensions", () => {
    expect(DIMENSIONS).toHaveLength(5);
    expect(DIMENSIONS).toContain("speed");
    expect(DIMENSIONS).toContain("security");
    expect(DIMENSIONS).toContain("ecosystem");
    expect(DIMENSIONS).toContain("scalability");
    expect(DIMENSIONS).toContain("devExp");
  });

  test("base stats exist for every language and dimension", () => {
    for (const lang of LANGUAGES) {
      expect(BASE_STATS[lang]).toBeDefined();
      for (const dim of DIMENSIONS) {
        const stat = BASE_STATS[lang][dim];
        expect(stat).toBeGreaterThanOrEqual(1);
        expect(stat).toBeLessThanOrEqual(10);
      }
    }
  });

  test("rarity odds sum to 1", () => {
    const totalOdds = RARITY_TIERS.reduce(
      (sum, rarity) => sum + RARITY_ODDS[rarity],
      0
    );
    expect(totalOdds).toBeCloseTo(1.0);
  });

  test("max stat is 1000", () => {
    expect(MAX_STAT).toBe(1000);
  });

  test("free pulls per day is 3", () => {
    expect(FREE_PULLS_PER_DAY).toBe(3);
  });

  test("rarity multipliers increase with rarity", () => {
    expect(RARITY_STAT_MULTIPLIERS.Common).toBe(1);
    expect(RARITY_STAT_MULTIPLIERS.Uncommon).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Common
    );
    expect(RARITY_STAT_MULTIPLIERS.Rare).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Uncommon
    );
    expect(RARITY_STAT_MULTIPLIERS.Legendary).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Rare
    );
    expect(RARITY_STAT_MULTIPLIERS.Mythic).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Legendary
    );
  });
});
