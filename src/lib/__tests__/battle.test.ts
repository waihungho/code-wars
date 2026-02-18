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

    test("player loses when all 3 stats are lower", () => {
      const aiStats: Stats = {
        speed: 100,
        security: 100,
        ecosystem: 100,
        scalability: 100,
        devExp: 100,
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

    test("draw when stats are equal on all picked dimensions", () => {
      const aiStats: Stats = {
        speed: 15,
        security: 18,
        ecosystem: 10,
        scalability: 14,
        devExp: 8,
      };
      const dims: [Dimension, Dimension, Dimension] = [
        "speed",
        "security",
        "ecosystem",
      ];
      const result = resolveBattle(mockCard, aiStats, dims);
      expect(result.result).toBe("draw");
    });
  });
});
