import React, { useState, useEffect } from 'react';
import api from '../api/api.js';

const OTPVerification = ({ email, name, onVerificationSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Start timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/otp/verify-otp`, {
        email,
        otp: otpString
      });

      if (response.data.success) {
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        setError(response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.response?.data?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post(`/otp/resend-otp`, {
        email,
        name
      });

      if (response.data.success) {
        setSuccess('OTP resent successfully! Please check your email.');
        setTimer(300); // Reset timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear OTP fields
      } else {
        setError(response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h2 className="card-title text-primary">Email Verification</h2>
                <p className="text-muted">
                  We've sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <div className="mb-4">
                <label className="form-label">Enter 6-digit OTP</label>
                <div className="d-flex justify-content-between gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      className="form-control text-center"
                      style={{ width: '50px', height: '50px', fontSize: '18px' }}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              <div className="text-center mb-3">
                <p className="text-muted mb-2">
                  {timer > 0 ? (
                    <>Code expires in <strong>{formatTime(timer)}</strong></>
                  ) : (
                    <span className="text-danger">Code expired</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary w-100 mb-3"
                onClick={handleVerifyOTP}
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="text-center">
                <p className="mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={handleResendOTP}
                  disabled={!canResend || loading}
                >
                  {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
                </button>
              </div>

              <div className="text-center mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onBack}
                  disabled={loading}
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
