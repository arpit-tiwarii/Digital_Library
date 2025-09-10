import Issue from '../models/issue.js';
import Book from '../models/book.js';
import User from '../models/user.js';
import FineHistory from '../models/fineHistory.js';
import { 
  sendBookIssueConfirmation, 
  sendOverdueFineNotification 
} from '../utils/emailService.js';
import { calculateFineForIssue } from './fineController.js';

// Get all issues
const getAllIssues = async (req, res, next) => {
  try {
    // Get all issues (both existing and new records)
    const issues = await Issue.find({})
      .populate('userId', 'name email phoneNo role')
      .populate('bookId', 'bookTitle bookAuthor coverImage categoryId')
      .sort({ issueDate: -1 });

    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Error in getAllIssues:', error);
    next(error);
  }
};

const getIssue = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if userId is provided and valid
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Get all issues for the user (both existing and new records)
    const issues = await Issue.find({ userId: userId })
      .populate('bookId', 'bookTitle bookAuthor coverImage description categoryId')
      .populate('userId', 'name email phoneNo role')
      .sort({ issueDate: -1 });

    console.log('Issues fetched for user:', userId, 'Count:', issues.length);

    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error('Error in getIssue:', error);
    next(error);
  }
};

// Create new issue with fine management and email notifications
const createIssue = async (req, res, next) => {
  try {
    const { userId, bookId, issueDate, returnDate, isFromRequest = false } = req.body;

    // Prevent direct issuance - books must be requested first
    if (!isFromRequest) {
      return res.status(403).json({ 
        success: false, 
        message: 'Direct book issuance is disabled. Please submit a book request first and wait for admin approval.' 
      });
    }

    // Basic validation
    if (!userId || !bookId || !issueDate || !returnDate) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // ✅ Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    // ✅ Check if available
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available for this book.' });
    }

    // ✅ Create issue with fine management fields
    const issue = new Issue({
      userId,
      bookId,
      issueDate,
      returnDate,
      isReturned: false,
      fineAmount: 0,
      overdueFine: 0,
      damageFine: 0,
      finePaid: false,
      fineStatus: 'pending',
      damageType: 'none',
      reminderSent: false,
      warningSent: false,
      overdueNotificationSent: false,
      reissueCount: 0,
      maxReissues: 2,
      canReissue: true
    });

    await issue.save();

    // ✅ Deduct available copy only if this is a legitimate issue
    if (isFromRequest) {
      book.availableCopies -= 1;
      await book.save();
    }

    // ✅ Send confirmation email with care instructions
    try {
      const user = await User.findById(userId);
      await sendBookIssueConfirmation(
        user.email,
        user.name,
        book.bookTitle,
        issueDate,
        returnDate
      );
    } catch (emailError) {
      console.error('❌ Error sending issue confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Book issued successfully',
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

// Update issue by ID with fine calculation
const updateIssue = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    console.log("issueId", issueId)
    // console.log(req.params.selectedIssue._id)
    // Fetch the issue before updating
    const issue = await Issue.findById(issueId).populate('userId bookId');
    if (!issue) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }
    console.log("update issue route")
    
    // If user is returning the book now
    if(!issue.isReturned) {
      const book = await Book.findById(issue.bookId);
      if (book) {
        book.availableCopies += 1; // Increase available copies
        await book.save();
      }

      // Calculate final fines before marking as returned
      const fineCalculation = await calculateFineForIssue(issueId);
      
      // Update issue with return details and fines
      issue.actualReturnDate = new Date();
      issue.isReturned = true;
      issue.overdueFine = fineCalculation.overdueFine;
      issue.damageFine = req.body.damageFine || 0;
      issue.damageType = req.body.damageType || 'none';
      issue.damageDescription = req.body.damageDescription || null;
      issue.fineAmount = fineCalculation.overdueFine + (req.body.damageFine || 0);
      issue.fineStatus = 'pending';

      // Create fine history record
      if (issue.fineAmount > 0) {
        const fineHistory = new FineHistory({
          userId: issue.userId._id,
          issueId: issue._id,
          fineType: fineCalculation.overdueFine > 0 && (req.body.damageFine || 0) > 0 ? 'both' : 
                   fineCalculation.overdueFine > 0 ? 'overdue' : 'damage',
          amount: issue.fineAmount,
          overdueAmount: fineCalculation.overdueFine,
          damageAmount: req.body.damageFine || 0,
          overdueDays: fineCalculation.overdueDays || 0,
          damageDescription: req.body.damageDescription || null,
          damageType: req.body.damageType || 'none',
          status: 'pending'
        });
        await fineHistory.save();
      }

      await issue.save();

      return res.status(200).json({
        success: true,
        message: 'Book returned successfully',
        data: {
          issue,
          fineCalculation: {
            overdueFine: fineCalculation.overdueFine,
            damageFine: req.body.damageFine || 0,
            totalFine: issue.fineAmount,
            overdueDays: fineCalculation.overdueDays || 0
          }
        },
      });
    } else {
      // Regular update (not a return)
      Object.assign(issue, req.body);
      await issue.save();

      return res.status(200).json({
        success: true,
        message: 'Issue updated successfully',
        data: issue,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Soft delete issue by ID
const deleteIssue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Issue.findByIdAndUpdate(
      id, 
      { isActive: false }, 
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Issue not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Issue deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Get overdue issues
const getOverdueIssues = async (req, res, next) => {
  try {
    const today = new Date();
    
    // Add timeout to prevent hanging queries
    const queryPromise = Issue.find({
      isReturned: false,
      returnDate: { $lt: today }
    })
    .select('userId bookId returnDate overdueFine fineAmount fineStatus')
    .populate('userId', 'name email')
    .populate('bookId', 'bookTitle')
    .limit(100) // Limit to prevent performance issues
    .sort({ returnDate: -1 }); // Sort by return date for better performance

    // Add 10 second timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 10000);
    });

    const overdueIssues = await Promise.race([queryPromise, timeoutPromise]);

    return res.status(200).json({
      success: true,
      data: overdueIssues,
    });
  } catch (error) {
    console.error('Error in getOverdueIssues:', error);
    if (error.message === 'Query timeout') {
      return res.status(408).json({
        success: false,
        message: 'Request timeout - please try again'
      });
    }
    next(error);
  }
};

// Get issues due soon (1 day left)
const getDueSoonIssues = async (req, res, next) => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get all due soon issues with optimized query
    const dueSoonIssues = await Issue.find({
      isReturned: false,
      returnDate: {
        $gte: today,
        $lte: tomorrow
      }
    })
    .select('userId bookId returnDate')
    .populate('userId', 'name email')
    .populate('bookId', 'bookTitle')
    .limit(50) // Limit to prevent performance issues
    .sort({ returnDate: 1 }); // Sort by return date ascending

    return res.status(200).json({
      success: true,
      data: dueSoonIssues,
    });
  } catch (error) {
    next(error);
  }
};

export const issueController = {
    createIssue,
    getAllIssues,
    getIssue,
    deleteIssue,
    updateIssue,
    getOverdueIssues,
    getDueSoonIssues
};
