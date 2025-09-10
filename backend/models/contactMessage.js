import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  subject: {
    type: String,
    trim: true,
    default: 'Contact Inquiry'
  },
  message: {
    type: String,
    required: true,
    trim: true,
    minlength: 5
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

contactMessageSchema.index({ email: 1, createdAt: -1 });
contactMessageSchema.index({ isActive: 1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;


