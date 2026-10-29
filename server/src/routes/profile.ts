import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updatePreferencesSchema, updateProfileSchema } from '../types/index.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const profile = await store.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve profile' });
  }
});

// PUT /api/profile
router.put('/', requireAuth, validateBody(updateProfileSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const updated = await store.upsertProfile({
      id: req.user!.id,
      email: req.user!.email,
      display_name: req.body.display_name,
      timezone: req.body.timezone,
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// GET /api/profile/preferences
router.get('/preferences', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const preferences = await store.getPreferences(req.user!.id);
    res.json({ success: true, data: preferences });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve preferences' });
  }
});

// PUT /api/profile/preferences
router.put(
  '/preferences',
  requireAuth,
  validateBody(updatePreferencesSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const updated = await store.updatePreferences(req.user!.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
  }
);

export default router;
