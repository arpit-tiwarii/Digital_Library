import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  getDashboardStats,
} from '../controllers/statisticsController.js';

const router = express.Router();

// Get main dashboard statistics (admin only)
router.get('/dashboard', auth, adminAuth, getDashboardStats);

// // Get book statistics by category (admin only)
// router.get('/books-by-category', auth, adminAuth, getBookStatsByCategory);

// // Get recent activity statistics (admin only)
// router.get('/recent-activity', auth, adminAuth, getRecentActivity);

export default router;
