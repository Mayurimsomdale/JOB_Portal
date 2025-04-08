// Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './login.css'; // Make sure to create this file

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:8081/api/login', { email, password });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        alert('Login successful! Redirecting to job portal...');
        navigate('/jobs');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className='login-page'>
      <div className="navbar-custom">
        <div className="scroll-text">
          Welcome to the Job Portal Application – Please Login!
        </div>
      </div>

      <div className='login-container'>
        <form className='card p-4 shadow' onSubmit={handleLogin}>
          <h3 className='text-center mb-3'>Login</h3>
          <div className='mb-2'>
            <label className='form-label'>Email Address</label>
            <input
              type='email'
              className='form-control'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-2'>
            <label className='form-label'>Password</label>
            <input
              type='password'
              className='form-control'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-end">
                <Link to="/forgot-password" className="small text-primary">Forgot Password?</Link>
            </div>
          </div>
          {error && <p className='text-danger'>{error}</p>}
          <div className='d-flex justify-content-between align-items-center mt-3'>
            <p className='mb-0'>Not a user? <Link to='/register'>Register Here!</Link></p>
            <button type='submit' className='btn btn-primary'>Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
