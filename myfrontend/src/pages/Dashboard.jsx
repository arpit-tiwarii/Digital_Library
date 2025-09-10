"use client";

import { useState, useEffect } from "react";
import api from "../api/api.js";
import { useNavigate } from "react-router-dom";
import imageCompression from 'browser-image-compression';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [stats, setStats] = useState({}); // Changed from null to empty object
  const [fineStats, setFineStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(false);
  const navigate = useNavigate();
  const [editForm, setEditForm] = useState({ name: '', email: '', phoneNo: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [editProfile, setEditProfile] = useState(false)

  useEffect(() => {
    fetchUserProfile();
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    if (userData?.name) setEditForm({ name: userData.name || '', email: userData.email || '', phoneNo: userData.phoneNo || '' })
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.email) return;

      const response = await api.get(`/user/getUser/${userData.email}`);
      setUser(response.data);

      if (response.data.role === "admin") {
        fetchStats();
        fetchFineStats();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/statistics/dashboard");
      const data = response.data.data;
  
      setStats({
        totalBooks: data.books.total,
        issuedBooks: data.issues.total,
        activeIssues: data.issues.active,
        totalUsers: data.users.total
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalBooks: 0,
        issuedBooks: 0,
        activeIssues: 0,
        totalUsers: 0
      });
    } finally {
      setLoading(false);
    }
  };
  
  

  const fetchFineStats = async () => {
    try {
      const response = await api.get("/fines/statistics");
      setFineStats(response.data.data);
    } catch (error) {
      console.error("Error fetching fine stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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

  const totalIssuedBooks = user.Issues?.length || 0;
  const activeIssues = user.Issues?.filter((issue) => !issue.isReturned).length || 0;

  const handleViewRequests = () => {
    if (user?.role === "admin") {
      navigate("/manage-requests");
    } else {
      navigate("/my-requests");
    }
  };

  const changeProfilePic = async (e) => {
    try {
      e.preventDefault(); 

      console.log('aaya');
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.email) return;

      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput.files[0];
      
      if (!file) return;

      const loader = document.createElement("div");
      loader.className = "position-fixed";
      loader.style.top = "20px";
      loader.style.right = "20px";
      loader.style.zIndex = "9999";
      loader.innerHTML = `
        <div class="alert alert-info">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Uploading profile picture...
        </div>
      `;
      document.body.appendChild(loader);

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("profilePic", compressedFile);

      await api.put(`/user/updateProfile/${userData.email}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      loader.innerHTML = `
        <div class="alert alert-success">
          <i class="bi bi-check-circle me-2"></i>
          Profile picture updated successfully!
        </div>
      `;

      setTimeout(() => {
        loader.remove();
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating profile picture:", error);
      const loader = document.querySelector(".position-fixed");
      if (loader) {
        loader.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>
            Failed to update profile picture. Please try again.
          </div>
        `;
        setTimeout(() => loader.remove(), 3000);
      }
    }
  };

  const handleProfileChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      await api.put(`/user/updateProfile/${editForm.email}`, editForm)
      const { data } = await api.get(`/user/getUser/${editForm.email}`)
      if (data) {
        localStorage.setItem('user', JSON.stringify(data))
      }
      alert('Profile updated successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="container mt-5">
      {/* Welcome Banner */}
      <div className="rounded-4 p-4 mb-4" style={{background:'#fff5f5', border:'1px solid #ffd6d6'}}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 className="mb-1" style={{color:'#b30000'}}>Welcome, {user?.name}</h2>
            <p className="mb-0 text-muted">Manage your profile, requests, and issued books in one place.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-danger" onClick={handleViewRequests}>
              {user?.role === "admin" ? "Manage Requests" : "My Requests"}
            </button>
            <a href="/books" className="btn btn-outline-primary">Browse Books</a>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="card hover-lift">
            <div className="card-body text-center">
              {user?.profilePic ? (
                <div
                  className="position-relative d-inline-block mb-3 profile-pic-wrapper"
                  style={{ width: "150px", height: "150px" }}
                  onClick={() => { setProfile(true); setEditProfile(true); }}
                >
                  <img
                    src={resolveProfilePicUrl(user.profilePic)}
                    alt="Profile"
                    className="rounded-circle w-100 h-100"
                    style={{ objectFit: 'cover', cursor: 'pointer' }}
                  />
                  <div className="position-absolute top-50 start-50 translate-middle profile-edit-overlay">
                    <button type="button" className="btn btn-light btn-sm">Edit</button>
                  </div>
                </div>
              ) : (
                <div
                  className="position-relative d-inline-flex align-items-center justify-content-center mb-3 profile-pic-wrapper bg-primary text-white rounded-circle"
                  style={{ width: "150px", height: "150px", fontSize: "4rem", cursor: 'pointer' }}
                  onClick={() => { setProfile(true); setEditProfile(true); }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                  <div className="position-absolute top-50 start-50 translate-middle profile-edit-overlay">
                    <button type="button" className="btn btn-light btn-sm">Edit</button>
                  </div>
                </div>
              )}
              {profile ? (
                <form onSubmit={changeProfilePic}>
                  {editProfile && <p>Change Profile Picture</p>}
                  {editProfile && <input
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    required
                  />}
                  <button type="submit" className="btn btn-primary btn-sm me-2">
                    Upload
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setProfile(false)}
                  >
                    Cancel
                  </button>
                </form>
              ) : null}
              <h5 className="card-title mt-3">Your Profile</h5>
              <p className="card-text">
                <strong>Name:</strong> {user?.name} <br />
                <strong>Email:</strong> {user?.email} <br />
                <strong>Role:</strong>{" "}
                <span className="badge bg-primary">{user?.role}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card mb-4 hover-lift">
            <div className="card-body">
              <h5 className="card-title mb-3">Edit Profile</h5>
              <form onSubmit={handleProfileSave} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Name</label>
                  <input className="form-control" name="name" value={editForm.name} onChange={handleProfileChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" name="email" value={editForm.email} onChange={handleProfileChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input className="form-control" name="phoneNo" value={editForm.phoneNo || ''} onChange={handleProfileChange} />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button className="btn btn-danger" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card text-white hover-lift" style={{background:'#b30000'}}>
            <div className="card-body">
              <h4 className="card-title">{stats?.issuedBooks || totalIssuedBooks}</h4>
              <p className="card-text">Issued Books</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white hover-lift">
            <div className="card-body">
              <h4 className="card-title">{stats?.activeIssues || activeIssues}</h4>
              <p className="card-text">Active Issues</p>
            </div>
          </div>
        </div>

        {user?.role === "admin" && (
          <>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white hover-lift">
                <div className="card-body">
                  <h4 className="card-title">{stats?.totalUsers}</h4>
                  <p className="card-text">Total Users</p>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white hover-lift">
                <div className="card-body">
                  <h4 className="card-title">{stats?.totalBooks}</h4>
                  <p className="card-text">Total Books</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fine Statistics for Admin */}
      {user?.role === "admin" && fineStats && (
        <div className="row mb-4">
          <div className="col-12">
            <h4>Fine Management Overview</h4>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-danger text-white hover-lift">
              <div className="card-body text-center">
                <h4>₹{fineStats.pending.amount}</h4>
                <p className="mb-0">Pending Fines ({fineStats.pending.count})</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-success text-white hover-lift">
              <div className="card-body text-center">
                <h4>₹{fineStats.monthly.amount}</h4>
                <p className="mb-0">This Month ({fineStats.monthly.count})</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-primary text-white hover-lift">
              <div className="card-body text-center">
                <h4>₹{fineStats.yearly.amount}</h4>
                <p className="mb-0">This Year ({fineStats.yearly.count})</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card bg-warning text-white hover-lift">
              <div className="card-body text-center">
                <h4>{fineStats.overdueBooks}</h4>
                <p className="mb-0">Overdue Books</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issued Books Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card hover-lift">
            <div className="card-body">
              <h5 className="card-title">Your Issued Books</h5>
              {user?.Issues && user.Issues.length > 0 ? (
                <div className="list-group">
                  {user.Issues.map((issue) => (
                    <div key={issue._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{issue.bookId?.bookTitle || 'Unknown Book'}</strong> by {issue.bookId?.bookAuthor || 'Unknown Author'} <br />
                          <small>
                            Issue Date: {new Date(issue.issueDate).toLocaleDateString()} | Return Date:{" "}
                            {issue.returnDate ? new Date(issue.returnDate).toLocaleDateString() : "Not returned"} <br />
                            {issue.isReturned && issue.actualReturnDate && `Actual Return: ${new Date(issue.actualReturnDate).toLocaleDateString()}`}
                          </small>
                        </div>
                        <div className="text-end">
                          {issue.fineAmount > 0 && (
                            <span className="badge bg-warning">
                              Fine: ₹{issue.fineAmount}
                            </span>
                          )}
                          {issue.isReturned ? (
                            <span className="badge bg-success">Returned</span>
                          ) : (
                            <span className="badge bg-primary">Active</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No books issued yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card hover-lift">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-flex flex-wrap gap-2">
                <a href="/books" className="btn btn-outline-primary">
                  Browse Books
                </a>
                <button
                  className="btn btn-outline-info"
                  onClick={handleViewRequests}
                >
                  {user?.role === "admin" ? "Manage Requests" : "My Requests"}
                </button>
                {user?.role === "admin" && (
                  <>
                    <a href="/add-book" className="btn btn-outline-success">
                      Add New Book
                    </a>
                    <a href="/issue-book" className="btn btn-outline-info">
                      Manage Issues
                    </a>
                    <a href="/return-book" className="btn btn-outline-warning">
                      Return Books
                    </a>
                    <a href="/fine-management" className="btn btn-outline-danger">
                      Fine Management
                    </a>
                    <a href="/users" className="btn btn-outline-secondary">
                      View Users
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
