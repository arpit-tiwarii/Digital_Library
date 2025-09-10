import { useState, useEffect } from "react";
import api from "../api/api.js";

const FineManagement = () => {
  const [fines, setFines] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    fineType: "",
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [selectedFine, setSelectedFine] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: "cash",
    notes: ""
  });

  useEffect(() => {
    fetchFines();
    fetchStatistics();
  }, [filters]);

  const fetchFines = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.fineType) params.append("fineType", filters.fineType);
      if (filters.page) params.append("page", filters.page);

      const response = await api.get(`/fines/all?${params}`);
      setFines(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching fines:", error);
      setError("Failed to load fines");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/fines/statistics");
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await api.put(`/fines/pay/${selectedFine._id}`, paymentData);
      setSuccess("Fine marked as paid successfully!");
      setShowPaymentModal(false);
      setSelectedFine(null);
      setPaymentData({ paymentMethod: "cash", notes: "" });
      fetchFines();
      fetchStatistics();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to mark fine as paid");
    }
  };

  const handleWaiveFine = async () => {
    try {
      await api.put(`/fines/waive/${selectedFine._id}`, { notes: paymentData.notes });
      setSuccess("Fine waived successfully!");
      setShowWaiveModal(false);
      setSelectedFine(null);
      setPaymentData({ paymentMethod: "cash", notes: "" });
      fetchFines();
      fetchStatistics();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to waive fine");
    }
  };

  const handleManualCalculation = async () => {
    try {
      const response = await api.post("/fines/calculate-overdue");
      setSuccess(`Fine calculation completed: ${response.data.data.updatedCount} issues updated, ${response.data.data.emailSentCount} emails sent`);
      fetchFines();
      fetchStatistics();
    } catch (error) {
      setError("Failed to calculate overdue fines");
    }
  };

  const handleSendReminders = async () => {
    try {
      const response = await api.post("/fines/send-reminders");
      setSuccess(`Due soon reminders sent: ${response.data.data.emailsSent} emails`);
    } catch (error) {
      setError("Failed to send reminders");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-warning",
      paid: "bg-success",
      waived: "bg-info"
    };
    return `badge ${badges[status] || "bg-secondary"}`;
  };

  const getFineTypeBadge = (type) => {
    const badges = {
      overdue: "bg-danger",
      damage: "bg-warning",
      both: "bg-danger",
      waived: "bg-info"
    };
    return `badge ${badges[type] || "bg-secondary"}`;
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading fines...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Fine Management</h2>
            <div className="btn-group">
              <button className="btn btn-outline-primary" onClick={handleManualCalculation}>
                <i className="bi bi-calculator"></i> Calculate Fines
              </button>
              <button className="btn btn-outline-info" onClick={handleSendReminders}>
                <i className="bi bi-envelope"></i> Send Reminders
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Statistics Cards */}
          {statistics && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-warning text-white">
                  <div className="card-body text-center">
                    <h4>₹{statistics.pending.amount}</h4>
                    <p className="mb-0">Pending Fines ({statistics.pending.count})</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h4>₹{statistics.monthly.amount}</h4>
                    <p className="mb-0">This Month ({statistics.monthly.count})</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h4>₹{statistics.yearly.amount}</h4>
                    <p className="mb-0">This Year ({statistics.yearly.count})</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-danger text-white">
                  <div className="card-body text-center">
                    <h4>{statistics.overdueBooks}</h4>
                    <p className="mb-0">Overdue Books</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fine Type</label>
                  <select
                    className="form-select"
                    value={filters.fineType}
                    onChange={(e) => setFilters({ ...filters, fineType: e.target.value, page: 1 })}
                  >
                    <option value="">All Types</option>
                    <option value="overdue">Overdue</option>
                    <option value="damage">Damage</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setFilters({ status: "", fineType: "", page: 1 })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Fines Table */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Fine Records</h5>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine._id}>
                        <td>
                          <div>
                            <strong>{fine.userId?.name}</strong>
                            <br />
                            <small className="text-muted">{fine.userId?.email}</small>
                          </div>
                        </td>
                        <td>{fine.issueId?.bookId?.bookTitle || "Unknown Book"}</td>
                        <td>
                          <span className={getFineTypeBadge(fine.fineType)}>
                            {fine.fineType}
                          </span>
                        </td>
                        <td>
                          <strong>₹{fine.amount}</strong>
                          {fine.overdueAmount > 0 && (
                            <div>
                              <small className="text-muted">
                                Overdue: ₹{fine.overdueAmount} ({fine.overdueDays} days)
                              </small>
                            </div>
                          )}
                          {fine.damageAmount > 0 && (
                            <div>
                              <small className="text-muted">
                                Damage: ₹{fine.damageAmount}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadge(fine.status)}>
                            {fine.status}
                          </span>
                        </td>
                        <td>{new Date(fine.createdAt).toLocaleDateString()}</td>
                        <td>
                          {fine.status === "pending" && (
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-success"
                                onClick={() => {
                                  setSelectedFine(fine);
                                  setShowPaymentModal(true);
                                }}
                              >
                                <i className="bi bi-check"></i> Pay
                              </button>
                              <button
                                className="btn btn-info"
                                onClick={() => {
                                  setSelectedFine(fine);
                                  setShowWaiveModal(true);
                                }}
                              >
                                <i className="bi bi-x"></i> Waive
                              </button>
                            </div>
                          )}
                          {fine.status === "paid" && (
                            <div>
                              <small className="text-success">
                                Paid on {new Date(fine.paidAt).toLocaleDateString()}
                              </small>
                              <br />
                              <small className="text-muted">
                                by {fine.collectedBy?.name || "Admin"}
                              </small>
                            </div>
                          )}
                          {fine.status === "waived" && (
                            <div>
                              <small className="text-info">
                                Waived on {new Date(fine.paidAt).toLocaleDateString()}
                              </small>
                              <br />
                              <small className="text-muted">
                                by {fine.collectedBy?.name || "Admin"}
                              </small>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${!pagination.hasPrev ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={!pagination.hasPrev}
                      >
                        Previous
                      </button>
                    </li>
                    <li className="page-item">
                      <span className="page-link">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                    </li>
                    <li className={`page-item ${!pagination.hasNext ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={!pagination.hasNext}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFine && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mark Fine as Paid</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    placeholder="Add any notes about the payment..."
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <strong>Fine Amount:</strong> ₹{selectedFine.amount}
                  <br />
                  <strong>User:</strong> {selectedFine.userId?.name}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-success" onClick={handleMarkAsPaid}>
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {showWaiveModal && selectedFine && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Waive Fine</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowWaiveModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reason for Waiving (Required)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    placeholder="Please provide a reason for waiving this fine..."
                    required
                  ></textarea>
                </div>
                <div className="alert alert-warning">
                  <strong>Fine Amount:</strong> ₹{selectedFine.amount}
                  <br />
                  <strong>User:</strong> {selectedFine.userId?.name}
                  <br />
                  <strong>Warning:</strong> This action cannot be undone.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowWaiveModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleWaiveFine}
                  disabled={!paymentData.notes.trim()}
                >
                  Waive Fine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {(showPaymentModal || showWaiveModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default FineManagement;
