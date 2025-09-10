import OTP from '../models/otp.js';
import User from '../models/user.js';
import { sendOTPEmail } from '../utils/emailService.js';

// Generate and send OTP
export const generateAndSendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already registered and verified' 
      });
    }

    // Delete any existing unused OTPs for this email
    await OTP.deleteMany({
      email,
      isUsed: false
    });

    // Generate and send OTP
    const totp = await sendOTPEmail(email, name);

    // Store OTP in database with 5 minutes expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const otpRecord = new OTP({
      email,
      otp: totp,
      expiresAt,
      isUsed: false
    });
    await otpRecord.save();

    console.log(`✅ OTP generated and sent to ${email}`);
    console.log(totp);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      email: email,
      otp: totp
    });

  } catch (error) {
    console.error('❌ Error generating OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      email,
      otp,
      isUsed: false,
      expiresAt: { $gt: new Date() } // Not expired
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Update user email verification status
    const user = await User.findOne({ email });
    if (user) {
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    console.log(`✅ OTP verified successfully for ${email}`);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email and name are required'
      });
    }

    // Delete any existing unused OTPs for this email
    await OTP.deleteMany({
      email,
      isUsed: false
    });

    // Generate and send new OTP
    const otp = await sendOTPEmail(email, name);

    // Store new OTP in database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const otpRecord = new OTP({
      email,
      otp: otp.toString(),
      expiresAt,
      isUsed: false
    });
    await otpRecord.save();

    console.log(`✅ OTP resent to ${email}`);
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully. Please check your email.',
      email: email
    });

  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.',
      error: error.message
    });
  }
};
