import express from 'express';
import type { Request, Response } from 'express';
import { getLeaderboard } from '../store.ts';

const router = express.Router();

/**
 * GET /api/leaderboard
 * Returns ranked player ladder sorted by rank_points descending
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const tier = (req.query.tier as string) || 'all';
    const search = ((req.query.search as string) || '').toLowerCase().trim();

    let leaderboard = getLeaderboard(tier);

    if (search) {
      leaderboard = leaderboard.filter((p) =>
        p.full_name.toLowerCase().includes(search) || (p.dupr_id && p.dupr_id.toLowerCase().includes(search))
      );
    }

    const tierBreakdown = {
      pickleMaster: leaderboard.filter((p) => p.rank_tier === 'Pickle Master').length,
      diamond: leaderboard.filter((p) => p.rank_tier === 'Diamond').length,
      platinum: leaderboard.filter((p) => p.rank_tier === 'Platinum').length,
      gold: leaderboard.filter((p) => p.rank_tier === 'Gold').length,
      silver: leaderboard.filter((p) => p.rank_tier === 'Silver').length,
      bronze: leaderboard.filter((p) => p.rank_tier === 'Bronze').length,
    };

    return res.json({
      success: true,
      total: leaderboard.length,
      tierFilter: tier,
      tierBreakdown,
      data: leaderboard,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
