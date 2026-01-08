import React, { useState } from 'react';
import './Login.css';
import { authAPI } from '../../services/api';

const Login = ({ onBackHome, onSwitchToRegister, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      try {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
        
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        
        setIsLoggedIn(true);
        alert('✅ Login successful! Welcome to PayMyHostel');
        onLoginSuccess(response.data.user);
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
        setErrors({ general: `❌ ${errorMessage}` });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <button className="back-button" onClick={onBackHome}>
            ← Back to Home
          </button>
          <h1>Welcome Back</h1>
          <p>Sign in to your PayMayHostel account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.general && <div className="general-error">{errors.general}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Don't have an account? <button onClick={onSwitchToRegister} className="link-button">Create one</button></p>
        </div>
      </div>

      {/* Decorative side panel */}
      <div className="login-decoration">
        <div className="notice-board">
          <div className="pin pin-left"></div>
          <div className="pin pin-right"></div>
          <div className="decoration-content">
            <h2>PayMayHostel</h2>
            <p>Manage your hostel payments securely and efficiently</p>
            <ul>
              <li>✓ Quick and easy payments</li>
              <li>✓ Payment tracking</li>
              <li>✓ Real-time notifications</li>
              <li>✓ 24/7 support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
