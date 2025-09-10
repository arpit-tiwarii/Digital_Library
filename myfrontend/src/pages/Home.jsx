import { Link } from "react-router-dom"
import { useState, useEffect } from 'react'
import axios from 'axios'

const Home = () => {
  const user = localStorage.getItem("user")
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalDonations: 0,
    totalRequests: 0,
    loading: true
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [booksRes, usersRes, donationsRes, requestsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/books`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/book-donations`).catch(() => ({ data: [] })),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/book-requests`).catch(() => ({ data: [] }))
      ])

      setStats({
        totalBooks: booksRes.data?.length || 0,
        totalUsers: usersRes.data?.length || 0,
        totalDonations: donationsRes.data?.length || 0,
        totalRequests: requestsRes.data?.length || 0,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center py-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-dark">
                InfoBeans Digital Library
              </h1>
              <p className="lead mb-4 text-muted">
                Your gateway to knowledge and learning. Access thousands of books, research materials, 
                and educational resources curated specifically for the InfoBeans Foundation community.
              </p>
              <p className="mb-4">
                Whether you're a student, professional, or lifelong learner, our digital library provides 
                free access to quality educational content across technology, business, literature, and academic subjects. 
                Join our community of learners and contribute to knowledge sharing through book donations and discussions.
              </p>
              <div className="d-flex flex-wrap gap-3 mb-4">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    <i className="bi bi-speedometer2 me-2"></i>Go to Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Get Started
                  </Link>
                )}
                <Link to="/books" className="btn btn-outline-primary btn-lg">
                  <i className="bi bi-collection me-2"></i>Browse Books
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="text-center">
                <div className="bg-white rounded-4 shadow-sm p-5 border">
                  <i className="bi bi-book-half display-1 text-primary mb-3"></i>
                  <h4 className="mb-3">Digital Knowledge Hub</h4>
                  <p className="text-muted mb-4">
                    Explore our comprehensive collection of {stats.loading ? 'thousands of' : stats.totalBooks.toLocaleString()} books, 
                    contribute through donations, and connect with {stats.loading ? 'many' : stats.totalUsers.toLocaleString()} fellow learners 
                    in our growing community.
                  </p>
                  <div className="row g-3 text-center">
                    <div className="col-6">
                      <div className="fw-bold text-primary fs-5">
                        {stats.loading ? '...' : stats.totalBooks.toLocaleString()}
                      </div>
                      <small className="text-muted">Books</small>
                    </div>
                    <div className="col-6">
                      <div className="fw-bold text-primary fs-5">
                        {stats.loading ? '...' : stats.totalUsers.toLocaleString()}
                      </div>
                      <small className="text-muted">Members</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">Library Features</h2>
            <p className="lead text-muted">Everything you need for your learning journey</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="text-center p-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-collection fs-2 text-primary"></i>
                </div>
                <h5 className="fw-bold mb-3">Comprehensive Collection</h5>
                <p className="text-muted">
                  Access {stats.loading ? 'thousands of' : stats.totalBooks.toLocaleString()} carefully selected books across multiple disciplines. 
                  From technical manuals to literary classics, find resources that match your learning goals and interests.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="text-center p-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-search fs-2 text-primary"></i>
                </div>
                <h5 className="fw-bold mb-3">Advanced Search</h5>
                <p className="text-muted">
                  Find exactly what you need with powerful search filters by author, category, publication year, and keywords. 
                  Our intelligent system helps you discover relevant content quickly and efficiently.
                </p>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="text-center p-4">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-people fs-2 text-primary"></i>
                </div>
                <h5 className="fw-bold mb-3">Community Learning</h5>
                <p className="text-muted">
                  Join {stats.loading ? 'many' : stats.totalUsers.toLocaleString()} active members in our learning community. 
                  Share knowledge, contribute through {stats.loading ? 'book' : stats.totalDonations.toLocaleString()} donations, 
                  and participate in educational discussions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-6 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">Simple steps to start your learning journey</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">1</span>
                </div>
                <h6 className="fw-bold mb-2">Create Account</h6>
                <p className="text-muted small">
                  Sign up for free with your email address. No hidden fees or subscription charges.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">2</span>
                </div>
                <h6 className="fw-bold mb-2">Browse & Search</h6>
                <p className="text-muted small">
                  Explore our collection using categories, search filters, or browse recommendations.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">3</span>
                </div>
                <h6 className="fw-bold mb-2">Request Books</h6>
                <p className="text-muted small">
                  Submit requests for books you want to read. Track your requests through your dashboard.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <span className="fw-bold">4</span>
                </div>
                <h6 className="fw-bold mb-2">Learn & Share</h6>
                <p className="text-muted small">
                  Access your books, learn at your pace, and contribute back to the community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-6 fw-bold mb-4">Start Your Learning Journey Today</h2>
              <p className="lead mb-5 opacity-90">
                Join {stats.loading ? 'thousands of' : stats.totalUsers.toLocaleString()} learners who trust InfoBeans Foundation 
                for quality educational resources. Access our growing library of {stats.loading ? 'books' : stats.totalBooks.toLocaleString() + ' books'} 
                and become part of our knowledge-sharing community.
              </p>
              
              {!user ? (
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/register" className="btn btn-light btn-lg px-4 py-3">
                    <i className="bi bi-person-plus me-2"></i>Join Free Today
                  </Link>
                  <Link to="/login" className="btn btn-outline-light btn-lg px-4 py-3">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/books" className="btn btn-light btn-lg px-4 py-3">
                    <i className="bi bi-search me-2"></i>Explore Library
                  </Link>
                  <Link to="/dashboard" className="btn btn-outline-light btn-lg px-4 py-3">
                    <i className="bi bi-speedometer2 me-2"></i>My Dashboard
                  </Link>
                </div>
              )}
              
              <div className="mt-4">
                <small className="opacity-75">
                  <i className="bi bi-shield-check me-2"></i>
                  100% Free • No Hidden Fees • Trusted by {stats.loading ? 'thousands' : stats.totalUsers.toLocaleString()}+ Members
                </small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
