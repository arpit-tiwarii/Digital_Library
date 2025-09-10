"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../api/api.js";

const UserProfile = () => {
  const { userId } = useParams(); // Get userId from URL parameter
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = location.state?.userEmail; // Get email from state if available

  const [user, setUser] = useState(null);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const apiBase = import.meta.env.VITE_API_BASE || 'https://digital-library-backend-clf5.onrender.com';
  const resolveProfilePicUrl = (profilePicValue) => {
    if (!profilePicValue) return null;
    const valueAsString = String(profilePicValue);
    if (
      valueAsString.startsWith('http://') ||
      valueAsString.startsWith('https://') ||
      valueAsString.startsWith('data:')
    ) {
      return valueAsString;
    }
    return `${apiBase}/images/upload/${valueAsString}`;
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile(userId, userEmail);
    } else {
      setError("No user ID provided.");
      setLoading(false);
    }
  }, [userId, userEmail]);

  const fetchUserProfile = async (id, email) => {
    try {
      setLoading(true);

      // Use getUserById endpoint which returns user data with issues
      const userResponse = await api.get(`/user/getUserById/${id}`);
      
      if (userResponse.data.success) {
        setUser(userResponse.data.data);
        // The issues are already included in the user data
        setIssuedBooks(userResponse.data.data.issues || []);
      } else {
        throw new Error(userResponse.data.message || 'Failed to fetch user data');
      }

      setError("");
    } catch (err) {
      console.error("Error fetching user profile:", err);
      if (err.response?.status === 401) {
        setError("Authentication required. Please login again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You can only view your own profile.");
      } else if (err.response?.status === 404) {
        setError("User not found.");
      } else {
        setError("Failed to load user details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUsers = () => {
    navigate("/users");
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading user profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBackToUsers}>
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info">
          <h4>User Not Found</h4>
          <p>The requested user could not be found.</p>
          <button className="btn btn-primary" onClick={handleBackToUsers}>
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>User Profile</h2>
            <button className="btn btn-outline-primary" onClick={handleBackToUsers}>
              <i className="bi bi-arrow-left"></i> Back to Users
            </button>
          </div>

          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  {user.profilePic ? (
                    <img
                      src={resolveProfilePicUrl(user.profilePic) || "/placeholder.svg"}
                      alt={`${user.name}'s profile`}
                      className="rounded-circle mb-3"
                      width="120"
                      height="120"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = `${apiBase}/images/upload/defaultPic.jpg`; }}
                    />
                  ) : (
                    <div
                      className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white mb-3"
                      style={{ width: "120px", height: "120px", fontSize: "3rem" }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h4>{user.name}</h4>
                  <p className="text-muted">{user.email}</p>
                  <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"} mb-2`}>
                    {user.role}
                  </span>
                  <br />
                  <span className={`badge ${user.isEmailVerified ? "bg-success" : "bg-warning"}`}>
                    {user.isEmailVerified ? "Email Verified" : "Email Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">User Information</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Name:</strong> {user.name}</p>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Role:</strong> {user.role}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Phone:</strong> {user.phoneNo || "Not provided"}</p>
                      <p><strong>Joined:</strong> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Last Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-body">
                  <h5 className="card-title">Issued Books ({issuedBooks.length})</h5>
                  {issuedBooks.length === 0 ? (
                    <p className="text-muted">No books issued by this user.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Book Title</th>
                            <th>Issue Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                            <th>Fine</th>
                          </tr>
                        </thead>
                        <tbody>
                          {issuedBooks.map((issue, index) => (
                            <tr key={issue._id || index}>
                              <td>{index + 1}</td>
                              <td>{issue.bookId?.bookTitle || "Unknown Book"}</td>
                              <td>{issue.issueDate ? new Date(issue.issueDate).toLocaleDateString() : "N/A"}</td>
                              <td>{issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : "N/A"}</td>
                              <td>
                                <span className={`badge ${issue.isReturned ? "bg-success" : "bg-warning"}`}>
                                  {issue.isReturned ? "Returned" : "Issued"}
                                </span>
                              </td>
                              <td>₹{issue.fineAmount || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
