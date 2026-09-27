import { Router, Request, Response } from 'express';
import { getAllProfiles, getProfileById, createProfile } from '../store.ts';
import { Profile, UserRole } from '../../src/types.ts';

const router = Router();

/**
 * GET /api/auth/demo-users
 * Returns list of seeded accounts for quick role-testing
 */
router.get('/demo-users', (req: Request, res: Response) => {
  const users = getAllProfiles();
  return res.json({ success: true, data: users });
});

/**
 * POST /api/auth/login
 * Simple login returning user profile and session token
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    const profiles = getAllProfiles();

    let user: Profile | undefined;
    if (email) {
      user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
    }

    if (!user && role) {
      user = profiles.find((p) => p.role === role);
    }

    if (!user) {
      // Default fallback
      user = role === 'court_admin' ? profiles[0] : profiles[1];
    }

    const token = `usr_${user.id}`;
    return res.json({
      success: true,
      token,
      user,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/register
 * New user registration with strict role selection
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { full_name, email, role = 'player', dupr_id } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const validRole: UserRole = role === 'court_admin' ? 'court_admin' : 'player';

    const newProfile: Profile = {
      id: `usr-${Date.now()}`,
      full_name,
      email,
      role: validRole,
      rank_points: validRole === 'court_admin' ? 1800 : 1000,
      rank_tier: validRole === 'court_admin' ? 'Platinum' : 'Bronze',
      total_xp: 0,
      wins: 0,
      losses: 0,
      dupr_id: dupr_id || `DUPR-${Math.floor(10000 + Math.random() * 90000)}`,
      skill_rating: validRole === 'court_admin' ? 4.5 : 3.0,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80`,
      created_at: new Date().toISOString(),
    };

    createProfile(newProfile);

    return res.status(201).json({
      success: true,
      token: `usr_${newProfile.id}`,
      user: newProfile,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated user profile
 */
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || (req.headers['x-user-id'] as string);
  let userId = '00000000-0000-0000-0000-000000000002'; // default Taylor

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.substring(7).replace('usr_', '');
  } else if (authHeader) {
    userId = authHeader.replace('usr_', '');
  }

  const user = getProfileById(userId) || getProfileById('00000000-0000-0000-0000-000000000002');
  return res.json({ success: true, user });
});

export default router;
