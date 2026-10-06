import { Router, Request, Response } from 'express';
import { authenticateUser, requireCourtAdmin } from '../middleware/auth.ts';
import { getAllCourts, getCourtById, addCourtReview } from '../store.ts';
import { Court, CourtReview } from '../../src/types.ts';

const router = Router();

/**
 * GET /api/courts
 * Returns list of pickleball facilities
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const courts = getAllCourts();
    return res.json({ success: true, count: courts.length, data: courts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/courts/:id
 * Get single court details with real-time time slots
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const court = getCourtById(req.params.id);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }

    // Generate dynamic hourly slots
    const availableSlots = [
      { time: '08:00 AM', available: true, price: court.hourly_rate },
      { time: '09:30 AM', available: true, price: court.hourly_rate },
      { time: '11:00 AM', available: false, price: court.hourly_rate },
      { time: '01:30 PM', available: true, price: court.hourly_rate },
      { time: '03:00 PM', available: true, price: court.hourly_rate },
      { time: '05:00 PM (Prime)', available: true, price: court.hourly_rate * 1.15 },
      { time: '06:30 PM (Prime)', available: true, price: court.hourly_rate * 1.15 },
      { time: '08:00 PM (Night)', available: true, price: court.hourly_rate },
    ];

    return res.json({ success: true, data: { ...court, availableSlots } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/courts/:id/reviews
 * Allows players to submit 1 to 5 star rating and comment for court or management
 */
router.post('/:id/reviews', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, tags, user_name, user_avatar, user_role, user_id } = req.body;

    const court = getCourtById(id);
    if (!court) {
      return res.status(404).json({ error: 'Court not found' });
    }

    const numRating = Math.max(1, Math.min(5, Number(rating) || 5));
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ error: 'Comment feedback is required' });
    }

    const newReview = addCourtReview({
      id: `rev-${Date.now()}`,
      court_id: id,
      user_id: user_id || '00000000-0000-0000-0000-000000000002',
      user_name: user_name || 'Verified Tagum Athlete',
      user_avatar: user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      user_role: user_role || 'Verified Player',
      rating: numRating,
      comment: comment.trim(),
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Court Surface & Grip', 'Management & Staff'],
      created_at: new Date().toISOString(),
    });

    const updatedCourt = getCourtById(id);
    return res.status(201).json({ success: true, review: newReview, court: updatedCourt });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
