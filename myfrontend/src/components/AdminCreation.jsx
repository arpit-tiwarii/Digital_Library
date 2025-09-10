"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OTPVerification from "./OTPVerification.jsx";
import api from "../api/api.js";

const AdminCreation = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    role: "admin", // Default to admin for this component
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpSent, setOtpSent] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Updated OTP in state:", otpSent);
  }, [otpSent]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate phone number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.phoneNo)) {
      setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9");
      setLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/otp/generate-otp", {
        email: formData.email,
        name: formData.name,
      });

      const data = response.data;
      console.log("Server Response:", data);

      if (data.success) {
        setOtpSent(data.otp);
        setSuccess("OTP sent successfully! Please check the email.");
        setShowOTPVerification(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!isVerified) {
      setError("Please verify the email with OTP before creating the admin.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate phone number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(formData.phoneNo)) {
      setError("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9");
      setLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/user/createAdmin", {
        name: formData.name,
        email: formData.email,
        phoneNo: formData.phoneNo,
        role: formData.role,
        password: formData.password,
        otp: otpSent,
      });

      const data = response.data;

      if (data.success) {
        setSuccess("Admin user created successfully! Redirecting to users page...");
        setTimeout(() => navigate("/users"), 2000);
      } else {
        setError(data.message || "Admin creation failed");
      }
    } catch (error) {
      console.error("❌ Error during admin creation:", error);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setSuccess("Email verified successfully! You can now create the admin user.");
    setShowOTPVerification(false);
  };

  const handleBackToCreation = () => {
    setShowOTPVerification(false);
    setOtpSent("");
    setError("");
    setSuccess("");
  };

  const adminCreationForm = (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-danger">Create Admin User</h2>
              <p className="text-muted text-center mb-4">Create a new administrator account</p>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="name" 
                    name="name"
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNo" className="form-label">Mobile No.</label>
                  <input 
                    type="tel" 
                    className="form-control" 
                    id="phoneNo" 
                    name="phoneNo"
                    value={formData.phoneNo} 
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number" 
                    maxLength="10" 
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Role</label>
                  <select 
                    className="form-select" 
                    id="role" 
                    name="role"
                    value={formData.role} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="admin">Administrator</option>
                    <option value="user">Regular User</option>
                  </select>
                  <small className="form-text text-muted">
                    Select the role for the new user. Only admins can create other admins.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength="6" 
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="confirmPassword" 
                    name="confirmPassword"
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                    minLength="6" 
                  />
                </div>

                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-danger" 
                    disabled={loading || !isVerified}
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>

                  {!otpSent && (
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleSendOTP} 
                      disabled={loading || !formData.email || !formData.name}
                    >
                      Send OTP for Email Verification
                    </button>
                  )}
                </div>
              </form>

              <div className="text-center mt-3">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate("/users")}
                >
                  Back to Users
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showOTPVerification && !isVerified) {
    return (
      <OTPVerification
        email={formData.email}
        name={formData.name}
        onVerificationSuccess={handleVerificationSuccess}
        onBack={handleBackToCreation}
      />
    );
  }

  return adminCreationForm;
};

export default AdminCreation;
