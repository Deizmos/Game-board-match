import mongoose, { Schema, Document } from 'mongoose';
import { IGame, IGameImage, IGameRating, IPlayingTime, IAgeRange } from '../types';

const gameImageSchema = new Schema<IGameImage>({
  url: String,
  alt: String,
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const gameRatingSchema = new Schema<IGameRating>({
  average: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  count: {
    type: Number,
    default: 0
  }
});

const playingTimeSchema = new Schema<IPlayingTime>({
  min: {
    type: Number,
    required: [true, 'Minimum playing time is required'],
    min: 1
  },
  max: {
    type: Number,
    required: [true, 'Maximum playing time is required'],
    min: 1
  }
});

const ageSchema = new Schema<IAgeRange>({
  min: {
    type: Number,
    required: [true, 'Minimum age is required'],
    min: 0
  },
  max: {
    type: Number,
    default: 100
  }
});

const gameSchema = new Schema<IGame>({
  name: {
    type: String,
    required: [true, 'Game name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Game description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  minPlayers: {
    type: Number,
    required: [true, 'Minimum players is required'],
    min: 1
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Maximum players is required'],
    min: 1
  },
  playingTime: {
    type: playingTimeSchema,
    required: [true, 'Playing time is required']
  },
  age: {
    type: ageSchema,
    required: [true, 'Age is required']
  },
  categories: [{
    type: String,
    enum: [
      'strategy', 'party', 'cooperative', 'competitive', 'family', 
      'thematic', 'euro', 'ameritrash', 'abstract', 'card', 'dice',
      'miniature', 'role-playing', 'trivia', 'word', 'puzzle'
    ]
  }],
  mechanics: [{
    type: String,
    enum: [
      'area-control', 'auction', 'card-drafting', 'deck-building', 'dice-rolling',
      'hand-management', 'worker-placement', 'tile-placement', 'set-collection',
      'trading', 'negotiation', 'cooperative', 'solo', 'asymmetric'
    ]
  }],
  complexity: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Complexity rating is required']
  },
  rating: {
    type: gameRatingSchema,
    default: () => ({ average: 0, count: 0 })
  },
  images: [gameImageSchema],
  publisher: {
    type: String,
    required: [true, 'Publisher is required']
  },
  yearPublished: {
    type: Number,
    required: [true, 'Year published is required'],
    min: 1800,
    max: new Date().getFullYear()
  },
  bggId: {
    type: Number,
    unique: true,
    sparse: true // Allow null values but ensure uniqueness when present
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String], // User-generated tags
  popularity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
gameSchema.index({ name: 'text', description: 'text' });
gameSchema.index({ categories: 1 });
gameSchema.index({ mechanics: 1 });
gameSchema.index({ complexity: 1 });
gameSchema.index({ 'rating.average': -1 });
gameSchema.index({ popularity: -1 });

// Virtual for average rating calculation
gameSchema.virtual('averageRating').get(function(this: IGame): number {
  return this.rating.count > 0 ? this.rating.average : 0;
});

// Method to update rating
gameSchema.methods.updateRating = async function(this: IGame, newRating: number): Promise<IGame> {
  const totalRating = this.rating.average * this.rating.count + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

// Method to check if game supports player count
gameSchema.methods.supportsPlayerCount = function(this: IGame, playerCount: number): boolean {
  return playerCount >= this.minPlayers && playerCount <= this.maxPlayers;
};

// Method to check if game is suitable for age
gameSchema.methods.suitableForAge = function(this: IGame, age: number): boolean {
  return age >= this.age.min && age <= this.age.max;
};

export default mongoose.model<IGame>('Game', gameSchema);
