import express from 'express';
import { bookRequestController } from '../controllers/bookRequestController.js';
import { auth, adminAuth, userAuth } from '../middleware/auth.js';
import { sendBookRequestNotification, sendBookIssuedNotification } from '../utils/emailService.js';

const router = express.Router();

// Create a new book request (user)
router.post('/create',auth, userAuth, bookRequestController.createBookRequest);

// Get all book requests (admin only)
router.get('/all', auth, adminAuth, bookRequestController.getAllBookRequests);

// Get book requests by user ID
router.get('/user/:userId',auth, userAuth, bookRequestController.getUserBookRequests);

// Update book request status (admin only)
router.put('/:requestId/status',auth,  adminAuth, bookRequestController.updateBookRequestStatus);

// Get pending requests count (admin dashboard)
router.get('/pending/count',auth, adminAuth, bookRequestController.getPendingRequestsCount);

// Test email endpoint (for debugging) - admin only
router.post('/test-email', auth, adminAuth, async (req, res) => {
  try {
    const { email, name, bookTitle, status, adminComments } = req.body;
    
    console.log('🧪 Testing email service...');
    console.log('   Email:', email);
    console.log('   Name:', name);
    console.log('   Book:', bookTitle);
    console.log('   Status:', status);
    
    if (status === 'approved') {
      // Test both emails for approved status
      await sendBookRequestNotification(email, name, bookTitle, status, adminComments);
      await sendBookIssuedNotification(email, name, bookTitle, '2024-01-15', '2024-01-30');
    } else {
      // Test only status notification for rejected
      await sendBookRequestNotification(email, name, bookTitle, status, adminComments);
    }
    
    res.json({ 
      success: true, 
      message: 'Test emails sent successfully. Check console for details.' 
    });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test email failed: ' + error.message 
    });
  }
});

export default router;
