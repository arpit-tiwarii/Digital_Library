import { Navigate } from "react-router-dom"

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem("token")
  const userData = localStorage.getItem("user")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && userData) {
    const user = JSON.parse(userData)
    if (user.role !== "admin") {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Access Denied</h4>
            <p>You don't have permission to access this page. Admin privileges required.</p>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute
