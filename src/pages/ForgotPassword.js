import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8081/api/forgot-password', {
        email,
        newPassword,
      });

      if (res.data.success) {
        setMessage('Password reset successfully! You can now login.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error resetting password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="card p-4 shadow" onSubmit={handleReset}>
          <h4 className="text-center mb-3">Reset Password</h4>
          <div className="mb-2">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label>New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          {message && <p className="text-info">{message}</p>}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-success">Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
