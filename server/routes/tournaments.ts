import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth.ts';
import {
  getAllTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  leaveTournament,
  generateTournamentBracket,
  updateBracketMatchScore,
  completeTournament,
  deleteTournament,
} from '../store.ts';

const router = Router();

/**
 * GET /api/tournaments
 * List all tournaments with optional status query
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    let list = getAllTournaments();
    if (status && status !== 'all') {
      list = list.filter((t) => t.status === status);
    }
    return res.json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/tournaments/:id
 * Retrieve tournament details and bracket rounds
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const tournament = getTournamentById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    return res.json({ success: true, data: tournament });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tournaments
 * Admin creates a new tournament
 */
router.post('/', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'court_admin') {
      return res.status(403).json({
        error: 'Only Official Referees / Club Admins have tournament organizing authority.',
      });
    }

    const {
      title,
      description,
      category,
      skill_level,
      format,
      max_participants,
      venue_name,
      venue_address,
      start_date,
      end_date,
      registration_deadline,
      entry_fee,
      prize_pool,
      banner_image_url,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Tournament title is required' });
    }

    const created = createTournament(
      {
        title: title.trim(),
        description: description?.trim() || 'Sanctioned Tagum City competitive tournament.',
        category: category || "Men's Singles",
        skill_level: skill_level || 'Open Division (All)',
        format: format || 'Single Elimination (8 Players)',
        max_participants: Number(max_participants) || 8,
        venue_name: venue_name || 'Tagum Central Pickleball Complex',
        venue_address: venue_address || 'Pioneer Ave, Magugpo Poblacion, Tagum City',
        start_date: start_date || new Date(Date.now() + 7 * 86400000).toISOString(),
        end_date: end_date || new Date(Date.now() + 9 * 86400000).toISOString(),
        registration_deadline: registration_deadline || new Date(Date.now() + 6 * 86400000).toISOString(),
        entry_fee: Number(entry_fee) || 350,
        prize_pool: Number(prize_pool) || 15000,
        banner_image_url: banner_image_url || '/src/assets/images/tagum_championship_trophy_1791477380864.jpg',
      },
      user.id
    );

    return res.status(201).json({
      success: true,
      message: 'Tournament successfully announced and open for entries!',
      data: created,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/tournaments/:id/join
 * Player registers/joins tournament
 */
router.post('/:id/join', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role === 'court_admin') {
      return res.status(403).json({
        error: 'Referees oversee officiating and tournament administration. To compete as a player, please switch to a Player profile.',
      });
    }

    const result = joinTournament(req.params.id, user.id);
    return res.json({
      success: true,
      message: result.message || 'Successfully registered for tournament!',
      data: result.tournament,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tournaments/:id/leave
 * Player withdraws from tournament
 */
router.post('/:id/leave', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const result = leaveTournament(req.params.id, user.id);
    return res.json({
      success: true,
      message: result.message || 'Withdrew from tournament',
      data: result.tournament,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tournaments/:id/bracket/generate
 * Admin generates seeds and single elimination bracket
 */
router.post('/:id/bracket/generate', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'court_admin') {
      return res.status(403).json({ error: 'Admin authority required to seed and generate brackets' });
    }

    const result = generateTournamentBracket(req.params.id);
    return res.json({
      success: true,
      message: result.message || 'Bracket seeded and tournament activated!',
      data: result.tournament,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * PATCH /api/tournaments/:id/matches/:matchId
 * Admin scores a bracket match, designates winner, advances bracket
 */
router.patch('/:id/matches/:matchId', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'court_admin') {
      return res.status(403).json({ error: 'Only Referees / Admins can submit official bracket scores' });
    }

    const { score1, score2, winnerId, status } = req.body;
    const result = updateBracketMatchScore(req.params.id, req.params.matchId, {
      score1: score1 !== undefined ? Number(score1) : undefined,
      score2: score2 !== undefined ? Number(score2) : undefined,
      winnerId,
      status,
    });

    return res.json({
      success: true,
      message: 'Bracket match score recorded and advanced!',
      data: result.tournament,
      match: result.updatedMatch,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/tournaments/:id/complete
 * Admin finalizes tournament
 */
router.post('/:id/complete', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'court_admin') {
      return res.status(403).json({ error: 'Admin authority required' });
    }

    const { championId } = req.body;
    if (!championId) {
      return res.status(400).json({ error: 'championId is required' });
    }

    const result = completeTournament(req.params.id, championId);
    return res.json({
      success: true,
      message: 'Tournament concluded and champion certified!',
      data: result.tournament,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/tournaments/:id
 * Admin cancels / deletes tournament
 */
router.delete('/:id', authenticateUser, (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (user.role !== 'court_admin') {
      return res.status(403).json({ error: 'Admin authority required' });
    }

    deleteTournament(req.params.id);
    return res.json({ success: true, message: 'Tournament deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
