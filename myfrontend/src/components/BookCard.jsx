"use client"

import { useState, useEffect } from "react"
import api from "../api/api.js"
import adminAuth from "../api/adminAuth.js"
const BookCard = ({ book, onIssue, showIssueButton, showEditButton }) => {
  const [loading, setLoading] = useState(false)
  const [issued, setIssued] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({
    bookTitle: book.bookTitle || '',
    bookAuthor: book.bookAuthor || '',
    isbn: book.isbn || '',
    publisher: book.publisher || '',
    year: book.year || '',
    totalCopies: book.totalCopies || 0,
    description: book.description || ''
  })

  // Get the correct book ID
  const getBookId = () => {
    return book.id || book._id || book.bookId
  }

  // Correct useEffect
  useEffect(() => {
    if (book) {
      console.log("Book Details:", book)
      console.log("Book ID:", getBookId())
    }
  }, [book]) // Runs whenever book changes

  const handleRequestBook = async () => {
    const userData = localStorage.getItem("user")
    if (!userData) return

    const user = JSON.parse(userData)
    setLoading(true)

    try {
      await api.post("/book-request/create", {
        userId: user._id || user.id,
        bookId: book._id || book.bookId || book.id,
      })

      setIssued(true)
      if (onIssue) onIssue(book._id || book.id || book.bookId)

      // Show success message dynamically
      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-success alert-dismissible fade show position-fixed"
      alertDiv.style.top = "20px"
      alertDiv.style.right = "20px"
      alertDiv.style.zIndex = "9999"
      alertDiv.innerHTML = `
        Book request submitted successfully! Waiting for admin approval.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `
      document.body.appendChild(alertDiv)
      setTimeout(() => alertDiv.remove(), 5000)
    } catch (error) {
      console.error("Error requesting book:", error)
      const errorMessage = error.response?.data?.message || "Error requesting book. Please try again."
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleEditBook = async () => {
    const bookId = getBookId()
    if (!bookId) {
      alert('Book ID not found. Cannot update book.')
      return
    }

    setLoading(true)
    try {
      console.log('=== Starting book update ===')
      console.log('Book ID:', bookId)
      console.log('Edit form data:', JSON.stringify(editForm, null, 2))
      
      // Log the full API request details
      const token = localStorage.getItem('token')
      console.log('Auth token exists:', !!token)
      console.log('API Base URL:', api.defaults.baseURL)
      
      // Make the API request with the correct endpoint
      console.log('Sending PUT request to:', `/books/update/${bookId}`)
      const response = await api.put(`/books/update/${bookId}`, editForm, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.data) {
        // Show success message
        const alertDiv = document.createElement("div")
        alertDiv.className = "alert alert-success alert-dismissible fade show position-fixed"
        alertDiv.style.top = "20px"
        alertDiv.style.right = "20px"
        alertDiv.style.zIndex = "9999"
        alertDiv.innerHTML = `
          Book updated successfully!
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `
        document.body.appendChild(alertDiv)
        setTimeout(() => alertDiv.remove(), 3000)
        
        setShowEditModal(false)
        // Call onIssue to update parent component if needed
        if (onIssue) onIssue(bookId)
        
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      console.error("Error updating book:", error);
      console.log("Error response:", error.response?.data);
      console.log("Error status:", error.response?.status);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Error updating book. Please try again.";
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBook = async () => {
    const bookId = getBookId()
    if (!bookId) {
      alert('Book ID not found. Cannot delete book.')
      return
    }

    if (!window.confirm(`Are you sure you want to delete "${book.bookTitle}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      console.log('Deleting book with ID:', bookId)
      await api.delete(`/books/deleteBook/${bookId}`)
      
      // Show success message
      const alertDiv = document.createElement("div")
      alertDiv.className = "alert alert-warning alert-dismissible fade show position-fixed"
      alertDiv.style.top = "20px"
      alertDiv.style.right = "20px"
      alertDiv.style.zIndex = "9999"
      alertDiv.innerHTML = `
        Book "${book.bookTitle}" deleted successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `
      document.body.appendChild(alertDiv)
      setTimeout(() => alertDiv.remove(), 3000)
      
      // Refresh page to remove deleted book
      window.location.reload()
    } catch (error) {
      console.error("Error deleting book:", error)
      alert(error.response?.data?.message || "Error deleting book. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm hover-lift">
        {showEditButton && (
          <div className="position-absolute" style={{ 
            top: '10px', 
            right: '10px', 
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button 
              className="btn btn-warning btn-sm shadow-lg"
              onClick={() => setShowEditModal(true)}
              title="Edit Book"
              disabled={loading}
              style={{ 
                minWidth: '70px',
                fontWeight: '600',
                borderRadius: '20px',
                border: '2px solid #fff',
                fontSize: '12px'
              }}
            >
              <i className="fas fa-edit me-1"></i>
              Edit
            </button>
            <button 
              className="btn btn-danger btn-sm shadow-lg"
              onClick={handleDeleteBook}
              title="Delete Book"
              disabled={loading}
              style={{ 
                minWidth: '70px',
                fontWeight: '600',
                borderRadius: '20px',
                border: '2px solid #fff',
                fontSize: '12px'
              }}
            >
              <i className="fas fa-trash me-1"></i>
              Delete
            </button>
          </div>
        )}
        <img
          src={`${import.meta.env.VITE_API_BASE || 'https://digital-library-backend-clf5.onrender.com'}/images/upload/${book.coverImage}`}
          className="card-img-top"
          alt={`Cover of ${book.bookTitle || book.title}`}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = `${import.meta.env.VITE_API_BASE || 'https://digital-library-backend-clf5.onrender.com'}/images/upload/defaultBook.jpg`;
          }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{book.bookTitle || book.title}</h5>
          <p className="card-text text-muted">by {book.bookAuthor || book.author}</p>
          <p className="card-text">
            <small className="text-muted">Category: {book.categoryName || book.category}</small>
          </p>
          <p className="card-text">
            <small className="text-success">Available: {book.availableCopies} copies</small>
          </p>
          {book.description && <p className="card-text flex-grow-1">{book.description}</p>}

          {showIssueButton && book.availableCopies > 0 && !issued && (
            <button className="btn btn-primary mt-auto" onClick={handleRequestBook} disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Requesting...
                </>
              ) : (
                "Request Book"
              )}
            </button>
          )}

          {(book.availableCopies === 0 || issued) && (
            <button className="btn btn-secondary mt-auto" disabled>
              {issued ? "Requested" : "Not Available"}
            </button>
          )}
        </div>
      </div>

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Book: {book.bookTitle}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Book Title</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bookTitle"
                        value={editForm.bookTitle}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Author</label>
                      <input
                        type="text"
                        className="form-control"
                        name="bookAuthor"
                        value={editForm.bookAuthor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">ISBN</label>
                      <input
                        type="text"
                        className="form-control"
                        name="isbn"
                        value={editForm.isbn}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Publisher</label>
                      <input
                        type="text"
                        className="form-control"
                        name="publisher"
                        value={editForm.publisher}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Year</label>
                      <input
                        type="number"
                        className="form-control"
                        name="year"
                        value={editForm.year}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Total Copies</label>
                      <input
                        type="number"
                        className="form-control"
                        name="totalCopies"
                        value={editForm.totalCopies}
                        onChange={handleInputChange}
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Available Copies</label>
                      <input
                        type="number"
                        className="form-control"
                        value={book.availableCopies}
                        disabled
                        title="Available copies are calculated automatically"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={editForm.description}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleEditBook}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookCard
