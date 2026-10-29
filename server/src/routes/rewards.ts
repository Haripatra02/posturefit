import { Router, Response } from 'express';
import { store } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { completeActivitySchema } from '../types/index.js';
import { GamificationService } from '../services/gamificationService.js';

const router = Router();

// POST /api/rewards/complete-activity
router.post(
  '/complete-activity',
  requireAuth,
  validateBody(completeActivitySchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { exercise_id, challenge_id, duration_seconds, completion_status, idempotency_key } = req.body;
      const userId = req.user!.id;

      // Strict Anti-Cheat Idempotency Check: prevent duplicate rewards
      const existing = await store.getActivityCompletionByIdempotency(idempotency_key);
      if (existing) {
        res.status(200).json({
          success: true,
          data: {
            completion: existing,
            pointsAwarded: 0,
            newlyEarnedBadges: [],
            isDuplicate: true,
          },
        });
        return;
      }

      // 1. Create activity completion
      const completion = await store.createActivityCompletion({
        user_id: userId,
        exercise_id,
        challenge_id,
        duration_seconds,
        completion_status,
        idempotency_key,
        points_awarded: 0,
        completed_at: new Date().toISOString(),
      });

      // 2. If completed successfully, award points & evaluate gamification
      let rewardResult = { pointsAwarded: 0, newlyEarnedBadges: [] as any[], newRewardEvents: [] as any[] };
      if (completion_status === 'completed') {
        rewardResult = await GamificationService.handleActivityCompletion(
          userId,
          completion.id,
          Boolean(challenge_id),
          exercise_id
        );

        // Update completion record with awarded points
        completion.points_awarded = rewardResult.pointsAwarded;
      }

      res.status(201).json({
        success: true,
        data: {
          completion,
          pointsAwarded: rewardResult.pointsAwarded,
          newlyEarnedBadges: rewardResult.newlyEarnedBadges,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: 'Failed to complete activity' });
    }
  }
);

// GET /api/rewards/summary
router.get('/summary', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const summary = await GamificationService.getUserSummary(req.user!.id);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve gamification summary' });
  }
});

// GET /api/rewards/ledger
router.get('/ledger', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ledger = await store.getUserRewardEvents(req.user!.id);
    res.json({ success: true, data: ledger });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve reward ledger' });
  }
});

// GET /api/rewards/badges
router.get('/badges', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [allBadges, userBadges] = await Promise.all([
      store.getBadges(),
      store.getUserBadges(req.user!.id),
    ]);

    const earnedMap = new Map<string, string>();
    for (const ub of userBadges) {
      earnedMap.set(ub.badge_id, ub.earned_at);
    }

    const responseData = allBadges.map((badge) => ({
      ...badge,
      earned: earnedMap.has(badge.id),
      earned_at: earnedMap.get(badge.id) || null,
    }));

    res.json({ success: true, data: responseData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve badges' });
  }
});

export default router;
