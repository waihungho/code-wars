import { describe, test, expect, vi } from "vitest";
import {
  getOrCreatePlayer,
  getPlayerCards,
  insertCard,
  deleteCard,
  updatePlayerAfterBattle,
  insertBattleLog,
  updateCardStats,
  updatePlayerMaterials,
  resetDailyPulls,
  getLeaderboardByWins,
  getLeaderboardByWinRate,
  getLeaderboardByStrongestCard,
} from "../db";

// Mock supabase
vi.mock("../supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    rpc: vi.fn(),
  },
}));

describe("DB Access Layer", () => {
  test("getOrCreatePlayer is a function", () => {
    expect(typeof getOrCreatePlayer).toBe("function");
  });

  test("getPlayerCards is a function", () => {
    expect(typeof getPlayerCards).toBe("function");
  });

  test("insertCard is a function", () => {
    expect(typeof insertCard).toBe("function");
  });

  test("deleteCard is a function", () => {
    expect(typeof deleteCard).toBe("function");
  });

  test("updatePlayerAfterBattle is a function", () => {
    expect(typeof updatePlayerAfterBattle).toBe("function");
  });

  test("insertBattleLog is a function", () => {
    expect(typeof insertBattleLog).toBe("function");
  });

  test("updateCardStats is a function", () => {
    expect(typeof updateCardStats).toBe("function");
  });

  test("updatePlayerMaterials is a function", () => {
    expect(typeof updatePlayerMaterials).toBe("function");
  });

  test("resetDailyPulls is a function", () => {
    expect(typeof resetDailyPulls).toBe("function");
  });

  test("leaderboard functions exist", () => {
    expect(typeof getLeaderboardByWins).toBe("function");
    expect(typeof getLeaderboardByWinRate).toBe("function");
    expect(typeof getLeaderboardByStrongestCard).toBe("function");
  });
});
