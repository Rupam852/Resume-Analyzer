import express from 'express';
import multer from 'multer';
import { analyzeResume, getUserAnalyses, getAnalysisById, deleteAnalysisById } from '../controllers/analyzeController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure Multer for In-Memory Storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// Protected routes
router.post('/analyze', authenticateToken, upload.single('resume'), analyzeResume);
router.get('/history', authenticateToken, getUserAnalyses);
router.get('/:id', authenticateToken, getAnalysisById);
router.delete('/:id', authenticateToken, deleteAnalysisById);

export default router;
