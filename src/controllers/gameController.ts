import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as gameService from '../services/gameService';

export async function newGame(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const game = await gameService.createNewGame(req.userId);
    res.status(201).json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

export async function callNumber(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { gameId } = req.body;
    if (!gameId) { res.status(400).json({ success: false, message: 'gameId is required' }); return; }
    const game = await gameService.callNextNumber(gameId, req.userId!);
    res.json({ success: true, data: game });
  } catch (err) {
    next(err);
  }
}

export async function checkWin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { gameId } = req.body;
    if (!gameId) { res.status(400).json({ success: false, message: 'gameId is required' }); return; }
    const result = await gameService.checkWinCondition(gameId, req.userId!);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const history = await gameService.getHistory(req.userId!);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
}

export async function addCoins(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const amount = 50; // fixed top-up amount
    const coins = await gameService.addCoins(req.userId!, amount);
    res.json({ success: true, coins });
  } catch (err) {
    next(err);
  }
}
