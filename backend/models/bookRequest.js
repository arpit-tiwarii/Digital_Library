import mongoose from 'mongoose';

const bookRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  requestDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminResponseDate: {
    type: Date,
    default: null
  },
  adminComments: {
    type: String,
    trim: true
  },
  issueDate: {
    type: Date,
    default: null
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
bookRequestSchema.index({ userId: 1 });
bookRequestSchema.index({ bookId: 1 });
bookRequestSchema.index({ status: 1 });
bookRequestSchema.index({ requestDate: 1 });
bookRequestSchema.index({ isActive: 1 });

const BookRequest = mongoose.model('BookRequest', bookRequestSchema);

export default BookRequest;
