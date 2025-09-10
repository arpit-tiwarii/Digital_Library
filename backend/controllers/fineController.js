import Issue from '../models/issue.js';
import FineHistory from '../models/fineHistory.js';
import User from '../models/user.js';
import Book from '../models/book.js';
import { 
  sendOverdueFineNotification, 
  sendDueSoonReminder, 
  sendBookIssueConfirmation 
} from '../utils/emailService.js';

// Calculate and update fines for all overdue books
export const updateOverdueFines = async () => {
  try {
    console.log('🔄 Starting overdue fine calculation...');
    
    const today = new Date();
    const overdueIssues = await Issue.find({
      isReturned: false,
      returnDate: { $lt: today }
    }).populate('userId bookId');

    let updatedCount = 0;
    let emailSentCount = 0;

    for (const issue of overdueIssues) {
      const overdueDays = Math.ceil((today - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24));
      const overdueFine = overdueDays * 5; // ₹5 per day
      
      // Update issue with new fine amount
      issue.overdueFine = overdueFine;
      issue.fineAmount = issue.damageFine + overdueFine;
      await issue.save();

      // Create or update fine history
      let fineHistory = await FineHistory.findOne({ issueId: issue._id });
      
      if (!fineHistory) {
        fineHistory = new FineHistory({
          userId: issue.userId._id,
          issueId: issue._id,
          fineType: 'overdue',
          amount: overdueFine,
          overdueAmount: overdueFine,
          damageAmount: 0,
          overdueDays: overdueDays,
          status: 'pending'
        });
      } else {
        fineHistory.amount = overdueFine + fineHistory.damageAmount;
        fineHistory.overdueAmount = overdueFine;
        fineHistory.overdueDays = overdueDays;
      }
      
      await fineHistory.save();

      // Send overdue notification email (only once per day)
      if (!issue.overdueNotificationSent) {
        try {
          await sendOverdueFineNotification(
            issue.userId.email,
            issue.userId.name,
            issue.bookId.bookTitle,
            overdueDays,
            overdueFine,
            issue.returnDate
          );
          issue.overdueNotificationSent = true;
          await issue.save();
          emailSentCount++;
        } catch (emailError) {
          console.error('❌ Error sending overdue notification email:', emailError);
        }
      }

      updatedCount++;
    }

    console.log(`✅ Fine calculation completed: ${updatedCount} issues updated, ${emailSentCount} emails sent`);
    return { updatedCount, emailSentCount };
  } catch (error) {
    console.error('❌ Error updating overdue fines:', error);
    throw error;
  }
};

// Send due soon reminders
export const sendDueSoonReminders = async () => {
  try {
    console.log('📧 Sending due soon reminders...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dueSoonIssues = await Issue.find({
      isReturned: false,
      returnDate: {
        $gte: today,
        $lte: tomorrow
      },
      reminderSent: false
    }).populate('userId bookId');

    let emailSentCount = 0;

    for (const issue of dueSoonIssues) {
      try {
        await sendDueSoonReminder(
          issue.userId.email,
          issue.userId.name,
          issue.bookId.bookTitle,
          issue.returnDate
        );
        
        issue.reminderSent = true;
        await issue.save();
        emailSentCount++;
      } catch (emailError) {
        console.error('❌ Error sending due soon reminder:', emailError);
      }
    }

    console.log(`✅ Due soon reminders sent: ${emailSentCount} emails`);
    return emailSentCount;
  } catch (error) {
    console.error('❌ Error sending due soon reminders:', error);
    throw error;
  }
};

// Get all fines for admin dashboard
export const getAllFines = async (req, res) => {
  try {
    const { status, fineType, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (fineType) query.fineType = fineType;

    const skip = (page - 1) * limit;
    
    const fines = await FineHistory.find(query)
      .populate('userId', 'name email')
      .populate('issueId')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FineHistory.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const totalAmount = await FineHistory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: fines,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      summary: {
        totalAmount: totalAmount[0]?.total || 0,
        totalFines: total
      }
    });
  } catch (error) {
    console.error('❌ Error getting fines:', error);
    res.status(500).json({ success: false, message: 'Failed to get fines' });
  }
};

// Get user's fine history
export const getUserFines = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const fines = await FineHistory.find(query)
      .populate('issueId')
      .populate('collectedBy', 'name')
      .sort({ createdAt: -1 });

    const totalAmount = await FineHistory.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.status(200).json({
      success: true,
      data: fines,
      summary: {
        totalAmount: totalAmount[0]?.total || 0,
        totalFines: fines.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting user fines:', error);
    res.status(500).json({ success: false, message: 'Failed to get user fines' });
  }
};

// Mark fine as paid
export const markFineAsPaid = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { paymentMethod = 'cash', notes } = req.body;
    const adminId = req.user._id;

    const fine = await FineHistory.findById(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    if (fine.status === 'paid' || fine.status === 'waived') {
      return res.status(400).json({ success: false, message: 'Fine is already paid or waived' });
    }

    // Mark fine as paid
    await fine.markAsPaid(adminId, paymentMethod, notes);

    // Update issue fine status
    await Issue.findByIdAndUpdate(fine.issueId, {
      finePaid: true,
      finePaidAt: new Date(),
      fineStatus: 'paid'
    });

    res.status(200).json({
      success: true,
      message: 'Fine marked as paid successfully',
      data: fine
    });
  } catch (error) {
    console.error('❌ Error marking fine as paid:', error);
    res.status(500).json({ success: false, message: 'Failed to mark fine as paid' });
  }
};

// Waive fine
export const waiveFine = async (req, res) => {
  try {
    const { fineId } = req.params;
    const { notes } = req.body;
    const adminId = req.user._id;

    const fine = await FineHistory.findById(fineId);
    if (!fine) {
      return res.status(404).json({ success: false, message: 'Fine not found' });
    }

    if (fine.status === 'paid' || fine.status === 'waived') {
      return res.status(400).json({ success: false, message: 'Fine is already paid or waived' });
    }

    // Waive fine
    await fine.waiveFine(adminId, notes);

    // Update issue fine status
    await Issue.findByIdAndUpdate(fine.issueId, {
      finePaid: true,
      finePaidAt: new Date(),
      fineStatus: 'waived'
    });

    res.status(200).json({
      success: true,
      message: 'Fine waived successfully',
      data: fine
    });
  } catch (error) {
    console.error('❌ Error waiving fine:', error);
    res.status(500).json({ success: false, message: 'Failed to waive fine' });
  }
};

// Get fine statistics for dashboard
export const getFineStatistics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total pending fines
    const pendingFines = await FineHistory.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Monthly fines
    const monthlyFines = await FineHistory.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Yearly fines
    const yearlyFines = await FineHistory.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Fines by type
    const finesByType = await FineHistory.aggregate([
      { $group: { _id: '$fineType', count: { $sum: 1 }, total: { $sum: '$amount' } } }
    ]);

    // Overdue books count
    const overdueBooks = await Issue.countDocuments({
      isReturned: false,
      returnDate: { $lt: today }
    });

    res.status(200).json({
      success: true,
      data: {
        pending: {
          count: pendingFines[0]?.count || 0,
          amount: pendingFines[0]?.total || 0
        },
        monthly: {
          count: monthlyFines[0]?.count || 0,
          amount: monthlyFines[0]?.total || 0
        },
        yearly: {
          count: yearlyFines[0]?.count || 0,
          amount: yearlyFines[0]?.total || 0
        },
        byType: finesByType,
        overdueBooks
      }
    });
  } catch (error) {
    console.error('❌ Error getting fine statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to get fine statistics' });
  }
};

// Manual fine calculation for specific issue
export const calculateFineForIssue = async (issueId) => {
  try {
    const issue = await Issue.findById(issueId).populate('userId bookId');
    if (!issue) {
      throw new Error('Issue not found');
    }

    if (issue.isReturned) {
      return { overdueFine: 0, damageFine: issue.damageFine || 0, totalFine: issue.damageFine || 0 };
    }

    // Check if fine was calculated recently (within last hour) to avoid recalculation
    const lastCalculationTime = issue.lastFineCalculation || new Date(0);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    if (lastCalculationTime > oneHourAgo && issue.overdueFine > 0) {
      // Return cached calculation if recent
      return { 
        overdueFine: issue.overdueFine, 
        damageFine: issue.damageFine || 0, 
        totalFine: issue.fineAmount || 0,
        overdueDays: Math.ceil((new Date() - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24))
      };
    }

    const today = new Date();
    const overdueDays = Math.ceil((today - new Date(issue.returnDate)) / (1000 * 60 * 60 * 24));
    const overdueFine = Math.max(0, overdueDays * 5);
    const damageFine = issue.damageFine || 0;
    const totalFine = overdueFine + damageFine;

    // Update issue with calculation timestamp
    issue.overdueFine = overdueFine;
    issue.fineAmount = totalFine;
    issue.lastFineCalculation = new Date();
    await issue.save();

    return { overdueFine, damageFine, totalFine, overdueDays };
  } catch (error) {
    console.error('❌ Error calculating fine for issue:', error);
    throw error;
  }
};

export default {
  updateOverdueFines,
  sendDueSoonReminders,
  getAllFines,
  getUserFines,
  markFineAsPaid,
  waiveFine,
  getFineStatistics,
  calculateFineForIssue
};
