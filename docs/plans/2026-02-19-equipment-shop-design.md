# Equipment Shop Design

## Overview

Add an `/equipment` page with two tabs: **Shop** (buy items with SOL) and **My Cards** (equip items onto cards). Items include account-wide consumables and card-specific equipment across 4 slot types.

## Item Catalog

### Account-Wide Consumables

| Item | Effect | SOL Price |
|------|--------|-----------|
| Extra Summon (x3) | +3 gacha pulls | 0.01 SOL |
| Extra Summon (x10) | +10 gacha pulls | 0.03 SOL |
| Extra Summon (x50) | +50 gacha pulls | 0.12 SOL |
| Battle Pass (x10) | +10 daily battles | 0.01 SOL |
| Battle Pass (x20) | +20 daily battles | 0.02 SOL |
| Unlimited Battle Pass | Unlimited battles for 24h | 0.1 SOL |

### Card Equipment — Slot 1: Stat Boost

| Item | Effect | SOL Price |
|------|--------|-----------|
| Stat Chip I | +10% to one stat | 0.05 SOL |
| Stat Chip II | +25% to one stat | 0.2 SOL |
| Stat Chip III | +50% to one stat | 0.5 SOL |
| Omni Chip | +15% to ALL stats | 1.0 SOL |

Player picks which stat dimension when purchasing Stat Chips I-III.

### Card Equipment — Slot 2: Ability Enhancement

| Item | Effect | SOL Price |
|------|--------|-----------|
| Trigger Amplifier I | Ability trigger 30% -> 45% | 0.1 SOL |
| Trigger Amplifier II | Ability trigger 30% -> 60% | 0.35 SOL |
| Passive Booster | Passive bonus doubled | 0.15 SOL |
| Ability Overcharge | Passive doubled + trigger 30% -> 50% | 0.75 SOL |

### Card Equipment — Slot 3: Utility

| Item | Effect | SOL Price |
|------|--------|-----------|
| Dimension Scout | Preview 1 of 3 battle dimensions | 0.05 SOL |
| XP Magnet I | +50% XP from battles | 0.08 SOL |
| XP Magnet II | +100% XP from battles | 0.3 SOL |
| Lucky Charm | +5% chance for higher rarity on next pull | 0.5 SOL |

### Card Equipment — AI Slot (Special 4th Slot)

| Item | Effect | SOL Price |
|------|--------|-----------|
| AI Core | +50% ALL stats, trigger 30% -> 70%, passive tripled, +100% XP | 10 SOL |

- Stacks on top of all 3 regular equipment slots
- Only one AI item exists
- Visual: rainbow/holographic border + "AI-Enhanced" badge in battle

### Unequip Fee

0.01 SOL to remove any item from a card. Item returns to inventory.

## Architecture

### Approach: Shop-First (single page, two tabs)

`/equipment` page with:
1. **Shop tab** - browse and buy items with SOL
2. **My Cards tab** - select a card, view its 4 slots, equip/unequip from inventory

### Database Schema

**`equipment_items`** (static catalog, seeded)

```sql
CREATE TYPE slot_type_enum AS ENUM ('stat_boost', 'ability_enhancement', 'utility', 'ai_core', 'consumable');

CREATE TABLE equipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slot_type slot_type_enum NOT NULL,
  effect_type TEXT NOT NULL,
  effect_value JSONB NOT NULL,
  sol_price DECIMAL(10,4) NOT NULL,
  description TEXT NOT NULL
);
```

**`player_inventory`** (owned, unequipped items)

```sql
CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES equipment_items(id) NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

**`card_equipment`** (items equipped on cards)

```sql
CREATE TABLE card_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
  inventory_id UUID REFERENCES player_inventory(id) ON DELETE CASCADE NOT NULL,
  slot_type slot_type_enum NOT NULL,
  equipped_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(card_id, slot_type)
);
```

**`sol_transactions`** (payment audit log)

```sql
CREATE TABLE sol_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  tx_signature TEXT UNIQUE NOT NULL,
  sol_amount DECIMAL(10,4) NOT NULL,
  item_id UUID REFERENCES equipment_items(id) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
```

### SOL Payment Flow

1. Player clicks "Buy" in shop
2. Frontend builds Solana transfer instruction (player wallet -> treasury wallet)
3. Wallet adapter prompts for signature
4. Transaction submitted to devnet
5. Frontend sends `tx_signature` to backend verification
6. Backend verifies on-chain: correct amount, confirmed status
7. Backend credits item to `player_inventory`
8. If consumable: immediately update player record (add pulls/battles)
9. If equipment: item appears in inventory for equipping

### Battle Integration

Equipment modifiers apply in this order:
1. Base card stats
2. Rarity multiplier
3. Equipment stat boosts (additive — Stat Chip + AI Core both apply)
4. Passive ability bonus (doubled by Passive Booster/Ability Overcharge/AI Core)
5. Ability trigger roll (chance overridden by Trigger Amplifier/AI Core — take highest)
6. Utility effects (Dimension Scout, XP multipliers)

For stacking: Trigger Amplifier II (60%) + AI Core (70%) = 70% (take max, don't sum).

### RLS Policies

- `equipment_items`: publicly readable (catalog)
- `player_inventory`: player can read/write own rows
- `card_equipment`: player can read/write own rows (via card ownership)
- `sol_transactions`: player can read/insert own rows

## UI Design

### Shop Tab

- Items grouped by category (Consumables, Stat Boosts, Ability, Utility, AI Core)
- Each item card shows: name, effect description, SOL price, "Buy" button
- Price-tier borders: green (<0.1), blue (0.1-0.5), gold (0.5-1.0), rainbow (10 SOL AI Core)
- Stat Chips show dimension picker dropdown before purchase
- Wallet balance shown in header

### My Cards Tab

- Left panel: card list from collection (compact CardDisplay)
- Right panel: selected card with 4 slots (Stat Boost, Ability, Utility, AI)
- Each slot shows equipped item or "empty" + equip button
- Equipped items show "Unequip (0.01 SOL)" button
- Bottom: unequipped inventory items filtered by slot type
- Click inventory item -> equips to matching empty slot

### Styling

- Dark theme consistent with existing pages (gray-950/900)
- Price-tier borders match rarity border patterns
- SOL amounts with Solana symbol
- Loading spinner during wallet confirmation
- Success: green flash + item in inventory
- Failure: red toast with error

## Error Handling

- **Wallet not connected:** "Connect Wallet" replaces Buy buttons
- **Insufficient SOL:** Toast error from wallet adapter rejection
- **Transaction timeout:** Poll 30s max, mark failed, show retry message
- **Full slot:** Button disabled, "Slot occupied — unequip first"
- **Card burned with equipment:** Auto-unequip to inventory (no fee)
- **Double-spend:** Backend enforces unique `tx_signature`
- **Price mismatch:** Backend verifies on-chain amount matches item price

## Demo Mode

All features work in local/demo mode (no Supabase) using in-memory stores, matching existing pattern in `db.ts`. SOL transactions are simulated in demo mode.
