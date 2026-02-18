import { getSupabase, isSupabaseConfigured } from "./supabase";
import { FREE_PULLS_PER_DAY, MAX_DAILY_BATTLES } from "./constants";

// ---------------------------------------------------------------------------
// In-memory store for demo mode (no Supabase configured)
// ---------------------------------------------------------------------------
interface LocalPlayer {
  id: string;
  wallet_address: string;
  free_pulls_remaining: number;
  last_pull_reset: string;
  xp: number;
  materials: number;
  daily_battles: number;
  created_at: string;
}

interface LocalCard {
  id: string;
  player_id: string;
  language: string;
  rarity: string;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  dev_exp: number;
  nft_mint_address: string | null;
  created_at: string;
}

interface LocalBattleLog {
  id: string;
  player_id: string;
  player_card_id: string;
  ai_language: string;
  ai_stats: object;
  dimensions_picked: string[];
  result: string;
  xp_earned: number;
  created_at: string;
}

const local = {
  players: [] as LocalPlayer[],
  cards: [] as LocalCard[],
  battleLogs: [] as LocalBattleLog[],
};

function uuid() {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------
export async function getOrCreatePlayer(walletAddress: string) {
  if (!isSupabaseConfigured) {
    let player = local.players.find((p) => p.wallet_address === walletAddress);
    if (!player) {
      player = {
        id: uuid(),
        wallet_address: walletAddress,
        free_pulls_remaining: FREE_PULLS_PER_DAY,
        last_pull_reset: new Date().toISOString(),
        xp: 0,
        materials: 0,
        daily_battles: 0,
        created_at: new Date().toISOString(),
      };
      local.players.push(player);
    }
    return { ...player };
  }

  const supabase = getSupabase()!;
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

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
export async function getPlayerCards(playerId: string) {
  if (!isSupabaseConfigured) {
    return local.cards
      .filter((c) => c.player_id === playerId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const supabase = getSupabase()!;
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
  if (!isSupabaseConfigured) {
    const newCard: LocalCard = {
      id: uuid(),
      ...card,
      nft_mint_address: null,
      created_at: new Date().toISOString(),
    };
    local.cards.push(newCard);
    return { ...newCard };
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("cards")
    .insert(card)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCard(cardId: string) {
  if (!isSupabaseConfigured) {
    local.cards = local.cards.filter((c) => c.id !== cardId);
    return;
  }

  const supabase = getSupabase()!;
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw error;
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
  if (!isSupabaseConfigured) {
    const card = local.cards.find((c) => c.id === cardId);
    if (card) Object.assign(card, stats);
    return;
  }

  const supabase = getSupabase()!;
  const { error } = await supabase
    .from("cards")
    .update(stats)
    .eq("id", cardId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Battle
// ---------------------------------------------------------------------------
export async function updatePlayerAfterBattle(
  playerId: string,
  xpEarned: number
) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (player) {
      player.daily_battles = (player.daily_battles ?? 0) + 1;
      if (player.daily_battles <= MAX_DAILY_BATTLES) {
        player.xp += xpEarned;
      }
    }
    return;
  }

  const supabase = getSupabase()!;
  const { data: player } = await supabase
    .from("players")
    .select("xp, daily_battles")
    .eq("id", playerId)
    .single();

  const newDailyBattles = (player?.daily_battles ?? 0) + 1;
  const effectiveXp =
    newDailyBattles <= MAX_DAILY_BATTLES ? xpEarned : 0;

  const { error } = await supabase
    .from("players")
    .update({
      xp: (player?.xp ?? 0) + effectiveXp,
      daily_battles: newDailyBattles,
    })
    .eq("id", playerId);

  if (error) throw error;
}

export async function getPlayerDailyBattles(playerId: string): Promise<number> {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    return player?.daily_battles ?? 0;
  }

  const supabase = getSupabase()!;
  const { data } = await supabase
    .from("players")
    .select("daily_battles")
    .eq("id", playerId)
    .single();

  return data?.daily_battles ?? 0;
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
  if (!isSupabaseConfigured) {
    const entry: LocalBattleLog = {
      id: uuid(),
      ...log,
      created_at: new Date().toISOString(),
    };
    local.battleLogs.push(entry);
    return { ...entry };
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("battle_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Player resources
// ---------------------------------------------------------------------------
export async function updatePlayerMaterials(
  playerId: string,
  materials: number
) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (player) player.materials = materials;
    return;
  }

  const supabase = getSupabase()!;
  const { error } = await supabase
    .from("players")
    .update({ materials })
    .eq("id", playerId);

  if (error) throw error;
}

export async function resetDailyLimits(playerId: string) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (!player) return;
    const lastReset = new Date(player.last_pull_reset);
    const now = new Date();
    if (now.toISOString().slice(0, 10) !== lastReset.toISOString().slice(0, 10)) {
      player.free_pulls_remaining = FREE_PULLS_PER_DAY;
      player.daily_battles = 0;
      player.last_pull_reset = now.toISOString();
    }
    return;
  }

  const supabase = getSupabase()!;
  const { data: player } = await supabase
    .from("players")
    .select("last_pull_reset, free_pulls_remaining, daily_battles")
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
        free_pulls_remaining: FREE_PULLS_PER_DAY,
        daily_battles: 0,
        last_pull_reset: now.toISOString(),
      })
      .eq("id", playerId);
  }
}

export async function decrementPulls(playerId: string) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (!player || player.free_pulls_remaining <= 0) {
      throw new Error("No free pulls remaining");
    }
    player.free_pulls_remaining--;
    return;
  }

  const supabase = getSupabase()!;
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

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------
export async function getLeaderboardByWins(limit = 20) {
  if (!isSupabaseConfigured) {
    const wins: Record<string, number> = {};
    for (const log of local.battleLogs) {
      if (log.result === "win") {
        const player = local.players.find((p) => p.id === log.player_id);
        const addr = player?.wallet_address ?? log.player_id;
        wins[addr] = (wins[addr] ?? 0) + 1;
      }
    }
    return Object.entries(wins)
      .map(([wallet_address, total_wins]) => ({ wallet_address, total_wins }))
      .sort((a, b) => b.total_wins - a.total_wins)
      .slice(0, limit);
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase.rpc("leaderboard_by_wins", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}

export async function getLeaderboardByWinRate(limit = 20) {
  if (!isSupabaseConfigured) {
    const stats: Record<string, { wins: number; total: number }> = {};
    for (const log of local.battleLogs) {
      const player = local.players.find((p) => p.id === log.player_id);
      const addr = player?.wallet_address ?? log.player_id;
      if (!stats[addr]) stats[addr] = { wins: 0, total: 0 };
      stats[addr].total++;
      if (log.result === "win") stats[addr].wins++;
    }
    return Object.entries(stats)
      .filter(([, s]) => s.total >= 10)
      .map(([wallet_address, s]) => ({
        wallet_address,
        win_rate: s.total > 0 ? s.wins / s.total : 0,
        total_battles: s.total,
      }))
      .sort((a, b) => b.win_rate - a.win_rate)
      .slice(0, limit);
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase.rpc("leaderboard_by_win_rate", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}

export async function getLeaderboardByStrongestCard(limit = 20) {
  if (!isSupabaseConfigured) {
    return local.cards
      .map((c) => {
        const player = local.players.find((p) => p.id === c.player_id);
        return {
          wallet_address: player?.wallet_address ?? c.player_id,
          language: c.language,
          total_stats: c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp,
        };
      })
      .sort((a, b) => b.total_stats - a.total_stats)
      .slice(0, limit);
  }

  const supabase = getSupabase()!;
  const { data, error } = await supabase.rpc("leaderboard_by_strongest_card", {
    lim: limit,
  });
  if (error) throw error;
  return data;
}
