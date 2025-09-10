import React, { useState, useEffect } from 'react';
import api from '../api/api.js';

const DonationManager = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/book-donation/all`);

      if (response.data.success) {
        setDonations(response.data.donations);
      } else {
        setError('Failed to fetch donations');
      }
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (donationId, newStatus, adminComments = '') => {
    try {
      setUpdateLoading(true);
      const response = await api.put(
        `/book-donation/${donationId}/status`,
        { status: newStatus, adminComments }
      );

      if (response.data.success) {
        // Update the donation in the list
        setDonations(prev => prev.map(donation => 
          donation._id === donationId 
            ? { ...donation, status: newStatus, adminComments }
            : donation
        ));
        setShowModal(false);
        setSelectedDonation(null);
      } else {
        setError('Failed to update donation status');
      }
    } catch (error) {
      console.error('Error updating donation status:', error);
      setError('Failed to update donation status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge bg-warning';
      case 'approved': return 'badge bg-success';
      case 'rejected': return 'badge bg-danger';
      case 'collected': return 'badge bg-info';
      default: return 'badge bg-secondary';
    }
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition) {
      case 'excellent': return 'badge bg-success';
      case 'good': return 'badge bg-primary';
      case 'fair': return 'badge bg-warning';
      case 'poor': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = selectedStatus === 'all' || donation.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      donation.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.bookAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.donorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">📚 Book Donation Management</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {/* Filters */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label">Filter by Status:</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Donations</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="collected">Collected</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Search:</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by book title, author, donor name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Donations Table */}
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Donor</th>
                      <th>Book Details</th>
                      <th>Condition</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted">
                          No donations found
                        </td>
                      </tr>
                    ) : (
                      filteredDonations.map((donation) => (
                        <tr key={donation._id}>
                          <td>#{donation._id}</td>
                          <td>
                            <div>
                              <strong>{donation.donorName}</strong><br />
                              <small className="text-muted">
                                {donation.donorEmail}<br />
                                {donation.donorPhone}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{donation.bookTitle}</strong><br />
                              <small className="text-muted">by {donation.bookAuthor}</small>
                              {donation.isbn && (
                                <>
                                  <br />
                                  <small className="text-muted">ISBN: {donation.isbn}</small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={getConditionBadgeClass(donation.condition)}>
                              {donation.condition.charAt(0).toUpperCase() + donation.condition.slice(1)}
                            </span>
                          </td>
                          <td>{donation.quantity}</td>
                          <td>
                            <span className={getStatusBadgeClass(donation.status)}>
                              {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                setSelectedDonation(donation);
                                setShowModal(true);
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for managing donation */}
      {showModal && selectedDonation && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Donation #{selectedDonation._id}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDonation(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Donor Information</h6>
                    <p><strong>Name:</strong> {selectedDonation.donorName}</p>
                    <p><strong>Email:</strong> {selectedDonation.donorEmail}</p>
                    <p><strong>Phone:</strong> {selectedDonation.donorPhone}</p>
                  </div>
                  <div className="col-md-6">
                    <h6>Book Information</h6>
                    <p><strong>Title:</strong> {selectedDonation.bookTitle}</p>
                    <p><strong>Author:</strong> {selectedDonation.bookAuthor}</p>
                    <p><strong>Condition:</strong> 
                      <span className={`ms-2 ${getConditionBadgeClass(selectedDonation.condition)}`}>
                        {selectedDonation.condition}
                      </span>
                    </p>
                    <p><strong>Quantity:</strong> {selectedDonation.quantity}</p>
                  </div>
                </div>
                
                {selectedDonation.description && (
                  <div className="mt-3">
                    <h6>Description</h6>
                    <p className="text-muted">{selectedDonation.description}</p>
                  </div>
                )}

                <div className="mt-3">
                  <h6>Update Status</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <select
                        className="form-select"
                        value={selectedDonation.status}
                        onChange={(e) => setSelectedDonation({
                          ...selectedDonation,
                          status: e.target.value
                        })}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="collected">Collected</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(
                          selectedDonation._id,
                          selectedDonation.status,
                          selectedDonation.adminComments
                        )}
                        disabled={updateLoading}
                      >
                        {updateLoading ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default DonationManager;
