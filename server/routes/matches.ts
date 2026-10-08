import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth.ts';
import { getAllMatches, getMatchById, createMatch, updateMatch, getProfileById, getCourtById } from '../store.ts';
import { Match, MatchPlayer } from '../../src/types.ts';

const router = Router();

/**
 * GET /api/matches
 * Returns list of matches filtered by status
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const status = (req.query.status as string) || 'all';
    let matches = getAllMatches();

    if (status !== 'all') {
      matches = matches.filter((m) => m.status === status);
    }

    return res.json({ success: true, count: matches.length, data: matches });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/matches/:id
 * Get single match details
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const match = getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    return res.json({ success: true, data: match });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/matches
 * Create an open competitive match
 */
router.post('/', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'court_admin') {
      return res.status(403).json({
        error: 'Official Referee Neutrality: Referees focus strictly on court scoring and facility management. To host and play competitive matches, please register as a Player.'
      });
    }
    const { courtId, gameType = 'doubles', minRating = 3.0, maxRating = 4.5, scheduledAt } = req.body;

    if (!courtId) {
      return res.status(400).json({ error: 'courtId is required' });
    }

    const court = getCourtById(courtId);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }

    const newMatchId = `match-${Date.now()}`;
    const initialPlayer: MatchPlayer = {
      id: `mp-${Date.now()}-1`,
      match_id: newMatchId,
      player_id: user.id,
      team: 'A',
      player: user,
    };

    const newMatch: Match = {
      id: newMatchId,
      host_id: user.id,
      court_id: court.id,
      scheduled_at: scheduledAt || new Date(Date.now() + 3600000).toISOString(),
      game_type: gameType,
      min_rating: Number(minRating),
      max_rating: Number(maxRating),
      status: 'open',
      team_a_score: 0,
      team_b_score: 0,
      winner_team: null,
      created_at: new Date().toISOString(),
      court,
      players: [initialPlayer],
    };

    const saved = createMatch(newMatch);
    return res.status(201).json({ success: true, data: saved });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/matches/:id/join
 * Join an open match
 */
router.post('/:id/join', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'court_admin') {
      return res.status(403).json({
        error: 'Official Referee Neutrality: Referees cannot play in matches. Only registered players can join competitive rosters. Please register as a Player.'
      });
    }
    const match = getMatchById(req.params.id);

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.status !== 'open') {
      return res.status(400).json({ error: 'Cannot join match: match is already in progress or completed' });
    }

    const players = match.players || [];
    if (players.some((p) => p.player_id === user.id)) {
      return res.status(400).json({ error: 'You are already registered in this match' });
    }

    const maxPlayers = match.game_type === 'singles' ? 2 : 4;
    if (players.length >= maxPlayers) {
      return res.status(400).json({ error: 'Match roster is already full' });
    }

    // Determine team allocation
    const teamACount = players.filter((p) => p.team === 'A').length;
    const assignedTeam = teamACount < (match.game_type === 'singles' ? 1 : 2) ? 'A' : 'B';

    const newPlayer: MatchPlayer = {
      id: `mp-${Date.now()}`,
      match_id: match.id,
      player_id: user.id,
      team: assignedTeam,
      player: user,
    };

    const updatedPlayers = [...players, newPlayer];
    const newStatus = updatedPlayers.length === maxPlayers ? 'in_progress' : 'open';

    const updated = updateMatch(match.id, {
      players: updatedPlayers,
      status: newStatus,
    });

    return res.json({
      success: true,
      message: `Joined Team ${assignedTeam} successfully! Match is now ${newStatus}.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
