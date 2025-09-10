import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const AuthFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');

    // Auto-redirect to login after 5 seconds
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow text-center">
            <div className="card-body p-5">
              <div className="mb-4">
                <svg width="64" height="64" viewBox="0 0 24 24" className="text-danger">
                  <path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                </svg>
              </div>
              <h3 className="card-title text-danger mb-3">Authentication Failed</h3>
              <p className="text-muted mb-4">
                Sorry, we couldn't authenticate you with Google. This might be due to:
              </p>
              <ul className="text-muted text-start mb-4">
                <li>You cancelled the authentication process</li>
                <li>There was a temporary issue with Google's servers</li>
                <li>Your Google account doesn't have the required permissions</li>
              </ul>
              <div className="d-grid gap-2">
                <Link to="/login" className="btn btn-primary">
                  Try Again
                </Link>
                <Link to="/" className="btn btn-outline-secondary">
                  Go to Home
                </Link>
              </div>
              <p className="text-muted mt-3 small">
                You will be automatically redirected to the login page in 5 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFailure;
