import express from 'express';
import {
  getMatches,
  getMatch,
  createMatch,
  updateMatch,
  joinMatch,
  leaveMatch,
  cancelMatch,
  getMyMatches
} from '../controllers/matchController';
import { protect } from '../middleware/auth';
import { validate, matchValidation } from '../middleware/validation';

const router = express.Router();

// Public routes
router.get('/', getMatches);
router.get('/:id', getMatch);

// Protected routes
router.get('/my-matches', protect, getMyMatches);
router.post('/', protect, validate(matchValidation.create), createMatch);
router.put('/:id', protect, validate(matchValidation.update), updateMatch);
router.post('/:id/join', protect, joinMatch);
router.post('/:id/leave', protect, leaveMatch);
router.delete('/:id', protect, cancelMatch);

export default router;
