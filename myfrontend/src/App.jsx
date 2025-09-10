import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Books from "./pages/Books.jsx"
import AddBook from "./pages/AddBook.jsx"
import IssueBook from "./pages/IssueBook.jsx"
import ReturnBook from "./pages/ReturnBook.jsx"
import FineManagement from "./pages/FineManagement.jsx"
import Users from "./pages/Users.jsx"
import UserProfile from "./pages/userProfile.jsx"
import MyRequests from "./pages/MyRequests.jsx"
import ManageRequests from "./pages/ManageRequests.jsx"
import BookDonation from "./components/BookDonation.jsx"
import DonationManager from "./components/DonationManager.jsx"
import AuthSuccess from "./pages/AuthSuccess.jsx"
import AuthFailure from "./pages/AuthFailure.jsx"
import CategoryManager from "./components/CategoryManager.jsx"
import AdminCreation from "./components/AdminCreation.jsx"
import About from "./pages/About.jsx"
import Contact from "./pages/Contact.jsx"

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar/>
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/books" element={<Books />} />
          
          {/* Google OAuth Routes */}
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/auth-failure" element={<AuthFailure />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userProfile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userProfile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-book"
            element={
              <ProtectedRoute adminOnly>
                <AddBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue-book"
            element={
              <ProtectedRoute adminOnly>
                <IssueBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/return-book"
            element={
              <ProtectedRoute adminOnly>
                <ReturnBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fine-management"
            element={
              <ProtectedRoute adminOnly>
                <FineManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute adminOnly>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-requests"
            element={
              <ProtectedRoute adminOnly>
                <ManageRequests />
              </ProtectedRoute>
            }
          />
          <Route path="/donate-book" element={<BookDonation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/manage-donations"
            element={
              <ProtectedRoute adminOnly>
                <DonationManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-categories"
            element={
              <ProtectedRoute adminOnly>
                <CategoryManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminCreation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
