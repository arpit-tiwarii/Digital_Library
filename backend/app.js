import connectDB from './config/db.js';
import cors from 'cors'
import express from 'express';
import dotenv from 'dotenv';
import auth from './middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';
import session from 'express-session';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Required for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB().then(async () => {
    console.log("✅ Database connected successfully");

    // ------------------------------------------
    // START SERVER AND DEFINE ROUTES HERE
    // This code will only run after the database is ready
    // ------------------------------------------

    app.use('/image', express.static('image'));
    app.use('/images', express.static('images'));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // All routes are defined AFTER the database is connected
    // Import routes only after DB is ready
    const { default: bookRoutes } = await import('./Routes/book-route.js');
    const { default: issueRoutes } = await import('./Routes/issue-route.js');
    const { default: categoryRoutes } = await import('./Routes/category-route.js');
    const { default: userRoutes } = await import('./Routes/user-route.js');
    const { default: bookRequestRoutes } = await import('./Routes/bookRequest-route.js');
    const { default: otpRoutes } = await import('./Routes/otp-route.js');
    const { default: bookDonationRoutes } = await import('./Routes/bookDonation-route.js');
    const { default: googleAuthRoutes } = await import('./Routes/googleAuth-route.js');
    const { default: fineRoutes } = await import('./Routes/fine-route.js');
    const { default: contactRoutes } = await import('./Routes/contact-route.js');
    const { default: statisticsRoutes } = await import('./Routes/statistics-route.js');

    app.use('/books', bookRoutes);
    app.use('/issue', issueRoutes);
    app.use('/category', categoryRoutes);
    app.use('/user', userRoutes);
    app.use('/book-request', bookRequestRoutes);
    app.use('/otp', otpRoutes);
    app.use('/book-donation', bookDonationRoutes);
    app.use('/auth', googleAuthRoutes);
    app.use('/fines', fineRoutes);
    app.use('/statistics', statisticsRoutes);
    app.use('/', contactRoutes);

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'OK', 
            message: 'InfoBeans Digital Library API is running',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // Start server
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`✅ Server started on port ${PORT}`);
        console.log(`🌐 Visit http://localhost:${PORT} to view the application`);
        console.log(`🔐 Google OAuth available at http://localhost:${PORT}/auth/google`);
        console.log(`💚 Health check available at http://localhost:${PORT}/health`);
    });

}).catch((err) => {
    // Log a fatal error if the database connection fails
    console.error("❌ Fatal Error: Database connection failed.", err);
    process.exit(1); // Exit the application if the database is not ready
});