import BookDonation from '../models/bookDonation.js';
import Book from '../models/book.js';
import Category from '../models/category.js';
import { sendDonationSubmissionEmail, sendDonationApprovalEmail, sendDonationRejectionEmail } from '../utils/emailService.js';

// Submit a book donation request
export const submitDonation = async (req, res) => {
  try {
    const {
      donorName,
      donorEmail,
      donorPhone,
      bookTitle,
      bookAuthor,
      isbn,
      publisher,
      year,
      condition,
      quantity,
      description,
      categoryName
    } = req.body;

    // Validate required fields
    if (!donorName || !donorEmail || !donorPhone || !bookTitle || !bookAuthor || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate mobile number format (Indian format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(donorPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Create donation record
    const donation = new BookDonation({
      donorName,
      donorEmail,
      donorPhone,
      bookTitle,
      bookAuthor,
      isbn: isbn || null,
      publisher: publisher || null,
      year: year || null,
      condition,
      quantity: quantity || 1,
      description: description || null,
      categoryName: categoryName || null,
      status: 'pending',
      donationDate: new Date()
    });

    await donation.save();

    // Send email notification to donor
    try {
      await sendDonationSubmissionEmail(donorEmail, donorName, bookTitle);
      console.log(`✅ Donation submission email sent to ${donorEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send donation submission email:', emailError);
      // Don't fail the request if email fails
    }

    console.log(`✅ Book donation submitted by ${donorName} for "${bookTitle}"`);
    res.status(201).json({
      success: true,
      message: 'Book donation request submitted successfully. We will review and contact you soon.',
      donation: {
        donationId: donation._id,
        bookTitle: donation.bookTitle,
        status: donation.status
      }
    });

  } catch (error) {
    console.error('❌ Error submitting donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit donation request',
      error: error.message
    });
  }
};

// Get all donations (admin only)
export const getAllDonations = async (req, res) => {
  try {
    const donations = await BookDonation.find().sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      donations
    });

  } catch (error) {
    console.error('❌ Error fetching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
};

// Get donations by status
export const getDonationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    const validStatuses = ['pending', 'approved', 'rejected', 'collected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, collected'
      });
    }

    const donations = await BookDonation.find({ status }).sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      donations
    });

  } catch (error) {
    console.error('❌ Error fetching donations by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donations',
      error: error.message
    });
  }
};

// Update donation status (admin only)
export const updateDonationStatus = async (req, res) => {
  try {
    const { donationId } = req.params;
    const { status, adminComments } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'collected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected, collected'
      });
    }

    const donation = await BookDonation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const previousStatus = donation.status;
    donation.status = status;
    donation.adminComments = adminComments || null;
    await donation.save();

    // Send email notifications based on status change
    try {
      if (status === 'approved' && previousStatus !== 'approved') {
        await sendDonationApprovalEmail(donation.donorEmail, donation.donorName, donation.bookTitle, adminComments);
        console.log(`✅ Donation approval email sent to ${donation.donorEmail}`);
      } else if (status === 'rejected' && previousStatus !== 'rejected') {
        await sendDonationRejectionEmail(donation.donorEmail, donation.donorName, donation.bookTitle, adminComments);
        console.log(`✅ Donation rejection email sent to ${donation.donorEmail}`);
      }
    } catch (emailError) {
      console.error('❌ Failed to send donation status email:', emailError);
      // Don't fail the request if email fails
    }

    // If status is 'collected', add the book to library
    if (status === 'collected' && previousStatus !== 'collected') {
      try {
        await addDonatedBookToLibrary(donation);
        console.log(`✅ Donated book "${donation.bookTitle}" added to library`);
      } catch (libraryError) {
        console.error('❌ Failed to add donated book to library:', libraryError);
        return res.status(500).json({
          success: false,
          message: 'Donation status updated but failed to add book to library',
          error: libraryError.message
        });
      }
    }

    console.log(`✅ Donation ${donationId} status updated to ${status}`);
    res.status(200).json({
      success: true,
      message: 'Donation status updated successfully',
      donation
    });

  } catch (error) {
    console.error('❌ Error updating donation status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donation status',
      error: error.message
    });
  }
};

// Helper function to add donated book to library
const addDonatedBookToLibrary = async (donation) => {
  try {
    // Check if book already exists in library (by ISBN or title + author)
    let existingBook = null;
    
    if (donation.isbn) {
      existingBook = await Book.findOne({ isbn: donation.isbn });
    }
    
    if (!existingBook) {
      // Try to find by title and author if ISBN not found
      existingBook = await Book.findOne({
        bookTitle: donation.bookTitle,
        bookAuthor: donation.bookAuthor
      });
    }

    if (existingBook) {
      // Update existing book quantities
      existingBook.totalCopies += donation.quantity;
      existingBook.availableCopies += donation.quantity;
      await existingBook.save();
      
      console.log(`✅ Updated existing book "${donation.bookTitle}" - Added ${donation.quantity} copies`);
    } else {
      // Create new book entry
      // Determine category: use donation.categoryName if valid, otherwise 'Other'
      const resolvedCategoryName = donation.categoryName &&
        [
          'Computer Science','Mathematics','Physics','Chemistry','Biology','Engineering','Medicine','Psychology','Economics','Business','Law','Education',
          'Fiction','Non-Fiction','Science Fiction','Fantasy','Mystery & Thriller','Romance','Historical Fiction','Biography & Memoir','Poetry','Drama',
          'Programming','Web Development','Mobile Development','Data Science','Artificial Intelligence','Machine Learning','Cybersecurity','Database','DevOps','Cloud Computing',
          'History','Philosophy','Religion','Politics','Sociology','Geography','Art & Design','Music','Sports','Travel','Cooking','Self-Help','Children','Young Adult','Reference','Magazines','Other'
        ].includes(donation.categoryName)
        ? donation.categoryName
        : 'Other';

      let defaultCategory = await Category.findOne({ categoryName: resolvedCategoryName });
      if (!defaultCategory) {
        defaultCategory = new Category({
          categoryName: resolvedCategoryName,
          description: resolvedCategoryName === 'Other' ? 'Miscellaneous donated books' : ''
        });
        await defaultCategory.save();
      }

      const newBook = new Book({
        bookTitle: donation.bookTitle,
        bookAuthor: donation.bookAuthor,
        isbn: donation.isbn || `DONATED-${Date.now()}`, // Generate temporary ISBN if not provided
        publisher: donation.publisher || 'Donated',
        year: donation.year || new Date().getFullYear(),
        totalCopies: donation.quantity,
        availableCopies: donation.quantity,
        coverImage: 'defaultBook.jpg',
        description: donation.description || `Donated by ${donation.donorName}`,
        categoryId: defaultCategory._id
      });
      
      await newBook.save();
      console.log(`✅ Created new book "${donation.bookTitle}" with ${donation.quantity} copies`);
    }
  } catch (error) {
    console.error('❌ Error adding donated book to library:', error);
    throw error;
  }
};

// Get donation by ID
export const getDonationById = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donation = await BookDonation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.status(200).json({
      success: true,
      donation
    });

  } catch (error) {
    console.error('❌ Error fetching donation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation',
      error: error.message
    });
  }
};

// Search donations
export const searchDonations = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const donations = await BookDonation.find({
      $or: [
        { bookTitle: { $regex: query, $options: 'i' } },
        { bookAuthor: { $regex: query, $options: 'i' } },
        { donorName: { $regex: query, $options: 'i' } },
        { donorEmail: { $regex: query, $options: 'i' } }
      ]
    }).sort({ donationDate: -1 });

    res.status(200).json({
      success: true,
      donations
    });

  } catch (error) {
    console.error('❌ Error searching donations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search donations',
      error: error.message
    });
  }
};
