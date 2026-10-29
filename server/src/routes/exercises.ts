import { Router, Request, Response } from 'express';
import { store } from '../db/store.js';

const router = Router();

// GET /api/exercises
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const exercises = await store.getExercises(category);
    res.json({ success: true, data: exercises });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve exercises' });
  }
});

// GET /api/exercises/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const exercise = await store.getExerciseById(id);
    if (!exercise) {
      res.status(404).json({ success: false, error: 'Exercise not found' });
      return;
    }
    res.json({ success: true, data: exercise });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve exercise' });
  }
});

export default router;
