"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import OTPVerification from "../components/OTPVerification.jsx";

import api from "../api/api.js";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpSent, setOtpSent] = useState(""); // ✅ This is your OTP state
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  // For debugging only
  useEffect(() => {
    console.log("Updated OTP in state:", otpSent);
  }, [otpSent]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Send OTP function
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
        setOtpSent(data.otp); // ✅ Save OTP in state
        setSuccess("OTP sent successfully! Please check your email.");
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

  // ✅ Register user after OTP verified
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!isVerified) {
      setError("Please verify your email with OTP before registering.");
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
      const response = await api.post("/user/RegisterUser", {
        name: formData.name,
        email: formData.email,
        phoneNo: formData.phoneNo,
        role: "user", // Always set role to "user" for normal registration
        password: formData.password,
        otp: otpSent, // ✅ Use state OTP here
      });

      const data = response.data;

      if (data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("❌ Error during registration:", error);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ OTP Verification Success
  const handleVerificationSuccess = () => {
    setIsVerified(true);
    setSuccess("Email verified successfully! You can now register.");
    setShowOTPVerification(false);
  };

  const handleBackToRegistration = () => {
    setShowOTPVerification(false);
    setOtpSent(""); // ✅ Reset OTP
    setError("");
    setSuccess("");
  };

  // ✅ Registration Form
  const registrationForm = (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <h2 className="card-title text-center mb-4 text-primary">Register</h2>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                {/* Inputs */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input type="text" className="form-control" id="name" name="name"
                    value={formData.name} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email"
                    value={formData.email} onChange={handleChange} required />
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNo" className="form-label">Mobile No.</label>
                  <input type="tel" className="form-control" id="phoneNo" name="phoneNo"
                    value={formData.phoneNo} onChange={handleChange}
                    placeholder="Enter 10-digit mobile number" maxLength="10" required />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input type="password" className="form-control" id="password" name="password"
                    value={formData.password} onChange={handleChange} required minLength="6" />
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" id="confirmPassword" name="confirmPassword"
                    value={formData.confirmPassword} onChange={handleChange} required minLength="6" />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading || !isVerified}>
                    {loading ? "Registering..." : "Register"}
                  </button>

                  {!otpSent && (
                    <button type="button" className="btn btn-outline-secondary"
                      onClick={handleSendOTP} disabled={loading || !formData.email || !formData.name}>
                      Send OTP for Email Verification
                    </button>
                  )}
                </div>
              </form>

              <div className="text-center">
                <p>Already have an account? <Link to="/login" className="text-primary">Login</Link></p>
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
        onBack={handleBackToRegistration}
      />
    );
  }

  return registrationForm;
};

export default Register;
