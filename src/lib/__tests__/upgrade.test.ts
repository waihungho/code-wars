import {
  getBurnMaterials,
  getUpgradeCost,
  canUpgrade,
  applyUpgrade,
} from "../upgrade";
import { MAX_STAT } from "../constants";
import type { Card, Dimension } from "../types";

const mockCard: Card = {
  id: "card-1",
  playerId: "player-1",
  language: "Python",
  rarity: "Common",
  speed: 3,
  security: 4,
  ecosystem: 10,
  scalability: 4,
  devExp: 10,
  nftMintAddress: null,
  createdAt: new Date().toISOString(),
};

describe("Upgrade Engine", () => {
  describe("getBurnMaterials", () => {
    test("higher rarity gives more materials", () => {
      expect(getBurnMaterials("Legendary")).toBeGreaterThan(
        getBurnMaterials("Common")
      );
    });

    test("Common gives 1 material", () => {
      expect(getBurnMaterials("Common")).toBe(1);
    });
  });

  describe("getUpgradeCost", () => {
    test("cost increases with current stat", () => {
      expect(getUpgradeCost(50)).toBeGreaterThan(getUpgradeCost(10));
    });

    test("cost is at least 1", () => {
      expect(getUpgradeCost(1)).toBeGreaterThanOrEqual(1);
    });
  });

  describe("canUpgrade", () => {
    test("can upgrade if stat is below max and have enough resources", () => {
      expect(canUpgrade(mockCard, "speed", 100, 0)).toBe(true);
    });

    test("cannot upgrade if stat is at max", () => {
      const maxCard = { ...mockCard, speed: MAX_STAT };
      expect(canUpgrade(maxCard, "speed", 9999, 0)).toBe(false);
    });
  });

  describe("applyUpgrade", () => {
    test("increases the chosen dimension by upgrade amount", () => {
      const upgraded = applyUpgrade(mockCard, "speed");
      expect(upgraded.speed).toBeGreaterThan(mockCard.speed);
    });

    test("does not modify other dimensions", () => {
      const upgraded = applyUpgrade(mockCard, "speed");
      expect(upgraded.security).toBe(mockCard.security);
      expect(upgraded.ecosystem).toBe(mockCard.ecosystem);
    });

    test("does not exceed MAX_STAT", () => {
      const nearMax = { ...mockCard, speed: MAX_STAT - 1 };
      const upgraded = applyUpgrade(nearMax, "speed");
      expect(upgraded.speed).toBeLessThanOrEqual(MAX_STAT);
    });
  });
});
