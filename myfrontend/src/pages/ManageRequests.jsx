"use client"

import { useState, useEffect } from "react"
import api from "../api/api.js"
import { useNavigate } from "react-router-dom"

const ManageRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState(null)
  const [adminComments, setAdminComments] = useState("")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    
    if (!token || !userData) {
      navigate("/login")
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      navigate("/dashboard")
      return
    }

    fetchRequests()
  }, [navigate])

  const fetchRequests = async () => {
    try {
      const response = await api.get("/book-request/all")
      const items = (response.data?.data || []).map(r => ({
        requestId: r._id,
        user: r.userId ? { name: r.userId.name, email: r.userId.email, _id: r.userId._id } : null,
        book: r.bookId ? { bookTitle: r.bookId.bookTitle, bookAuthor: r.bookId.bookAuthor, _id: r.bookId._id } : null,
        requestDate: r.requestDate,
        status: r.status,
        adminComments: r.adminComments,
        adminResponseDate: r.adminResponseDate
      }))
      setRequests(items)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, status) => {
    setProcessingRequest(requestId)
    try {
      const userData = localStorage.getItem("user")
      const user = JSON.parse(userData)

      // Debug: Log user data to see what's available
      console.log('User data from localStorage:', user)
      console.log('User ID being sent:', user._id || user.id || user.userId)

      // Prefer Mongo _id, then fallbacks
      const adminId = user._id || user.id || user.userId
      
      if (!adminId) {
        throw new Error('User ID not found. Please log in again.')
      }

      await api.put(`/book-request/${requestId}/status`, {
        status,
        adminComments: adminComments.trim() || null,
        adminId: adminId
      })

      // Show success message
      const alertDiv = document.createElement("div")
      alertDiv.className = `alert alert-${status === 'approved' ? 'success' : 'warning'} alert-dismissible fade show position-fixed`
      alertDiv.style.top = "20px"
      alertDiv.style.right = "20px"
      alertDiv.style.zIndex = "9999"
      alertDiv.innerHTML = `
        Request ${status} successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `
      document.body.appendChild(alertDiv)
      setTimeout(() => alertDiv.remove(), 3000)

      // Refresh requests
      await fetchRequests()
      setAdminComments("")
      setSelectedRequest(null)
    } catch (error) {
      console.error("Error updating request:", error)
      
      // Show more specific error message
      let errorMessage = "Error updating request. Please try again."
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setProcessingRequest(null)
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

  const openCommentsModal = (request) => {
    setSelectedRequest(request)
    setAdminComments("")
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
            <h2>Book Request Management</h2>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
          
          {requests.length === 0 ? (
            <div className="alert alert-info">
              <h5>No Book Requests</h5>
              <p>There are no book requests to manage at the moment.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Request ID</th>
                    <th>User</th>
                    <th>Book</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.requestId}>
                      <td>#{request.requestId}</td>
                      <td>
                        <div>
                          <strong>{request.user?.name}</strong>
                          <br />
                          <small className="text-muted">{request.user?.email}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{request.book?.bookTitle}</strong>
                          <br />
                          <small className="text-muted">by {request.book?.bookAuthor}</small>
                        </div>
                      </td>
                      <td>{new Date(request.requestDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        {request.status === 'pending' ? (
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openCommentsModal(request)}
                              disabled={processingRequest === request.requestId}
                            >
                              {processingRequest === request.requestId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => openCommentsModal(request)}
                              disabled={processingRequest === request.requestId}
                            >
                              {processingRequest === request.requestId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </div>
                        ) : (
                          <div>
                            <small className="text-muted">
                              {request.adminComments && (
                                <div className="mt-1">
                                  <strong>Comments:</strong> {request.adminComments}
                                </div>
                              )}
                              {request.adminResponseDate && (
                                <div className="mt-1">
                                  <strong>Response Date:</strong> {new Date(request.adminResponseDate).toLocaleDateString()}
                                </div>
                              )}
                            </small>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Comments Modal */}
      {selectedRequest && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedRequest.status === 'pending' ? 'Process Request' : 'Add Comments'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedRequest(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Book:</strong> {selectedRequest.book?.bookTitle}
                </div>
                <div className="mb-3">
                  <strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})
                </div>
                <div className="mb-3">
                  <label htmlFor="adminComments" className="form-label">Comments (Optional)</label>
                  <textarea
                    id="adminComments"
                    className="form-control"
                    rows="3"
                    placeholder="Add any comments for the user..."
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success me-2"
                  onClick={() => handleStatusUpdate(selectedRequest.requestId, 'approved')}
                  disabled={processingRequest === selectedRequest.requestId}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleStatusUpdate(selectedRequest.requestId, 'rejected')}
                  disabled={processingRequest === selectedRequest.requestId}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {selectedRequest && (
        <div 
          className="modal-backdrop fade show" 
          onClick={() => setSelectedRequest(null)}
        ></div>
      )}
    </div>
  )
}

export default ManageRequests
