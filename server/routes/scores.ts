import { Router, Request, Response } from 'express';
import { authenticateUser, requireCourtAdmin } from '../middleware/auth.ts';
import { calculateMatchEloAndXp } from '../controllers/ranking.ts';
import { getMatchById, updateMatch, getProfileById, updateProfile } from '../store.ts';
import { Profile } from '../../src/types.ts';

const router = Router();

/**
 * POST /api/scores/live-update
 * Court Admin live score tracker (+ / -) while match is in progress
 */
router.post('/live-update', authenticateUser, requireCourtAdmin, (req: Request, res: Response) => {
  try {
    const { matchId, teamAScore, teamBScore } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    const match = getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status === 'completed') {
      return res.status(400).json({ error: 'Cannot update live score of an already completed match' });
    }

    const updated = updateMatch(matchId, {
      team_a_score: Math.max(0, Number(teamAScore) || 0),
      team_b_score: Math.max(0, Number(teamBScore) || 0),
      status: 'in_progress',
    });

    return res.json({ success: true, match: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/scores/submit
 * **************************************************************************
 * CRITICAL ADMIN-ONLY ENDPOINT:
 * - PLAYERS CANNOT SCORE THEIR OWN MATCHES.
 * - ONLY verified 'court_admin' users can submit official scores.
 * - Automatically calculates Elo, updates win/loss, applies XP bonuses,
 *   auto-upgrades rank tiers, and syncs official DUPR skill ratings.
 * **************************************************************************
 */
router.post('/submit', authenticateUser, requireCourtAdmin, (req: Request, res: Response) => {
  try {
    const { matchId, teamAScore, teamBScore } = req.body;
    const admin = req.user!;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    const scoreA = Number(teamAScore);
    const scoreB = Number(teamBScore);

    if (isNaN(scoreA) || isNaN(scoreB) || scoreA < 0 || scoreB < 0) {
      return res.status(400).json({ error: 'Scores must be valid non-negative integers' });
    }

    if (scoreA === scoreB) {
      return res.status(400).json({
        error: 'Pickleball matches cannot end in a tie. A team must win with a 2-point difference.',
      });
    }

    const match = getMatchById(matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status === 'completed') {
      return res.status(400).json({
        error: 'This match has already been officially scored and completed.',
      });
    }

    // Extract players from Team A and Team B
    const matchPlayers = match.players || [];
    const teamAPlayers: Profile[] = [];
    const teamBPlayers: Profile[] = [];

    for (const mp of matchPlayers) {
      const profile = getProfileById(mp.player_id);
      if (profile) {
        if (mp.team === 'A') teamAPlayers.push(profile);
        else teamBPlayers.push(profile);
      }
    }

    if (teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      return res.status(400).json({
        error: 'Cannot compute official score: match rosters must contain active registered players.',
      });
    }

    // Run Elo & XP algorithm
    const eloResult = calculateMatchEloAndXp({
      teamAPlayers,
      teamBPlayers,
      teamAScore: scoreA,
      teamBScore: scoreB,
      adminId: admin.id,
    });

    // Update each player in store / DB
    for (const adj of eloResult.adjustments) {
      const isWinner = adj.team === eloResult.winnerTeam;
      const currentProfile = getProfileById(adj.playerId);

      if (currentProfile) {
        updateProfile(adj.playerId, {
          rank_points: adj.ratingAfter,
          rank_tier: adj.tierAfter,
          total_xp: adj.totalXp,
          wins: isWinner ? currentProfile.wins + 1 : currentProfile.wins,
          losses: !isWinner ? currentProfile.losses + 1 : currentProfile.losses,
          skill_rating: adj.skillRatingAfter,
        });
      }
    }

    // Update match players metadata
    const updatedPlayers = matchPlayers.map((mp) => {
      const adj = eloResult.adjustments.find((a) => a.playerId === mp.player_id);
      if (adj) {
        return {
          ...mp,
          rating_before: adj.ratingBefore,
          rating_after: adj.ratingAfter,
          xp_earned: adj.xpEarned,
          player: getProfileById(mp.player_id),
        };
      }
      return mp;
    });

    // Mark match as completed
    const completedMatch = updateMatch(matchId, {
      status: 'completed',
      winner_team: eloResult.winnerTeam,
      team_a_score: scoreA,
      team_b_score: scoreB,
      scored_by_admin_id: admin.id,
      completed_at: new Date().toISOString(),
      players: updatedPlayers,
    });

    return res.json({
      success: true,
      message: `Match officially verified and scored by Referee ${admin.full_name}`,
      match: completedMatch,
      eloResult,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

export default router;
