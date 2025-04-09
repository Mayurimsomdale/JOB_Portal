import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const EmailForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: reset password
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // API Base URL - adjust this to match your backend server address
  const API_BASE_URL = 'http://localhost:8081';

  const handleSendEmailCode = async (e) => {
    e.preventDefault();
    setMessage('Sending verification code to email...');
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/forgot-password/send-email-code`, { email });
      if (res.data.success) {
        setMessage('Verification code sent to your email! Check your inbox or spam folder.');
        setStep(2);
      } else {
        setError(res.data.message || 'Failed to send verification code');
      }
    } catch (err) {
      console.error('Error sending code:', err);
      setError(err.response?.data?.message || 'Something went wrong! Please check your email address.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e) => {
    e.preventDefault();
    setMessage('Verifying code...');
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/forgot-password/verify-email-code`, {
        email,
        verificationCode
      });

      if (res.data.success) {
        setMessage('Code verified successfully!');
        setStep(3);
      } else {
        setError(res.data.message || 'Invalid code');
      }
    } catch (err) {
      console.error('Error verifying code:', err);
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setMessage('Resetting password...');
    setError('');
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/forgot-password/reset-by-email`, {
        email,
        verificationCode,
        newPassword
      });

      if (res.data.success) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(res.data.message || 'Password reset failed');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    switch (step) {
      case 1:
        return (
          <form className="card p-4 shadow" onSubmit={handleSendEmailCode}>
            <h4 className="text-center mb-3">Forgot Password</h4>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between mt-3">
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/login')}>
                Back to Login
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </div>
            <div className="mt-3 text-center">
              <button 
                type="button" 
                className="btn btn-link" 
                onClick={() => navigate('/mobile-forgot-password')}
              >
                Use Mobile Number Instead
              </button>
            </div>
          </form>
        );
      case 2:
        return (
          <form className="card p-4 shadow" onSubmit={handleVerifyEmailCode}>
            <h4 className="text-center mb-3">Verify Email Code</h4>
            <div className="mb-3">
              <label htmlFor="code" className="form-label">Verification Code</label>
              <input
                type="text"
                id="code"
                className="form-control"
                placeholder="Enter 6-digit code from email"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
              />
              <div className="form-text">
                Check your email for a 6-digit verification code
              </div>
            </div>
            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between mt-3">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
            <div className="mt-3 text-center">
              <button
                type="button"
                className="btn btn-link"
                onClick={handleSendEmailCode}
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
          </form>
        );
      case 3:
        return (
          <form className="card p-4 shadow" onSubmit={handleResetPassword}>
            <h4 className="text-center mb-3">Reset Password</h4>
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
            {message && <div className="alert alert-info">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="d-flex justify-content-between mt-3">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="submit" className="btn btn-success" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">{renderForm()}</div>
    </div>
  );
};

export default EmailForgotPassword;