import React, { useState, useEffect, useCallback } from 'react';
import './HostelNotices.css';
import { noticeAPI } from '../../services/api';

const HostelNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await noticeAPI.getActiveNotices();
      const payload = response?.data;
      const noticeList = Array.isArray(payload) ? payload : payload?.notices || [];
      setNotices(noticeList);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();

    const handleNoticesUpdated = () => fetchNotices();
    window.addEventListener('noticesUpdated', handleNoticesUpdated);

    return () => {
      window.removeEventListener('noticesUpdated', handleNoticesUpdated);
    };
  }, [fetchNotices]);

  const getCategoryConfig = (category) => {
    const configs = {
      'maintenance': { color: '#FF9500', icon: '🔧', bgColor: '#FFF4E6' },
      'payment': { color: '#34C759', icon: '💳', bgColor: '#E8F8F0' },
      'event': { color: '#007AFF', icon: '📅', bgColor: '#E6F3FF' },
      'general': { color: '#8E8E93', icon: '📢', bgColor: '#F2F2F7' }
    };
    return configs[category] || configs['general'];
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      'high': { color: '#FF3B30', icon: '🔴', pulse: true },
      'medium': { color: '#FF9500', icon: '🟡', pulse: false },
      'low': { color: '#34C759', icon: '🟢', pulse: false }
    };
    return configs[priority] || configs['low'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Reset time to compare dates only
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const noticeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffTime = today.getTime() - noticeDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays < 0 && diffDays >= -7) return `In ${Math.abs(diffDays)} days`;
    
    // For older dates, show the actual date
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (loading) {
    return (
      <div className="hostel-notices">
        <div className="notices-header">
          <div className="header-content">
            <h2>📢 Hostel Notices & Announcements</h2>
            <p className="header-subtitle">Stay updated with the latest hostel information</p>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hostel-notices">
      <div className="notices-header">
        <div className="header-content">
          <h2>📢 Hostel Notices & Announcements</h2>
          <p className="header-subtitle">Stay updated with the latest hostel information</p>
        </div>
        <div className="notices-count">
          <span className="count-badge">{notices.length} Active</span>
        </div>
      </div>
      
      {notices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No active notices</h3>
          <p>Check back later for updates and announcements</p>
        </div>
      ) : (
        <div className="notices-container">
          {notices.map((notice, index) => {
            const categoryConfig = getCategoryConfig(notice.type);
            const priorityConfig = getPriorityConfig(notice.priority);
            
            return (
              <div 
                key={notice._id} 
                className={`notice-card ${priorityConfig.pulse ? 'pulse-animation' : ''}`}
                style={{ 
                  '--category-color': categoryConfig.color,
                  '--category-bg': categoryConfig.bgColor,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="notice-accent"></div>
                <div className="notice-content-wrapper">
                  <div className="notice-header">
                    <div className="notice-title-section">
                      <div className="category-icon">{categoryConfig.icon}</div>
                      <h3 className="notice-title">{notice.title}</h3>
                    </div>
                    <div className="notice-badges">
                      <span className="priority-indicator">
                        <span className="priority-icon">{priorityConfig.icon}</span>
                        <span className="priority-text">{notice.priority}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="notice-meta">
                    <div className="notice-date">
                      <span className="date-icon">🕒</span>
                      <span className="date-text">{formatDate(notice.createdAt)}</span>
                    </div>
                    <div className="notice-category">
                      <span 
                        className="category-badge"
                        style={{ 
                          backgroundColor: categoryConfig.color + '20',
                          color: categoryConfig.color,
                          border: `1px solid ${categoryConfig.color}30`
                        }}
                      >
                        {notice.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="notice-body">
                    <p className="notice-text">{notice.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HostelNotices;