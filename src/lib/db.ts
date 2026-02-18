import { supabase } from "./supabase";
import type { Card, BattleResult } from "./types";

export async function getOrCreatePlayer(walletAddress: string) {
  const { data: existing } = await supabase
    .from("players")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("players")
    .insert({ wallet_address: walletAddress })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPlayerCards(playerId: string) {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertCard(card: {
  player_id: string;
  language: string;
  rarity: string;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  dev_exp: number;
}) {
  const { data, error } = await supabase
    .from("cards")
    .insert(card)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCard(cardId: string) {
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw error;
}

export async function updatePlayerAfterBattle(
  playerId: string,
  xpEarned: number
) {
  const { data: player } = await supabase
    .from("players")
    .select("xp")
    .eq("id", playerId)
    .single();

  const { error } = await supabase
    .from("players")
    .update({ xp: (player?.xp ?? 0) + xpEarned })
    .eq("id", playerId);

  if (error) throw error;
}

export async function insertBattleLog(log: {
  player_id: string;
  player_card_id: string;
  ai_language: string;
  ai_stats: object;
  dimensions_picked: string[];
  result: string;
  xp_earned: number;
}) {
  const { data, error } = await supabase
    .from("battle_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCardStats(
  cardId: string,
  stats: {
    speed?: number;
    security?: number;
    ecosystem?: number;
    scalability?: number;
    dev_exp?: number;
  }
) {
  const { error } = await supabase
    .from("cards")
    .update(stats)
    .eq("id", cardId);

  if (error) throw error;
}

export async function updatePlayerMaterials(
  playerId: string,
  materials: number
) {
  const { error } = await supabase
    .from("players")
    .update({ materials })
    .eq("id", playerId);

  if (error) throw error;
}

export async function resetDailyPulls(playerId: string) {
  const { data: player } = await supabase
    .from("players")
    .select("last_pull_reset, free_pulls_remaining")
    .eq("id", playerId)
    .single();

  if (!player) return;

  const lastReset = new Date(player.last_pull_reset);
  const now = new Date();
  const isNewDay =
    now.toISOString().slice(0, 10) !== lastReset.toISOString().slice(0, 10);

  if (isNewDay) {
    await supabase
      .from("players")
      .update({
        free_pulls_remaining: 3,
        last_pull_reset: now.toISOString(),
      })
      .eq("id", playerId);
  }
}

export async function decrementPulls(playerId: string) {
  const { data: player } = await supabase
    .from("players")
    .select("free_pulls_remaining")
    .eq("id", playerId)
    .single();

  if (!player || player.free_pulls_remaining <= 0) {
    throw new Error("No free pulls remaining");
  }

  await supabase
    .from("players")
    .update({ free_pulls_remaining: player.free_pulls_remaining - 1 })
    .eq("id", playerId);
}

export async function getLeaderboardByWins(limit = 20) {
  const { data, error } = await supabase.rpc("leaderboard_by_wins", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}

export async function getLeaderboardByWinRate(limit = 20) {
  const { data, error } = await supabase.rpc("leaderboard_by_win_rate", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}

export async function getLeaderboardByStrongestCard(limit = 20) {
  const { data, error } = await supabase.rpc("leaderboard_by_strongest_card", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}
