import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, ILocation, IUserPreferences } from '../types';

const locationSchema = new Schema<ILocation>({
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
  city: {
    type: String,
    required: [true, 'City is required']
  },
  country: {
    type: String,
    required: [true, 'Country is required']
  }
});

const preferencesSchema = new Schema<IUserPreferences>({
  maxDistance: {
    type: Number,
    default: 50, // km
    min: 1,
    max: 500
  },
  ageRange: {
    min: {
      type: Number,
      default: 18,
      min: 18
    },
    max: {
      type: Number,
      default: 100,
      max: 100
    }
  },
  gameTypes: [{
    type: String,
    enum: ['strategy', 'party', 'cooperative', 'competitive', 'family', 'thematic', 'euro', 'ameritrash']
  }],
  playStyle: {
    type: String,
    enum: ['casual', 'competitive', 'mixed'],
    default: 'mixed'
  },
  availability: {
    weekdays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],
    weekends: [{
      type: String,
      enum: ['saturday', 'sunday']
    }],
    timeSlots: [{
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night']
    }]
  }
});

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: locationSchema,
    required: [true, 'Location is required']
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  favoriteGames: [{
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function(this: IUser): string {
  return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function(this: IUser): any {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

export default mongoose.model<IUser>('User', userSchema);
