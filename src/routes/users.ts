import express from 'express';
import {
  getUserProfile,
  updateProfile,
  addToFavorites,
  removeFromFavorites,
  getNearbyUsers,
  searchUsers
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { validate, userValidation } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.put('/profile', protect, validate(userValidation.updateProfile), updateProfile);
router.post('/favorites/:gameId', protect, addToFavorites);
router.delete('/favorites/:gameId', protect, removeFromFavorites);
router.get('/nearby', protect, getNearbyUsers);
router.get('/search', protect, searchUsers);

export default router;
