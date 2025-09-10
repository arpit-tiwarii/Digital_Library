import React, { useState } from 'react';
import api from '../api/api.js';

const BookDonation = () => {
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    bookTitle: '',
    bookAuthor: '',
    isbn: '',
    publisher: '',
    year: '',
    condition: '',
    quantity: 1,
    description: '',
    categoryName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/category/getCategories');
        if (res.data?.success) {
          setCategories(res.data.data || []);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Validate mobile number (Indian format)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.donorPhone)) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.donorEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate required fields
    if (!formData.donorName || !formData.bookTitle || !formData.bookAuthor || !formData.condition) {
      setError('Please fill in all required fields');
      return false;
    }
    // categoryName optional; no strict validation

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(`/book-donation/submit`, formData);

      if (response.data.success) {
        setSuccess(response.data.message);
        // Reset form
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          bookTitle: '',
          bookAuthor: '',
          isbn: '',
          publisher: '',
          year: '',
          condition: '',
          quantity: 1,
          description: '',
          categoryName: ''
        });
      } else {
        setError(response.data.message || 'Failed to submit donation request');
      }
    } catch (error) {
      console.error('Donation submission error:', error);
      setError(error.response?.data?.message || 'Failed to submit donation request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title text-primary">📚 Donate Books</h2>
                <p className="text-muted">
                  Share the joy of reading! Donate your books to our library and help others discover new worlds.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Donor Information */}
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="donorName" className="form-label">
                        Your Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="donorName"
                        name="donorName"
                        value={formData.donorName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="donorEmail" className="form-label">
                        Email Address <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="donorEmail"
                        name="donorEmail"
                        value={formData.donorEmail}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="donorPhone" className="form-label">
                    Mobile Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="donorPhone"
                    name="donorPhone"
                    value={formData.donorPhone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    required
                  />
                  <div className="form-text">Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9</div>
                </div>

                {/* Book Information */}
                <hr className="my-4" />
                <h5 className="mb-3">📖 Book Details</h5>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="bookTitle" className="form-label">
                        Book Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="bookTitle"
                        name="bookTitle"
                        value={formData.bookTitle}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="bookAuthor" className="form-label">
                        Author <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="bookAuthor"
                        name="bookAuthor"
                        value={formData.bookAuthor}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="categoryName" className="form-label">
                        Category (Optional)
                      </label>
                      <select
                        className="form-select"
                        id="categoryName"
                        name="categoryName"
                        value={formData.categoryName}
                        onChange={handleChange}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="isbn" className="form-label">
                        ISBN (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="isbn"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="publisher" className="form-label">
                        Publisher (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="publisher"
                        name="publisher"
                        value={formData.publisher}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="year" className="form-label">
                        Publication Year (Optional)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="condition" className="form-label">
                        Book Condition <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent - Like new</option>
                        <option value="good">Good - Minor wear</option>
                        <option value="fair">Fair - Some wear and tear</option>
                        <option value="poor">Poor - Significant damage</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="quantity" className="form-label">
                        Quantity
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="quantity"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max="10"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="description" className="form-label">
                    Additional Description (Optional)
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any additional information about the book, its condition, or why you're donating it..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting Donation...
                    </>
                  ) : (
                    'Submit Donation Request'
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted small">
                  <strong>Note:</strong> After submitting your donation request, our library staff will review it and contact you within 2-3 business days to arrange pickup or drop-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDonation;
