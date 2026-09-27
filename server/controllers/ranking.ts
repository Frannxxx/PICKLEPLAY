import { Profile, RankTier, TeamLetter, PlayerRatingAdjustment, EloAdjustmentResult } from '../../src/types.ts';

/**
 * Determine Rank Tier based on current Elo rank points.
 * Thresholds:
 *   Bronze: 0 - 1199
 *   Silver: 1200 - 1499
 *   Gold: 1500 - 1799
 *   Platinum: 1800 - 2099
 *   Diamond: 2100 - 2399
 *   Pickle Master: >= 2400
 */
export function determineRankTier(points: number): RankTier {
  if (points >= 2400) return 'Pickle Master';
  if (points >= 2100) return 'Diamond';
  if (points >= 1800) return 'Platinum';
  if (points >= 1500) return 'Gold';
  if (points >= 1200) return 'Silver';
  return 'Bronze';
}

/**
 * Calculate Elo and XP adjustments for all match participants.
 * Handles both singles (1v1) and doubles (2v2) with team average weighting.
 */
export function calculateMatchEloAndXp(params: {
  teamAPlayers: Profile[];
  teamBPlayers: Profile[];
  teamAScore: number;
  teamBScore: number;
  adminId: string;
}): EloAdjustmentResult {
  const { teamAPlayers, teamBPlayers, teamAScore, teamBScore, adminId } = params;

  if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
    throw new Error('Both teams must have at least one registered player to calculate rating');
  }

  // 1. Determine Winner
  const winnerTeam: TeamLetter = teamAScore > teamBScore ? 'A' : 'B';
  const scoreMargin = Math.abs(teamAScore - teamBScore);

  // 2. Calculate Team Average Elo Ratings
  const avgRatingA =
    teamAPlayers.reduce((sum, p) => sum + p.rank_points, 0) / teamAPlayers.length;
  const avgRatingB =
    teamBPlayers.reduce((sum, p) => sum + p.rank_points, 0) / teamBPlayers.length;

  // 3. Expected Outcome (Logistic Elo Curve)
  // E_A = 1 / (1 + 10 ^ ((R_B - R_A) / 400))
  const expectedA = 1 / (1 + Math.pow(10, (avgRatingB - avgRatingA) / 400));
  const expectedB = 1 - expectedA;

  // 4. Dynamic K-Factor
  // Higher sensitivity for closer rating distributions, baseline 32
  const baseK = 32;

  // 5. Margin of Victory Multiplier (Pickleball 11-point games)
  // A clean 11-2 win carries higher confidence than a tense 12-10 deuce finish
  // Multiplier scales between 1.0 and 1.6
  const marginMultiplier = Math.min(1.6, 1.0 + Math.log10(1 + scoreMargin / 6));

  const actualScoreA = winnerTeam === 'A' ? 1.0 : 0.0;
  const actualScoreB = winnerTeam === 'B' ? 1.0 : 0.0;

  // Base team delta
  const teamDeltaA = Math.round(baseK * (actualScoreA - expectedA) * marginMultiplier);
  const teamDeltaB = Math.round(baseK * (actualScoreB - expectedB) * marginMultiplier);

  const adjustments: PlayerRatingAdjustment[] = [];

  // Process Team A Players
  for (const player of teamAPlayers) {
    const isWinner = winnerTeam === 'A';
    // Individual scaling: lower-rated players on winning team get slightly more points,
    // higher-rated players on losing team absorb slightly higher penalty
    let individualDelta = teamDeltaA;
    if (isWinner && player.rank_points < avgRatingB) {
      // Underdog bonus
      individualDelta += Math.round((avgRatingB - player.rank_points) * 0.04);
    } else if (!isWinner && player.rank_points > avgRatingB) {
      // Favorite loss penalty
      individualDelta -= Math.round((player.rank_points - avgRatingB) * 0.03);
    }

    // Minimum loss floor: cannot drop below 100 points
    const newPoints = Math.max(100, player.rank_points + individualDelta);
    const tierBefore = player.rank_tier;
    const tierAfter = determineRankTier(newPoints);

    // XP Calculation
    // Base 60 XP + 120 XP for Win + Score Margin bonus + Giant Killer bonus
    let xpGain = 60;
    if (isWinner) {
      xpGain += 120;
      xpGain += Math.min(40, scoreMargin * 4);
      if (player.rank_points < avgRatingB) {
        xpGain += 50; // Giant killer bonus
      }
    } else {
      xpGain += Math.min(30, teamAScore * 3); // Effort points for scoring rallies
    }

    // DUPR micro-adjustment (0.01 to 0.05 step based on performance)
    const duprDelta = isWinner
      ? Math.min(0.06, 0.02 + scoreMargin * 0.004)
      : -Math.min(0.05, 0.015 + scoreMargin * 0.003);
    const newSkillRating = Math.max(1.0, Math.min(5.5, Number((player.skill_rating + duprDelta).toFixed(2))));

    adjustments.push({
      playerId: player.id,
      fullName: player.full_name,
      avatarUrl: player.avatar_url,
      team: 'A',
      ratingBefore: player.rank_points,
      ratingAfter: newPoints,
      ratingDelta: individualDelta,
      tierBefore,
      tierAfter,
      promoted: isTierHigher(tierAfter, tierBefore),
      demoted: isTierHigher(tierBefore, tierAfter),
      xpEarned: xpGain,
      totalXp: player.total_xp + xpGain,
      skillRatingBefore: player.skill_rating,
      skillRatingAfter: newSkillRating,
      duprSynced: true,
    });
  }

  // Process Team B Players
  for (const player of teamBPlayers) {
    const isWinner = winnerTeam === 'B';
    let individualDelta = teamDeltaB;
    if (isWinner && player.rank_points < avgRatingA) {
      // Underdog bonus
      individualDelta += Math.round((avgRatingA - player.rank_points) * 0.04);
    } else if (!isWinner && player.rank_points > avgRatingA) {
      // Favorite loss penalty
      individualDelta -= Math.round((player.rank_points - avgRatingA) * 0.03);
    }

    const newPoints = Math.max(100, player.rank_points + individualDelta);
    const tierBefore = player.rank_tier;
    const tierAfter = determineRankTier(newPoints);

    let xpGain = 60;
    if (isWinner) {
      xpGain += 120;
      xpGain += Math.min(40, scoreMargin * 4);
      if (player.rank_points < avgRatingA) {
        xpGain += 50;
      }
    } else {
      xpGain += Math.min(30, teamBScore * 3);
    }

    const duprDelta = isWinner
      ? Math.min(0.06, 0.02 + scoreMargin * 0.004)
      : -Math.min(0.05, 0.015 + scoreMargin * 0.003);
    const newSkillRating = Math.max(1.0, Math.min(5.5, Number((player.skill_rating + duprDelta).toFixed(2))));

    adjustments.push({
      playerId: player.id,
      fullName: player.full_name,
      avatarUrl: player.avatar_url,
      team: 'B',
      ratingBefore: player.rank_points,
      ratingAfter: newPoints,
      ratingDelta: individualDelta,
      tierBefore,
      tierAfter,
      promoted: isTierHigher(tierAfter, tierBefore),
      demoted: isTierHigher(tierBefore, tierAfter),
      xpEarned: xpGain,
      totalXp: player.total_xp + xpGain,
      skillRatingBefore: player.skill_rating,
      skillRatingAfter: newSkillRating,
      duprSynced: true,
    });
  }

  return {
    winnerTeam,
    teamAScore,
    teamBScore,
    margin: scoreMargin,
    expectedA: Number(expectedA.toFixed(3)),
    expectedB: Number(expectedB.toFixed(3)),
    kFactor: baseK,
    adjustments,
    scoredByAdminId: adminId,
  };
}

const TIER_ORDER: Record<RankTier, number> = {
  Bronze: 1,
  Silver: 2,
  Gold: 3,
  Platinum: 4,
  Diamond: 5,
  'Pickle Master': 6,
};

function isTierHigher(t1: RankTier, t2: RankTier): boolean {
  return TIER_ORDER[t1] > TIER_ORDER[t2];
}
