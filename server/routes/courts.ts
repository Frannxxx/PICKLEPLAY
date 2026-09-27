import { Router, Request, Response } from 'express';
import { authenticateUser, requireCourtAdmin } from '../middleware/auth.ts';
import { getAllCourts, getCourtById } from '../store.ts';
import { Court } from '../../src/types.ts';

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

export default router;
