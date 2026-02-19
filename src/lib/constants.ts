import type { Language, Rarity, Dimension, Stats, Ability, EquipmentItem } from "./types";

export const LANGUAGES: Language[] = [
  "Assembly",
  "C",
  "CPlusPlus",
  "CSharp",
  "Clojure",
  "COBOL",
  "Dart",
  "Delphi",
  "Elixir",
  "Erlang",
  "Go",
  "Haskell",
  "Java",
  "JavaScript",
  "Kotlin",
  "Lua",
  "MATLAB",
  "Pascal",
  "Perl",
  "PHP",
  "Python",
  "R",
  "Ruby",
  "Rust",
  "Scala",
  "Solidity",
  "SQL",
  "Swift",
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
  Assembly:   { speed: 10, security: 3,  ecosystem: 2,  scalability: 4,  devExp: 1 },
  C:          { speed: 9,  security: 2,  ecosystem: 7,  scalability: 5,  devExp: 3 },
  CPlusPlus:  { speed: 9,  security: 4,  ecosystem: 9,  scalability: 7,  devExp: 3 },
  CSharp:     { speed: 6,  security: 7,  ecosystem: 9,  scalability: 7,  devExp: 7 },
  Clojure:    { speed: 5,  security: 7,  ecosystem: 6,  scalability: 7,  devExp: 5 },
  COBOL:      { speed: 5,  security: 6,  ecosystem: 3,  scalability: 4,  devExp: 1 },
  Dart:       { speed: 6,  security: 6,  ecosystem: 7,  scalability: 6,  devExp: 8 },
  Delphi:     { speed: 7,  security: 5,  ecosystem: 5,  scalability: 4,  devExp: 5 },
  Elixir:     { speed: 5,  security: 7,  ecosystem: 6,  scalability: 10, devExp: 7 },
  Erlang:     { speed: 5,  security: 7,  ecosystem: 5,  scalability: 10, devExp: 3 },
  Go:         { speed: 7,  security: 6,  ecosystem: 6,  scalability: 9,  devExp: 7 },
  Haskell:    { speed: 6,  security: 9,  ecosystem: 4,  scalability: 6,  devExp: 2 },
  Java:       { speed: 6,  security: 7,  ecosystem: 10, scalability: 8,  devExp: 5 },
  JavaScript: { speed: 5,  security: 3,  ecosystem: 10, scalability: 6,  devExp: 8 },
  Kotlin:     { speed: 6,  security: 7,  ecosystem: 8,  scalability: 7,  devExp: 8 },
  Lua:        { speed: 7,  security: 4,  ecosystem: 5,  scalability: 5,  devExp: 8 },
  MATLAB:     { speed: 4,  security: 5,  ecosystem: 7,  scalability: 3,  devExp: 6 },
  Pascal:     { speed: 6,  security: 5,  ecosystem: 3,  scalability: 3,  devExp: 4 },
  Perl:       { speed: 4,  security: 3,  ecosystem: 7,  scalability: 3,  devExp: 2 },
  PHP:        { speed: 4,  security: 3,  ecosystem: 9,  scalability: 5,  devExp: 7 },
  Python:     { speed: 3,  security: 4,  ecosystem: 10, scalability: 4,  devExp: 10 },
  R:          { speed: 3,  security: 4,  ecosystem: 8,  scalability: 3,  devExp: 7 },
  Ruby:       { speed: 3,  security: 5,  ecosystem: 8,  scalability: 4,  devExp: 9 },
  Rust:       { speed: 9,  security: 10, ecosystem: 6,  scalability: 8,  devExp: 4 },
  Scala:      { speed: 7,  security: 8,  ecosystem: 7,  scalability: 8,  devExp: 4 },
  Solidity:   { speed: 4,  security: 5,  ecosystem: 5,  scalability: 3,  devExp: 5 },
  SQL:        { speed: 8,  security: 5,  ecosystem: 9,  scalability: 7,  devExp: 8 },
  Swift:      { speed: 7,  security: 8,  ecosystem: 6,  scalability: 6,  devExp: 8 },
};

export const RARITY_ODDS: Record<Rarity, number> = {
  Common: 0.504,
  Uncommon: 0.3,
  Rare: 0.15,
  Legendary: 0.045,
  Mythic: 0.001,
};

export const RARITY_STAT_MULTIPLIERS: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 1.2,
  Rare: 1.5,
  Legendary: 2.0,
  Mythic: 3.0,
};

export function getCardImagePath(language: string, rarity?: string): string {
  if (rarity === "Mythic") {
    return `/cards/mythic/${language}.png`;
  }
  return `/cards/${language}.png`;
}

export const MAX_STAT = 1000;
export const FREE_PULLS_PER_DAY = 3;
export const BATTLE_DIMENSIONS_COUNT = 3;
export const MIN_BATTLES_FOR_WINRATE = 10;
export const MAX_DAILY_BATTLES = 5;
export const ABILITY_TRIGGER_CHANCE = 0.3;

export const ABILITIES: Record<Language, Ability> = {
  Assembly: {
    name: "Direct Damage Array",
    flavorText: "Raw power flows through bare metal registers.",
    passiveDimension: "speed",
    passiveBonus: 0.15,
    triggeredDescription: "If SPD wins, double SPD score for that round",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  C: {
    name: "Direct Memory Access",
    flavorText: "No abstraction layer can match pointer precision.",
    passiveDimension: "speed",
    passiveBonus: 0.15,
    triggeredDescription: "If losing any round, ignore your lowest loss",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  CPlusPlus: {
    name: "Zero-Cost Abstraction",
    flavorText: "Templates compile away — performance remains.",
    passiveDimension: "speed",
    passiveBonus: 0.12,
    triggeredDescription: "If SPD wins, +8% to ECO for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  CSharp: {
    name: "LINQ Cascade",
    flavorText: "Query everything, from databases to game objects.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "All tied rounds become player wins",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Clojure: {
    name: "Immutable Truth",
    flavorText: "Persistent data structures transcend mutation.",
    passiveDimension: "security",
    passiveBonus: 0.12,
    triggeredDescription: "If SEC wins, opponent loses 10% on remaining dims",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  COBOL: {
    name: "Legacy Fortress",
    flavorText: "70 years of banking can't be wrong.",
    passiveDimension: "security",
    passiveBonus: 0.15,
    triggeredDescription: "Opponent's highest stat reduced by 15%",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Dart: {
    name: "Hot Reload",
    flavorText: "Changes manifest instantly across all platforms.",
    passiveDimension: "devExp",
    passiveBonus: 0.12,
    triggeredDescription: "If DEV wins, +10% to your lowest stat",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Delphi: {
    name: "RAD Deployment",
    flavorText: "Rapid application development — drag, drop, ship.",
    passiveDimension: "speed",
    passiveBonus: 0.1,
    triggeredDescription: "If winning 2/3 rounds, double XP reward",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Elixir: {
    name: "Phoenix Rebirth",
    flavorText: "Processes crash and rise again — fault tolerance incarnate.",
    passiveDimension: "scalability",
    passiveBonus: 0.15,
    triggeredDescription: "If SCL wins, revive one lost round as a tie",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Erlang: {
    name: "Nine Nines Uptime",
    flavorText: "99.9999999% availability — the telecom standard.",
    passiveDimension: "scalability",
    passiveBonus: 0.2,
    triggeredDescription: "If losing, one loss becomes a tie",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Go: {
    name: "Goroutine Swarm",
    flavorText: "A thousand lightweight threads march in unison.",
    passiveDimension: "scalability",
    passiveBonus: 0.15,
    triggeredDescription: "If SCL wins, +5% to all remaining dimensions",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Haskell: {
    name: "Monad Bind",
    flavorText: "Pure functions compose — side effects bow to the type system.",
    passiveDimension: "security",
    passiveBonus: 0.18,
    triggeredDescription: "If SEC wins, opponent's next stat halved",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Java: {
    name: "The Garbage Collector",
    flavorText: "Automatic memory management conquers all.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "All ties become player wins",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  JavaScript: {
    name: "Event Storm",
    flavorText: "The callback abyss consumes all who oppose.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "Swap one AI dimension with their lowest stat",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Kotlin: {
    name: "Null Safety Shield",
    flavorText: "NullPointerException is a relic of the past.",
    passiveDimension: "security",
    passiveBonus: 0.12,
    triggeredDescription: "If SEC wins, +8% to DEV for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Lua: {
    name: "Embed Strike",
    flavorText: "Lightweight and lethal — embedded in everything.",
    passiveDimension: "speed",
    passiveBonus: 0.12,
    triggeredDescription: "If SPD wins, steal 5% from opponent's SPD",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  MATLAB: {
    name: "Matrix Overload",
    flavorText: "Every problem is a matrix — solve it vectorized.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "If ECO wins, double the margin of victory",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Pascal: {
    name: "Structured Discipline",
    flavorText: "Procedure, function, begin, end — order prevails.",
    passiveDimension: "security",
    passiveBonus: 0.1,
    triggeredDescription: "Opponent's DEV stat reduced by 20%",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Perl: {
    name: "Regex Vortex",
    flavorText: "One-liners that would take pages in any other tongue.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "If ECO wins, scramble opponent's remaining stats",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  PHP: {
    name: "WordPress Dominion",
    flavorText: "40% of the web runs on this — resistance is futile.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.12,
    triggeredDescription: "If ECO wins, +10% to SCL for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Python: {
    name: "Library Summon",
    flavorText: "Import antigravity — there's a module for everything.",
    passiveDimension: "devExp",
    passiveBonus: 0.1,
    triggeredDescription: "Copy opponent's highest as +10% to player's weakest",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  R: {
    name: "Statistical Surge",
    flavorText: "P-values and confidence intervals — data speaks truth.",
    passiveDimension: "ecosystem",
    passiveBonus: 0.1,
    triggeredDescription: "If ECO wins, opponent's lowest stat drops by 15%",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Ruby: {
    name: "Convention Over Configuration",
    flavorText: "Beautiful code that reads like poetry.",
    passiveDimension: "devExp",
    passiveBonus: 0.15,
    triggeredDescription: "If DEV wins, +10% to all your stats for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Rust: {
    name: "The Borrow Checker",
    flavorText: "Memory safety isn't optional — it's law.",
    passiveDimension: "security",
    passiveBonus: 0.2,
    triggeredDescription: "If SEC wins, opponent gets -10% on next dimension",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Scala: {
    name: "Functional Fusion",
    flavorText: "OOP and FP merge into one — the best of both worlds.",
    passiveDimension: "scalability",
    passiveBonus: 0.12,
    triggeredDescription: "If SCL wins, +8% to SEC for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Solidity: {
    name: "The Nexus",
    flavorText: "The smart contract binds all transactions to truth.",
    passiveDimension: "security",
    passiveBonus: 0.15,
    triggeredDescription: "If you win 2/3 rounds, double XP reward",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  SQL: {
    name: "Query Optimizer",
    flavorText: "SELECT victory FROM battle WHERE opponent = 'defeated'.",
    passiveDimension: "speed",
    passiveBonus: 0.12,
    triggeredDescription: "If SPD wins, ignore opponent's highest stat in one round",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
  Swift: {
    name: "Protocol Witness",
    flavorText: "Type-safe protocols enforce correctness at compile time.",
    passiveDimension: "security",
    passiveBonus: 0.12,
    triggeredDescription: "If SEC wins, +8% to SPD for remaining rounds",
    triggerChance: ABILITY_TRIGGER_CHANCE,
  },
};

// ---------------------------------------------------------------------------
// Equipment System
// ---------------------------------------------------------------------------
export const TREASURY_WALLET = "11111111111111111111111111111112"; // devnet treasury — replace with actual

export const UNEQUIP_FEE_SOL = 0.01;

export const EQUIPMENT_CATALOG: EquipmentItem[] = [
  // --- Consumables ---
  { id: "summon-3",         name: "Extra Summon (x3)",       slotType: "consumable",           effectType: "add_pulls",         effectValue: { amount: 3 },                                                    solPrice: 0.02,  description: "+3 gacha pulls" },
  { id: "summon-10",        name: "Extra Summon (x10)",      slotType: "consumable",           effectType: "add_pulls",         effectValue: { amount: 10 },                                                   solPrice: 0.05,  description: "+10 gacha pulls" },
  { id: "summon-50",        name: "Extra Summon (x50)",      slotType: "consumable",           effectType: "add_pulls",         effectValue: { amount: 50 },                                                   solPrice: 0.2,   description: "+50 gacha pulls" },
  { id: "battle-10",        name: "Battle Pass (x10)",       slotType: "consumable",           effectType: "add_battles",       effectValue: { amount: 10 },                                                   solPrice: 0.01,  description: "+10 daily battles" },
  { id: "battle-20",        name: "Battle Pass (x20)",       slotType: "consumable",           effectType: "add_battles",       effectValue: { amount: 20 },                                                   solPrice: 0.02,  description: "+20 daily battles" },
  { id: "battle-unlimited", name: "Unlimited Battle Pass",   slotType: "consumable",           effectType: "unlimited_battles", effectValue: { hours: 24 },                                                    solPrice: 1,     description: "Unlimited battles for 24h" },
  // --- Stat Boost (Slot 1) ---
  { id: "stat-chip-1",      name: "Stat Chip I",             slotType: "stat_boost",           effectType: "stat_percent",      effectValue: { percent: 10 },                                                  solPrice: 0.05,  description: "+10% to one stat" },
  { id: "stat-chip-2",      name: "Stat Chip II",            slotType: "stat_boost",           effectType: "stat_percent",      effectValue: { percent: 25 },                                                  solPrice: 0.2,   description: "+25% to one stat" },
  { id: "stat-chip-3",      name: "Stat Chip III",           slotType: "stat_boost",           effectType: "stat_percent",      effectValue: { percent: 50 },                                                  solPrice: 0.5,   description: "+50% to one stat" },
  { id: "omni-chip",        name: "Omni Chip",               slotType: "stat_boost",           effectType: "all_stats_percent", effectValue: { percent: 15 },                                                  solPrice: 1.0,   description: "+15% to ALL stats" },
  // --- Ability Enhancement (Slot 2) ---
  { id: "trigger-amp-1",    name: "Trigger Amplifier I",     slotType: "ability_enhancement",  effectType: "trigger_chance",    effectValue: { chance: 0.45 },                                                 solPrice: 0.1,   description: "Ability trigger 30% → 45%" },
  { id: "trigger-amp-2",    name: "Trigger Amplifier II",    slotType: "ability_enhancement",  effectType: "trigger_chance",    effectValue: { chance: 0.60 },                                                 solPrice: 0.35,  description: "Ability trigger 30% → 60%" },
  { id: "passive-boost",    name: "Passive Booster",         slotType: "ability_enhancement",  effectType: "passive_multiply",  effectValue: { multiplier: 2 },                                                solPrice: 0.15,  description: "Passive ability bonus doubled" },
  { id: "overcharge",       name: "Ability Overcharge",      slotType: "ability_enhancement",  effectType: "overcharge",        effectValue: { passiveMultiplier: 2, chance: 0.50 },                            solPrice: 0.75,  description: "Passive doubled + trigger 50%" },
  // --- Utility (Slot 3) ---
  { id: "dim-scout",        name: "Dimension Scout",         slotType: "utility",              effectType: "preview_dimension", effectValue: { count: 1 },                                                     solPrice: 0.05,  description: "Preview 1 of 3 battle dimensions" },
  { id: "xp-magnet-1",      name: "XP Magnet I",             slotType: "utility",              effectType: "xp_multiplier",     effectValue: { multiplier: 1.5 },                                              solPrice: 0.08,  description: "+50% XP from battles" },
  { id: "xp-magnet-2",      name: "XP Magnet II",            slotType: "utility",              effectType: "xp_multiplier",     effectValue: { multiplier: 2.0 },                                              solPrice: 0.3,   description: "+100% XP from battles" },
  { id: "lucky-charm",      name: "Lucky Charm",             slotType: "utility",              effectType: "rarity_boost",      effectValue: { bonus: 0.05 },                                                  solPrice: 0.5,   description: "+5% higher rarity chance" },
  // --- AI Core (Special Slot 4) ---
  { id: "ai-core",          name: "AI Core",                 slotType: "ai_core",              effectType: "ai_core",           effectValue: { allStatsPercent: 50, triggerChance: 0.70, passiveMultiplier: 3, xpMultiplier: 2.0 }, solPrice: 10, description: "+50% ALL stats, trigger 70%, passive x3, +100% XP" },
];
