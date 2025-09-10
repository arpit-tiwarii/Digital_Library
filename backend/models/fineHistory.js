import mongoose from 'mongoose';

const fineHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  fineType: {
    type: String,
    enum: ['overdue', 'damage', 'both', 'waived'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  overdueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  damageAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  overdueDays: {
    type: Number,
    default: 0,
    min: -15
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
  paidAt: {
    type: Date,
    default: null
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'waived'],
    default: 'cash'
  },
  notes: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'waived'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
fineHistorySchema.index({ userId: 1 });
fineHistorySchema.index({ issueId: 1 });
fineHistorySchema.index({ fineType: 1 });
fineHistorySchema.index({ status: 1 });
fineHistorySchema.index({ paidAt: 1 });
fineHistorySchema.index({ createdAt: 1 });
fineHistorySchema.index({ isActive: 1 });

// Virtual for formatted amount
fineHistorySchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toFixed(2)}`;
});

// Virtual for payment status
fineHistorySchema.virtual('isPaid').get(function() {
  return this.status === 'paid' || this.status === 'waived';
});

// Method to mark as paid
fineHistorySchema.methods.markAsPaid = function(adminId, paymentMethod = 'cash', notes = null) {
  this.status = 'paid';
  this.paidAt = new Date();
  this.collectedBy = adminId;
  this.paymentMethod = paymentMethod;
  this.notes = notes;
  return this.save();
};

// Method to waive fine
fineHistorySchema.methods.waiveFine = function(adminId, notes = null) {
  this.status = 'waived';
  this.paidAt = new Date();
  this.collectedBy = adminId;
  this.paymentMethod = 'waived';
  this.notes = notes;
  return this.save();
};

const FineHistory = mongoose.model('FineHistory', fineHistorySchema);

export default FineHistory;
