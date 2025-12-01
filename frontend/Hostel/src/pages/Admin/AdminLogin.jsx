import React, { useState } from 'react';
import './AdminLogin.css';
import { adminAPI } from '../../services/api';

const AdminLogin = ({ onBackHome, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await adminAPI.adminLogin(credentials);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('currentUser', JSON.stringify(response.data.admin));
      onLoginSuccess(response.data.admin);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid admin credentials';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Admin Login</h1>
          <p>Access the administrative dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter admin username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="admin-login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>

        <button className="back-button" onClick={onBackHome}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
