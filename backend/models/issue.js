import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
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
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  returnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  isReturned: {
    type: Boolean,
    default: false
  },
  // Fine Management Fields
  fineAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  overdueFine: {
    type: Number,
    default: 0,
    min: 0
  },
  damageFine: {
    type: Number,
    default: 0,
    min: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  finePaidAt: {
    type: Date,
    default: null
  },
  fineStatus: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },
  damageDescription: {
    type: String,
    default: null
  },
  damageType: {
    type: String,
    enum: ['none', 'minor', 'moderate', 'severe', 'lost'],
    default: 'none'
  },
  // Email Notification Tracking
  reminderSent: {
    type: Boolean,
    default: false
  },
  warningSent: {
    type: Boolean,
    default: false
  },
  overdueNotificationSent: {
    type: Boolean,
    default: false
  },
  // Reissue Information
  reissueCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxReissues: {
    type: Number,
    default: 2
  },
  canReissue: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastFineCalculation: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better performance
issueSchema.index({ userId: 1 });
issueSchema.index({ bookId: 1 });
issueSchema.index({ isReturned: 1 });
issueSchema.index({ issueDate: 1 });
issueSchema.index({ returnDate: 1 });
issueSchema.index({ fineStatus: 1 });
issueSchema.index({ finePaid: 1 });
issueSchema.index({ isActive: 1 });
issueSchema.index({ isReturned: 1, returnDate: 1 }); // Compound index for overdue queries

// Virtual for calculating overdue days
issueSchema.virtual('overdueDays').get(function() {
  if (this.isReturned) return 0;
  const today = new Date();
  const returnDate = new Date(this.returnDate);
  const diffTime = today - returnDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for calculating overdue fine
issueSchema.virtual('calculatedOverdueFine').get(function() {
  const overdueDays = this.overdueDays;
  return overdueDays * 5; // ₹5 per day
});

// Virtual for checking if book is overdue
issueSchema.virtual('isOverdue').get(function() {
  return this.overdueDays > 0;
});

// Virtual for checking if book is due soon (1 day left)
issueSchema.virtual('isDueSoon').get(function() {
  if (this.isReturned) return false;
  const today = new Date();
  const returnDate = new Date(this.returnDate);
  const diffTime = returnDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 1;
});

// Method to calculate total fine
issueSchema.methods.calculateTotalFine = function() {
  const overdueFine = this.calculatedOverdueFine;
  const damageFine = this.damageFine || 0;
  return overdueFine + damageFine;
};

// Method to update fine amounts
issueSchema.methods.updateFines = function() {
  this.overdueFine = this.calculatedOverdueFine;
  this.fineAmount = this.calculateTotalFine();
  return this.save();
};

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
