import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './register.css'; // if you want to keep styles separate
import bgImage from '../images/job.jpg';
const Register = () => {
  // Common country codes with flags
  const countryCodes = [
    { code: '+1', country: '🇺🇸 United States' },
    { code: '+44', country: '🇬🇧 United Kingdom' },
    { code: '+91', country: '🇮🇳 India' },
    { code: '+61', country: '🇦🇺 Australia' },
    { code: '+86', country: '🇨🇳 China' },
    { code: '+81', country: '🇯🇵 Japan' },
    { code: '+49', country: '🇩🇪 Germany' },
    { code: '+33', country: '🇫🇷 France' },
    { code: '+7', country: '🇷🇺 Russia' },
    { code: '+971', country: '🇦🇪 UAE' },
    { code: '+65', country: '🇸🇬 Singapore' },
    { code: '+82', country: '🇰🇷 South Korea' },
    { code: '+55', country: '🇧🇷 Brazil' },
    { code: '+52', country: '🇲🇽 Mexico' },
    { code: '+27', country: '🇿🇦 South Africa' },
  ];

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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, countryCode, mobileNumber, password, confirmPassword } = formData;
    
    // Format the full mobile number with country code
    const fullMobileNumber = `${countryCode}${mobileNumber}`;

    // Simple validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          mobileNumber: fullMobileNumber,
          password 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("User registered successfully");
        // Clear form after successful registration
        setFormData({
          name: '',
          email: '',
          countryCode: '+1',
          mobileNumber: '',
          password: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || "Error registering user");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div div className='form-container' style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
    }}
   >
      <div className="navbar-custom">
        <div className="scroll-text" style={{ textAlign: 'center', fontSize: '1rem', width: '100%' }}>
          Welcome to the Job Portal Application - Register Now!
        
        </div> 
      </div>
      
      
      <form className='card p-3' onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '10px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
        <h3 className='text-center mb-3'>Register</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="mb-1">
          <label htmlFor="name" className="form-label">Name</label>
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
        
        <div className="mb-1">
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
        </div>
        
        <div className="mb-1">
          <label htmlFor="mobileNumber" className="form-label">Mobile Number</label>
          <div className="input-group">
            <select
              className="form-select"
              style={{ maxWidth: '150px' }}
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              required
            >
              {countryCodes.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.country} ({country.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              className="form-control"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter mobile number"
              required
            />
          </div>
        </div>
        
        <div className="mb-1">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-1">
          <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-1 form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1" required />
          <label className="form-check-label" htmlFor="exampleCheck1">I agree to Terms and Conditions</label>
        </div>
        
        <div className='d-flex justify-content-between'>
          <p>
            Already registered? <Link to='/login'>Login</Link>
          </p>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
        </div>
      </form>
     
     {/* Login button outside the form, right side below navbar */}
     <div style={{ position: 'absolute', top: '90px', right: '20px' }}>
  <Link 
    to="/login" 
    className="btn" 
    style={{
      backgroundColor: '#006400',  // Dark green
      color: 'white',
      fontSize: '1.2rem',
      padding: '10px 24px',
      border: 'none'
      
    }}
  >
    Login
  </Link>
</div>



    </div>
  );
};

export default Register;