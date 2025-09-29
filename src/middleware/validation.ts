import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      res.status(400).json({
        status: 'error',
        message: errorMessage
      });
      return;
    }
    
    next();
  };
};

// User validation schemas
export const userValidation = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    age: Joi.number().integer().min(18).max(100).required(),
    bio: Joi.string().max(500).allow(''),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      country: Joi.string().required()
    }).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    bio: Joi.string().max(500).allow(''),
    age: Joi.number().integer().min(18).max(100),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string(),
      city: Joi.string(),
      country: Joi.string()
    }),
    preferences: Joi.object({
      maxDistance: Joi.number().min(1).max(500),
      ageRange: Joi.object({
        min: Joi.number().min(18),
        max: Joi.number().max(100)
      }),
      gameTypes: Joi.array().items(Joi.string().valid(
        'strategy', 'party', 'cooperative', 'competitive', 'family', 
        'thematic', 'euro', 'ameritrash'
      )),
      playStyle: Joi.string().valid('casual', 'competitive', 'mixed'),
      availability: Joi.object({
        weekdays: Joi.array().items(Joi.string().valid(
          'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
        )),
        weekends: Joi.array().items(Joi.string().valid('saturday', 'sunday')),
        timeSlots: Joi.array().items(Joi.string().valid(
          'morning', 'afternoon', 'evening', 'night'
        ))
      })
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

// Game validation schemas
export const gameValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().max(1000).required(),
    minPlayers: Joi.number().integer().min(1).required(),
    maxPlayers: Joi.number().integer().min(1).required(),
    playingTime: Joi.object({
      min: Joi.number().integer().min(1).required(),
      max: Joi.number().integer().min(1).required()
    }).required(),
    age: Joi.object({
      min: Joi.number().integer().min(0).required(),
      max: Joi.number().integer().min(0).max(100)
    }).required(),
    categories: Joi.array().items(Joi.string().valid(
      'strategy', 'party', 'cooperative', 'competitive', 'family',
      'thematic', 'euro', 'ameritrash', 'abstract', 'card', 'dice',
      'miniature', 'role-playing', 'trivia', 'word', 'puzzle'
    )),
    mechanics: Joi.array().items(Joi.string().valid(
      'area-control', 'auction', 'card-drafting', 'deck-building', 'dice-rolling',
      'hand-management', 'worker-placement', 'tile-placement', 'set-collection',
      'trading', 'negotiation', 'cooperative', 'solo', 'asymmetric'
    )),
    complexity: Joi.number().min(1).max(5).required(),
    publisher: Joi.string().required(),
    yearPublished: Joi.number().integer().min(1800).max(new Date().getFullYear()).required(),
    bggId: Joi.number().integer().positive()
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string().max(1000),
    minPlayers: Joi.number().integer().min(1),
    maxPlayers: Joi.number().integer().min(1),
    playingTime: Joi.object({
      min: Joi.number().integer().min(1),
      max: Joi.number().integer().min(1)
    }),
    age: Joi.object({
      min: Joi.number().integer().min(0),
      max: Joi.number().integer().min(0).max(100)
    }),
    categories: Joi.array().items(Joi.string()),
    mechanics: Joi.array().items(Joi.string()),
    complexity: Joi.number().min(1).max(5),
    publisher: Joi.string(),
    yearPublished: Joi.number().integer().min(1800).max(new Date().getFullYear()),
    bggId: Joi.number().integer().positive()
  })
};

// Match validation schemas
export const matchValidation = {
  create: Joi.object({
    game: Joi.string().required(),
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500).allow(''),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
      address: Joi.string().required(),
      venue: Joi.string().required(),
      city: Joi.string().required()
    }).required(),
    scheduledDate: Joi.date().greater('now').required(),
    duration: Joi.number().integer().min(30).max(480).required(),
    maxPlayers: Joi.number().integer().min(2).required(),
    requirements: Joi.object({
      experience: Joi.string().valid('beginner', 'intermediate', 'advanced', 'any'),
      ageMin: Joi.number().integer().min(18),
      notes: Joi.string().max(200)
    }),
    tags: Joi.array().items(Joi.string()),
    isPublic: Joi.boolean(),
    visibility: Joi.string().valid('public', 'friends', 'private')
  }),

  update: Joi.object({
    title: Joi.string().max(100),
    description: Joi.string().max(500).allow(''),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2),
      address: Joi.string(),
      venue: Joi.string(),
      city: Joi.string()
    }),
    scheduledDate: Joi.date().greater('now'),
    duration: Joi.number().integer().min(30).max(480),
    maxPlayers: Joi.number().integer().min(2),
    requirements: Joi.object({
      experience: Joi.string().valid('beginner', 'intermediate', 'advanced', 'any'),
      ageMin: Joi.number().integer().min(18),
      notes: Joi.string().max(200)
    }),
    tags: Joi.array().items(Joi.string()),
    isPublic: Joi.boolean(),
    visibility: Joi.string().valid('public', 'friends', 'private')
  }),

  search: Joi.object({
    game: Joi.string(),
    location: Joi.object({
      coordinates: Joi.array().items(Joi.number()).length(2),
      maxDistance: Joi.number().min(1).max(500)
    }),
    dateFrom: Joi.date(),
    dateTo: Joi.date(),
    maxPlayers: Joi.number().integer().min(1),
    experience: Joi.string().valid('beginner', 'intermediate', 'advanced', 'any'),
    tags: Joi.array().items(Joi.string()),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};
