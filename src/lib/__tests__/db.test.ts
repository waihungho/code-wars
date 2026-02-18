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
  resetDailyLimits,
  getPlayerDailyBattles,
  getLeaderboardByWins,
  getLeaderboardByWinRate,
  getLeaderboardByStrongestCard,
} from "../db";

// Mock supabase — demo mode (no env vars)
vi.mock("../supabase", () => ({
  isSupabaseConfigured: false,
  getSupabase: () => null,
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

  test("resetDailyLimits is a function", () => {
    expect(typeof resetDailyLimits).toBe("function");
  });

  test("getPlayerDailyBattles is a function", () => {
    expect(typeof getPlayerDailyBattles).toBe("function");
  });

  test("leaderboard functions exist", () => {
    expect(typeof getLeaderboardByWins).toBe("function");
    expect(typeof getLeaderboardByWinRate).toBe("function");
    expect(typeof getLeaderboardByStrongestCard).toBe("function");
  });
});
