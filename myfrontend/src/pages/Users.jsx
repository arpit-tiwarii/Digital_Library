"use client"
import { useState, useEffect } from "react"
import api from "../api/api.js"
import { Link, useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
  const resolveProfilePicUrl = (profilePicValue) => {
    if (!profilePicValue) return null
    const valueAsString = String(profilePicValue)
    if (
      valueAsString.startsWith('http://') ||
      valueAsString.startsWith('https://') ||
      valueAsString.startsWith('data:')
    ) {
      return valueAsString
    }
    return `${apiBase}/images/upload/${valueAsString}`
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get("/user/getUsers")
      setUsers(response.data)
    } catch (error) {
      setError("Failed to load users. Please try again.")
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewProfile = (user) => {
    // Navigate to user profile with user ID as URL parameter
    navigate(`/userProfile/${user._id || user.userId}`, { 
      state: { userEmail: user.email } 
    });
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">User Management</h1>
          
          <div className="alert alert-info" role="alert">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Admin Management:</strong> Only existing administrators can create new admin users. 
            Regular users can only register through the public registration page.
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {/* Search Bar */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
              </div>
            </div>
            <div className="col-md-6 text-end">
              <Link to="/create-admin" className="btn btn-danger">
                <i className="bi bi-plus-circle me-2"></i>
                Create Admin User
              </Link>
            </div>
          </div>

          <p className="text-muted mb-4">
            Found {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
          </p>

          {filteredUsers.length === 0 ? (
            <div className="alert alert-info">
              <h4>No Users Found</h4>
              <p>No users match your search criteria.</p>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Profile</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Email Verified</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user,index) => (
                        <tr key={user._id || user.userId}>
                          <td>{index + 1}</td>
                          <td>
                            {user.profilePic ? (
                              <img
                                src={resolveProfilePicUrl(user.profilePic) || "/placeholder.svg"}
                                alt={`${user.name}'s profile`}
                                className="rounded-circle"
                                width="40"
                                height="40"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.currentTarget.src = `${apiBase}/images/upload/defaultPic.jpg` }}
                              />
                            ) : (
                              <div
                                className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white"
                                style={{ width: "40px", height: "40px" }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong> 
                              <button 
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => handleViewProfile(user)}
                                style={{ color: '#007bff' }}
                              >
                                {user.name}
                              </button>
                            </strong>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === "admin" ? "bg-danger" : "bg-primary"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${user.isEmailVerified ? "bg-success" : "bg-warning"}`}>
                              {user.isEmailVerified ? "Verified" : "Pending"}
                            </span>
                          </td>
                          <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button 
                                className="btn btn-outline-primary" 
                                title="View Profile"
                                onClick={() => handleViewProfile(user)}
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              <button className="btn btn-outline-secondary" title="Edit User">
                                <i className="bi bi-pencil"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Stats */}
          <div className="row mt-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h4>{users.length}</h4>
                  <p className="mb-0">Total Users</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h4>{users.filter((user) => user.role === "admin").length}</h4>
                  <p className="mb-0">Administrators</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h4>{users.filter((user) => user.role === "user").length}</h4>
                  <p className="mb-0">Regular Users</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h4>{users.filter((user) => user.isEmailVerified).length}</h4>
                  <p className="mb-0">Verified Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Users
