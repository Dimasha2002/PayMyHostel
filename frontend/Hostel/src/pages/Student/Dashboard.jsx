import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './Dashboard.css';
import PaymentModal from './PaymentModal';
import PaymentHistory from './PaymentHistory';
import RoomDetails from './RoomDetails';
import ReceiptModal from './ReceiptModal';
import HostelNotices from './HostelNotices';
import MakePayment from './MakePayment';
import { paymentAPI, userAPI } from '../../services/api';

const Dashboard = ({ onLogout, currentUser }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || '',
    studentId: currentUser?.studentId || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    roomNumber: currentUser?.roomNumber || '',
    hostelBlock: currentUser?.hostelBlock || '',
  });
  const [editData, setEditData] = useState(profileData);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setActiveSection('overview');
    alert('Payment successful!');
  };

  const handleEditClick = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    setProfileData(editData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getMyPayments();
      const payments = response.data.payments || [];
      setPaymentHistory(payments.map(p => ({
        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: p.amount,
        method: 'Bank Slip',
        status: p.status,
        reference: p.reference,
        month: p.month,
        year: p.year,
        id: p.id || p._id,
        rejectionReason: p.rejectionReason
      })));
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  // Fetch payments from API and listen for admin updates
  useEffect(() => {
    fetchPayments();
    const handleStatusUpdate = () => fetchPayments();
    window.addEventListener('paymentStatusUpdated', handleStatusUpdate);
    return () => window.removeEventListener('paymentStatusUpdated', handleStatusUpdate);
  }, []);

  const addPayment = async () => {
    await fetchPayments();
  };

  const handleResubmit = (rejectedPayment) => {
    // Remove the rejected payment from localStorage
    const allPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    const updatedPayments = allPayments.filter(p => p.id !== rejectedPayment.id);
    localStorage.setItem('payments', JSON.stringify(updatedPayments));
    
    // Switch to make payment section
    setActiveSection('payments');
    
    alert(`Payment for ${rejectedPayment.month} ${rejectedPayment.year} has been removed. Please submit a new payment.`);
  };

  // Calculate time since password change
  const getPasswordChangeTime = () => {
    if (!currentUser?.lastPasswordChange) return 'Never changed';
    
    const lastChange = new Date(currentUser.lastPasswordChange);
    const now = new Date();
    const diffSeconds = Math.floor((now - lastChange) / 1000);
    
    if (diffSeconds < 60) return 'Just now';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
    
    const diffYears = Math.floor(diffMonths / 12);
    return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('❌ New passwords do not match!');
      return;
    }
    
    if (passwordData.newPassword.length < 4) {
      alert('❌ Password must be at least 4 characters long!');
      return;
    }

    try {
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        // Update lastPasswordChange in localStorage
        const updatedUser = { ...currentUser, lastPasswordChange: new Date().toISOString() };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert('✅ Password changed successfully!');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        // Optionally reload the page to reflect changes
        window.location.reload();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      alert(`❌ ${errorMessage}`);
    }
  };

  // Generate PDF documents using jsPDF
  const generateAdmissionLetter = () => {
    const name = profileData.fullName || 'Student Name';
    const id = profileData.studentId || 'Student ID';
    const block = profileData.hostelBlock || 'Hostel Block';
    const room = profileData.roomNumber || 'Room Number';
    const today = new Date().toLocaleDateString();

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Admission Letter', 20, 20);
    doc.setFontSize(11);
    let y = 30;

    const lines = [
      `Date: ${today}`,
      '',
      'To Whom It May Concern,',
      '',
      `This is to confirm that ${name} (Student ID: ${id}) has been admitted to PayMayHostel and assigned accommodation at ${block}, Room ${room}.`,
      '',
      'Please contact the hostel administration for any further details.',
      '',
      'Sincerely,',
      'Hostel Administration'
    ];

    lines.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 170);
      doc.text(wrapped, 20, y);
      y += (wrapped.length * 7) + 2;
    });

    doc.save(`Admission_Letter_${id || 'student'}.pdf`);
  };

  const generateHostelAgreement = () => {
    const name = profileData.fullName || 'Student Name';
    const id = profileData.studentId || 'Student ID';
    const block = profileData.hostelBlock || 'Hostel Block';
    const room = profileData.roomNumber || 'Room Number';
    const today = new Date().toLocaleDateString();

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Hostel Agreement', 20, 20);
    doc.setFontSize(11);
    let y = 30;

    const intro = `Date: ${today}\n\nThis agreement is entered into between PayMayHostel (the "Hostel") and the resident: ${name} (Student ID: ${id}), residing at ${block}, Room ${room}.`;
    const terms = [
      'Terms & Conditions:',
      '1. The resident shall pay the monthly rent on or before the due date.',
      '2. The resident shall maintain cleanliness and adhere to hostel rules.',
      '3. The hostel reserves the right to revoke accommodation for serious violations.'
    ];

    const introWrapped = doc.splitTextToSize(intro, 170);
    doc.text(introWrapped, 20, y);
    y += (introWrapped.length * 7) + 6;

    terms.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 170);
      doc.text(wrapped, 20, y);
      y += (wrapped.length * 7) + 2;
    });

    y += 8;
    const closing = ['By signing below, the resident agrees to the terms stated above.', '', 'Resident Signature: ____________________', `Date: ${today}`, '', 'Hostel Administration'];
    closing.forEach(line => {
      const wrapped = doc.splitTextToSize(line, 170);
      doc.text(wrapped, 20, y);
      y += (wrapped.length * 7) + 2;
    });

    doc.save(`Hostel_Agreement_${id || 'student'}.pdf`);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="user-avatar">
            {currentUser?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <h3>{currentUser?.fullName}</h3>
            <p>{currentUser?.studentId}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-link ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            👤 Profile
          </button>
          <button 
            className={`nav-link ${activeSection === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('payments')}
          >
            💳 Payments
          </button>
          <button 
            className={`nav-link ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            📋 Payment History
          </button>
          <button 
            className={`nav-link ${activeSection === 'room' ? 'active' : ''}`}
            onClick={() => setActiveSection('room')}
          >
            🏠 Room Details
          </button>
          <button 
            className={`nav-link ${activeSection === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveSection('notices')}
          >
            📢 Notices
          </button>
          <button 
            className={`nav-link ${activeSection === 'support' ? 'active' : ''}`}
            onClick={() => setActiveSection('support')}
          >
            💬 Support
          </button>
        </nav>

        <button className="logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>PayMayHostel Dashboard</h1>
            <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="dashboard-content">
          {/* Section Content */}
          {activeSection === 'overview' && (
            <div className="profile-section-vertical">
              <div className="profile-container-vertical">
                {/* Left Sidebar */}
                <div className="profile-sidebar-vertical">
                  <div className="sidebar-profile-card">
                    <div className="sidebar-avatar">
                      {profileData.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <h2>{profileData.fullName}</h2>
                    <p className="sid">{profileData.studentId}</p>
                    <div className="sidebar-status">
                      <span className="status-dot"></span>
                      Active Account
                    </div>
                  </div>

                  <nav className="profile-menu-vertical">
                    <button 
                      className={`menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                      onClick={() => setActiveTab('personal')}
                    >
                      <span className="menu-icon">👤</span>
                      <span>Personal Information</span>
                    </button>
                    <button 
                      className={`menu-item ${activeTab === 'hostel' ? 'active' : ''}`}
                      onClick={() => setActiveTab('hostel')}
                    >
                      <span className="menu-icon">🏠</span>
                      <span>Hostel Details</span>
                    </button>
                    <button 
                      className={`menu-item ${activeTab === 'documents' ? 'active' : ''}`}
                      onClick={() => setActiveTab('documents')}
                    >
                      <span className="menu-icon">📄</span>
                      <span>Documents</span>
                    </button>
                    <button 
                      className={`menu-item ${activeTab === 'security' ? 'active' : ''}`}
                      onClick={() => setActiveTab('security')}
                    >
                      <span className="menu-icon">🔒</span>
                      <span>Security</span>
                    </button>
                  </nav>

                  {!isEditing && (
                    <button className="sidebar-edit-btn" onClick={handleEditClick}>
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>

                {/* Right Content Area */}
                <div className="profile-content-vertical">
                  {!isEditing ? (
                    <div className="vertical-content">
                      {activeTab === 'personal' && (
                        <div className="content-section">
                          <h3>Personal Information</h3>
                          <div className="vertical-detail-item">
                            <label>Full Name</label>
                            <p>{profileData.fullName}</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Student ID</label>
                            <p>{profileData.studentId}</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Email Address</label>
                            <p>{profileData.email}</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Phone Number</label>
                            <p>{profileData.phone}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'hostel' && (
                        <div className="content-section">
                          <h3>Hostel Details</h3>
                          <div className="vertical-detail-item">
                            <label>Hostel Block</label>
                            <p>{profileData.hostelBlock}</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Room Number</label>
                            <p>{profileData.roomNumber}</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Check-in Date</label>
                            <p>January 15, 2024</p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Occupancy Status</label>
                            <p><span className="badge-active">Occupied</span></p>
                          </div>
                          <div className="vertical-detail-item">
                            <label>Rent Amount (Monthly)</label>
                            <p>Rs. 20,000</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'documents' && (
                        <div className="content-section">
                          <h3>My Documents</h3>
                          <div className="document-list-vertical">
                            <div className="doc-item-vertical">
                              <div className="doc-header">
                                <span className="doc-icon-large">📄</span>
                                <div className="doc-meta">
                                  <p className="doc-name">Admission Letter</p>
                                  <p className="doc-date">Uploaded: Jan 10, 2024</p>
                                </div>
                              </div>
                              <button className="download-btn" onClick={generateAdmissionLetter}>📥 Download</button>
                            </div>

                            <div className="doc-item-vertical">
                              <div className="doc-header">
                                <span className="doc-icon-large">📝</span>
                                <div className="doc-meta">
                                  <p className="doc-name">Hostel Agreement</p>
                                  <p className="doc-date">Uploaded: Jan 15, 2024</p>
                                </div>
                              </div>
                              <button className="download-btn" onClick={generateHostelAgreement}>📥 Download</button>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'security' && (
                        <div className="content-section">
                          <h3>Security Settings</h3>
                          <div className="security-item-vertical">
                            <div className="security-info">
                              <h4>Password</h4>
                              <p>Last changed {getPasswordChangeTime()}</p>
                            </div>
                            <button className="security-action-btn" onClick={() => setShowPasswordModal(true)}>Change Password</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="vertical-edit-form">
                      <h3>Edit Your Profile</h3>
                      <form className="edit-form-vertical">
                        <div className="form-group-vertical">
                          <label htmlFor="fullName">Full Name</label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={editData.fullName}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div className="form-group-vertical">
                          <label htmlFor="studentId">Student ID</label>
                          <input
                            type="text"
                            id="studentId"
                            name="studentId"
                            value={editData.studentId}
                            disabled
                          />
                        </div>
                        <div className="form-group-vertical">
                          <label htmlFor="email">Email Address</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={editData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                          />
                        </div>
                        <div className="form-group-vertical">
                          <label htmlFor="phone">Phone Number</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={editData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div className="form-group-vertical">
                          <label htmlFor="hostelBlock">Hostel Block</label>
                          <input
                            type="text"
                            id="hostelBlock"
                            name="hostelBlock"
                            value={editData.hostelBlock}
                            onChange={handleInputChange}
                            placeholder="Enter hostel block"
                          />
                        </div>
                        <div className="form-group-vertical">
                          <label htmlFor="roomNumber">Room Number</label>
                          <input
                            type="text"
                            id="roomNumber"
                            name="roomNumber"
                            value={editData.roomNumber}
                            onChange={handleInputChange}
                            placeholder="Enter room number"
                          />
                        </div>
                      </form>
                      <div className="edit-actions-vertical">
                        <button className="save-btn-vertical" onClick={handleSaveProfile}>💾 Save Changes</button>
                        <button className="cancel-btn-vertical" onClick={handleCancelEdit}>❌ Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="payments-section">
              <h2>Make a Payment</h2>
              <MakePayment onSuccess={handlePaymentSuccess} onAddPayment={addPayment} />
            </div>
          )}

          {activeSection === 'history' && <PaymentHistory paymentHistory={paymentHistory} onResubmit={handleResubmit} />}
          {activeSection === 'room' && <RoomDetails currentUser={currentUser} />}
          {activeSection === 'notices' && <HostelNotices />}
          {activeSection === 'support' && (
            <div className="support-section">
              <h2>Support & Help</h2>
              <div className="support-content">
                <div className="support-card">
                  <h3>📧 Email Support</h3>
                  <p>support@paymyhostel.com</p>
                </div>
                <div className="support-card">
                  <h3>📞 Phone Support</h3>
                  <p>+92 300 1234567</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal onClose={() => setShowPaymentModal(false)} onSuccess={handlePaymentSuccess} />
      )}
      {showReceiptModal && (
        <ReceiptModal onClose={() => setShowReceiptModal(false)} />
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="close-button" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handlePasswordChange} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="pay-button">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
