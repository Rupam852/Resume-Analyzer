import express from 'express';
import { login, register, getProfile, googleRedirect, googleCallback } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// Google OAuth routes
router.get('/google', googleRedirect);
router.get('/google/callback', googleCallback);

export default router;
