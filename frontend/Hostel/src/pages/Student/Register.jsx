import React, { useState } from 'react';
import './Register.css';
import { authAPI } from '../../services/api';

const Register = ({ onSwitchToLogin, onBackHome }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    hostelBlock: '',
    roomNumber: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.studentId.trim()) {
      setError('Please enter your student ID');
      return;
    }

    if (!formData.studentId.toUpperCase().startsWith('STU')) {
      setError('Student ID must start with "STU"');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!formData.hostelBlock) {
      setError('Please select your hostel block');
      return;
    }

    if (!formData.roomNumber.trim()) {
      setError('Please enter your room number');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register({
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        hostelBlock: formData.hostelBlock,
        roomNumber: formData.roomNumber
      });

      alert('✅ Registration successful! You can now login with your credentials.');
      window.dispatchEvent(new CustomEvent('studentRegistered', { detail: response.data.user }));
      onSwitchToLogin();
    } catch (err) {
      // Handle specific error messages from backend
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        if (errorMessage.includes('email')) {
          setError('❌ This email is already registered. Please use a different email or login.');
        } else if (errorMessage.includes('studentId')) {
          setError('❌ This student ID is already registered. Please contact admin if this is an error.');
        } else {
          setError('❌ This account already exists. Please login instead.');
        }
      } else if (errorMessage.includes('invalid')) {
        setError('❌ Invalid information provided. Please check your details.');
      } else {
        setError(`❌ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <button className="back-btn" onClick={onBackHome}>
          ← Back to Home
        </button>
        
        <div className="register-card">
          <h1>Student Registration</h1>
          <p className="subtitle">Create your hostel account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Student ID *</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                placeholder="e.g., STU001"
              />
              <small style={{color: '#999', fontSize: '12px'}}>Must start with "STU"</small>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="0712345678"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hostel Block *</label>
                <select
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Block</option>
                  <option value="A">Block A</option>
                  <option value="B">Block B</option>
                  <option value="C">Block C</option>
                  <option value="D">Block D</option>
                </select>
              </div>

              <div className="form-group">
                <label>Room Number *</label>
                <select
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Room</option>
                  {formData.hostelBlock && Array.from({length: 10}, (_, i) => {
                    const roomNum = String(i + 1).padStart(2, '0');
                    const roomValue = `${formData.hostelBlock}${roomNum}`;
                    return <option key={roomValue} value={roomValue}>{roomNum}</option>;
                  })}
                  {!formData.hostelBlock && <option value="" disabled>Please select block first</option>}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Re-enter password"
              />
            </div>

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="login-link">
            Already have an account?{' '}
            <span onClick={onSwitchToLogin}>Login here</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
