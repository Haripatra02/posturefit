import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { startSessionSchema, updateSessionSchema } from '../types/index.js';
import { GamificationService } from '../services/gamificationService.js';

const router = Router();

// POST /api/sessions/start
router.post(
  '/start',
  requireAuth,
  validateBody(startSessionSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const session = await store.createWorkSession({
        user_id: req.user!.id,
        started_at: new Date().toISOString(),
        status: 'in_progress',
        planned_duration: req.body.planned_duration,
        actual_tracked_duration: 0,
        breaks_taken: 0,
      });

      res.status(201).json({ success: true, data: session });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to start session' });
    }
  }
);

// PUT /api/sessions/:id
router.put(
  '/:id',
  requireAuth,
  validateBody(updateSessionSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status, actual_tracked_duration, breaks_taken } = req.body;
      const updates: any = {
        status,
        actual_tracked_duration,
      };

      if (status === 'completed' || status === 'cancelled') {
        updates.ended_at = new Date().toISOString();
      }
      if (breaks_taken !== undefined) {
        updates.breaks_taken = breaks_taken;
      }

      const id = String(req.params.id);
      const updated = await store.updateWorkSession(id, updates);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Session not found' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to update session' });
    }
  }
);

// POST /api/sessions/:id/break
router.post('/:id/break', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const session = store.workSessions.get(id);
    if (!session || session.user_id !== req.user!.id) {
      res.status(404).json({ success: false, error: 'Work session not found' });
      return;
    }

    const breakNumber = (session.breaks_taken || 0) + 1;
    await store.updateWorkSession(session.id, {
      breaks_taken: breakNumber,
    });

    const rewardResult = await GamificationService.handleBreakCompletion(
      req.user!.id,
      session.id,
      breakNumber
    );

    res.json({
      success: true,
      data: {
        breaks_taken: breakNumber,
        pointsAwarded: rewardResult.pointsAwarded,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to record break' });
  }
});

// GET /api/sessions/history
router.get('/history', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt((req.query.limit as string) || '50', 10);
    const sessions = await store.getUserWorkSessions(req.user!.id, limit);
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve session history' });
  }
});

export default router;
