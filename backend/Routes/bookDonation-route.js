import express from 'express';
const router = express.Router();
import { 
  submitDonation, 
  getAllDonations, 
  getDonationsByStatus, 
  updateDonationStatus, 
  getDonationById, 
  searchDonations 
} from '../controllers/bookDonationController.js';
import { auth, userAuth, adminAuth } from '../middleware/auth.js';

// Public routes
router.post('/submit', submitDonation);

// Protected routes (admin only)
router.get('/all',auth, adminAuth, getAllDonations);
router.get('/status/:status', auth, adminAuth, getDonationsByStatus);
router.get('/search',auth, adminAuth, searchDonations);
router.get('/:donationId',auth, adminAuth, getDonationById);
router.put('/:donationId/status',auth, adminAuth, updateDonationStatus);

export default router;
