import { IGame } from "../types/Game";
import mongoose from "mongoose";


const GameSchema = new mongoose.Schema<IGame>({
  region: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Region',
    required: true
  },

  date: {
    type: Date,
    required: true,
    validate: {
      validator: (v: Date) => v > new Date(new Date().setHours(0, 0, 0, 0)),
      message: 'Game date must be in the future'
    }
  },

  bettingOpenTime: {
    type: Date,
    required: true
  },

  bettingCloseTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: IGame, v: Date) {
        return v > this.bettingOpenTime;
      },
      message: 'Betting close time must be after open time'
    }
  },


  winningNumber: {
    type: Number,
    min: 1,
    max: 100
  },


  status: {
    type: String,
    required: true,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming'
  },

  resultDeclarationTime: {
    type: Date,
    required: true,
    validate: {
      validator: function (this: IGame, v: Date) {
        return v > this.bettingCloseTime;
      },
      message: 'Result declaration time must be after betting close time'
    }
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying
GameSchema.index({ region: 1, date: 1 }, { unique: true });
const GameModel = mongoose.model<IGame>('Game', GameSchema);
export default GameModel;

