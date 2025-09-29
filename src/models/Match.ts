import mongoose, { Schema, Document } from 'mongoose';
import { IMatch, IPlayer, IChatMessage, IMatchLocation, IMatchRequirements } from '../types';

const playerSchema = new Schema<IPlayer>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled'],
    default: 'confirmed'
  }
});

const chatMessageSchema = new Schema<IChatMessage>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const matchLocationSchema = new Schema<IMatchLocation>({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: [true, 'Location coordinates are required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required']
  }
});

const matchRequirementsSchema = new Schema<IMatchRequirements>({
  experience: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'any'],
    default: 'any'
  },
  ageMin: {
    type: Number,
    min: 18,
    default: 18
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
});

const matchSchema = new Schema<IMatch>({
  host: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Host is required']
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: [true, 'Game is required']
  },
  title: {
    type: String,
    required: [true, 'Match title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  location: {
    type: matchLocationSchema,
    required: [true, 'Location is required']
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(date: Date): boolean {
        return date > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [30, 'Duration must be at least 30 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Maximum players is required'],
    min: [2, 'Must allow at least 2 players']
  },
  currentPlayers: [playerSchema],
  status: {
    type: String,
    enum: ['open', 'full', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  requirements: {
    type: matchRequirementsSchema,
    default: () => ({})
  },
  chat: [chatMessageSchema],
  tags: [String], // User-generated tags for easier discovery
  isPublic: {
    type: Boolean,
    default: true
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
matchSchema.index({ location: '2dsphere' });
matchSchema.index({ scheduledDate: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ host: 1 });
matchSchema.index({ game: 1 });
matchSchema.index({ 'currentPlayers.user': 1 });

// Virtual for available spots
matchSchema.virtual('availableSpots').get(function(this: IMatch): number {
  return this.maxPlayers - this.currentPlayers.filter(player => 
    player.status === 'confirmed'
  ).length;
});

// Virtual for is full
matchSchema.virtual('isFull').get(function(this: IMatch): boolean {
  return this.availableSpots <= 0;
});

// Method to add player to match
matchSchema.methods.addPlayer = async function(this: IMatch, userId: string): Promise<IMatch> {
  if (this.isFull) {
    throw new Error('Match is full');
  }
  
  if (this.status !== 'open') {
    throw new Error('Match is not accepting new players');
  }
  
  // Check if user is already in the match
  const existingPlayer = this.currentPlayers.find(player => 
    player.user.toString() === userId.toString()
  );
  
  if (existingPlayer) {
    throw new Error('User is already in this match');
  }
  
  this.currentPlayers.push({
    user: userId as any,
    joinedAt: new Date(),
    status: 'confirmed'
  });
  
  // Update status if full
  if (this.availableSpots <= 0) {
    this.status = 'full';
  }
  
  return this.save();
};

// Method to remove player from match
matchSchema.methods.removePlayer = async function(this: IMatch, userId: string): Promise<IMatch> {
  this.currentPlayers = this.currentPlayers.filter(player => 
    player.user.toString() !== userId.toString()
  );
  
  // Update status if no longer full
  if (this.status === 'full' && this.availableSpots > 0) {
    this.status = 'open';
  }
  
  return this.save();
};

// Method to check if user is in match
matchSchema.methods.hasPlayer = function(this: IMatch, userId: string): boolean {
  return this.currentPlayers.some(player => 
    player.user.toString() === userId.toString()
  );
};

// Method to get distance from a point
matchSchema.methods.getDistanceFrom = function(this: IMatch, coordinates: [number, number]): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (this.location.coordinates[1] - coordinates[1]) * Math.PI / 180;
  const dLon = (this.location.coordinates[0] - coordinates[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coordinates[1] * Math.PI / 180) * Math.cos(this.location.coordinates[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default mongoose.model<IMatch>('Match', matchSchema);
