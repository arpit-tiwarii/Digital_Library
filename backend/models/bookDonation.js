import mongoose from 'mongoose';

const bookDonationSchema = new mongoose.Schema({
  donorName: {
    type: String,
    required: true,
    trim: true
  },
  donorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  donorPhone: {
    type: String,
    required: true,
    trim: true
  },
  bookTitle: {
    type: String,
    required: true,
    trim: true
  },
  bookAuthor: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  condition: {
    type: String,
    required: true,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  categoryName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected', 'collected'],
    default: 'pending'
  },
  adminComments: {
    type: String,
    trim: true
  },
  donationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
bookDonationSchema.index({ donorEmail: 1 });
bookDonationSchema.index({ status: 1 });
bookDonationSchema.index({ donationDate: 1 });
bookDonationSchema.index({ bookTitle: 1 });
bookDonationSchema.index({ bookAuthor: 1 });
bookDonationSchema.index({ isActive: 1 });

const BookDonation = mongoose.model('BookDonation', bookDonationSchema);

export default BookDonation;
