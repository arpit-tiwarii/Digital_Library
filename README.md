# InfoBeans Digital Library Management System

> **Empowering Communities Through Digital Access to Knowledge**

A comprehensive digital library management system built for **InfoBeans Foundation** - serving the community since 2000 with 24+ years of dedication to education and technology empowerment.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)

## 🌟 About InfoBeans Foundation

**InfoBeans Foundation** has been a beacon of community empowerment since 2000, focusing on:
- 🎓 **Education Access**: Free educational resources for all
- 💻 **Technology Empowerment**: Bridging the digital divide
- 🤝 **Community Development**: Supporting skill development and learning
- 📖 **Knowledge Sharing**: Creating pathways to information and growth

## ✨ Features

### 👥 **User Management**
- Secure authentication with JWT and Google OAuth
- Role-based access control (Admin/User)
- User profile management and tracking

### 📚 **Book Management**
- Complete CRUD operations for book inventory
- Category-based organization with visual indicators
- Advanced search and filtering capabilities
- Book availability tracking

### 🎁 **Community Features**
- **Book Donation System**: Community members can donate books
- **Book Request System**: Users can request specific books
- **Donation Tracking**: Complete history of contributions
- **Request Management**: Streamlined request fulfillment

### 🔧 **Administrative Tools**
- Comprehensive admin dashboard
- User management and moderation
- Inventory management and reporting
- Email notification system

## 🛠️ Tech Stack

### **Frontend**
- **React 18+** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Bootstrap 5** - Responsive UI components
- **Axios** - HTTP client for API calls
- **Google OAuth** - Secure authentication

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Secure token-based authentication
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Nodemailer** - Email notifications

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- MongoDB Atlas account
- Google OAuth credentials

### **1. Clone Repository**
```bash
git clone https://github.com/yourusername/infobeans-digital-library.git
cd infobeans-digital-library
```

### **2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file with MongoDB URI, JWT secrets, etc.
npm start
```

### **3. Frontend Setup**
```bash
cd ../myfrontend
npm install
cp .env.example .env
# Configure your .env file with API base URL and Google Client ID
npm run dev
```

### **4. Access Application**
- **Frontend**: https://digital-library-frontend-l280.onrender.com
- **Backend API**: http://localhost:5000

## 📝 Environment Configuration

### **Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/library_mangement
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://digital-library-frontend-l280.onrender.com
```

### **Frontend (.env)**
```env
VITE_API_BASE=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🌐 API Documentation

### **Authentication Endpoints**
```
POST   /auth/register          # Register new user
POST   /auth/login             # User login
GET    /auth/google            # Google OAuth login
GET    /auth/logout            # User logout
GET    /auth/profile           # Get user profile
```

### **Book Management**
```
GET    /books/getBooks         # Fetch all books
POST   /books/addBook          # Add new book (Admin)
PUT    /books/updateBook/:id   # Update book (Admin)
DELETE /books/deleteBook/:id   # Delete book (Admin)
GET    /books/search           # Search books
```

### **Community Features**
```
POST   /donations/addDonation  # Submit book donation
GET    /donations/getDonations # Get user's donations
POST   /requests/addRequest    # Submit book request
GET    /requests/getRequests   # Get user's requests
```

## 🚀 Deployment

### **Free Deployment Options**
1. **Backend**: [Render](https://render.com) (Free tier)
2. **Frontend**: [Netlify](https://netlify.com) (Free tier)
3. **Database**: MongoDB Atlas (Free tier)

See `SIMPLE_DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 🤝 Contributing

We welcome contributions to help serve the InfoBeans Foundation community better!

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/CommunityFeature`)
3. **Commit** your changes (`git commit -m 'Add community enhancement'`)
4. **Push** to the branch (`git push origin feature/CommunityFeature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **InfoBeans Foundation** for their 24+ years of community service
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help make this project better

## 📞 Support & Contact

For questions, support, or collaboration opportunities:

- 📧 **Email**: foundation@infobeans.com
- 🌐 **Website**: [InfoBeans Foundation](https://infobeansuniversity.com)
- 📱 **GitHub Issues**: [Report Issues](https://github.com/yourusername/infobeans-digital-library/issues)

---

**Made with ❤️ for the InfoBeans Foundation Community**

*Bridging communities to knowledge since 2000*
