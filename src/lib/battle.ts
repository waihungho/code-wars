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
    const playerStat = playerCard[dim] as number;
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
