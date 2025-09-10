import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const ReturnBook = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({
    damageType: "none",
    damageFine: 0,
    damageDescription: ""
  });
  const [fineCalculation, setFineCalculation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveIssues();
  }, []);

  const fetchActiveIssues = async () => {
    try {
      setLoading(true);
      const response = await api.get("/issue/getAllIssues");
      const activeIssues = response.data.data.filter(issue => !issue.isReturned);
      setIssues(activeIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setError("Failed to load active issues");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (issue) => {
    setSelectedIssue(issue);
    setReturnData({
      damageType: "none",
      damageFine: 0,
      damageDescription: ""
    });
    setFineCalculation(null);
    setShowReturnModal(true);
  };

  const calculateFine = async () => {
    try {
      const response =
         await api.put(`/issue/updateIssue/${selectedIssue._id}`, {
        damageType: returnData.damageType,
        damageFine: returnData.damageFine,
        damageDescription: returnData.damageDescription
      });
      setFineCalculation(response.data.data.fineCalculation);
    } catch (error) {
      setError("Failed to calculate fine");
    }
  };

  const confirmReturn = async () => {
    try {
      await api.put(`/issue/updateIssue/${selectedIssue._id}`, {
        isReturned: true,
        damageType: returnData.damageType,
        damageFine: returnData.damageFine,
        damageDescription: returnData.damageDescription
      });
      
      setSuccess("Book returned successfully!");
      setShowReturnModal(false);
      setSelectedIssue(null);
      setReturnData({
        damageType: "none",
        damageFine: 0,
        damageDescription: ""
      });
      setFineCalculation(null);
      fetchActiveIssues();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to return book");
    }
  };

  const getDamageFineSuggestion = (damageType) => {
    const suggestions = {
      none: 0,
      minor: 50,
      moderate: 150,
      severe: 300,
      lost: 500
    };
    return suggestions[damageType] || 0;
  };

  const handleDamageTypeChange = (damageType) => {
    const suggestedFine = getDamageFineSuggestion(damageType);
    setReturnData({
      ...returnData,
      damageType,
      damageFine: suggestedFine
    });
  };

  const getStatusBadge = (issue) => {
    const today = new Date();
    const returnDate = new Date(issue.returnDate);
    const isOverdue = today > returnDate;
    
    if (isOverdue) {
      const overdueDays = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24));
      return (
        <span className="badge bg-danger">
          Overdue ({overdueDays} days)
        </span>
      );
    } else {
      const daysLeft = Math.ceil((returnDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 1) {
        return <span className="badge bg-warning">Due Soon</span>;
      } else {
        return <span className="badge bg-success">Active</span>;
      }
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading issues...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Return Books</h2>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left"></i> Back to Dashboard
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {issues.length === 0 ? (
            <div className="alert alert-info">
              <h4>No Active Issues</h4>
              <p>There are no books currently issued that need to be returned.</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Active Book Issues ({issues.length})</h5>
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Book</th>
                        <th>Issue Date</th>
                        <th>Return Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issues.map((issue) => (
                        <tr key={issue._id}>
                          <td>
                            <div>
                              <strong>{issue.userId?.name}</strong>
                              <br />
                              <small className="text-muted">{issue.userId?.email}</small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{issue.bookId?.bookTitle}</strong>
                              <br />
                              <small className="text-muted">ID: {issue.bookId?._id}</small>
                            </div>
                          </td>
                          <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                          <td>{new Date(issue.returnDate).toLocaleDateString()}</td>
                          <td>{getStatusBadge(issue)}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleReturnBook(issue)}
                            >
                              <i className="bi bi-arrow-return-left"></i> Return Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Return Book Modal */}
      {showReturnModal && selectedIssue && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Return Book</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowReturnModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Book Information</h6>
                    <div className="card">
                      <div className="card-body">
                        <p><strong>Book:</strong> {selectedIssue.bookId?.bookTitle}</p>
                        <p><strong>User:</strong> {selectedIssue.userId?.name}</p>
                        <p><strong>Issue Date:</strong> {new Date(selectedIssue.issueDate).toLocaleDateString()}</p>
                        <p><strong>Return Date:</strong> {new Date(selectedIssue.returnDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6>Damage Assessment</h6>
                    <div className="mb-3">
                      <label className="form-label">Damage Type</label>
                      <select
                        className="form-select"
                        value={returnData.damageType}
                        onChange={(e) => handleDamageTypeChange(e.target.value)}
                      >
                        <option value="none">No Damage</option>
                        <option value="minor">Minor Damage (₹50)</option>
                        <option value="moderate">Moderate Damage (₹150)</option>
                        <option value="severe">Severe Damage (₹300)</option>
                        <option value="lost">Lost Book (₹500)</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Damage Fine (₹)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={returnData.damageFine}
                        onChange={(e) => setReturnData({ ...returnData, damageFine: parseInt(e.target.value) || 0 })}
                        min="0"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Damage Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={returnData.damageDescription}
                        onChange={(e) => setReturnData({ ...returnData, damageDescription: e.target.value })}
                        placeholder="Describe any damage to the book..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {fineCalculation && (
                  <div className="mt-3">
                    <h6>Fine Calculation</h6>
                    <div className="alert alert-info">
                      <div className="row">
                        <div className="col-md-4">
                          <strong>Overdue Fine:</strong> ₹{fineCalculation.overdueFine}
                          {fineCalculation.overdueDays > 0 && (
                            <div><small>({fineCalculation.overdueDays} days)</small></div>
                          )}
                        </div>
                        <div className="col-md-4">
                          <strong>Damage Fine:</strong> ₹{fineCalculation.damageFine}
                        </div>
                        <div className="col-md-4">
                          <strong>Total Fine:</strong> ₹{fineCalculation.totalFine}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3">
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={calculateFine}
                    disabled={!returnData.damageType}
                  >
                    <i className="bi bi-calculator"></i> Calculate Fine
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={confirmReturn}
                    disabled={!fineCalculation}
                  >
                    <i className="bi bi-check"></i> Confirm Return
                  </button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showReturnModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default ReturnBook;
