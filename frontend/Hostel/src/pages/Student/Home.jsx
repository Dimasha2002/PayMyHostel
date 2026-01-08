import React, { useState } from 'react';
import './Home.css';
import hostelImage from '../../assets/hostel-room.webp';

const Home = ({ onGetStarted, onAdminLogin, onLogin }) => {
  const [activeNav, setActiveNav] = useState('home');

  const scrollToSection = (sectionId) => {
    setActiveNav(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
              {/* Roof - Top part with yellow/orange trim */}
              <path d="M 50 120 Q 50 80, 100 50 Q 150 80, 150 120" fill="#FFA500" stroke="none"/>
              
              {/* Roof dark overlay */}
              <path d="M 60 110 Q 60 85, 100 60 Q 140 85, 140 110" fill="#003D7A" stroke="none"/>
              
              {/* House body */}
              <rect x="55" y="110" width="90" height="65" rx="12" fill="#003D7A" stroke="none"/>
              
              {/* Base footer */}
              <rect x="70" y="168" width="60" height="15" rx="8" fill="#003D7A" stroke="none"/>
              
              {/* Dollar sign - white and large */}
              <text x="100" y="150" fontSize="70" fontWeight="900" fill="#FFFFFF" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, sans-serif">$</text>
            </svg>
            <span className="logo-text">PayMyHostel</span>
          </div>
          <div className="navbar-right">
            <ul className="nav-menu">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
                onClick={() => scrollToSection('home')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeNav === 'about' ? 'active' : ''}`}
                onClick={() => scrollToSection('about')}
              >
                About
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeNav === 'features' ? 'active' : ''}`}
                onClick={() => scrollToSection('features')}
              >
                Features
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeNav === 'contact' ? 'active' : ''}`}
                onClick={() => scrollToSection('contact')}
              >
                Contact
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeNav === 'rules' ? 'active' : ''}`}
                onClick={() => scrollToSection('rules')}
              >
                Hostel Rules
              </button>
            </li>
          </ul>
          <div className="nav-actions">
            <button className="nav-btn login" onClick={onLogin}>🔓 Login</button>
            <button className="nav-btn admin" onClick={onAdminLogin}>🔐 Admin</button>
          </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="section hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Manage Your Hostel Life with Ease</h1>
            <p className="hero-description">
              PayMayHostel simplifies hostel fee management. Pay fees online, stay updated with announcements, 
              and access all important information from one secure platform.
            </p>
            <button className="cta-button" onClick={onGetStarted}>Get Started</button>
          </div>
          <div className="hero-image">
            <img src={hostelImage} alt="Hostel Room" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="section-container">
          <h2 className="section-title">About PayMayHostel</h2>
          <div className="about-content">
            <p>
              PayMayHostel is a modern digital solution created to simplify hostel fee management 
              and communication. Our goal is to reduce paperwork, eliminate long payment queues, 
              and provide a seamless experience for both students and management.
            </p>
            <p>
              We offer fast, reliable, and secure features that help everyone stay connected and organized.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="section-container">
          <h2 className="section-title">System Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Online Fee Payments</h3>
              <p>Pay your hostel fees anytime with secure transactions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Payment Tracking</h3>
              <p>View past payments and check your remaining balance easily.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Room & Hostel Information</h3>
              <p>Access room details, allocations, and updates instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Digital Notifications</h3>
              <p>Receive alerts for fee deadlines, rules, and important announcements.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>User-Friendly Dashboard</h3>
              <p>A clean interface designed for easy student and admin use.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Data Storage</h3>
              <p>Your information is protected with advanced security standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section contact-section">
        <div className="section-container">
          <h2 className="section-title">Contact Us</h2>
          <p className="contact-intro">Need help or have questions? We're ready to assist you.</p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <p><strong>Email:</strong> support@paymayhostel.com</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon">☎️</span>
              <p><strong>Phone:</strong> +94 71 775 4075</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <p><strong>Address:</strong> UniHostel, First lane, New city, Colombo.</p>
            </div>
          </div>
          <p className="contact-form-text">You can also reach us through our contact form for quick support.</p>
        </div>
      </section>

      {/* Hostel Rules Section */}
      <section id="rules" className="section rules-section">
        <div className="section-container">
          <h2 className="section-title">Hostel Rules & Guidelines</h2>
          <p className="rules-intro">
            To ensure a safe and comfortable environment, all residents must follow these rules:
          </p>
          <div className="rules-list">
            <div className="rule-item">
              <span className="rule-number">1</span>
              <p>Maintain cleanliness in rooms and common areas at all times.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">2</span>
              <p>Respect quiet hours from 10 PM to 6 AM.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">3</span>
              <p>Visitors are allowed only during approved hours.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">4</span>
              <p>No illegal or prohibited items inside hostel premises.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">5</span>
              <p>Report issues (maintenance, safety, etc.) to the warden promptly.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">6</span>
              <p>Follow payment deadlines and keep your account updated.</p>
            </div>
            <div className="rule-item">
              <span className="rule-number">7</span>
              <p>Respect hostel staff and fellow residents.</p>
            </div>
          </div>
          <p className="rules-conclusion">
            These guidelines help create a peaceful and safe hostel environment for everyone.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2024 PayMayHostel. All rights reserved. | UniHostel</p>
      </footer>
    </div>
  );
};

export default Home;
