import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Show success message briefly before redirecting
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        console.error("Error parsing user data:", err);
        navigate("/login?error=auth_failed");
      }
    } else {
      navigate("/login?error=auth_failed");
    }
  }, [location, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow text-center">
            <div className="card-body p-5">
              <div className="mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" className="text-success">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="card-title text-success mb-3">Authentication Successful!</h3>
              <p className="text-muted">You have been successfully logged in with Google.</p>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Redirecting to dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
