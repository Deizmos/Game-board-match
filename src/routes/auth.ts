import express from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
  logout
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate, userValidation } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validate(userValidation.register), register);
router.post('/login', validate(userValidation.login), login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/change-password', protect, validate(userValidation.changePassword), changePassword);
router.post('/logout', protect, logout);

export default router;
