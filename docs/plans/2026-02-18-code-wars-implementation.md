# Code Wars Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a solo-play programming language card battle game as a Solana DApp with gacha, upgrades, battles, and leaderboard.

**Architecture:** Next.js App Router frontend with Supabase backend. Wallet-based auth via Solana wallet-adapter. Game logic runs client-side and via Supabase Edge Functions. Only Mythic NFTs go on-chain via Metaplex.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase (Postgres + Auth + Edge Functions), @solana/wallet-adapter, Metaplex SDK, Vitest for testing.

---

## Phase 1 — Core

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.env.local.example`, `.gitignore`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Step 2: Install Solana and Supabase dependencies**

Run:
```bash
npm install @solana/wallet-adapter-base @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js @supabase/supabase-js
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

**Step 3: Create .env.local.example**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

**Step 4: Create vitest config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/test/setup.ts`:
```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run"
```

**Step 5: Verify setup compiles**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Solana and Supabase deps"
```

---

### Task 2: Game Constants & TypeScript Types

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/__tests__/constants.test.ts`

**Step 1: Write the failing test for constants**

Create `src/lib/__tests__/constants.test.ts`:
```typescript
import {
  LANGUAGES,
  BASE_STATS,
  RARITY_TIERS,
  RARITY_ODDS,
  DIMENSIONS,
  MAX_STAT,
  FREE_PULLS_PER_DAY,
  RARITY_STAT_MULTIPLIERS,
} from "../constants";
import type { Language, Rarity, Dimension } from "../types";

describe("Game Constants", () => {
  test("has 8 languages", () => {
    expect(LANGUAGES).toHaveLength(8);
    expect(LANGUAGES).toContain("Assembly");
    expect(LANGUAGES).toContain("C");
    expect(LANGUAGES).toContain("Rust");
    expect(LANGUAGES).toContain("Java");
    expect(LANGUAGES).toContain("Go");
    expect(LANGUAGES).toContain("JavaScript");
    expect(LANGUAGES).toContain("Python");
    expect(LANGUAGES).toContain("Solidity");
  });

  test("has 5 dimensions", () => {
    expect(DIMENSIONS).toHaveLength(5);
    expect(DIMENSIONS).toContain("speed");
    expect(DIMENSIONS).toContain("security");
    expect(DIMENSIONS).toContain("ecosystem");
    expect(DIMENSIONS).toContain("scalability");
    expect(DIMENSIONS).toContain("devExp");
  });

  test("base stats exist for every language and dimension", () => {
    for (const lang of LANGUAGES) {
      expect(BASE_STATS[lang]).toBeDefined();
      for (const dim of DIMENSIONS) {
        const stat = BASE_STATS[lang][dim];
        expect(stat).toBeGreaterThanOrEqual(1);
        expect(stat).toBeLessThanOrEqual(10);
      }
    }
  });

  test("rarity odds sum to 1", () => {
    const totalOdds = RARITY_TIERS.reduce(
      (sum, rarity) => sum + RARITY_ODDS[rarity],
      0
    );
    expect(totalOdds).toBeCloseTo(1.0);
  });

  test("max stat is 1000", () => {
    expect(MAX_STAT).toBe(1000);
  });

  test("free pulls per day is 3", () => {
    expect(FREE_PULLS_PER_DAY).toBe(3);
  });

  test("rarity multipliers increase with rarity", () => {
    expect(RARITY_STAT_MULTIPLIERS.Common).toBe(1);
    expect(RARITY_STAT_MULTIPLIERS.Uncommon).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Common
    );
    expect(RARITY_STAT_MULTIPLIERS.Rare).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Uncommon
    );
    expect(RARITY_STAT_MULTIPLIERS.Legendary).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Rare
    );
    expect(RARITY_STAT_MULTIPLIERS.Mythic).toBeGreaterThan(
      RARITY_STAT_MULTIPLIERS.Legendary
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/constants.test.ts`
Expected: FAIL

**Step 3: Write types**

Create `src/lib/types.ts`:
```typescript
export type Language =
  | "Assembly"
  | "C"
  | "Rust"
  | "Java"
  | "Go"
  | "JavaScript"
  | "Python"
  | "Solidity";

export type Rarity = "Common" | "Uncommon" | "Rare" | "Legendary" | "Mythic";

export type Dimension =
  | "speed"
  | "security"
  | "ecosystem"
  | "scalability"
  | "devExp";

export interface Stats {
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  devExp: number;
}

export interface Card {
  id: string;
  playerId: string;
  language: Language;
  rarity: Rarity;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  devExp: number;
  nftMintAddress: string | null;
  createdAt: string;
}

export interface Player {
  id: string;
  walletAddress: string;
  freePullsRemaining: number;
  lastPullReset: string;
  xp: number;
  createdAt: string;
}

export interface BattleResult {
  playerCard: Card;
  aiLanguage: Language;
  aiStats: Stats;
  dimensionsPicked: [Dimension, Dimension, Dimension];
  result: "win" | "lose" | "draw";
  xpEarned: number;
}
```

**Step 4: Write constants**

Create `src/lib/constants.ts`:
```typescript
import type { Language, Rarity, Dimension, Stats } from "./types";

export const LANGUAGES: Language[] = [
  "Assembly",
  "C",
  "Rust",
  "Java",
  "Go",
  "JavaScript",
  "Python",
  "Solidity",
];

export const DIMENSIONS: Dimension[] = [
  "speed",
  "security",
  "ecosystem",
  "scalability",
  "devExp",
];

export const RARITY_TIERS: Rarity[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Legendary",
  "Mythic",
];

export const BASE_STATS: Record<Language, Stats> = {
  Assembly: { speed: 10, security: 3, ecosystem: 2, scalability: 4, devExp: 1 },
  C: { speed: 9, security: 2, ecosystem: 7, scalability: 5, devExp: 3 },
  Rust: { speed: 9, security: 10, ecosystem: 6, scalability: 8, devExp: 4 },
  Java: { speed: 6, security: 7, ecosystem: 10, scalability: 8, devExp: 5 },
  Go: { speed: 7, security: 6, ecosystem: 6, scalability: 9, devExp: 7 },
  JavaScript: {
    speed: 5,
    security: 3,
    ecosystem: 10,
    scalability: 6,
    devExp: 8,
  },
  Python: { speed: 3, security: 4, ecosystem: 10, scalability: 4, devExp: 10 },
  Solidity: { speed: 4, security: 5, ecosystem: 5, scalability: 3, devExp: 5 },
};

export const RARITY_ODDS: Record<Rarity, number> = {
  Common: 0.5,
  Uncommon: 0.3,
  Rare: 0.15,
  Legendary: 0.045,
  Mythic: 0.005,
};

export const RARITY_STAT_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 1.2,
  Rare: 1.5,
  Legendary: 2.0,
  Mythic: 3.0,
};

export const MAX_STAT = 1000;
export const FREE_PULLS_PER_DAY = 3;
export const BATTLE_DIMENSIONS_COUNT = 3;
export const MIN_BATTLES_FOR_WINRATE = 10;
```

**Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/constants.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts src/lib/__tests__/constants.test.ts
git commit -m "feat: add game types and constants for 8 languages and 5 dimensions"
```

---

### Task 3: Gacha Engine (Pure Logic)

**Files:**
- Create: `src/lib/gacha.ts`
- Create: `src/lib/__tests__/gacha.test.ts`

**Step 1: Write failing tests for gacha logic**

Create `src/lib/__tests__/gacha.test.ts`:
```typescript
import { rollRarity, generateCardStats, generateCard } from "../gacha";
import {
  RARITY_TIERS,
  BASE_STATS,
  RARITY_STAT_MULTIPLIERS,
  MAX_STAT,
} from "../constants";
import type { Language, Rarity } from "../types";

describe("Gacha Engine", () => {
  describe("rollRarity", () => {
    test("returns a valid rarity", () => {
      for (let i = 0; i < 100; i++) {
        const rarity = rollRarity();
        expect(RARITY_TIERS).toContain(rarity);
      }
    });

    test("returns Common for roll 0.0", () => {
      expect(rollRarity(0.0)).toBe("Common");
    });

    test("returns Common for roll 0.49", () => {
      expect(rollRarity(0.49)).toBe("Common");
    });

    test("returns Uncommon for roll 0.5", () => {
      expect(rollRarity(0.5)).toBe("Uncommon");
    });

    test("returns Mythic for roll 0.999", () => {
      expect(rollRarity(0.999)).toBe("Mythic");
    });
  });

  describe("generateCardStats", () => {
    test("stats are within expected range for Common", () => {
      const stats = generateCardStats("Rust", "Common");
      expect(stats.speed).toBeGreaterThanOrEqual(BASE_STATS.Rust.speed * 0.8);
      expect(stats.speed).toBeLessThanOrEqual(
        BASE_STATS.Rust.speed * RARITY_STAT_MULTIPLIERS.Common * 1.2
      );
    });

    test("Mythic stats are higher than Common on average", () => {
      let mythicTotal = 0;
      let commonTotal = 0;
      for (let i = 0; i < 100; i++) {
        const mythic = generateCardStats("Python", "Mythic");
        const common = generateCardStats("Python", "Common");
        mythicTotal +=
          mythic.speed +
          mythic.security +
          mythic.ecosystem +
          mythic.scalability +
          mythic.devExp;
        commonTotal +=
          common.speed +
          common.security +
          common.ecosystem +
          common.scalability +
          common.devExp;
      }
      expect(mythicTotal / 100).toBeGreaterThan(commonTotal / 100);
    });

    test("no stat exceeds MAX_STAT", () => {
      for (let i = 0; i < 100; i++) {
        const stats = generateCardStats("Assembly", "Mythic");
        expect(stats.speed).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.security).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.ecosystem).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.scalability).toBeLessThanOrEqual(MAX_STAT);
        expect(stats.devExp).toBeLessThanOrEqual(MAX_STAT);
      }
    });
  });

  describe("generateCard", () => {
    test("returns a card with all required fields", () => {
      const card = generateCard("player-123");
      expect(card.playerId).toBe("player-123");
      expect(card.language).toBeDefined();
      expect(card.rarity).toBeDefined();
      expect(card.speed).toBeGreaterThan(0);
      expect(card.security).toBeGreaterThan(0);
      expect(card.ecosystem).toBeGreaterThan(0);
      expect(card.scalability).toBeGreaterThan(0);
      expect(card.devExp).toBeGreaterThan(0);
      expect(card.nftMintAddress).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/gacha.test.ts`
Expected: FAIL

**Step 3: Implement gacha engine**

Create `src/lib/gacha.ts`:
```typescript
import {
  LANGUAGES,
  RARITY_TIERS,
  RARITY_ODDS,
  BASE_STATS,
  RARITY_STAT_MULTIPLIERS,
  MAX_STAT,
} from "./constants";
import type { Language, Rarity, Stats, Card } from "./types";

export function rollRarity(roll?: number): Rarity {
  const r = roll ?? Math.random();
  let cumulative = 0;
  for (const rarity of RARITY_TIERS) {
    cumulative += RARITY_ODDS[rarity];
    if (r < cumulative) return rarity;
  }
  return "Common";
}

export function generateCardStats(language: Language, rarity: Rarity): Stats {
  const base = BASE_STATS[language];
  const multiplier = RARITY_STAT_MULTIPLIERS[rarity];
  const randomize = (val: number) => {
    const min = Math.floor(val * multiplier * 0.8);
    const max = Math.ceil(val * multiplier * 1.2);
    const result = min + Math.floor(Math.random() * (max - min + 1));
    return Math.min(result, MAX_STAT);
  };
  return {
    speed: randomize(base.speed),
    security: randomize(base.security),
    ecosystem: randomize(base.ecosystem),
    scalability: randomize(base.scalability),
    devExp: randomize(base.devExp),
  };
}

export function generateCard(playerId: string): Omit<Card, "id" | "createdAt"> {
  const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
  const rarity = rollRarity();
  const stats = generateCardStats(language, rarity);
  return {
    playerId,
    language,
    rarity,
    ...stats,
    nftMintAddress: null,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/gacha.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/gacha.ts src/lib/__tests__/gacha.test.ts
git commit -m "feat: implement gacha engine with rarity rolls and stat generation"
```

---

### Task 4: Battle Engine (Pure Logic)

**Files:**
- Create: `src/lib/battle.ts`
- Create: `src/lib/__tests__/battle.test.ts`

**Step 1: Write failing tests for battle logic**

Create `src/lib/__tests__/battle.test.ts`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/battle.test.ts`
Expected: FAIL

**Step 3: Implement battle engine**

Create `src/lib/battle.ts`:
```typescript
import {
  LANGUAGES,
  DIMENSIONS,
  BASE_STATS,
  BATTLE_DIMENSIONS_COUNT,
} from "./constants";
import type { Language, Dimension, Stats, Card, BattleResult } from "./types";

export function pickRandomDimensions(): [Dimension, Dimension, Dimension] {
  const shuffled = [...DIMENSIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, BATTLE_DIMENSIONS_COUNT) as [
    Dimension,
    Dimension,
    Dimension,
  ];
}

export function generateAiOpponent(difficulty: number): {
  language: Language;
  stats: Stats;
} {
  const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
  const base = BASE_STATS[language];
  const scale = difficulty * 1.5;
  const randomize = (val: number) => {
    const scaled = val * scale;
    const min = Math.floor(scaled * 0.8);
    const max = Math.ceil(scaled * 1.2);
    return Math.max(1, min + Math.floor(Math.random() * (max - min + 1)));
  };
  return {
    language,
    stats: {
      speed: randomize(base.speed),
      security: randomize(base.security),
      ecosystem: randomize(base.ecosystem),
      scalability: randomize(base.scalability),
      devExp: randomize(base.devExp),
    },
  };
}

export function resolveBattle(
  playerCard: Card,
  aiStats: Stats,
  dimensions: [Dimension, Dimension, Dimension]
): BattleResult {
  let playerScore = 0;
  let aiScore = 0;

  for (const dim of dimensions) {
    const playerStat = playerCard[dim === "devExp" ? "devExp" : dim] as number;
    const aiStat = aiStats[dim];
    if (playerStat > aiStat) {
      playerScore++;
    } else if (aiStat > playerStat) {
      aiScore++;
    } else {
      playerScore += 0.5;
      aiScore += 0.5;
    }
  }

  let result: "win" | "lose" | "draw";
  let xpEarned: number;

  if (playerScore > aiScore) {
    result = "win";
    xpEarned = 10 + Math.floor(Math.random() * 5);
  } else if (aiScore > playerScore) {
    result = "lose";
    xpEarned = 0;
  } else {
    result = "draw";
    xpEarned = 3;
  }

  return {
    playerCard,
    aiLanguage: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    aiStats,
    dimensionsPicked: dimensions,
    result,
    xpEarned,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/battle.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/battle.ts src/lib/__tests__/battle.test.ts
git commit -m "feat: implement battle engine with AI opponent and dimension comparison"
```

---

### Task 5: Upgrade Engine (Pure Logic)

**Files:**
- Create: `src/lib/upgrade.ts`
- Create: `src/lib/__tests__/upgrade.test.ts`

**Step 1: Write failing tests**

Create `src/lib/__tests__/upgrade.test.ts`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/upgrade.test.ts`
Expected: FAIL

**Step 3: Implement upgrade engine**

Create `src/lib/upgrade.ts`:
```typescript
import { MAX_STAT } from "./constants";
import type { Card, Dimension, Rarity } from "./types";

const BURN_MATERIALS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 3,
  Rare: 8,
  Legendary: 25,
  Mythic: 100,
};

export function getBurnMaterials(rarity: Rarity): number {
  return BURN_MATERIALS[rarity];
}

export function getUpgradeCost(currentStat: number): number {
  return Math.max(1, Math.floor(currentStat / 10) + 1);
}

export function canUpgrade(
  card: Card,
  dimension: Dimension,
  materials: number,
  xp: number
): boolean {
  const statKey = dimension === "devExp" ? "devExp" : dimension;
  const currentStat = card[statKey] as number;
  if (currentStat >= MAX_STAT) return false;
  const cost = getUpgradeCost(currentStat);
  return materials >= cost || xp >= cost;
}

export function applyUpgrade(card: Card, dimension: Dimension): Card {
  const statKey = dimension === "devExp" ? "devExp" : dimension;
  const currentStat = card[statKey] as number;
  const increment = Math.max(1, Math.floor(Math.random() * 3) + 1);
  const newStat = Math.min(currentStat + increment, MAX_STAT);
  return { ...card, [statKey]: newStat };
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/upgrade.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/upgrade.ts src/lib/__tests__/upgrade.test.ts
git commit -m "feat: implement card upgrade engine with burn and XP paths"
```

---

### Task 6: Supabase Client & Database Schema

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `supabase/schema.sql`

**Step 1: Create Supabase client**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 2: Create database schema SQL**

Create `supabase/schema.sql`:
```sql
-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  free_pulls_remaining INTEGER DEFAULT 3 NOT NULL,
  last_pull_reset TIMESTAMPTZ DEFAULT now() NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  materials INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Cards table
CREATE TYPE language_enum AS ENUM (
  'Assembly', 'C', 'Rust', 'Java', 'Go', 'JavaScript', 'Python', 'Solidity'
);

CREATE TYPE rarity_enum AS ENUM (
  'Common', 'Uncommon', 'Rare', 'Legendary', 'Mythic'
);

CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  language language_enum NOT NULL,
  rarity rarity_enum NOT NULL,
  speed INTEGER NOT NULL,
  security INTEGER NOT NULL,
  ecosystem INTEGER NOT NULL,
  scalability INTEGER NOT NULL,
  dev_exp INTEGER NOT NULL,
  nft_mint_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Battle logs
CREATE TYPE battle_result_enum AS ENUM ('win', 'lose', 'draw');

CREATE TABLE battle_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  player_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  ai_language language_enum NOT NULL,
  ai_stats JSONB NOT NULL,
  dimensions_picked TEXT[] NOT NULL,
  result battle_result_enum NOT NULL,
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_cards_player_id ON cards(player_id);
CREATE INDEX idx_battle_logs_player_id ON battle_logs(player_id);
CREATE INDEX idx_battle_logs_result ON battle_logs(result);
CREATE INDEX idx_players_wallet ON players(wallet_address);

-- Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_logs ENABLE ROW LEVEL SECURITY;

-- Players can read/write their own data
CREATE POLICY "Players can view own profile"
  ON players FOR SELECT
  USING (wallet_address = current_setting('app.wallet_address', true));

CREATE POLICY "Players can update own profile"
  ON players FOR UPDATE
  USING (wallet_address = current_setting('app.wallet_address', true));

-- Cards: players can read/write their own cards
CREATE POLICY "Players can view own cards"
  ON cards FOR SELECT
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can insert own cards"
  ON cards FOR INSERT
  WITH CHECK (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can delete own cards"
  ON cards FOR DELETE
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Battle logs: players can read/insert their own
CREATE POLICY "Players can view own battles"
  ON battle_logs FOR SELECT
  USING (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

CREATE POLICY "Players can insert own battles"
  ON battle_logs FOR INSERT
  WITH CHECK (player_id IN (
    SELECT id FROM players
    WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Leaderboard: everyone can read aggregated stats
CREATE POLICY "Anyone can view players for leaderboard"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view battle_logs for leaderboard"
  ON battle_logs FOR SELECT
  USING (true);
```

**Step 3: Commit**

```bash
git add src/lib/supabase.ts supabase/schema.sql
git commit -m "feat: add Supabase client and database schema with RLS policies"
```

---

### Task 7: Supabase Data Access Layer

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/__tests__/db.test.ts`

**Step 1: Write failing tests for DB helpers (mocked)**

Create `src/lib/__tests__/db.test.ts`:
```typescript
import { describe, test, expect, vi, beforeEach } from "vitest";
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/db.test.ts`
Expected: FAIL

**Step 3: Implement data access layer**

Create `src/lib/db.ts`:
```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/db.test.ts`
Expected: PASS

**Step 5: Add leaderboard RPCs to schema**

Append to `supabase/schema.sql`:
```sql
-- Leaderboard RPC functions
CREATE OR REPLACE FUNCTION leaderboard_by_wins(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, total_wins BIGINT) AS $$
  SELECT p.wallet_address, COUNT(*) as total_wins
  FROM battle_logs bl
  JOIN players p ON p.id = bl.player_id
  WHERE bl.result = 'win'
  GROUP BY p.wallet_address
  ORDER BY total_wins DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION leaderboard_by_win_rate(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, win_rate NUMERIC, total_battles BIGINT) AS $$
  SELECT
    p.wallet_address,
    ROUND(COUNT(*) FILTER (WHERE bl.result = 'win')::NUMERIC / COUNT(*)::NUMERIC, 3) as win_rate,
    COUNT(*) as total_battles
  FROM battle_logs bl
  JOIN players p ON p.id = bl.player_id
  GROUP BY p.wallet_address
  HAVING COUNT(*) >= 10
  ORDER BY win_rate DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION leaderboard_by_strongest_card(lim INTEGER DEFAULT 20)
RETURNS TABLE(wallet_address TEXT, language language_enum, total_stats BIGINT) AS $$
  SELECT
    p.wallet_address,
    c.language,
    (c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp)::BIGINT as total_stats
  FROM cards c
  JOIN players p ON p.id = c.player_id
  ORDER BY total_stats DESC
  LIMIT lim;
$$ LANGUAGE sql STABLE;
```

**Step 6: Commit**

```bash
git add src/lib/db.ts src/lib/__tests__/db.test.ts supabase/schema.sql
git commit -m "feat: add Supabase data access layer with leaderboard RPCs"
```

---

### Task 8: Wallet Provider & Layout

**Files:**
- Create: `src/components/WalletProvider.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/app/globals.css` (update)

**Step 1: Create WalletProvider component**

Create `src/components/WalletProvider.tsx`:
```typescript
"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      clusterApiUrl("devnet"),
    []
  );

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
```

**Step 2: Create game context provider**

Create `src/components/GameProvider.tsx`:
```typescript
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getOrCreatePlayer, getPlayerCards, resetDailyPulls } from "@/lib/db";
import type { Card } from "@/lib/types";

interface GameState {
  player: any | null;
  cards: Card[];
  loading: boolean;
  refreshCards: () => Promise<void>;
  refreshPlayer: () => Promise<void>;
}

const GameContext = createContext<GameState>({
  player: null,
  cards: [],
  loading: true,
  refreshCards: async () => {},
  refreshPlayer: async () => {},
});

export function useGame() {
  return useContext(GameContext);
}

export default function GameProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { publicKey, connected } = useWallet();
  const [player, setPlayer] = useState<any | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshPlayer = useCallback(async () => {
    if (!publicKey) return;
    const p = await getOrCreatePlayer(publicKey.toBase58());
    await resetDailyPulls(p.id);
    const updated = await getOrCreatePlayer(publicKey.toBase58());
    setPlayer(updated);
  }, [publicKey]);

  const refreshCards = useCallback(async () => {
    if (!player) return;
    const c = await getPlayerCards(player.id);
    setCards(c ?? []);
  }, [player]);

  useEffect(() => {
    if (connected && publicKey) {
      setLoading(true);
      refreshPlayer().then(() => setLoading(false));
    } else {
      setPlayer(null);
      setCards([]);
      setLoading(false);
    }
  }, [connected, publicKey, refreshPlayer]);

  useEffect(() => {
    if (player) {
      refreshCards();
    }
  }, [player, refreshCards]);

  return (
    <GameContext.Provider
      value={{ player, cards, loading, refreshCards, refreshPlayer }}
    >
      {children}
    </GameContext.Provider>
  );
}
```

**Step 3: Update layout.tsx**

Replace `src/app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import GameProvider from "@/components/GameProvider";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code Wars - Programming Language Card Game",
  description:
    "Collect, upgrade, and battle programming language cards on Solana",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <WalletProvider>
          <GameProvider>
            <NavBar />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </GameProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
```

**Step 4: Create NavBar component**

Create `src/components/NavBar.tsx`:
```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useGame } from "./GameProvider";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/gacha", label: "Gacha" },
  { href: "/battle", label: "Battle" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { player } = useGame();

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-cyan-400">
            Code Wars
          </Link>
          <div className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? "text-cyan-400 font-medium"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {player && (
            <span className="text-sm text-gray-400">
              XP: {player.xp} | Materials: {player.materials}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}
```

**Step 5: Verify build compiles**

Run: `npm run build`
Expected: Build succeeds (or only env warnings)

**Step 6: Commit**

```bash
git add src/components/ src/app/layout.tsx
git commit -m "feat: add wallet provider, game context, nav bar, and app layout"
```

---

### Task 9: Home Page

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Implement Home page**

Replace `src/app/page.tsx`:
```typescript
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useGame } from "@/components/GameProvider";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function HomePage() {
  const { connected } = useWallet();
  const { player, cards, loading } = useGame();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <h1 className="text-5xl font-bold text-center">
          <span className="text-cyan-400">Code Wars</span>
        </h1>
        <p className="text-xl text-gray-400 text-center max-w-md">
          Collect, upgrade, and battle programming language cards on Solana
        </p>
        <WalletMultiButton />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  const totalBattleStats = cards.reduce(
    (sum, c) => sum + c.speed + c.security + c.ecosystem + c.scalability + c.dev_exp,
    0
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Welcome back, Commander</h1>

      <div className="grid grid-cols-2 gap-4">
        <StatBox label="Cards Owned" value={cards.length} />
        <StatBox label="Total XP" value={player?.xp ?? 0} />
        <StatBox label="Materials" value={player?.materials ?? 0} />
        <StatBox label="Total Power" value={totalBattleStats} />
        <StatBox
          label="Free Pulls Left"
          value={player?.free_pulls_remaining ?? 0}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: implement home page with player stats overview"
```

---

### Task 10: Gacha Page

**Files:**
- Create: `src/app/gacha/page.tsx`
- Create: `src/components/CardDisplay.tsx`

**Step 1: Create reusable CardDisplay component**

Create `src/components/CardDisplay.tsx`:
```typescript
"use client";

import { DIMENSIONS } from "@/lib/constants";
import type { Dimension } from "@/lib/types";

const RARITY_COLORS: Record<string, string> = {
  Common: "border-gray-600 bg-gray-900",
  Uncommon: "border-green-600 bg-green-950",
  Rare: "border-blue-600 bg-blue-950",
  Legendary: "border-yellow-500 bg-yellow-950",
  Mythic: "border-purple-500 bg-purple-950 shadow-lg shadow-purple-500/20",
};

const LANGUAGE_EMOJI: Record<string, string> = {
  Assembly: "🔧",
  C: "⚡",
  Rust: "🦀",
  Java: "☕",
  Go: "🐹",
  JavaScript: "🟨",
  Python: "🐍",
  Solidity: "💎",
};

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

interface CardDisplayProps {
  language: string;
  rarity: string;
  speed: number;
  security: number;
  ecosystem: number;
  scalability: number;
  dev_exp: number;
  compact?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export default function CardDisplay({
  language,
  rarity,
  speed,
  security,
  ecosystem,
  scalability,
  dev_exp,
  compact = false,
  onClick,
  selected = false,
}: CardDisplayProps) {
  const stats = { speed, security, ecosystem, scalability, devExp: dev_exp };
  const totalPower = speed + security + ecosystem + scalability + dev_exp;

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border-2 p-4 transition-all ${
        RARITY_COLORS[rarity] ?? RARITY_COLORS.Common
      } ${onClick ? "cursor-pointer hover:scale-105" : ""} ${
        selected ? "ring-2 ring-cyan-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{LANGUAGE_EMOJI[language] ?? "💻"}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {rarity}
        </span>
      </div>
      <h3 className="text-lg font-bold mb-3">{language}</h3>
      {!compact && (
        <div className="space-y-1">
          {DIMENSIONS.map((dim) => (
            <div key={dim} className="flex justify-between text-sm">
              <span className="text-gray-400">{DIMENSION_LABELS[dim]}</span>
              <span className="font-mono">{stats[dim]}</span>
            </div>
          ))}
          <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-cyan-400">{totalPower}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create Gacha page**

Create `src/app/gacha/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { generateCard } from "@/lib/gacha";
import { insertCard, decrementPulls } from "@/lib/db";

export default function GachaPage() {
  const { connected } = useWallet();
  const { player, refreshCards, refreshPlayer } = useGame();
  const [pulledCard, setPulledCard] = useState<any | null>(null);
  const [pulling, setPulling] = useState(false);
  const [revealing, setRevealing] = useState(false);

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to pull cards
      </div>
    );
  }

  const handlePull = async () => {
    if (player.free_pulls_remaining <= 0) return;

    setPulling(true);
    setPulledCard(null);
    setRevealing(false);

    try {
      await decrementPulls(player.id);

      const cardData = generateCard(player.id);
      const saved = await insertCard({
        player_id: player.id,
        language: cardData.language,
        rarity: cardData.rarity,
        speed: cardData.speed,
        security: cardData.security,
        ecosystem: cardData.ecosystem,
        scalability: cardData.scalability,
        dev_exp: cardData.devExp,
      });

      // Animate reveal
      setTimeout(() => {
        setPulledCard(saved);
        setRevealing(true);
        setPulling(false);
      }, 1500);

      await refreshPlayer();
      await refreshCards();
    } catch (err) {
      console.error("Pull failed:", err);
      setPulling(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <h1 className="text-3xl font-bold">Gacha — Pull Cards</h1>

      <p className="text-gray-400">
        Free pulls remaining today:{" "}
        <span className="text-cyan-400 font-bold">
          {player.free_pulls_remaining}
        </span>
      </p>

      <button
        onClick={handlePull}
        disabled={pulling || player.free_pulls_remaining <= 0}
        className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-lg font-bold transition-colors"
      >
        {pulling ? "Pulling..." : "Pull Card"}
      </button>

      {pulling && !pulledCard && (
        <div className="animate-pulse text-4xl">🎴</div>
      )}

      {revealing && pulledCard && (
        <div className="animate-fade-in max-w-xs mx-auto">
          <CardDisplay
            language={pulledCard.language}
            rarity={pulledCard.rarity}
            speed={pulledCard.speed}
            security={pulledCard.security}
            ecosystem={pulledCard.ecosystem}
            scalability={pulledCard.scalability}
            dev_exp={pulledCard.dev_exp}
          />
        </div>
      )}
    </div>
  );
}
```

**Step 3: Add fade-in animation to globals.css**

Add to `src/app/globals.css`:
```css
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/gacha/ src/components/CardDisplay.tsx src/app/globals.css
git commit -m "feat: implement gacha page with card pulling and reveal animation"
```

---

### Task 11: Collection Page

**Files:**
- Create: `src/app/collection/page.tsx`

**Step 1: Implement Collection page with upgrade and burn UI**

Create `src/app/collection/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import { DIMENSIONS } from "@/lib/constants";
import {
  getBurnMaterials,
  getUpgradeCost,
  canUpgrade,
  applyUpgrade,
} from "@/lib/upgrade";
import {
  deleteCard,
  updateCardStats,
  updatePlayerMaterials,
} from "@/lib/db";
import type { Card, Dimension } from "@/lib/types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

export default function CollectionPage() {
  const { connected } = useWallet();
  const { player, cards, refreshCards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [mode, setMode] = useState<"view" | "upgrade" | "burn">("view");

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to view your collection
      </div>
    );
  }

  const handleBurn = async (card: any) => {
    const materials = getBurnMaterials(card.rarity);
    await deleteCard(card.id);
    await updatePlayerMaterials(
      player.id,
      (player.materials ?? 0) + materials
    );
    setSelectedCard(null);
    await refreshCards();
    await refreshPlayer();
  };

  const handleUpgrade = async (card: any, dimension: Dimension) => {
    const statKey = dimension === "devExp" ? "dev_exp" : dimension;
    const currentStat = card[statKey] as number;
    const cost = getUpgradeCost(currentStat);

    // Prefer materials, then XP
    if ((player.materials ?? 0) >= cost) {
      await updatePlayerMaterials(player.id, player.materials - cost);
    } else if (player.xp >= cost) {
      // Use XP (update via refreshPlayer after)
    } else {
      return;
    }

    const upgraded = applyUpgrade(
      { ...card, devExp: card.dev_exp } as Card,
      dimension
    );
    await updateCardStats(card.id, {
      [statKey]: upgraded[dimension === "devExp" ? "devExp" : dimension],
    });
    await refreshCards();
    await refreshPlayer();

    // Update selected card view
    const updatedCards = await refreshCards();
    setSelectedCard(cards.find((c: any) => c.id === card.id) ?? null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Collection ({cards.length})</h1>
        <div className="flex gap-2">
          <ModeButton
            active={mode === "view"}
            onClick={() => setMode("view")}
            label="View"
          />
          <ModeButton
            active={mode === "upgrade"}
            onClick={() => setMode("upgrade")}
            label="Upgrade"
          />
          <ModeButton
            active={mode === "burn"}
            onClick={() => setMode("burn")}
            label="Burn"
          />
        </div>
      </div>

      {cards.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          No cards yet — go pull some!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card: any) => (
            <CardDisplay
              key={card.id}
              language={card.language}
              rarity={card.rarity}
              speed={card.speed}
              security={card.security}
              ecosystem={card.ecosystem}
              scalability={card.scalability}
              dev_exp={card.dev_exp}
              selected={selectedCard?.id === card.id}
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>
      )}

      {selectedCard && mode === "upgrade" && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold">
            Upgrade {selectedCard.language}
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {DIMENSIONS.map((dim) => {
              const statKey = dim === "devExp" ? "dev_exp" : dim;
              const cost = getUpgradeCost(selectedCard[statKey]);
              return (
                <button
                  key={dim}
                  onClick={() => handleUpgrade(selectedCard, dim)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                >
                  <p className="text-xs text-gray-400">
                    {DIMENSION_LABELS[dim]}
                  </p>
                  <p className="font-bold">{selectedCard[statKey]}</p>
                  <p className="text-xs text-cyan-400">Cost: {cost}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedCard && mode === "burn" && (
        <div className="bg-gray-900 border border-red-900 rounded-lg p-6 text-center space-y-4">
          <h2 className="text-xl font-bold">
            Burn {selectedCard.language} ({selectedCard.rarity})?
          </h2>
          <p className="text-gray-400">
            You will receive{" "}
            <span className="text-cyan-400 font-bold">
              {getBurnMaterials(selectedCard.rarity)}
            </span>{" "}
            materials
          </p>
          <button
            onClick={() => handleBurn(selectedCard)}
            className="px-6 py-2 bg-red-700 hover:bg-red-600 rounded-lg font-bold transition-colors"
          >
            Burn Card
          </button>
        </div>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-cyan-600 text-white"
          : "bg-gray-800 text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/collection/
git commit -m "feat: implement collection page with upgrade and burn mechanics"
```

---

### Task 12: Battle Page

**Files:**
- Create: `src/app/battle/page.tsx`

**Step 1: Implement Battle page**

Create `src/app/battle/page.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/components/GameProvider";
import CardDisplay from "@/components/CardDisplay";
import {
  pickRandomDimensions,
  generateAiOpponent,
  resolveBattle,
} from "@/lib/battle";
import {
  insertBattleLog,
  updatePlayerAfterBattle,
} from "@/lib/db";
import type { Card, Dimension, BattleResult } from "@/lib/types";

const DIMENSION_LABELS: Record<Dimension, string> = {
  speed: "Speed",
  security: "Security",
  ecosystem: "Ecosystem",
  scalability: "Scalability",
  devExp: "DevExp",
};

export default function BattlePage() {
  const { connected } = useWallet();
  const { player, cards, refreshPlayer } = useGame();
  const [selectedCard, setSelectedCard] = useState<any | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [fighting, setFighting] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

  if (!connected || !player) {
    return (
      <div className="text-center text-gray-400 mt-20">
        Connect your wallet to battle
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-20">
        You need cards to battle — go pull some first!
      </div>
    );
  }

  const handleBattle = async () => {
    if (!selectedCard) return;

    setFighting(true);
    setBattleResult(null);

    const ai = generateAiOpponent(difficulty);
    const dimensions = pickRandomDimensions();

    const cardForBattle: Card = {
      ...selectedCard,
      devExp: selectedCard.dev_exp,
    };

    const result = resolveBattle(cardForBattle, ai.stats, dimensions);
    result.aiLanguage = ai.language;
    result.aiStats = ai.stats;

    // Save to DB
    await insertBattleLog({
      player_id: player.id,
      player_card_id: selectedCard.id,
      ai_language: ai.language,
      ai_stats: ai.stats,
      dimensions_picked: dimensions,
      result: result.result,
      xp_earned: result.xpEarned,
    });

    if (result.xpEarned > 0) {
      await updatePlayerAfterBattle(player.id, result.xpEarned);
    }

    setTimeout(() => {
      setBattleResult(result);
      setFighting(false);
      refreshPlayer();
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Battle</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
              <option key={d} value={d}>
                Lv.{d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Select Your Card</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {cards.map((card: any) => (
            <CardDisplay
              key={card.id}
              language={card.language}
              rarity={card.rarity}
              speed={card.speed}
              security={card.security}
              ecosystem={card.ecosystem}
              scalability={card.scalability}
              dev_exp={card.dev_exp}
              compact
              selected={selectedCard?.id === card.id}
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleBattle}
          disabled={!selectedCard || fighting}
          className="px-8 py-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-lg font-bold transition-colors"
        >
          {fighting ? "Fighting..." : "Battle!"}
        </button>
      </div>

      {battleResult && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 animate-fade-in">
          <div
            className={`text-center text-3xl font-bold ${
              battleResult.result === "win"
                ? "text-green-400"
                : battleResult.result === "lose"
                  ? "text-red-400"
                  : "text-yellow-400"
            }`}
          >
            {battleResult.result === "win"
              ? "Victory!"
              : battleResult.result === "lose"
                ? "Defeat"
                : "Draw"}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {battleResult.dimensionsPicked.map((dim) => {
              const playerStat =
                selectedCard[dim === "devExp" ? "dev_exp" : dim];
              const aiStat = battleResult.aiStats[dim];
              const winner =
                playerStat > aiStat
                  ? "player"
                  : aiStat > playerStat
                    ? "ai"
                    : "tie";
              return (
                <div
                  key={dim}
                  className={`p-4 rounded-lg border text-center ${
                    winner === "player"
                      ? "border-green-600 bg-green-950"
                      : winner === "ai"
                        ? "border-red-600 bg-red-950"
                        : "border-yellow-600 bg-yellow-950"
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-2">
                    {DIMENSION_LABELS[dim]}
                  </p>
                  <div className="flex justify-between">
                    <span className="font-bold">{playerStat}</span>
                    <span className="text-gray-500">vs</span>
                    <span className="font-bold">{aiStat}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-sm text-gray-400">
            vs AI {battleResult.aiLanguage} | XP earned:{" "}
            <span className="text-cyan-400">{battleResult.xpEarned}</span>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/battle/
git commit -m "feat: implement battle page with AI opponent and dimension comparison"
```

---

### Task 13: Leaderboard Page

**Files:**
- Create: `src/app/leaderboard/page.tsx`

**Step 1: Implement Leaderboard page with 3 tabs**

Create `src/app/leaderboard/page.tsx`:
```typescript
"use client";

import { useState, useEffect } from "react";
import {
  getLeaderboardByWins,
  getLeaderboardByWinRate,
  getLeaderboardByStrongestCard,
} from "@/lib/db";

type Tab = "wins" | "winRate" | "strongest";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("wins");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        let result;
        switch (tab) {
          case "wins":
            result = await getLeaderboardByWins();
            break;
          case "winRate":
            result = await getLeaderboardByWinRate();
            break;
          case "strongest":
            result = await getLeaderboardByStrongestCard();
            break;
        }
        setData(result ?? []);
      } catch {
        setData([]);
      }
      setLoading(false);
    };
    fetch();
  }, [tab]);

  const truncateWallet = (addr: string) =>
    `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Leaderboard</h1>

      <div className="flex gap-2">
        <TabButton
          active={tab === "wins"}
          onClick={() => setTab("wins")}
          label="Top Wins"
        />
        <TabButton
          active={tab === "winRate"}
          onClick={() => setTab("winRate")}
          label="Best Win Rate"
        />
        <TabButton
          active={tab === "strongest"}
          onClick={() => setTab("strongest")}
          label="Strongest Card"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400 text-center">No data yet</p>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-sm text-gray-400">
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Wallet</th>
                {tab === "wins" && (
                  <th className="p-3 text-right">Total Wins</th>
                )}
                {tab === "winRate" && (
                  <>
                    <th className="p-3 text-right">Win Rate</th>
                    <th className="p-3 text-right">Battles</th>
                  </>
                )}
                {tab === "strongest" && (
                  <>
                    <th className="p-3 text-right">Language</th>
                    <th className="p-3 text-right">Total Stats</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, i: number) => (
                <tr
                  key={i}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30"
                >
                  <td className="p-3 text-cyan-400 font-bold">{i + 1}</td>
                  <td className="p-3 font-mono text-sm">
                    {truncateWallet(row.wallet_address)}
                  </td>
                  {tab === "wins" && (
                    <td className="p-3 text-right font-bold">
                      {row.total_wins}
                    </td>
                  )}
                  {tab === "winRate" && (
                    <>
                      <td className="p-3 text-right font-bold">
                        {(row.win_rate * 100).toFixed(1)}%
                      </td>
                      <td className="p-3 text-right text-gray-400">
                        {row.total_battles}
                      </td>
                    </>
                  )}
                  {tab === "strongest" && (
                    <>
                      <td className="p-3 text-right">{row.language}</td>
                      <td className="p-3 text-right font-bold text-cyan-400">
                        {row.total_stats}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-cyan-600 text-white"
          : "bg-gray-800 text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/leaderboard/
git commit -m "feat: implement leaderboard page with 3 tabs"
```

---

### Task 14: Final Wiring & Build Verification

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final wiring and build verification"
```

---

## Summary

| Task | Description | Phase |
|------|-------------|-------|
| 1 | Project scaffolding | 1 |
| 2 | Game constants & types | 1 |
| 3 | Gacha engine (pure logic) | 1 |
| 4 | Battle engine (pure logic) | 1 |
| 5 | Upgrade engine (pure logic) | 2 |
| 6 | Supabase client & schema | 1 |
| 7 | Supabase data access layer | 1 |
| 8 | Wallet provider & layout | 1 |
| 9 | Home page | 1 |
| 10 | Gacha page | 1 |
| 11 | Collection page | 2 |
| 12 | Battle page | 1 |
| 13 | Leaderboard page | 2 |
| 14 | Final wiring & build | All |
