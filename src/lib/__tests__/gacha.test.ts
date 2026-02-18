import { rollRarity, generateCardStats, generateCard } from "../gacha";
import {
  RARITY_TIERS,
  BASE_STATS,
  RARITY_STAT_MULTIPLIERS,
  MAX_STAT,
} from "../constants";

describe("Gacha Engine", () => {
  describe("rollRarity", () => {
    test("returns a valid rarity", () => {
      for (let i = 0; i < 100; i++) {
        const rarity = rollRarity();
        expect(RARITY_TIERS).toContain(rarity);
      }
    });

    test("returns Common for roll 0.0", () => {
      expect(rollRarity(0.0)).toBe("Common");
    });

    test("returns Common for roll 0.49", () => {
      expect(rollRarity(0.49)).toBe("Common");
    });

    test("returns Uncommon for roll 0.5", () => {
      expect(rollRarity(0.5)).toBe("Uncommon");
    });

    test("returns Mythic for roll 0.999", () => {
      expect(rollRarity(0.999)).toBe("Mythic");
    });
  });

  describe("generateCardStats", () => {
    test("stats are within expected range for Common", () => {
      const stats = generateCardStats("Rust", "Common");
      expect(stats.speed).toBeGreaterThanOrEqual(
        Math.floor(BASE_STATS.Rust.speed * RARITY_STAT_MULTIPLIERS.Common * 0.8)
      );
      expect(stats.speed).toBeLessThanOrEqual(
        Math.ceil(BASE_STATS.Rust.speed * RARITY_STAT_MULTIPLIERS.Common * 1.2)
      );
    });

    test("Mythic stats are higher than Common on average", () => {
      let mythicTotal = 0;
      let commonTotal = 0;
      for (let i = 0; i < 100; i++) {
        const mythic = generateCardStats("Python", "Mythic");
        const common = generateCardStats("Python", "Common");
        mythicTotal +=
          mythic.speed +
          mythic.security +
          mythic.ecosystem +
          mythic.scalability +
          mythic.devExp;
        commonTotal +=
          common.speed +
          common.security +
          common.ecosystem +
          common.scalability +
          common.devExp;
      }
      expect(mythicTotal / 100).toBeGreaterThan(commonTotal / 100);
    });

    test("no stat exceeds MAX_STAT", () => {
      for (let i = 0; i < 100; i++) {
        const stats = generateCardStats("Assembly", "Mythic");
        expect(stats.speed).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.security).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.ecosystem).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.scalability).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.devExp).toBeLessThanOrEqual(MAX_STAT);
      }
    });
  });

  describe("generateCard", () => {
    test("returns a card with all required fields", () => {
      const card = generateCard("player-123");
      expect(card.playerId).toBe("player-123");
      expect(card.language).toBeDefined();
      expect(card.rarity).toBeDefined();
      expect(card.speed).toBeGreaterThan(0);
      expect(card.security).toBeGreaterThan(0);
      expect(card.ecosystem).toBeGreaterThan(0);
      expect(card.scalability).toBeGreaterThan(0);
      expect(card.devExp).toBeGreaterThan(0);
      expect(card.nftMintAddress).toBeNull();
    });
  });
});
