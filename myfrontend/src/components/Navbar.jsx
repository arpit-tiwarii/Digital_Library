"use client"

import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import api from "../api/api.js"

const Navbar = () => {
  const [user, setUser] = useState(null)
  const [donationDropdownOpen, setDonationDropdownOpen] = useState(false)
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
  const userData = localStorage.getItem("user")

  if (userData && userData !== "undefined" && userData !== "null") {
    try {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      if (parsed?.email) {
        api.get(`/user/getUser/${parsed.email}`)
          .then((res) => {
            if (res?.data) {
              setUser(res.data)
              // keep localStorage in sync so other pages get fresh data too
              localStorage.setItem("user", JSON.stringify(res.data))
            }
          })
          .catch((err) => {
            console.error("Failed to refresh user in navbar:", err)
          })
      }
    } catch (err) {
      console.error("Invalid JSON in localStorage for 'user'", err)
      localStorage.removeItem("user") // remove corrupted data
    }
  } else {
    // If "undefined" or "null" is stored, clear it
    localStorage.removeItem("user")
  }
},[])

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


  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    navigate("/")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
          <i className="bi bi-book-half me-2 fs-4"></i>
          <span>InfoBeans Library</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-4">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/books">
                <i className="bi bi-collection me-1"></i>Books
              </Link>
            </li>
            
            {/* Donation Dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded={donationDropdownOpen}
                onClick={(e) => {
                  e.preventDefault()
                  setDonationDropdownOpen(!donationDropdownOpen)
                }}
              >
                <i className="bi bi-heart me-1"></i>Donations
              </a>
              <ul className={`dropdown-menu ${donationDropdownOpen ? 'show' : ''}`}>
                <li>
                  <Link className="dropdown-item" to="/donate-book" onClick={() => setDonationDropdownOpen(false)}>
                    <i className="bi bi-gift me-2"></i>Donate Books
                  </Link>
                </li>
                {user?.role === "admin" && (
                  <li>
                    <Link className="dropdown-item" to="/manage-donations" onClick={() => setDonationDropdownOpen(false)}>
                      <i className="bi bi-gear me-2"></i>Manage Donations
                    </Link>
                  </li>
                )}
              </ul>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-requests">
                    <i className="bi bi-clipboard-check me-1"></i>My Requests
                  </Link>
                </li>
              </>
            )}

            {/* Admin Management Dropdown */}
            {user?.role === "admin" && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded={manageDropdownOpen}
                  onClick={(e) => {
                    e.preventDefault()
                    setManageDropdownOpen(!manageDropdownOpen)
                  }}
                >
                  <i className="bi bi-tools me-1"></i>Admin
                </a>
                <ul className={`dropdown-menu ${manageDropdownOpen ? 'show' : ''}`}>
                  <li><h6 className="dropdown-header">Book Management</h6></li>
                  <li>
                    <Link className="dropdown-item" to="/add-book" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-plus-circle me-2"></i>Add Book
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/issue-book" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-book me-2"></i>Issue Management
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/return-book" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-arrow-return-left me-2"></i>Return Books
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/fine-management" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-cash-coin me-2"></i>Fine Management
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><h6 className="dropdown-header">System Management</h6></li>
                  <li>
                    <Link className="dropdown-item" to="/manage-requests" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-list-check me-2"></i>Requests
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/users" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-people me-2"></i>Users
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/manage-categories" onClick={() => setManageDropdownOpen(false)}>
                      <i className="bi bi-tags me-2"></i>Categories
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                <i className="bi bi-info-circle me-1"></i>About
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                <i className="bi bi-envelope me-1"></i>Contact
              </Link>
            </li>
            
            {user ? (
              <li className="nav-item d-flex align-items-center">
                <div className="d-flex align-items-center me-3">
                  {user?.profilePic && (
                    <img
                      src={resolveProfilePicUrl(user.profilePic) || "/placeholder.svg"}
                      alt="Profile"
                      className="rounded-circle me-2"
                      width="32"
                      height="32"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = `${apiBase}/images/upload/defaultPic.jpg` }}
                    />
                  )}
                  <span className="navbar-text fw-medium me-2">Welcome, {user.name}</span>
                </div>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i>Logout
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light btn-sm ms-2" to="/register">
                    <i className="bi bi-person-plus me-1"></i>Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
