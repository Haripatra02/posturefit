import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest, requireAdmin, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { exerciseSchema } from '../types/index.js';

const router = Router();

// Apply auth and admin check to all admin routes
router.use(requireAuth, requireAdmin);

// POST /api/admin/exercises (Create exercise)
router.post('/exercises', validateBody(exerciseSchema), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const created = await store.createExercise(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create exercise' });
  }
});

// PUT /api/admin/exercises/:id (Update exercise)
router.put('/exercises/:id', validateBody(exerciseSchema.partial()), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const updated = await store.updateExercise(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Exercise not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update exercise' });
  }
});

// DELETE /api/admin/exercises/:id (Archive or remove exercise)
router.delete('/exercises/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const success = await store.deleteExercise(id);
    if (!success) {
      res.status(404).json({ success: false, error: 'Exercise not found' });
      return;
    }
    res.json({ success: true, message: 'Exercise removed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to remove exercise' });
  }
});

// POST /api/admin/users/:userId/role (Set user role)
router.post('/users/:userId/role', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const { role } = req.body;
    if (!['user', 'admin', 'moderator'].includes(role)) {
      res.status(400).json({ success: false, error: 'Invalid role specified' });
      return;
    }

    await store.setUserRole(userId, role);
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update user role' });
  }
});

export default router;
