import Game, { IGame } from '../models/Game';
import User from '../models/User';
import { generateBoard, buildCallPool, checkWin } from '../utils/bingoUtils';

const COST_PER_GAME = 10;
const WIN_REWARD = 50;

export async function createNewGame(userId?: string): Promise<IGame> {
  const board = generateBoard();
  const callPool = buildCallPool();

  // Guest preview — no auth, no coin deduction, game not persisted to a user
  if (!userId) {
    return new Game({ board, marked: [12], calledNumbers: [], callPool, isWinner: false, coinsSpent: 0, coinsEarned: 0 });
  }

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.coins < COST_PER_GAME) {
    const err = new Error('Not enough coins to start a game') as Error & { statusCode: number };
    err.statusCode = 400;
    throw err;
  }

  user.coins -= COST_PER_GAME;
  user.gamesPlayed += 1;
  await user.save();

  return Game.create({
    userId,
    board,
    marked: [12],
    calledNumbers: [],
    callPool,
    isWinner: false,
    coinsSpent: COST_PER_GAME,
    coinsEarned: 0,
  });
}

export async function callNextNumber(gameId: string, userId: string): Promise<IGame> {
  const game = await Game.findOne({ _id: gameId, userId });
  if (!game) throw new Error('Game not found');
  if (game.isWinner) throw new Error('Game is already won');
  if (game.callPool.length === 0) throw new Error('All numbers have been called');

  const called = game.callPool.shift()!;
  game.calledNumbers.push(called);

  const idx = game.board.findIndex((n, i) => i !== 12 && n === called);
  if (idx !== -1 && !game.marked.includes(idx)) {
    game.marked.push(idx);
  }

  const won = checkWin(game.marked);
  if (won && !game.isWinner) {
    game.isWinner = true;
    game.coinsEarned = WIN_REWARD;
    await User.findByIdAndUpdate(userId, {
      $inc: { coins: WIN_REWARD, gamesWon: 1 },
    });
  }

  game.markModified('callPool');
  game.markModified('marked');
  game.markModified('calledNumbers');
  return game.save();
}

export async function checkWinCondition(gameId: string, userId: string): Promise<{ isWinner: boolean; game: IGame }> {
  const game = await Game.findOne({ _id: gameId, userId });
  if (!game) throw new Error('Game not found');
  return { isWinner: game.isWinner, game };
}

export async function getHistory(userId: string): Promise<IGame[]> {
  return Game.find({ userId }).sort({ createdAt: -1 }).limit(20).select('-callPool -board');
}

export async function addCoins(userId: string, amount: number): Promise<number> {
  const user = await User.findByIdAndUpdate(userId, { $inc: { coins: amount } }, { new: true });
  if (!user) throw new Error('User not found');
  return user.coins;
}
