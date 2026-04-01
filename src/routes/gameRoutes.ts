import { Router } from 'express';
import { newGame, callNumber, checkWin, getHistory, addCoins } from '../controllers/gameController';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// Public — guests can generate a preview board; logged-in users pay coins
router.get('/new', optionalAuth, newGame);

// Protected — must be authenticated
router.post('/call',       requireAuth, callNumber);
router.post('/check',      requireAuth, checkWin);
router.get('/history',     requireAuth, getHistory);
router.post('/coins/add',  requireAuth, addCoins);

export default router;
