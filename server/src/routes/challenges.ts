import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/challenges
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await store.getChallenges();
    res.json({ success: true, data: challenges });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve challenges' });
  }
});

// GET /api/challenges/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const challenge = await store.getChallengeById(id);
    if (!challenge) {
      res.status(404).json({ success: false, error: 'Challenge not found' });
      return;
    }
    res.json({ success: true, data: challenge });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve challenge' });
  }
});

export default router;
