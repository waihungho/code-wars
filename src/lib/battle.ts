import {
  LANGUAGES,
  DIMENSIONS,
  BASE_STATS,
  BATTLE_DIMENSIONS_COUNT,
  ABILITIES,
} from "./constants";
import type {
  Language,
  Dimension,
  Stats,
  Card,
  BattleResult,
  AbilityTriggerResult,
} from "./types";

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

function applyPassiveBonus(stats: Stats, language: Language): Stats {
  const ability = ABILITIES[language];
  const boosted = { ...stats };
  const dim = ability.passiveDimension;
  boosted[dim] = Math.round(boosted[dim] * (1 + ability.passiveBonus));
  return boosted;
}

function rollAbilityTrigger(language: Language): boolean {
  const ability = ABILITIES[language];
  return Math.random() < ability.triggerChance;
}

export function resolveBattle(
  playerCard: Card,
  aiStats: Stats,
  dimensions: [Dimension, Dimension, Dimension]
): BattleResult {
  const ability = ABILITIES[playerCard.language];
  const triggered = rollAbilityTrigger(playerCard.language);

  // Build effective player stats with passive bonus
  const playerStats = applyPassiveBonus(
    {
      speed: playerCard.speed,
      security: playerCard.security,
      ecosystem: playerCard.ecosystem,
      scalability: playerCard.scalability,
      devExp: playerCard.devExp,
    },
    playerCard.language
  );

  // Clone AI stats so triggered abilities can mutate them
  const effectiveAi = { ...aiStats };

  // --- Pre-battle triggered abilities ---
  // JavaScript: Event Storm — swap one AI dimension with their lowest
  if (triggered && playerCard.language === "JavaScript") {
    let lowestDim: Dimension = dimensions[0];
    let lowestVal = effectiveAi[lowestDim];
    for (const d of DIMENSIONS) {
      if (effectiveAi[d] < lowestVal) {
        lowestVal = effectiveAi[d];
        lowestDim = d;
      }
    }
    // Swap a random battle dimension (not already lowest) with the lowest
    const swapCandidates = dimensions.filter((d) => d !== lowestDim);
    if (swapCandidates.length > 0) {
      const swapDim =
        swapCandidates[Math.floor(Math.random() * swapCandidates.length)];
      const temp = effectiveAi[swapDim];
      effectiveAi[swapDim] = effectiveAi[lowestDim];
      effectiveAi[lowestDim] = temp;
    }
  }

  // Python: Library Summon — copy opponent's highest as +10% to player's weakest
  if (triggered && playerCard.language === "Python") {
    let highestVal = 0;
    for (const d of DIMENSIONS) {
      if (effectiveAi[d] > highestVal) highestVal = effectiveAi[d];
    }
    let weakestDim: Dimension = dimensions[0];
    let weakestVal = playerStats[weakestDim];
    for (const d of DIMENSIONS) {
      if (playerStats[d] < weakestVal) {
        weakestVal = playerStats[d];
        weakestDim = d;
      }
    }
    playerStats[weakestDim] = Math.round(
      playerStats[weakestDim] + highestVal * 0.1
    );
  }

  // --- Resolve each dimension ---
  const roundResults: {
    dim: Dimension;
    playerVal: number;
    aiVal: number;
    winner: "player" | "ai" | "tie";
  }[] = [];

  let rustDebuffActive = false;

  for (let i = 0; i < dimensions.length; i++) {
    const dim = dimensions[i];
    let pVal = playerStats[dim];
    let aVal = effectiveAi[dim];

    // Rust: The Borrow Checker — if SEC won previous, opponent -10% this dim
    if (rustDebuffActive) {
      aVal = Math.round(aVal * 0.9);
      rustDebuffActive = false;
    }

    // Assembly: Direct Damage Array — if SPD wins, double SPD score
    if (
      triggered &&
      playerCard.language === "Assembly" &&
      dim === "speed" &&
      pVal > aVal
    ) {
      pVal *= 2;
    }

    // Go: Goroutine Swarm — if SCL already won, +5% all remaining
    if (triggered && playerCard.language === "Go") {
      const sclResult = roundResults.find((r) => r.dim === "scalability");
      if (sclResult && sclResult.winner === "player") {
        pVal = Math.round(pVal * 1.05);
      }
    }

    let winner: "player" | "ai" | "tie";
    if (pVal > aVal) {
      winner = "player";
    } else if (aVal > pVal) {
      winner = "ai";
    } else {
      // Java: The Garbage Collector — ties become player wins
      if (triggered && playerCard.language === "Java") {
        winner = "player";
      } else {
        winner = "tie";
      }
    }

    // Rust: if SEC wins, debuff next round
    if (
      triggered &&
      playerCard.language === "Rust" &&
      dim === "security" &&
      winner === "player"
    ) {
      rustDebuffActive = true;
    }

    roundResults.push({ dim, playerVal: pVal, aiVal: aVal, winner });
  }

  // --- C: Direct Memory Access — if losing any round, ignore lowest loss ---
  if (triggered && playerCard.language === "C") {
    const losses = roundResults.filter((r) => r.winner === "ai");
    if (losses.length > 0) {
      // Find the round with the smallest margin of loss
      let smallestLossIdx = -1;
      let smallestMargin = Infinity;
      for (let i = 0; i < roundResults.length; i++) {
        if (roundResults[i].winner === "ai") {
          const margin = roundResults[i].aiVal - roundResults[i].playerVal;
          if (margin < smallestMargin) {
            smallestMargin = margin;
            smallestLossIdx = i;
          }
        }
      }
      if (smallestLossIdx >= 0) {
        roundResults[smallestLossIdx].winner = "tie";
      }
    }
  }

  // --- Calculate final score ---
  let playerScore = 0;
  let aiScore = 0;
  for (const r of roundResults) {
    if (r.winner === "player") {
      playerScore++;
    } else if (r.winner === "ai") {
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

  // Solidity: The Nexus — if win 2/3, double XP
  if (
    triggered &&
    playerCard.language === "Solidity" &&
    result === "win"
  ) {
    xpEarned *= 2;
  }

  const abilityResult: AbilityTriggerResult | null = triggered
    ? {
        triggered: true,
        abilityName: ability.name,
        description: ability.triggeredDescription,
      }
    : null;

  return {
    playerCard,
    aiLanguage: LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)],
    aiStats,
    dimensionsPicked: dimensions,
    result,
    xpEarned,
    abilityTriggered: abilityResult,
    isPracticeMode: false,
  };
}
