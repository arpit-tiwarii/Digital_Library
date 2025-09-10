"use client"

import { useState, useEffect } from "react"
import api from "../api/api.js"
import { useNavigate } from "react-router-dom"

const MyRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      navigate("/login")
      return
    }

    fetchUserRequests()
  }, [navigate])

  const fetchUserRequests = async () => {
    try {
      const userData = localStorage.getItem("user")
      
      if (!userData) {
        console.error("No user data found")
        setLoading(false)
        return
      }

      const user = JSON.parse(userData)
      const userId = user._id || user.id
      const response = await api.get(`/book-request/user/${userId}`)
      const items = (response.data?.data || []).map(r => ({
        requestId: r._id,
        book: r.bookId ? { bookTitle: r.bookId.bookTitle, bookAuthor: r.bookId.bookAuthor, coverImage: r.bookId.coverImage } : null,
        requestDate: r.requestDate,
        status: r.status,
        adminComments: r.adminComments,
        adminResponseDate: r.adminResponseDate,
        issueDate: r.issueDate,
        actualReturnDate: r.actualReturnDate,
      }))
      setRequests(items)
    } catch (error) {
      console.error("Error fetching user requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: "badge bg-warning text-dark",
      approved: "badge bg-success",
      rejected: "badge bg-danger"
    }
    return <span className={badges[status]}>{status.toUpperCase()}</span>
  }

  const getStatusMessage = (status) => {
    const messages = {
      pending: "Your request is being reviewed by the admin.",
      approved: "Your request has been approved! You can collect the book from the library.",
      rejected: "Your request was not approved. Please check admin comments for details."
    }
    return messages[status] || ""
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Book Requests</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate("/books")}
            >
              Browse Books
            </button>
          </div>
          
          {requests.length === 0 ? (
            <div className="alert alert-info">
              <h5>No Book Requests Yet</h5>
              <p>You haven't made any book requests yet. Start by browsing our collection!</p>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate("/books")}
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div className="row">
              {requests.map((request) => (
                <div key={request.requestId} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm">
                    <img
                      src={`${import.meta.env.VITE_API_BASE || 'https://digital-library-backend-clf5.onrender.com'}/images/upload/${request.book?.coverImage || 'defaultBook.jpg'}`}
                      className="card-img-top"
                      alt={`Cover of ${request.book?.bookTitle || 'Book'}`}
                      style={{ height: "200px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = `${import.meta.env.VITE_API_BASE || 'https://digital-library-backend-clf5.onrender.com'}/images/upload/defaultBook.jpg`;
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{request.book?.bookTitle}</h5>
                      <p className="card-text text-muted">by {request.book?.bookAuthor}</p>
                       
                      <div className="mb-3">
                        <strong>Status:</strong> {getStatusBadge(request.status)}
                      </div>
                       
                      <div className="mb-3">
                        <small className="text-muted">
                          <strong>Request Date:</strong> {new Date(request.requestDate).toLocaleDateString()}
                        </small>
                      </div>
                       
                      {request.adminResponseDate && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Response Date:</strong> {new Date(request.adminResponseDate).toLocaleDateString()}
                          </small>
                        </div>
                      )}
                       
                      {request.adminComments && (
                        <div className="mb-3">
                          <small className="text-muted">
                            <strong>Admin Comments:</strong>
                            <br />
                            {request.adminComments}
                          </small>
                        </div>
                      )}
                       
                      {request.status === 'approved' && request.issueDate && (
                        <div className="mb-3">
                          <small className="text-success">
                            <strong>Issue Date:</strong> {new Date(request.issueDate).toLocaleDateString()}
                            <br />
                            <strong>Return Date:</strong> {new Date(request.actualReturnDate).toLocaleDateString()}
                          </small>
                        </div>
                      )}
                       
                      <div className="mt-auto">
                        <div className={`alert alert-${request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'danger'} mb-0`}>
                          <small>{getStatusMessage(request.status)}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyRequests
