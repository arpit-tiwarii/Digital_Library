import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  getAllFines,
  getUserFines,
  markFineAsPaid,
  waiveFine,
  getFineStatistics,
  updateOverdueFines,
  sendDueSoonReminders
} from '../controllers/fineController.js';

const router = express.Router();

// Get all fines (admin only)
router.get('/all', auth, adminAuth, getAllFines);

// Get fine statistics for dashboard (admin only)
router.get('/statistics', auth, adminAuth, getFineStatistics);

// Get user's fine history
router.get('/user/:userId', auth, getUserFines);

// Mark fine as paid (admin only)
router.put('/pay/:fineId', auth, adminAuth, markFineAsPaid);

// Waive fine (admin only)
router.put('/waive/:fineId', auth, adminAuth, waiveFine);

// Manual fine calculation (admin only)
router.post('/calculate-overdue', auth, adminAuth, async (req, res) => {
  try {
    const result = await updateOverdueFines();
    res.status(200).json({
      success: true,
      message: 'Fine calculation completed',
      data: result
    });
  } catch (error) {
    console.error('❌ Error in manual fine calculation:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate fines' });
  }
});

// Manual due soon reminders (admin only)
router.post('/send-reminders', auth, adminAuth, async (req, res) => {
  try {
    const result = await sendDueSoonReminders();
    res.status(200).json({
      success: true,
      message: 'Due soon reminders sent',
      data: { emailsSent: result }
    });
  } catch (error) {
    console.error('❌ Error sending due soon reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to send reminders' });
  }
});

export default router;
