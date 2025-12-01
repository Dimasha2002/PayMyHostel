import React, { useState, useEffect } from 'react';
import './RoomDetails.css';
import { userAPI } from '../../services/api';

const RoomDetails = ({ currentUser }) => {
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getRoommates();
        if (response.data.success) {
          setRoommates(response.data.roommates);
        }
      } catch (error) {
        console.error('Failed to fetch roommates:', error);
        setRoommates([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRoommates();
    }
  }, [currentUser]);

  const getRoomType = () => {
    if (!roommates.length) return 'Single Occupancy';
    if (roommates.length === 1) return 'Double Sharing';
    if (roommates.length === 2) return 'Triple Sharing';
    return 'Multiple Sharing';
  };

  const getFloorNumber = (hostelBlock) => {
    if (!hostelBlock) return '-';
    const floorMapping = {
      'A': '1st',
      'B': '2nd', 
      'C': '3rd',
      'D': '4th'
    };
    const floor = floorMapping[hostelBlock.toUpperCase()];
    return floor ? `${floor} Floor` : '-';
  };

  return (
    <div className="room-details">
      <h2>Room & Hostel Information</h2>
      <div className="room-grid">
        <div className="room-card">
          <div className="card-header">🏠 Room Details</div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Block:</span>
              <span className="value">{currentUser?.hostelBlock || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Room Number:</span>
              <span className="value">{currentUser?.roomNumber || '-'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Room Type:</span>
              <span className="value">{getRoomType()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Floor:</span>
              <span className="value">{getFloorNumber(currentUser?.hostelBlock)}</span>
            </div>
          </div>
        </div>

        <div className="room-card">
          <div className="card-header">👥 Roommate Information</div>
          <div className="card-body">
            {loading ? (
              <div className="detail-row">
                <span className="loading-text">Loading roommates...</span>
              </div>
            ) : roommates.length > 0 ? (
              roommates.map((roommate, index) => (
                <div key={roommate._id}>
                  <div className="detail-row">
                    <span className="label">Roommate {index + 1}:</span>
                    <span className="value">{roommate.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Contact:</span>
                    <span className="value">{roommate.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Student ID:</span>
                    <span className="value">{roommate.studentId}</span>
                  </div>
                  {index < roommates.length - 1 && <div className="roommate-divider"></div>}
                </div>
              ))
            ) : (
              <>
                <div className="detail-row">
                  <span className="label">Roommate:</span>
                  <span className="value no-data">-</span>
                </div>
                <div className="detail-row">
                  <span className="label">Contact:</span>
                  <span className="value no-data">-</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="room-card">
          <div className="card-header">📋 Hostel Information</div>
          <div className="card-body">
            <div className="detail-row">
              <span className="label">Hostel Name:</span>
              <span className="value">UniHostel</span>
            </div>
            <div className="detail-row">
              <span className="label">Location:</span>
              <span className="value">First Lane, New City</span>
            </div>
            <div className="detail-row">
              <span className="label">Contact:</span>
              <span className="value">+94 71 775 4075</span>
            </div>
          </div>
        </div>

        <div className="room-card">
          <div className="card-header">⚙️ Room Facilities</div>
          <div className="card-body facilities">
            <div className="facility">✓ WiFi</div>
            <div className="facility">✓ AC</div>
            <div className="facility">✓ Hot Water</div>
            <div className="facility">✓ Study Desk</div>
            <div className="facility">✓ Wardrobe</div>
            <div className="facility">✓ Bed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;