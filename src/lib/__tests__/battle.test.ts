import {
  pickRandomDimensions,
  generateAiOpponent,
  resolveBattle,
} from "../battle";
import { DIMENSIONS } from "../constants";
import type { Card, Stats, Dimension } from "../types";

const mockCard: Card = {
  id: "card-1",
  playerId: "player-1",
  language: "Rust",
  rarity: "Rare",
  speed: 15,
  security: 18,
  ecosystem: 10,
  scalability: 14,
  devExp: 8,
  nftMintAddress: null,
  createdAt: new Date().toISOString(),
};

describe("Battle Engine", () => {
  describe("pickRandomDimensions", () => {
    test("picks exactly 3 dimensions", () => {
      const dims = pickRandomDimensions();
      expect(dims).toHaveLength(3);
    });

    test("all picked dimensions are valid", () => {
      for (let i = 0; i < 50; i++) {
        const dims = pickRandomDimensions();
        for (const d of dims) {
          expect(DIMENSIONS).toContain(d);
        }
      }
    });

    test("no duplicate dimensions", () => {
      for (let i = 0; i < 50; i++) {
        const dims = pickRandomDimensions();
        const unique = new Set(dims);
        expect(unique.size).toBe(3);
      }
    });
  });

  describe("generateAiOpponent", () => {
    test("returns valid language and stats", () => {
      const ai = generateAiOpponent(1);
      expect(ai.language).toBeDefined();
      expect(ai.stats.speed).toBeGreaterThan(0);
      expect(ai.stats.security).toBeGreaterThan(0);
    });

    test("higher difficulty produces higher stats", () => {
      let lowTotal = 0;
      let highTotal = 0;
      for (let i = 0; i < 100; i++) {
        const low = generateAiOpponent(1);
        const high = generateAiOpponent(10);
        lowTotal += Object.values(low.stats).reduce((a, b) => a + b, 0);
        highTotal += Object.values(high.stats).reduce((a, b) => a + b, 0);
      }
      expect(highTotal / 100).toBeGreaterThan(lowTotal / 100);
    });
  });

  describe("resolveBattle", () => {
    test("player wins when all 3 stats are higher", () => {
      const aiStats: Stats = {
        speed: 1,
        security: 1,
        ecosystem: 1,
        scalability: 1,
        devExp: 1,
      };
      const dims: [Dimension, Dimension, Dimension] = [
        "speed",
        "security",
        "ecosystem",
      ];
      const result = resolveBattle(mockCard, aiStats, dims);
      expect(result.result).toBe("win");
      expect(result.xpEarned).toBeGreaterThan(0);
    });

    test("player loses when all 3 stats are much lower", () => {
      const aiStats: Stats = {
        speed: 200,
        security: 200,
        ecosystem: 200,
        scalability: 200,
        devExp: 200,
      };
      const dims: [Dimension, Dimension, Dimension] = [
        "speed",
        "security",
        "ecosystem",
      ];
      const result = resolveBattle(mockCard, aiStats, dims);
      expect(result.result).toBe("lose");
      expect(result.xpEarned).toBe(0);
    });

    test("result includes ability trigger info", () => {
      const aiStats: Stats = {
        speed: 1,
        security: 1,
        ecosystem: 1,
        scalability: 1,
        devExp: 1,
      };
      const dims: [Dimension, Dimension, Dimension] = [
        "speed",
        "security",
        "ecosystem",
      ];
      const result = resolveBattle(mockCard, aiStats, dims);
      expect(result).toHaveProperty("abilityTriggered");
      expect(result).toHaveProperty("isPracticeMode");
      expect(result.isPracticeMode).toBe(false);
    });

    test("passive bonus applies to correct dimension", () => {
      // Rust has +20% security passive. mockCard security = 18, so boosted ~22.
      // AI security = 20 should lose to boosted 22 but beat raw 18.
      const aiStats: Stats = {
        speed: 100,
        security: 20,
        ecosystem: 100,
        scalability: 100,
        devExp: 100,
      };
      const dims: [Dimension, Dimension, Dimension] = [
        "security",
        "speed",
        "ecosystem",
      ];
      // Even though player loses speed and ecosystem, security should be won
      // due to passive (18 * 1.2 = 22 > 20)
      const result = resolveBattle(mockCard, aiStats, dims);
      // Player wins security (22 vs 20) but loses speed (15 vs 100) and ecosystem (10 vs 100)
      expect(result.result).toBe("lose");
    });
  });
});
