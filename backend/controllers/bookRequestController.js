import BookRequest from '../models/bookRequest.js';
import Book from '../models/book.js';
import User from '../models/user.js';
import Issue from '../models/issue.js';
import { sendBookRequestNotification, sendBookIssuedNotification } from '../utils/emailService.js';
import { issueController } from './issueController.js';

// Create a new book request
const createBookRequest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { bookId } = req.body;
    console.log(userId);
    console.log(bookId);
    // Basic validation
    if (!userId || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Book ID are required.'
      });
    }

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found.'
      });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available for this book.'
      });
    }

    // Check if user already has a pending request for this book
    const existingRequest = await BookRequest.findOne({
      userId,
      bookId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this book.'
      });
    }

    // Create the request
    const requestDate = new Date().toISOString().split('T')[0];
    const oldrequest = new BookRequest({
      userId,
      bookId,
      requestDate
    });
    await oldrequest.save();

    const request = await BookRequest.findById(oldrequest._id)
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle bookAuthor availableCopies');

    console.log(request);
    console.log('request hui hai');
    
    try {
      await sendBookIssuedNotification(
        request.userId.email,
        request.userId.name,
        request.bookId.bookTitle,
      );
      console.log('✅ Book issued notification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send book issued notification email:', emailError.message);
      // Don't fail the whole request if email fails, but log it
    }
    
    return res.status(201).json({
      success: true,
      message: 'Book request submitted successfully. Waiting for admin approval.',
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Get all book requests (for admin)
const  getAllBookRequests = async (req, res, next) => {
  try {
    const requests = await BookRequest.find()
      .populate('userId', 'name email phoneNo role')
      .populate('bookId', 'bookTitle bookAuthor availableCopies coverImage description categoryId')
      .sort({ requestDate: -1 });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getAllBookRequests:', error);
    next(error);
  }
};

// Get book requests by user ID
const getUserBookRequests = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const requests = await BookRequest.find({ userId })
      .populate('bookId', 'bookTitle bookAuthor description coverImage categoryId')
      .sort({ requestDate: -1 });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error in getUserBookRequests:', error);
    next(error);
  }
};

// Admin approve/reject book request
const updateBookRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { status, adminComments, adminId } = req.body;

    // Debug: Log the received data
    console.log('🔍 Update Book Request Status Debug:');
    console.log('   Request ID:', requestId);
    console.log('   Status:', status);
    console.log('   Admin Comments:', adminComments);
    console.log('   Admin ID:', adminId);
    console.log('   Request Body:', req.body);

    if (!['approved', 'rejected'].includes(status)) {
      console.log('❌ Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: 'Status must be either "approved" or "rejected".'
      });
    }

    if (!adminId) {
      console.log('❌ Missing adminId');
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required.'
      });
    }

    // Find the request
    const request = await BookRequest.findById(requestId)
      .populate('userId', 'name email')
      .populate('bookId', 'bookTitle bookAuthor availableCopies');

    if (!request) {
      console.log('❌ Book request not found for ID:', requestId);
      return res.status(404).json({
        success: false,
        message: 'Book request not found.'
      });
    }

    console.log('✅ Found book request:', {
      requestId: request._id,
      status: request.status,
      userId: request.userId,
      bookId: request.bookId
    });

    if (request.status !== 'pending') {
      console.log('❌ Request already processed. Current status:', request.status);
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed.'
      });
    }

    // Update request status
    request.status = status;
    request.adminId = adminId;
    request.adminResponseDate = new Date();
    request.adminComments = adminComments;
    await request.save();

    // If approved, create the actual issue and send email
    if (status === 'approved') {
      try {
        const issueDate = new Date();
        const returnDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

        console.log('📚 Creating issue for approved request...');
        console.log('   Issue Date:', issueDate);
        console.log('   Return Date:', returnDate);

        // Create the issue directly using the issue model (since this is approved through request)
        const issue = new Issue({
          userId: request.userId._id,
          bookId: request.bookId._id,
          issueDate,
          returnDate,
          isReturned: false
        });
        await issue.save();

        console.log('✅ Issue created successfully:', issue._id);

        // Deduct available copy from book
        const book = await Book.findById(request.bookId._id);
        if (book) {
          book.availableCopies -= 1;
          await book.save();
          console.log('✅ Book available copies updated:', book.availableCopies);
        }

        // Update request with issue details
        // request.issueDate = issueDate;
        // request.actualReturnDate = actualReturnDate;
        // await request.save();

        console.log('✅ Request updated with issue details');

        // Send book issued notification email IMMEDIATELY
        console.log('📧 Sending book issued notification email...');
        // Send status notification email IMMEDIATELY
        console.log('📧 Sending status notification email...');
        try {
          await sendBookRequestNotification(
            request.userId.email,
            request.userId.name,
            request.bookId.bookTitle,
            status,
            adminComments
          );
          console.log('✅ Status notification email sent successfully');
        } catch (emailError) {
          console.error('❌ Failed to send status notification email:', emailError.message);
          // Don't fail the whole request if email fails, but log it
        }
      } catch (issueError) {
        console.error('❌ Error creating issue:', issueError);
        throw new Error(`Failed to create issue: ${issueError.message}`);
      }
    } else {
      try {
        await sendBookRequestNotification(
          request.userId.email,
          request.userId.name,
          request.bookId.bookTitle,
          status,
          adminComments
        );
        console.log('✅ Status notification email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send status notification email:', emailError.message);
        // Don't fail the whole request if email fails, but log it
      }
    }

    return res.status(200).json({
      success: true,
      message: `Book request ${status} successfully.`,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// Get pending requests count (for admin dashboard)
const getPendingRequestsCount = async (req, res, next) => {
  try {
    const count = await BookRequest.countDocuments({ status: 'pending' });

    return res.status(200).json({
      success: true,
      data: { pendingCount: count }
    });
  } catch (error) {
    next(error);
  }
};

export const bookRequestController = {
  createBookRequest,
  getAllBookRequests,
  getUserBookRequests,
  updateBookRequestStatus,
  getPendingRequestsCount
};