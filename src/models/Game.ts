import mongoose, { Document, Schema } from 'mongoose';

export interface IGame extends Document {
  userId: mongoose.Types.ObjectId;
  board: number[];
  marked: number[];
  calledNumbers: number[];
  callPool: number[];
  isWinner: boolean;
  coinsSpent: number;
  coinsEarned: number;
  createdAt: Date;
}

const GameSchema = new Schema<IGame>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    board: { type: [Number], required: true },
    marked: { type: [Number], default: [12] },
    calledNumbers: { type: [Number], default: [] },
    callPool: { type: [Number], required: true },
    isWinner: { type: Boolean, default: false },
    coinsSpent: { type: Number, default: 10 },
    coinsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IGame>('Game', GameSchema);
