import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';
dotenv.config();

// Basic authentication middleware
const auth = async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization'];

        if (!bearerHeader || !bearerHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization token missing or malformed' });
        }

        const token = bearerHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user exists in DB using Mongoose
        const existingUser = await User.findById(decoded.userId);
        if (!existingUser) {
            return res.status(401).json({ message: 'User not found or removed' });
        }

        // Check if email is verified
        if (!existingUser.isEmailVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email before accessing this resource.',
                emailNotVerified: true
            });
        }

        // Attach user & token to request
        req.user = existingUser;
        console.log('yahi aaya')
        req.token = token;

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token format.' });
        }
        return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }
};

// Admin authorization middleware
const adminAuth = (req, res, next) => {
    
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Admin privileges required.',
            requiredRole: 'admin',
            currentRole: req.user ? req.user.role : 'none'
        });
    }
    console.log('yaha bhi aaya ', req.user.role)
    next();
};

// User authorization middleware
const userAuth = (req, res, next) => {
    if (!req.user || (req.user.role !== 'user' && req.user.role !== 'admin')) {
        return res.status(403).json({
            message: 'Access denied. User privileges required.',
            requiredRole: 'user',
            currentRole: req.user ? req.user.role : 'none'
        });
    }
    next();
};

export { auth, adminAuth, userAuth };
export default auth;
