import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: [
      // Academic Categories
      'Computer Science',
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology',
      'Engineering',
      'Medicine',
      'Psychology',
      'Economics',
      'Business',
      'Law',
      'Education',
      
      // Literature Categories
      'Fiction',
      'Non-Fiction',
      'Science Fiction',
      'Fantasy',
      'Mystery & Thriller',
      'Romance',
      'Historical Fiction',
      'Biography & Memoir',
      'Poetry',
      'Drama',
      
      // Programming & Technology
      'Programming',
      'Web Development',
      'Mobile Development',
      'Data Science',
      'Artificial Intelligence',
      'Machine Learning',
      'Cybersecurity',
      'Database',
      'DevOps',
      'Cloud Computing',
      
      // General Categories
      'History',
      'Philosophy',
      'Religion',
      'Politics',
      'Sociology',
      'Geography',
      'Art & Design',
      'Music',
      'Sports',
      'Travel',
      'Cooking',
      'Self-Help',
      'Children',
      'Young Adult',
      'Reference',
      'Magazines',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  color: {
    type: String,
    default: '#007bff'
  },
  icon: {
    type: String,
    default: '📚'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create indexes for better performance
categorySchema.index({ isActive: 1 });

// Pre-save middleware to set default description and color based on category
categorySchema.pre('save', function(next) {
  if (!this.description) {
    this.description = this.getDefaultDescription();
  }
  if (!this.color) {
    this.color = this.getDefaultColor();
  }
  if (!this.icon) {
    this.icon = this.getDefaultIcon();
  }
  next();
});

// Method to get default description
categorySchema.methods.getDefaultDescription = function() {
  const descriptions = {
    'Computer Science': 'Books about computer science, algorithms, and computing theory',
    'Programming': 'Programming languages, coding practices, and software development',
    'Web Development': 'Frontend, backend, and full-stack web development',
    'Fiction': 'Imaginative stories and creative literature',
    'Non-Fiction': 'Factual books based on real events and information',
    'Science Fiction': 'Futuristic and scientific fiction stories',
    'Fantasy': 'Magical and supernatural fiction',
    'History': 'Historical events, periods, and figures',
    'Mathematics': 'Mathematical concepts, theories, and applications',
    'Physics': 'Physical sciences and natural laws',
    'Chemistry': 'Chemical sciences and molecular studies',
    'Biology': 'Life sciences and living organisms',
    'Engineering': 'Engineering principles and applications',
    'Medicine': 'Medical sciences and healthcare',
    'Psychology': 'Human mind and behavior studies',
    'Economics': 'Economic theories and financial systems',
    'Business': 'Business management and entrepreneurship',
    'Law': 'Legal studies and jurisprudence',
    'Education': 'Teaching methods and educational theories',
    'Philosophy': 'Philosophical thoughts and theories',
    'Religion': 'Religious texts and spiritual studies',
    'Politics': 'Political science and governance',
    'Sociology': 'Social behavior and society studies',
    'Geography': 'Earth sciences and spatial studies',
    'Art & Design': 'Creative arts and design principles',
    'Music': 'Musical theory and performance',
    'Sports': 'Athletics and physical activities',
    'Travel': 'Travel guides and exploration',
    'Cooking': 'Culinary arts and recipes',
    'Self-Help': 'Personal development and improvement',
    'Children': 'Books for young readers',
    'Young Adult': 'Books for teenage readers',
    'Reference': 'Reference materials and encyclopedias',
    'Other': 'Miscellaneous and general topics'
  };
  return descriptions[this.categoryName] || 'General category for various topics';
};

// Method to get default color
categorySchema.methods.getDefaultColor = function() {
  const colors = {
    'Computer Science': '#007bff',
    'Programming': '#28a745',
    'Web Development': '#17a2b8',
    'Fiction': '#dc3545',
    'Non-Fiction': '#6c757d',
    'Science Fiction': '#6f42c1',
    'Fantasy': '#fd7e14',
    'History': '#e83e8c',
    'Mathematics': '#20c997',
    'Physics': '#ffc107',
    'Chemistry': '#28a745',
    'Biology': '#17a2b8',
    'Engineering': '#6f42c1',
    'Medicine': '#dc3545',
    'Psychology': '#fd7e14',
    'Economics': '#20c997',
    'Business': '#007bff',
    'Law': '#6c757d',
    'Education': '#28a745',
    'Philosophy': '#6f42c1',
    'Religion': '#fd7e14',
    'Politics': '#dc3545',
    'Sociology': '#17a2b8',
    'Geography': '#20c997',
    'Art & Design': '#e83e8c',
    'Music': '#ffc107',
    'Sports': '#28a745',
    'Travel': '#17a2b8',
    'Cooking': '#fd7e14',
    'Self-Help': '#20c997',
    'Children': '#ffc107',
    'Young Adult': '#e83e8c',
    'Reference': '#6c757d',
    'Other': '#6f42c1'
  };
  return colors[this.categoryName] || '#007bff';
};

// Method to get default icon
categorySchema.methods.getDefaultIcon = function() {
  const icons = {
    'Computer Science': '💻',
    'Programming': '⚡',
    'Web Development': '🌐',
    'Fiction': '📖',
    'Non-Fiction': '📚',
    'Science Fiction': '🚀',
    'Fantasy': '🐉',
    'History': '🏛️',
    'Mathematics': '🔢',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Engineering': '⚙️',
    'Medicine': '🏥',
    'Psychology': '🧠',
    'Economics': '💰',
    'Business': '💼',
    'Law': '⚖️',
    'Education': '🎓',
    'Philosophy': '🤔',
    'Religion': '⛪',
    'Politics': '🗳️',
    'Sociology': '👥',
    'Geography': '🌍',
    'Art & Design': '🎨',
    'Music': '🎵',
    'Sports': '⚽',
    'Travel': '✈️',
    'Cooking': '👨‍🍳',
    'Self-Help': '💪',
    'Children': '👶',
    'Young Adult': '👨‍🎓',
    'Reference': '📖',
    'Other': '📚'
  };
  return icons[this.categoryName] || '📚';
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
