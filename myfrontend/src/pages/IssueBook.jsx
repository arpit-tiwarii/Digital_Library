"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api.js";

const IssueBook = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await api.get("/issue/getAllIssues");
      if (response.data.success && Array.isArray(response.data.data)) {
        setIssues(response.data.data);
      } else {
        setError("Invalid response from server.");
      }
    } catch (error) {
      setError("Failed to load issues. Please try again.");
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (issue) => {
    if (issue.isReturned) {
      return <span className="badge bg-success">Returned</span>;
    }
    
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
        return <span className="badge bg-primary">Active</span>;
      }
    }
  };

  const getFineAmount = (issue) => {
    if (issue.isReturned) {
      return issue.fineAmount || 0;
    }
    
    const today = new Date();
    const returnDate = new Date(issue.returnDate);
    const isOverdue = today > returnDate;
    
    if (isOverdue) {
      const overdueDays = Math.ceil((today - returnDate) / (1000 * 60 * 60 * 24));
      return overdueDays * 5; // ₹5 per day
    }
    
    return 0;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Issue Management</h1>
        <div className="btn-group">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/return-book")}
          >
            <i className="bi bi-arrow-return-left"></i> Return Books
          </button>
          <button
            className="btn btn-outline-success"
            onClick={() => navigate("/fine-management")}
          >
            <i className="bi bi-cash-coin"></i> Fine Management
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {issues.length === 0 ? (
        <div className="alert alert-info">
          <h4>No Issues Found</h4>
          <p>There are no book issues in the system.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">All Book Issues ({issues.length})</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Issue ID</th>
                    <th>User</th>
                    <th>Book</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Fine Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr key={issue._id}>
                      <td>#{issue._id.slice(-6)}</td>
                      <td>
                        <div>
                          <strong>{issue.userId?.name || "N/A"}</strong>
                          <br />
                          <small className="text-muted">{issue.userId?.email || "N/A"}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{issue.bookId?.bookTitle || "N/A"}</strong>
                          <br />
                          <small className="text-muted">ID: {issue.bookId?._id?.slice(-6) || "N/A"}</small>
                        </div>
                      </td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(issue.returnDate).toLocaleDateString()}</td>
                      <td>{getStatusBadge(issue)}</td>
                      <td>
                        {issue.isReturned ? (
                          <div>
                            <strong>₹{issue.fineAmount || 0}</strong>
                            {issue.fineAmount > 0 && (
                              <div>
                                <small className="text-muted">
                                  {issue.fineStatus === 'paid' ? 'Paid' : 
                                   issue.fineStatus === 'waived' ? 'Waived' : 'Pending'}
                                </small>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <strong>₹{getFineAmount(issue)}</strong>
                            {getFineAmount(issue) > 0 && (
                              <div>
                                <small className="text-danger">Accumulating</small>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {!issue.isReturned && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate("/return-book")}
                          >
                            <i className="bi bi-arrow-return-left"></i> Return
                          </button>
                        )}
                        {issue.isReturned && issue.fineAmount > 0 && issue.fineStatus === 'pending' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => navigate("/fine-management")}
                          >
                            <i className="bi bi-cash-coin"></i> Collect Fine
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{issues.length}</h4>
              <p>Total Issues</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>{issues.filter((i) => !i.isReturned).length}</h4>
              <p>Active Issues</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body text-center">
              <h4>
                {issues.filter(
                  (i) => !i.isReturned && new Date(i.returnDate) < new Date()
                ).length}
              </h4>
              <p>Overdue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{issues.filter((i) => i.isReturned).length}</h4>
              <p>Returned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fine Summary */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>₹{issues.reduce((total, issue) => total + (getFineAmount(issue)), 0)}</h4>
              <p>Total Pending Fines</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning text-white">
            <div className="card-body text-center">
              <h4>₹{issues.filter(i => i.isReturned).reduce((total, issue) => total + (issue.fineAmount || 0), 0)}</h4>
              <p>Total Collected Fines</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-secondary text-white">
            <div className="card-body text-center">
              <h4>{issues.filter(i => i.isReturned && i.fineAmount > 0).length}</h4>
              <p>Books with Fines</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueBook;
