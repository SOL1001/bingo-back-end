import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { signToken } from '../utils/jwt';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      res.status(409).json({ success: false, message: 'Username or email already taken' });
      return;
    }
    const user = await User.create({ username, email, password });
    const token = signToken(String(user._id));
    res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }
    const token = signToken(String(user._id));
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        gamesPlayed: user.gamesPlayed,
        gamesWon: user.gamesWon,
      },
    });
  } catch (err) {
    next(err);
  }
}
