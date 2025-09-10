import express from 'express';
const router = express.Router();
import { generateAndSendOTP, verifyOTP, resendOTP } from '../controllers/otpController.js';

// Generate and send OTP
router.post('/generate-otp', generateAndSendOTP);

// Verify OTP
router.post('/verify-otp', verifyOTP);

// Resend OTP
router.post('/resend-otp', resendOTP);

export default router;
