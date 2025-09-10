"use client"

import { useState, useEffect } from "react"
import api from "../api/api.js"

const BookRequestManager = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingRequest, setProcessingRequest] = useState(null)
  const [adminComments, setAdminComments] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await api.get("/book-request/all")
      // Normalize to UI-friendly shape
      const items = (response.data?.data || []).map(r => ({
        requestId: r._id,
        user: r.userId ? { name: r.userId.name, email: r.userId.email } : null,
        book: r.bookId ? { bookTitle: r.bookId.bookTitle, bookAuthor: r.bookId.bookAuthor } : null,
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

      await api.put(`/book-request/${requestId}/status`, {
        status,
        adminComments: adminComments.trim() || null,
        adminId: user._id || user.id
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
    } catch (error) {
      console.error("Error updating request:", error)
      alert("Error updating request. Please try again.")
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center">
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
          <h2 className="mb-4">Book Request Management</h2>
          
          {requests.length === 0 ? (
            <div className="alert alert-info">
              No book requests found.
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
                              onClick={() => handleStatusUpdate(request.requestId, 'approved')}
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
                              onClick={() => handleStatusUpdate(request.requestId, 'rejected')}
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
      <div className="modal fade" id="adminCommentsModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Comments (Optional)</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add any comments for the user..."
                value={adminComments}
                onChange={(e) => setAdminComments(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" data-bs-dismiss="modal">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookRequestManager
