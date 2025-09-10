import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookTitle: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  publisher: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  bookAuthor: {
    type: String,
    required: true,
    trim: true
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 0
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  coverImage: {
    type: String,
    default: 'defaultBook.jpg'
  },
  description: {
    type: String,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
bookSchema.index({ bookTitle: 1 });
bookSchema.index({ bookAuthor: 1 });
bookSchema.index({ categoryId: 1 });
bookSchema.index({ isActive: 1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;
