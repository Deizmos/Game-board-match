import express from 'express';
import {
  getGames,
  getGame,
  createGame,
  updateGame,
  rateGame,
  getPopularGames,
  getCategories,
  getMechanics
} from '../controllers/gameController';
import { protect } from '../middleware/auth';
import { validate, gameValidation } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/', getGames);
router.get('/popular', getPopularGames);
router.get('/categories', getCategories);
router.get('/mechanics', getMechanics);
router.get('/:id', getGame);

// Protected routes
router.post('/', protect, validate(gameValidation.create), createGame);
router.put('/:id', protect, validate(gameValidation.update), updateGame);
router.post('/:id/rate', protect, rateGame);

export default router;
