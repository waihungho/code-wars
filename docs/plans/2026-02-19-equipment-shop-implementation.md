# Equipment Shop Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an `/equipment` page where players buy items with SOL (devnet) and equip them onto cards with 4 typed slots, plus account-wide consumables.

**Architecture:** New `/equipment` route with Shop and My Cards tabs. SOL payments via `@solana/web3.js` SystemProgram transfer to treasury wallet on devnet. Equipment modifiers integrated into the existing `resolveBattle()` function. Dual-mode (demo/Supabase) following `db.ts` patterns.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, @solana/web3.js v1, @solana/wallet-adapter-react, Supabase, Vitest

---

## Task 1: Add Equipment Types

**Files:**
- Modify: `src/lib/types.ts`

**Step 1: Add equipment types to types.ts**

Add the following types at the end of `src/lib/types.ts`:

```typescript
export type SlotType = "stat_boost" | "ability_enhancement" | "utility" | "ai_core" | "consumable";

export interface EquipmentItem {
  id: string;
  name: string;
  slotType: SlotType;
  effectType: string;
  effectValue: Record<string, number | string>;
  solPrice: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  playerId: string;
  itemId: string;
  purchasedAt: string;
}

export interface CardEquipment {
  id: string;
  cardId: string;
  inventoryId: string;
  slotType: SlotType;
  equippedAt: string;
}

export interface SolTransaction {
  id: string;
  playerId: string;
  txSignature: string;
  solAmount: number;
  itemId: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
}
```

**Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add equipment type definitions"
```

---

## Task 2: Add Equipment Item Catalog Constants

**Files:**
- Modify: `src/lib/constants.ts`

**Step 1: Add equipment catalog**

Add the following at the end of `src/lib/constants.ts`:

```typescript
import type { EquipmentItem } from "./types";
// (move the import to the top with other type imports)

export const TREASURY_WALLET = "11111111111111111111111111111112"; // Replace with actual devnet treasury

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  // --- Consumables ---
  { id: "summon-3",    name: "Extra Summon (x3)",      slotType: "consumable",            effectType: "add_pulls",       effectValue: { amount: 3 },                     solPrice: 0.01,  description: "+3 gacha pulls" },
  { id: "summon-10",   name: "Extra Summon (x10)",     slotType: "consumable",            effectType: "add_pulls",       effectValue: { amount: 10 },                    solPrice: 0.03,  description: "+10 gacha pulls" },
  { id: "summon-50",   name: "Extra Summon (x50)",     slotType: "consumable",            effectType: "add_pulls",       effectValue: { amount: 50 },                    solPrice: 0.12,  description: "+50 gacha pulls" },
  { id: "battle-10",   name: "Battle Pass (x10)",      slotType: "consumable",            effectType: "add_battles",     effectValue: { amount: 10 },                    solPrice: 0.01,  description: "+10 daily battles" },
  { id: "battle-20",   name: "Battle Pass (x20)",      slotType: "consumable",            effectType: "add_battles",     effectValue: { amount: 20 },                    solPrice: 0.02,  description: "+20 daily battles" },
  { id: "battle-unlimited", name: "Unlimited Battle Pass", slotType: "consumable",        effectType: "unlimited_battles", effectValue: { hours: 24 },                   solPrice: 0.1,   description: "Unlimited battles for 24h" },
  // --- Stat Boost (Slot 1) ---
  { id: "stat-chip-1", name: "Stat Chip I",            slotType: "stat_boost",            effectType: "stat_percent",    effectValue: { percent: 10 },                   solPrice: 0.05,  description: "+10% to one stat" },
  { id: "stat-chip-2", name: "Stat Chip II",           slotType: "stat_boost",            effectType: "stat_percent",    effectValue: { percent: 25 },                   solPrice: 0.2,   description: "+25% to one stat" },
  { id: "stat-chip-3", name: "Stat Chip III",          slotType: "stat_boost",            effectType: "stat_percent",    effectValue: { percent: 50 },                   solPrice: 0.5,   description: "+50% to one stat" },
  { id: "omni-chip",   name: "Omni Chip",              slotType: "stat_boost",            effectType: "all_stats_percent", effectValue: { percent: 15 },                 solPrice: 1.0,   description: "+15% to ALL stats" },
  // --- Ability Enhancement (Slot 2) ---
  { id: "trigger-amp-1", name: "Trigger Amplifier I",  slotType: "ability_enhancement",   effectType: "trigger_chance",  effectValue: { chance: 0.45 },                  solPrice: 0.1,   description: "Ability trigger 30% → 45%" },
  { id: "trigger-amp-2", name: "Trigger Amplifier II", slotType: "ability_enhancement",   effectType: "trigger_chance",  effectValue: { chance: 0.60 },                  solPrice: 0.35,  description: "Ability trigger 30% → 60%" },
  { id: "passive-boost", name: "Passive Booster",      slotType: "ability_enhancement",   effectType: "passive_multiply", effectValue: { multiplier: 2 },                solPrice: 0.15,  description: "Passive ability bonus doubled" },
  { id: "overcharge",  name: "Ability Overcharge",     slotType: "ability_enhancement",   effectType: "overcharge",      effectValue: { passiveMultiplier: 2, chance: 0.50 }, solPrice: 0.75, description: "Passive doubled + trigger 50%" },
  // --- Utility (Slot 3) ---
  { id: "dim-scout",   name: "Dimension Scout",        slotType: "utility",               effectType: "preview_dimension", effectValue: { count: 1 },                    solPrice: 0.05,  description: "Preview 1 of 3 battle dimensions" },
  { id: "xp-magnet-1", name: "XP Magnet I",            slotType: "utility",               effectType: "xp_multiplier",   effectValue: { multiplier: 1.5 },               solPrice: 0.08,  description: "+50% XP from battles" },
  { id: "xp-magnet-2", name: "XP Magnet II",           slotType: "utility",               effectType: "xp_multiplier",   effectValue: { multiplier: 2.0 },               solPrice: 0.3,   description: "+100% XP from battles" },
  { id: "lucky-charm", name: "Lucky Charm",            slotType: "utility",               effectType: "rarity_boost",    effectValue: { bonus: 0.05 },                   solPrice: 0.5,   description: "+5% higher rarity chance" },
  // --- AI Core (Special Slot 4) ---
  { id: "ai-core",     name: "AI Core",                slotType: "ai_core",               effectType: "ai_core",         effectValue: { allStatsPercent: 50, triggerChance: 0.70, passiveMultiplier: 3, xpMultiplier: 2.0 }, solPrice: 10, description: "+50% ALL stats, trigger 70%, passive x3, +100% XP" },
];

export const UNEQUIP_FEE_SOL = 0.01;
```

**Step 2: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add equipment catalog constants and treasury wallet"
```

---

## Task 3: Add Database Schema Migration

**Files:**
- Modify: `supabase/schema.sql`

**Step 1: Add equipment tables to schema**

Append the following to the end of `supabase/schema.sql`:

```sql
-- Equipment System
CREATE TYPE slot_type_enum AS ENUM ('stat_boost', 'ability_enhancement', 'utility', 'ai_core', 'consumable');

CREATE TABLE equipment_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slot_type slot_type_enum NOT NULL,
  effect_type TEXT NOT NULL,
  effect_value JSONB NOT NULL,
  sol_price DECIMAL(10,4) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT REFERENCES equipment_items(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE card_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  inventory_id UUID REFERENCES player_inventory(id) ON DELETE CASCADE NOT NULL,
  slot_type slot_type_enum NOT NULL,
  equipped_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(card_id, slot_type)
);

CREATE TABLE sol_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  tx_signature TEXT UNIQUE NOT NULL,
  sol_amount DECIMAL(10,4) NOT NULL,
  item_id TEXT REFERENCES equipment_items(id) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_inventory_player_id ON player_inventory(player_id);
CREATE INDEX idx_card_equipment_card_id ON card_equipment(card_id);
CREATE INDEX idx_sol_tx_player_id ON sol_transactions(player_id);
CREATE INDEX idx_sol_tx_signature ON sol_transactions(tx_signature);

-- RLS
ALTER TABLE equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sol_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment catalog is public" ON equipment_items FOR SELECT USING (true);

CREATE POLICY "Players view own inventory" ON player_inventory FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own inventory" ON player_inventory FOR INSERT
  WITH CHECK (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players delete own inventory" ON player_inventory FOR DELETE
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));

CREATE POLICY "Players view own equipment" ON card_equipment FOR SELECT
  USING (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own equipment" ON card_equipment FOR INSERT
  WITH CHECK (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players delete own equipment" ON card_equipment FOR DELETE
  USING (card_id IN (SELECT c.id FROM cards c JOIN players p ON c.player_id = p.id WHERE p.wallet_address = current_setting('app.wallet_address', true)));

CREATE POLICY "Players view own transactions" ON sol_transactions FOR SELECT
  USING (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
CREATE POLICY "Players insert own transactions" ON sol_transactions FOR INSERT
  WITH CHECK (player_id IN (SELECT id FROM players WHERE wallet_address = current_setting('app.wallet_address', true)));
```

**Step 2: Add `bonus_pulls` and `bonus_battles` columns to players table**

Add at the end of schema (or as ALTER):

```sql
-- Add bonus resource columns for consumable purchases
ALTER TABLE players ADD COLUMN IF NOT EXISTS bonus_pulls INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS bonus_battles INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS unlimited_battles_until TIMESTAMPTZ;
```

**Step 3: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add equipment database schema and RLS policies"
```

---

## Task 4: Add Equipment DB Functions

**Files:**
- Modify: `src/lib/db.ts`

**Step 1: Add local store types for equipment**

Add to the local interface/store section at the top of `db.ts`:

```typescript
interface LocalInventoryItem {
  id: string;
  player_id: string;
  item_id: string;
  purchased_at: string;
}

interface LocalCardEquipment {
  id: string;
  card_id: string;
  inventory_id: string;
  slot_type: string;
  equipped_at: string;
}

interface LocalSolTransaction {
  id: string;
  player_id: string;
  tx_signature: string;
  sol_amount: number;
  item_id: string;
  status: string;
  created_at: string;
}
```

Add to the `local` object:

```typescript
inventory: [] as LocalInventoryItem[],
cardEquipment: [] as LocalCardEquipment[],
solTransactions: [] as LocalSolTransaction[],
```

**Step 2: Add equipment CRUD functions**

Add the following functions at the end of `db.ts` (before the leaderboard section):

```typescript
// ---------------------------------------------------------------------------
// Equipment — Inventory
// ---------------------------------------------------------------------------
export async function getPlayerInventory(playerId: string) {
  if (!isSupabaseConfigured) {
    return local.inventory.filter((i) => i.player_id === playerId);
  }
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("player_inventory")
    .select("*")
    .eq("player_id", playerId)
    .order("purchased_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addToInventory(playerId: string, itemId: string) {
  if (!isSupabaseConfigured) {
    const entry: LocalInventoryItem = {
      id: uuid(),
      player_id: playerId,
      item_id: itemId,
      purchased_at: new Date().toISOString(),
    };
    local.inventory.push(entry);
    return { ...entry };
  }
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("player_inventory")
    .insert({ player_id: playerId, item_id: itemId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromInventory(inventoryId: string) {
  if (!isSupabaseConfigured) {
    local.inventory = local.inventory.filter((i) => i.id !== inventoryId);
    return;
  }
  const supabase = getSupabase()!;
  const { error } = await supabase.from("player_inventory").delete().eq("id", inventoryId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Equipment — Card Slots
// ---------------------------------------------------------------------------
export async function getCardEquipment(cardId: string) {
  if (!isSupabaseConfigured) {
    return local.cardEquipment.filter((e) => e.card_id === cardId);
  }
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("card_equipment")
    .select("*")
    .eq("card_id", cardId);
  if (error) throw error;
  return data;
}

export async function equipItem(cardId: string, inventoryId: string, slotType: string) {
  if (!isSupabaseConfigured) {
    // Check slot not already occupied
    const existing = local.cardEquipment.find(
      (e) => e.card_id === cardId && e.slot_type === slotType
    );
    if (existing) throw new Error("Slot already occupied");
    const entry: LocalCardEquipment = {
      id: uuid(),
      card_id: cardId,
      inventory_id: inventoryId,
      slot_type: slotType,
      equipped_at: new Date().toISOString(),
    };
    local.cardEquipment.push(entry);
    return { ...entry };
  }
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("card_equipment")
    .insert({ card_id: cardId, inventory_id: inventoryId, slot_type: slotType })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unequipItem(equipmentId: string) {
  if (!isSupabaseConfigured) {
    local.cardEquipment = local.cardEquipment.filter((e) => e.id !== equipmentId);
    return;
  }
  const supabase = getSupabase()!;
  const { error } = await supabase.from("card_equipment").delete().eq("id", equipmentId);
  if (error) throw error;
}

export async function unequipAllFromCard(cardId: string) {
  if (!isSupabaseConfigured) {
    local.cardEquipment = local.cardEquipment.filter((e) => e.card_id !== cardId);
    return;
  }
  const supabase = getSupabase()!;
  const { error } = await supabase.from("card_equipment").delete().eq("card_id", cardId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Equipment — SOL Transactions
// ---------------------------------------------------------------------------
export async function recordTransaction(tx: {
  player_id: string;
  tx_signature: string;
  sol_amount: number;
  item_id: string;
  status: string;
}) {
  if (!isSupabaseConfigured) {
    const entry: LocalSolTransaction = {
      id: uuid(),
      ...tx,
      created_at: new Date().toISOString(),
    };
    local.solTransactions.push(entry);
    return { ...entry };
  }
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from("sol_transactions")
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransactionStatus(txId: string, status: string) {
  if (!isSupabaseConfigured) {
    const tx = local.solTransactions.find((t) => t.id === txId);
    if (tx) tx.status = status;
    return;
  }
  const supabase = getSupabase()!;
  const { error } = await supabase
    .from("sol_transactions")
    .update({ status })
    .eq("id", txId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Equipment — Player bonus resources (consumables)
// ---------------------------------------------------------------------------
export async function addBonusPulls(playerId: string, amount: number) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (player) player.free_pulls_remaining += amount;
    return;
  }
  const supabase = getSupabase()!;
  const { data: player } = await supabase
    .from("players")
    .select("free_pulls_remaining")
    .eq("id", playerId)
    .single();
  if (!player) throw new Error("Player not found");
  const { error } = await supabase
    .from("players")
    .update({ free_pulls_remaining: player.free_pulls_remaining + amount })
    .eq("id", playerId);
  if (error) throw error;
}

export async function addBonusBattles(playerId: string, amount: number) {
  if (!isSupabaseConfigured) {
    const player = local.players.find((p) => p.id === playerId);
    if (player) player.daily_battles = Math.max(0, player.daily_battles - amount);
    return;
  }
  const supabase = getSupabase()!;
  const { data: player } = await supabase
    .from("players")
    .select("daily_battles")
    .eq("id", playerId)
    .single();
  if (!player) throw new Error("Player not found");
  const { error } = await supabase
    .from("players")
    .update({ daily_battles: Math.max(0, player.daily_battles - amount) })
    .eq("id", playerId);
  if (error) throw error;
}
```

**Step 3: Commit**

```bash
git add src/lib/db.ts
git commit -m "feat: add equipment inventory and transaction DB functions"
```

---

## Task 5: Add SOL Payment Utility

**Files:**
- Create: `src/lib/sol-payment.ts`

**Step 1: Create SOL payment module**

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TREASURY_WALLET } from "./constants";

export async function createPaymentTransaction(
  connection: Connection,
  payerPublicKey: PublicKey,
  solAmount: number
): Promise<Transaction> {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payerPublicKey,
      toPubkey: new PublicKey(TREASURY_WALLET),
      lamports: Math.round(solAmount * LAMPORTS_PER_SOL),
    })
  );
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payerPublicKey;
  return transaction;
}

export async function confirmTransaction(
  connection: Connection,
  signature: string,
  timeoutMs = 30000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    if (status.value?.confirmationStatus === "confirmed" || status.value?.confirmationStatus === "finalized") {
      return !status.value.err;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}
```

**Step 2: Commit**

```bash
git add src/lib/sol-payment.ts
git commit -m "feat: add SOL payment transaction utilities"
```

---

## Task 6: Integrate Equipment into Battle Engine

**Files:**
- Modify: `src/lib/battle.ts`
- Test: `src/lib/__tests__/battle.test.ts`

**Step 1: Write failing tests for equipment modifiers**

Add to `src/lib/__tests__/battle.test.ts`:

```typescript
import { applyEquipmentModifiers } from "../battle";
import type { EquipmentItem } from "../types";
import { EQUIPMENT_CATALOG } from "../constants";

describe("Equipment Modifiers", () => {
  const baseStats = { speed: 10, security: 10, ecosystem: 10, scalability: 10, devExp: 10 };

  test("stat chip applies percentage boost to selected stat", () => {
    const statChip = EQUIPMENT_CATALOG.find((i) => i.id === "stat-chip-2")!;
    const equipped = [{ ...statChip, effectValue: { ...statChip.effectValue, stat: "speed" } }];
    const result = applyEquipmentModifiers(baseStats, equipped, 0.3, 0.2);
    expect(result.stats.speed).toBe(13); // 10 * 1.25 = 12.5, rounded to 13
    expect(result.stats.security).toBe(10); // unchanged
  });

  test("omni chip boosts all stats", () => {
    const omniChip = EQUIPMENT_CATALOG.find((i) => i.id === "omni-chip")!;
    const result = applyEquipmentModifiers(baseStats, [omniChip], 0.3, 0.2);
    expect(result.stats.speed).toBe(12); // 10 * 1.15 = 11.5, rounded to 12
    expect(result.stats.security).toBe(12);
  });

  test("trigger amplifier overrides trigger chance", () => {
    const trigAmp = EQUIPMENT_CATALOG.find((i) => i.id === "trigger-amp-1")!;
    const result = applyEquipmentModifiers(baseStats, [trigAmp], 0.3, 0.2);
    expect(result.triggerChance).toBe(0.45);
  });

  test("ai core applies all bonuses", () => {
    const aiCore = EQUIPMENT_CATALOG.find((i) => i.id === "ai-core")!;
    const result = applyEquipmentModifiers(baseStats, [aiCore], 0.3, 0.2);
    expect(result.stats.speed).toBe(15); // 10 * 1.5
    expect(result.triggerChance).toBe(0.7);
    expect(result.passiveMultiplier).toBeGreaterThan(1);
    expect(result.xpMultiplier).toBe(2.0);
  });

  test("stacking: take max trigger chance, don't sum", () => {
    const trigAmp2 = EQUIPMENT_CATALOG.find((i) => i.id === "trigger-amp-2")!;
    const aiCore = EQUIPMENT_CATALOG.find((i) => i.id === "ai-core")!;
    const result = applyEquipmentModifiers(baseStats, [trigAmp2, aiCore], 0.3, 0.2);
    expect(result.triggerChance).toBe(0.7); // AI Core's 70% > Trigger Amp II's 60%
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/battle.test.ts`
Expected: FAIL — `applyEquipmentModifiers` not exported

**Step 3: Implement `applyEquipmentModifiers`**

Add to `src/lib/battle.ts` (export it):

```typescript
import type { EquipmentItem, Stats } from "./types";

export function applyEquipmentModifiers(
  baseStats: Stats,
  equippedItems: EquipmentItem[],
  baseTriggerChance: number,
  basePassiveBonus: number
): {
  stats: Stats;
  triggerChance: number;
  passiveMultiplier: number;
  xpMultiplier: number;
} {
  const stats = { ...baseStats };
  let triggerChance = baseTriggerChance;
  let passiveMultiplier = 1;
  let xpMultiplier = 1;

  for (const item of equippedItems) {
    switch (item.effectType) {
      case "stat_percent": {
        const stat = item.effectValue.stat as keyof Stats;
        const pct = (item.effectValue.percent as number) / 100;
        if (stat && stats[stat] !== undefined) {
          stats[stat] = Math.round(stats[stat] * (1 + pct));
        }
        break;
      }
      case "all_stats_percent": {
        const pct = (item.effectValue.percent as number) / 100;
        for (const key of Object.keys(stats) as (keyof Stats)[]) {
          stats[key] = Math.round(stats[key] * (1 + pct));
        }
        break;
      }
      case "trigger_chance": {
        const chance = item.effectValue.chance as number;
        triggerChance = Math.max(triggerChance, chance);
        break;
      }
      case "passive_multiply": {
        const mult = item.effectValue.multiplier as number;
        passiveMultiplier = Math.max(passiveMultiplier, mult);
        break;
      }
      case "overcharge": {
        const pMult = item.effectValue.passiveMultiplier as number;
        const chance = item.effectValue.chance as number;
        passiveMultiplier = Math.max(passiveMultiplier, pMult);
        triggerChance = Math.max(triggerChance, chance);
        break;
      }
      case "xp_multiplier": {
        const mult = item.effectValue.multiplier as number;
        xpMultiplier = Math.max(xpMultiplier, mult);
        break;
      }
      case "ai_core": {
        const allPct = (item.effectValue.allStatsPercent as number) / 100;
        for (const key of Object.keys(stats) as (keyof Stats)[]) {
          stats[key] = Math.round(stats[key] * (1 + allPct));
        }
        triggerChance = Math.max(triggerChance, item.effectValue.triggerChance as number);
        passiveMultiplier = Math.max(passiveMultiplier, item.effectValue.passiveMultiplier as number);
        xpMultiplier = Math.max(xpMultiplier, item.effectValue.xpMultiplier as number);
        break;
      }
    }
  }

  return { stats, triggerChance, passiveMultiplier, xpMultiplier };
}
```

**Step 4: Update `resolveBattle` to accept optional equipment**

Modify `resolveBattle` signature to accept an optional `equippedItems` parameter:

```typescript
export function resolveBattle(
  playerCard: Card,
  aiStats: Stats,
  dimensions: [Dimension, Dimension, Dimension],
  equippedItems: EquipmentItem[] = []
): BattleResult {
```

Inside `resolveBattle`, after building `playerStats` from passive bonus, apply equipment modifiers:

```typescript
// Apply equipment modifiers
const ability = ABILITIES[playerCard.language];
const mods = applyEquipmentModifiers(
  playerStats,
  equippedItems,
  ability.triggerChance,
  ability.passiveBonus
);
// Replace playerStats with equipment-modified stats
Object.assign(playerStats, mods.stats);
// Use equipment-modified trigger chance
const triggered = Math.random() < mods.triggerChance;
// Apply passive multiplier to the passive bonus
if (mods.passiveMultiplier > 1) {
  const dim = ability.passiveDimension;
  const extraBonus = ability.passiveBonus * (mods.passiveMultiplier - 1);
  playerStats[dim] = Math.round(playerStats[dim] * (1 + extraBonus));
}
```

At the end, apply XP multiplier:

```typescript
xpEarned = Math.round(xpEarned * mods.xpMultiplier);
```

**Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/battle.test.ts`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/battle.ts src/lib/__tests__/battle.test.ts
git commit -m "feat: integrate equipment modifiers into battle engine"
```

---

## Task 7: Update GameProvider with Equipment State

**Files:**
- Modify: `src/components/GameProvider.tsx`

**Step 1: Add inventory and equipment to game context**

Update `GameState` interface:

```typescript
interface GameState {
  player: any | null;
  cards: any[];
  inventory: any[];
  loading: boolean;
  refreshCards: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
  refreshInventory: () => Promise<void>;
}
```

Add `inventory` state and `refreshInventory` callback. Load inventory when player loads. Add `getPlayerInventory` to the import from `@/lib/db`.

**Step 2: Commit**

```bash
git add src/components/GameProvider.tsx
git commit -m "feat: add inventory state to GameProvider"
```

---

## Task 8: Update NavBar

**Files:**
- Modify: `src/components/NavBar.tsx`

**Step 1: Add Equipment nav item**

Add to `NAV_ITEMS` array between ARENA and RANKS:

```typescript
{ href: "/equipment", label: "EQUIP", icon: "+" },
```

**Step 2: Commit**

```bash
git add src/components/NavBar.tsx
git commit -m "feat: add Equipment link to NavBar"
```

---

## Task 9: Create Equipment Page — Shop Tab

**Files:**
- Create: `src/app/equipment/page.tsx`

**Step 1: Create the equipment page with Shop tab**

Build the `/equipment` page with:
- Two tabs: "SHOP" and "MY CARDS"
- Shop tab displays items grouped by category (Consumables, Stat Boosts, Ability Enhancement, Utility, AI Core)
- Each item card shows: name, description, SOL price, "Buy" button
- Price-tier borders: green (<0.1), blue (0.1-0.5), gold (0.5-1.0), rainbow (10 SOL)
- Stat Chips show a dimension picker dropdown before purchase
- "Buy" button triggers SOL payment flow:
  1. Create transaction via `createPaymentTransaction`
  2. Sign via `sendTransaction` from wallet adapter
  3. Confirm on-chain via `confirmTransaction`
  4. Record in DB, add to inventory or apply consumable
- Show wallet SOL balance in header
- Connected wallet required — show "Connect Wallet" message otherwise
- Loading states during transaction confirmation

Key imports:
- `useWallet`, `useConnection` from `@solana/wallet-adapter-react`
- `useGame` from `@/components/GameProvider`
- `EQUIPMENT_CATALOG`, `UNEQUIP_FEE_SOL` from `@/lib/constants`
- `createPaymentTransaction`, `confirmTransaction` from `@/lib/sol-payment`
- `addToInventory`, `addBonusPulls`, `addBonusBattles`, `recordTransaction`, `updateTransactionStatus` from `@/lib/db`

Follow the existing page patterns (dark theme, font-mono, tracking-wider, animate-fade-in).

**Step 2: Commit**

```bash
git add src/app/equipment/page.tsx
git commit -m "feat: add equipment shop page with SOL payments"
```

---

## Task 10: Add Equipment Page — My Cards Tab

**Files:**
- Modify: `src/app/equipment/page.tsx`

**Step 1: Add My Cards tab to the equipment page**

The My Cards tab displays:
- Left panel: card list from player's collection (compact `CardDisplay`)
- Right panel: selected card with 4 equipment slots
  - Slot 1: Stat Boost
  - Slot 2: Ability Enhancement
  - Slot 3: Utility
  - Slot 4: AI Core
- Each slot shows equipped item name + "Unequip (0.01 SOL)" button, or "Empty" + inventory items for that slot type
- Clicking an inventory item equips it to the matching slot
- Unequip triggers SOL payment (0.01 SOL fee), item returns to inventory

Key functions:
- `getCardEquipment` — load equipment for selected card
- `equipItem` — equip from inventory to card slot
- `unequipItem` — unequip (with SOL fee payment)

**Step 2: Commit**

```bash
git add src/app/equipment/page.tsx
git commit -m "feat: add My Cards equipment management tab"
```

---

## Task 11: Update Battle Page to Load Equipment

**Files:**
- Modify: `src/app/battle/page.tsx`

**Step 1: Load card equipment before battle**

When `handleBattle` is called:
1. Fetch `getCardEquipment(selectedCard.id)` + inventory items
2. Resolve equipped items to `EquipmentItem` objects from `EQUIPMENT_CATALOG`
3. Pass `equippedItems` to `resolveBattle()`
4. Handle Dimension Scout: if equipped, show one dimension before confirming battle

**Step 2: Commit**

```bash
git add src/app/battle/page.tsx
git commit -m "feat: apply equipped items during battle"
```

---

## Task 12: Auto-Unequip on Card Burn

**Files:**
- Modify: `src/app/collection/page.tsx`

**Step 1: Unequip items before burning**

In the `handleBurn` function, call `unequipAllFromCard(card.id)` before `deleteCard(card.id)`. This returns all equipped items to inventory without charging the unequip fee.

Add import: `import { unequipAllFromCard } from "@/lib/db";`

**Step 2: Commit**

```bash
git add src/app/collection/page.tsx
git commit -m "feat: auto-unequip items when burning a card"
```

---

## Task 13: Update Gacha to Use Bonus Pulls

**Files:**
- Modify: `src/app/gacha/page.tsx`

**Step 1: Allow pulling with bonus pulls**

The current gacha checks `player.free_pulls_remaining <= 0` to disable pulling. Update this to also allow pulling when bonus pulls are available (tracked via the same `free_pulls_remaining` field, which `addBonusPulls` increments).

No code change needed if `addBonusPulls` already adds to `free_pulls_remaining`. Just ensure the display reflects the total available pulls (free + bonus).

**Step 2: Commit (if changes needed)**

```bash
git add src/app/gacha/page.tsx
git commit -m "feat: support bonus pulls from equipment shop"
```

---

## Task 14: Run Full Test Suite and Build

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: ALL PASS

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve any build/test issues from equipment feature"
```
