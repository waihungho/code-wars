# Design: Abilities, Rarity Borders & Daily Battle Limit

**Date:** 2026-02-18

---

## 1. Ability System

Each of the 8 programming languages has a unique ability with two components:
- **Passive:** Always-on stat bonus during battle
- **Triggered:** 30% chance to activate during battle, creating dramatic moments

### Ability Table

| Language   | Ability Name          | Passive           | Triggered (30%)                                  |
|------------|-----------------------|-------------------|--------------------------------------------------|
| Assembly   | Direct Damage Array   | +15% Speed        | If SPD wins, double SPD score                    |
| C          | Direct Memory Access  | +15% Speed        | If losing any round, ignore lowest loss          |
| Rust       | The Borrow Checker    | +20% Security     | If SEC wins, opponent -10% next dimension        |
| Java       | The Garbage Collector | +10% Ecosystem    | Ties become player wins                          |
| Go         | Goroutine Swarm       | +15% Scalability  | If SCL wins, +5% all remaining dimensions        |
| JavaScript | Event Storm           | +10% Ecosystem    | Swap one AI dimension with their lowest          |
| Python     | Library Summon        | +10% DevExp       | Copy opponent's highest as +10% to player weakest|
| Solidity   | The Nexus             | +15% Security     | If win 2/3, double XP reward                     |

### Ability Icons (Tech/Cyber Aesthetic)

Each icon is a 32x32 monoline SVG with circuit-trace outlines and the language's accent glow.

- **Assembly — Direct Damage Array:** Vertical stack of 4 register cells, middle two shattered with fracture lines. Voltage arc cuts diagonally through. Circuit traces from corners.
- **C — Direct Memory Access:** Hexagonal memory grid (3x3 honeycomb). Sharp arrow pierces to center cell which pulses bright. `0xFF` etched below. PCB traces connect cells.
- **Rust — The Borrow Checker:** Geometric shield from interlocking gear teeth. Ampersand `&` cut as negative space glowing accent. Tiny padlock at bottom vertex.
- **Java — The Garbage Collector:** Three orbital rings (atom-like) around central diamond. Data fragments swept inward along orbits, dissolving into pixels.
- **Go — Goroutine Swarm:** Single input channel fans into 5 parallel traces with arrowheads. Wave interference patterns at crossings. Parallel processing schematic style.
- **JavaScript — Event Storm:** Circular event loop as continuous spiral inward. Lightning discharge at center with 3 forked bolts. Clock-face tick marks around loop.
- **Python — Library Summon:** Open hexagonal portal frame with circuit runes. Stack of 3 module blocks rising within. Summoning-circle traces radiate beneath.
- **Solidity — The Nexus:** Ethereum diamond from 4 interlocking chain links with micro-circuit traces. Center void glows intensely. Blockchain grid extends behind.

**Rendering:** Monoline stroke (1.5px), language accent color, transparent background. Hover adds outer glow + circuit-pulse animation.

---

## 2. Rarity Border System

Each rarity tier gets progressively more dramatic visuals across four layers.

| Rarity      | Border                              | Glow                     | Animation                                    | Inner Accent              |
|-------------|---------------------------------------|--------------------------|----------------------------------------------|---------------------------|
| Common      | 1px solid gray-600                   | None                     | None                                         | None                      |
| Uncommon    | 2px solid green-500                  | Subtle green shadow      | None                                         | Faint green inner line    |
| Rare        | 2px solid blue-400                   | Blue pulsing glow (slow) | Gentle shimmer on hover                      | Blue corner accents       |
| Legendary   | 3px gold rotating gradient border    | Gold animated glow       | Rotating gradient + sparkle particles        | Gold foil corner stamps   |
| Mythic      | 3px animated rainbow gradient        | Intense prismatic glow   | Rainbow border rotation + floating embers    | Holographic sheen overlay |

### Implementation

- **Common–Rare:** CSS-only via Tailwind classes + small custom CSS
- **Legendary:** `conic-gradient` on pseudo-element with `@keyframes rotate`, GPU-accelerated
- **Mythic:** Rainbow `conic-gradient` rotation + semi-transparent overlay with `linear-gradient` that shifts on hover (CSS `perspective` + `transform: rotateX/Y`)

---

## 3. Ability Codex Page

New **CODEX** nav item between VAULT and ARENA. Reference encyclopedia for all 8 language abilities.

### Layout

Grid of 8 language panels (2x4 desktop, 1-column mobile). Each panel:

```
┌──────────────────────────────────┐
│  [Card Art]   RUST               │
│               The Ironclad Warmage│
│                                  │
│  [Icon] THE BORROW CHECKER       │
│  "Memory safety isn't optional." │
│                                  │
│  PASSIVE    +20% Security        │
│  TRIGGERED  If SEC wins,         │
│   (30%)     opponent gets -10%   │
│             on next dimension    │
│                                  │
│  BASE STATS ───────────────────  │
│  SPD ████████░░ 9                │
│  SEC ██████████ 10               │
│  ECO ██████░░░░ 6                │
│  SCL ████████░░ 8                │
│  DEV ████░░░░░░ 4                │
└──────────────────────────────────┘
```

Panels use language theme colors. Click to expand for longer lore.

---

## 4. Daily Battle Limit

Players can battle **unlimited times per day**, but only the first **20 battles** award XP and count toward leaderboard.

### Mechanics

- New `daily_battles` field on player (resets at midnight UTC with `daily_pulls`)
- `daily_battles <= 20`: full XP, leaderboard stats recorded
- `daily_battles > 20`: battle plays out, but `+0 XP` with "DAILY LIMIT REACHED" tag, no leaderboard update

### Arena UI

- Battle counter in header: `⚔ 14/20 TODAY`
- At 20/20: counter turns gray, shows `⚔ 20/20 — PRACTICE MODE`
- Result screen: XP line changes to `+0 XP (daily cap)` in dimmed gray
- Note: `"Ranked battles reset at 00:00 UTC"`

### Reset

Rename `resetDailyPulls` → `resetDailyLimits`, also resets `daily_battles` to 0.

---

## Implementation Files to Modify

1. **`src/lib/types.ts`** — Add `Ability` type, add `ability` field to `Card`, add `daily_battles` to `Player`
2. **`src/lib/constants.ts`** — Add `ABILITIES` map, add `MAX_DAILY_BATTLES = 20`
3. **`src/lib/battle.ts`** — Apply passive bonuses, roll triggered abilities, respect daily limit
4. **`src/lib/db.ts`** — Update `resetDailyLimits`, `updatePlayerAfterBattle` with daily check
5. **`src/components/CardDisplay.tsx`** — Rarity border CSS, ability name/icon display
6. **`src/app/globals.css`** — Rotating gradient, holographic, shimmer, particle animations
7. **`src/app/codex/page.tsx`** — New Codex page
8. **`src/app/battle/page.tsx`** — Battle counter, practice mode indicator, ability trigger display
9. **`src/components/NavBar.tsx`** — Add CODEX link
10. **`src/components/AbilityIcon.tsx`** — New SVG icon component for 8 abilities
11. **`supabase/schema.sql`** — Add `daily_battles` column
