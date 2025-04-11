import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './register.css';
import bgImage from '../images/job.jpg';
// Example from your EmailForgotPassword.js

const Register = () => {
  const countryCodes = [ /* ... your country codes here ... */ ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+1',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, countryCode, mobileNumber, password, confirmPassword } = formData;
    const fullMobileNumber = `${countryCode}${mobileNumber}`;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/register`,
        {
          name,
          email,
          mobileNumber: fullMobileNumber,
          password
        }
      );
      
      console.log("Registration success:", response.data);
      

      alert("User registered successfully!");
      setFormData({
        name: '',
        email: '',
        countryCode: '+1',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='form-container' style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
    }}>
      <div className="navbar-custom">
        <div className="scroll-text" style={{ textAlign: 'center', fontSize: '1rem', width: '100%' }}>
          Welcome to the Job Portal Application - Register Now!
        </div>
      </div>

      <form className='card p-3' onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '10px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <h3 className='text-center mb-3'>Register</h3>

          {error && <div className="alert alert-danger">{error}</div>}

          {/* Name */}
          <div className="mb-1">
            <label htmlFor="name" className="form-label">Name</label>
            <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          {/* Email */}
          <div className="mb-1">
            <label htmlFor="email" className="form-label">Email address</label>
            <input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required />
            <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
          </div>

          {/* Mobile Number */}
          <div className="mb-1">
            <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
            <div className="input-group">
              <select className="form-select" style={{ maxWidth: '150px' }} name="countryCode" value={formData.countryCode} onChange={handleChange} required>
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.country} ({country.code})
                  </option>
                ))}
              </select>
              <input type="tel" className="form-control" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter mobile number" required />
            </div>
          </div>

          {/* Password */}
          <div className="mb-1">
            <label htmlFor="password" className="form-label">Password</label>
            <input type="password" className="form-control" id="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>

          {/* Confirm Password */}
          <div className="mb-1">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          {/* Checkbox */}
          <div className="mb-1 form-check">
            <input type="checkbox" className="form-check-input" id="exampleCheck1" required />
            <label className="form-check-label" htmlFor="exampleCheck1">I agree to Terms and Conditions</label>
          </div>

          {/* Submit Button */}
          <div className='d-flex justify-content-between'>
            <p>Already registered? <Link to='/login'>Login</Link></p>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>
      </form>

      {/* Login Button (top right) */}
      <div style={{ position: 'absolute', top: '90px', right: '20px' }}>
        <Link to="/login" className="btn" style={{
          backgroundColor: '#006400',
          color: 'white',
          fontSize: '1.2rem',
          padding: '10px 24px',
          border: 'none'
        }}>
          Login
        </Link>
      </div>
    </div>
  );
};

export default Register;
