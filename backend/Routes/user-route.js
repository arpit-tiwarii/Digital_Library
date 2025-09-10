import express from 'express';
const app = express.Router();
import User from '../models/user.js'
import Issue from '../models/issue.js';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import Book from '../models/book.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import { adminAuth, userAuth } from '../middleware/auth.js';
import { auth } from '../middleware/auth.js';
import upload from '../middleware/multerconfig.js';
dotenv.config();

app.post('/RegisterUser', async (req, res) => {
    try {
        const {name, email, phoneNo, password, otp} = req.body;
        console.log(otp)
        
        // Always set role to "user" for normal registration
        const role = "user";
        
        // Validate mobile number format (Indian format)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(phoneNo)) {
            return res.status(400).json({ 
                success: false,
                message: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Please enter a valid email address" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phoneNo: phoneNo }
            ]
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "User already registered! Please login" 
            });
        }

        // If OTP is provided, verify it
        if (otp) {
            console.log("andar aaya otp leke",otp)
            const OTP = (await import('../models/otp.js')).default;
            const otpRecord = await OTP.findOne({
                email,
                otp,
                // isUsed: false,
                expiresAt: { $gt: new Date() } // Not expired
            });

            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired OTP. Please request a new one."
                });
            }

            // Mark OTP as used
            otpRecord.isUsed = true;
            await otpRecord.save();
        }

        console.log('Creating user with data:', { name, email, phoneNo, role, isEmailVerified: otp ? true : false,
            emailVerifiedAt: otp ? new Date() : null });
        
        const hashedpassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');
        console.log(otp)
        const user = new User({
            name, 
            email, 
            phoneNo, 
            password: hashedpassword, 
            role,
            isEmailVerified: otp ? true : false,
            emailVerifiedAt: otp ? new Date() : null
        });
        
        const savedUser = await user.save();
        console.log('User saved successfully');

        if (!savedUser) { 
            return res.status(404).json({
                success: false,
                message: 'Error in creating user' 
            });
        }
        
        // Send welcome email to new user
        try {
          await sendWelcomeEmail(email, name);
          console.log(`✅ Welcome email sent to new user: ${email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
          // Don't fail the registration if email fails
        }
        
        res.status(201).json({
            success: true,
            message: otp ? "Registration successful! Please login to continue." : "Registration successful! Please verify your email with OTP.",
            user: {
                userId: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                isEmailVerified: savedUser.isEmailVerified
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: err.message
        });
    }
})

app.get('/getUsers', auth, adminAuth, async (req, res) => {
    try {
        // Get all users (both existing and new records)
        const users = await User.find({});
        res.status(200).json(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Route to get all users including deactivated ones (for admin management)
app.get('/getAllUsers', auth, adminAuth, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/getUser/:email', auth, userAuth, async (req, res) => {
    try {
      const { email } = req.params;
      console.log('Fetching user profile for email:', email);
      
      // Check if user is requesting their own profile or is admin
      if (req.user.email !== email && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'You can only access your own profile' 
        });
      }
      
      // First get the user
      const user = await User.findOne({ email });
    
      if(!user){
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Then get their issues with populated book data
      const issues = await Issue.find({ userId: user._id })
        .populate('bookId', 'bookTitle bookAuthor coverImage description categoryId')
        .sort({ issueDate: -1 });

      console.log('User profile fetched successfully. Issues count:', issues.length);
      
      // Combine user data with issues
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        profilePic: user.profilePic,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        Issues: issues // Keep the same field name for frontend compatibility
      };
      
      res.status(200).json(userData);
    } catch (err) {
      console.error('Error in getUser:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
});

// New route to get user by ID (for admin user profile viewing)
app.get('/getUserById/:userId', auth, adminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      
      // First get the user
      const user = await User.findById(userId);
      
      if(!user){
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }

      // Then get their issues with populated book data
      const issues = await Issue.find({ userId: userId })
        .populate('bookId', 'bookTitle bookAuthor coverImage description categoryId')
        .sort({ issueDate: -1 });
      
      // Combine user data with issues
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
        profilePic: user.profilePic,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        issues: issues
      };
      
      res.status(200).json({
        success: true,
        data: userData
      });
    } catch (err) {
      console.error('Error in getUserById:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
});

app.put('/updateUser/:id', auth, userAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

// Route for users to update their own profile
app.put('/updateProfile/:id', auth, userAuth, upload.single('profilePic'), async (req, res) => {
    try {
        if(req.file)
            console.log('file aayi')
        console.log(req.body)
        const { name, email, phoneNo } = req.body;
        
        // Users can only update their own profile
        const updateData = { name, email, phoneNo };
        if (req.file) {
            updateData.profilePic = req.file.filename;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
})

app.delete('/deleteUser/:id', auth, userAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        res.status(200).send(user)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.post('/login', async(req,res)=>{
    try{
        const {email, password} = req.body
        // Get user by email (both existing and new records)
        const users = await User.findOne({ email })
        console.log('Login attempt for:', email)
        
        if(!users) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }
        
        const isMatch = await bcrypt.compare(password, users.password)
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        // Check if email is verified
        if (!users.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address before logging in.',
                emailNotVerified: true
            });
        }

        const token = jwt.sign(
            {userId: users._id, username: users.name, role: users.role}, 
            process.env.JWT_SECRET || 'default_jwt_secret_key',
            {expiresIn:'365d'}
        )
        
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: users._id,
                name: users.name,
                email: users.email,
                role: users.role,
                profilePic: users.profilePic || null,
                isEmailVerified: users.isEmailVerified
            }
        })
    }catch(err){
        console.error('Login error:', err)
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: err.message
        })
    }
})

app.post('/logout',(req,res)=>{
    res.json("logout successfully")
})

// Route for admins to create new admin users
app.post('/createAdmin', auth, adminAuth, async (req, res) => {
    try {
        const {name, email, phoneNo, password, role, otp} = req.body;
        
        // Only admins can create other admins
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Only administrators can create admin users." 
            });
        }

        // Validate mobile number format (Indian format)
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(phoneNo)) {
            return res.status(400).json({ 
                success: false,
                message: "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Please enter a valid email address" 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phoneNo: phoneNo }
            ]
        });
        
        if (existingUser) {
            return res.status(409).json({ 
                success: false,
                message: "User already registered! Please login" 
            });
        }

        // If OTP is provided, verify it
        if (otp) {
            const OTP = (await import('../models/otp.js')).default;
            const otpRecord = await OTP.findOne({
                email,
                otp,
                expiresAt: { $gt: new Date() } // Not expired
            });

            if (!otpRecord) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired OTP. Please request a new one."
                });
            }

            // Mark OTP as used
            otpRecord.isUsed = true;
            await otpRecord.save();
        }

        console.log('Creating admin user with data:', { name, email, phoneNo, role, isEmailVerified: otp ? true : false,
            emailVerifiedAt: otp ? new Date() : null });
        
        const hashedpassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully');
        
        const user = new User({
            name, 
            email, 
            phoneNo, 
            password: hashedpassword, 
            role,
            isEmailVerified: otp ? true : false,
            emailVerifiedAt: otp ? new Date() : null
        });
        
        const savedUser = await user.save();
        console.log('Admin user saved successfully');

        if (!savedUser) { 
            return res.status(404).json({
                success: false,
                message: 'Error in creating admin user' 
            });
        }
        
        // Send welcome email to new admin user
        try {
          await sendWelcomeEmail(email, name);
          console.log(`✅ Welcome email sent to new admin user: ${email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send welcome email to ${email}:`, emailError);
          // Don't fail the admin creation if email fails
        }
        
        res.status(201).json({
            success: true,
            message: "Admin user created successfully!",
            user: {
                userId: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role,
                isEmailVerified: savedUser.isEmailVerified
            }
        });
    } catch (err) {
        console.error('Admin creation error:', err);
        res.status(500).json({
            success: false,
            message: 'Admin creation failed. Please try again.',
            error: err.message
        });
    }
})

export default app;