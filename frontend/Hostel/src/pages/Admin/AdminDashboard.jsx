import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import api, { userAPI, paymentAPI, noticeAPI, roomAPI, adminAPI } from '../../services/api';

const BLOCKS = ['A', 'B', 'C', 'D'];
const ROOMS_PER_BLOCK = 10;
const DEFAULT_ROOM_CAPACITY = 2;

const normalizeRoomNumber = (value) => String(value || '').padStart(2, '0');

const buildRoomList = (roomDocs, studentList) => {
  const studentMap = new Map();

  studentList.forEach(student => {
    if (!student.block || !student.room) return;
    const block = student.block;
    const cleanedRoom = student.room.replace(block, '').trim();
    const roomNumber = normalizeRoomNumber(cleanedRoom || student.room);
    const key = `${block}-${roomNumber}`;
    if (!studentMap.has(key)) {
      studentMap.set(key, []);
    }
    studentMap.get(key).push(student.studentId || student.name || 'Student');
  });

  const roomMap = new Map();

  roomDocs.forEach(room => {
    const block = room.hostelBlock || 'A';
    const roomNumber = normalizeRoomNumber(room.roomNumber);
    const key = `${block}-${roomNumber}`;
    const capacity = room.capacity || DEFAULT_ROOM_CAPACITY;
    const residents = (room.residents || []).map(res => res.fullName || res.studentId || 'Student');
    const assignedStudents = studentMap.get(key) || residents;
    const students = assignedStudents.slice(0, capacity);
    while (students.length < Math.max(capacity, DEFAULT_ROOM_CAPACITY)) {
      students.push('-');
    }

    // Calculate actual occupancy based on real students (not dashes)
    const actualStudents = assignedStudents.filter(student => student && student !== '-');
    const occupancy = Math.min(actualStudents.length, capacity);

    roomMap.set(key, {
      id: room._id,
      key,
      block,
      roomNumber,
      capacity,
      students: [students[0] || '-', students[1] || '-'],
      occupancy,
      status: room.status || 'available',
      monthlyRent: room.monthlyRent || 0
    });
  });

  const rooms = [];

  BLOCKS.forEach(block => {
    for (let i = 1; i <= ROOMS_PER_BLOCK; i += 1) {
      const roomNumber = normalizeRoomNumber(i);
      const key = `${block}-${roomNumber}`;

      if (roomMap.has(key)) {
        rooms.push(roomMap.get(key));
      } else {
        const assignedStudents = studentMap.get(key) || [];
        const students = assignedStudents.slice(0, 2);
        while (students.length < 2) {
          students.push('-');
        }

        // Calculate actual occupancy based on real students (not dashes)
        const actualStudents = assignedStudents.filter(student => student && student !== '-');
        const occupancy = Math.min(actualStudents.length, DEFAULT_ROOM_CAPACITY);

        rooms.push({
          id: key,
          key,
          block,
          roomNumber,
          capacity: DEFAULT_ROOM_CAPACITY,
          students,
          occupancy,
          status: 'available',
          monthlyRent: 0
        });
      }
    }
  });

  return rooms;
};

const AdminDashboard = ({ onLogout, currentUser }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(null);
  
  // Notices state
  const [notices, setNotices] = useState([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [noticeFormData, setNoticeFormData] = useState({
    title: '',
    content: '',
    type: 'maintenance',
    priority: 'medium'
  });

  // Load students from API
  const [students, setStudents] = useState([]);

  // Load payments from API
  const [payments, setPayments] = useState([]);

  // Load rooms from API
  const [rawRooms, setRawRooms] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Fetch all data on mount
  useEffect(() => {
    fetchStudents();
    fetchPayments();
    fetchNotices();
    fetchRooms();

    const handleStudentRegistered = () => {
      fetchStudents();
      fetchRooms();
    };

    window.addEventListener('studentRegistered', handleStudentRegistered);

    return () => {
      window.removeEventListener('studentRegistered', handleStudentRegistered);
    };
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await userAPI.getStudents();
      console.log('Fetch students response:', response.data);
      const studentsData = response.data.students || [];
      console.log('Raw students data:', studentsData);
      const mappedStudents = studentsData.map(s => ({
        id: s._id,
        name: s.fullName,
        studentId: s.studentId,
        email: s.email,
        phone: s.phone,
        block: s.hostelBlock,
        room: s.roomNumber,
        status: 'Active'
      }));
      console.log('Mapped students:', mappedStudents);
      setStudents(mappedStudents);
    } catch (error) {
      console.error('Failed to fetch students:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getAllPayments();
      const payments = response.data.payments || [];
      setPayments(payments.map(p => ({
        id: p._id,
        student: p.user?.fullName || 'Unknown',
        studentId: p.user?.studentId || 'N/A',
        amount: p.amount,
        status: p.status,
        month: p.month,
        year: p.year,
        date: new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        reference: p.reference,
        description: p.description,
        receipt: p.bankSlip,
        rejectionReason: p.rejectionReason
      })));
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await noticeAPI.getAllNotices();
      const noticeList = Array.isArray(response?.data)
        ? response.data
        : response?.data?.notices || [];

      setNotices(noticeList.map(n => ({
        id: n._id,
        title: n.title,
        content: n.content,
        type: n.type,
        priority: n.priority,
        date: new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        isActive: n.isActive
      })));
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAllRooms();
      const roomsData = response.data.rooms || [];
      setRawRooms(roomsData);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    setRooms(buildRoomList(rawRooms, students));
  }, [rawRooms, students]);

  // Filter rooms based on selected block and room
  const filteredRooms = rooms.filter(room => {
    if (selectedBlock && room.block !== selectedBlock) return false;
    if (selectedRoom && room.roomNumber !== selectedRoom) return false;
    return true;
  });

  // Get available room numbers for selected block
  const availableRooms = selectedBlock 
    ? rooms.filter(r => r.block === selectedBlock).map(r => r.roomNumber)
    : [];

  const handleApprovePayment = async (id) => {
    try {
      await adminAPI.approvePayment(id);
      alert('Payment approved successfully!');
      fetchPayments(); // Refresh payments
      window.dispatchEvent(new CustomEvent('paymentStatusUpdated', { detail: { paymentId: id, status: 'success' } }));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (id) => {
    const rejectionReason = prompt('Enter rejection reason (optional):');
    if (rejectionReason === null) return; // User cancelled
    
    try {
      await adminAPI.rejectPayment(id, rejectionReason || 'Invalid payment details');
      alert('Payment rejected. Student can resubmit the payment.');
      fetchPayments(); // Refresh payments
        window.dispatchEvent(new CustomEvent('paymentStatusUpdated', { detail: { paymentId: id, status: 'rejected' } }));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleViewReceipt = (payment) => {
    setSelectedReceipt(payment);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    if (!payment.receipt) {
      alert('Receipt file is not available yet.');
      return;
    }

    try {
      const baseUrl = (api.defaults.baseURL || '').replace(/\/api\/?$/, '') || window.location.origin;
      const normalizedReceipt = payment.receipt.replace(/^\//, '');
      const fileUrl = `${baseUrl}/${normalizedReceipt}`.replace(/([^:]\/)\//g, '$1');
      const fileName = normalizedReceipt.split('/').pop() || `${payment.reference || 'payment'}-receipt`;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Unable to download receipt. Please try again.');
    }
  };

  const handleViewDescription = (payment) => {
    setSelectedDescription(payment);
    setShowDescriptionModal(true);
  };

  // Student management handlers
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    block: '',
    room: '',
    status: 'Active'
  });

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setStudentFormData({
      name: student.name,
      studentId: student.studentId,
      email: student.email,
      phone: student.phone,
      block: student.block,
      room: student.room,
      status: student.status
    });
    setShowEditStudentModal(true);
  };

  const handleDeleteStudent = async (studentMongoId) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove their payment history.')) {
      try {
        console.log('Delete attempt for student ID:', studentMongoId);
        const student = students.find(s => s.id === studentMongoId);
        if (!student) {
          console.error('Student not found in local state');
          alert('Student not found in local data');
          return;
        }
        console.log('Found student to delete:', student);

        const response = await userAPI.deleteUser(studentMongoId);
        console.log('Delete response:', response);
        alert('Student deleted successfully!');
        fetchStudents(); // Refresh students
        fetchPayments(); // Refresh payments (they'll be filtered by backend)
      } catch (error) {
        console.error('Delete error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          studentId: studentMongoId
        });
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete student';
        alert(`Error deleting student: ${errorMessage}`);
      }
    }
  };

  const handleSaveStudent = async () => {
    if (!studentFormData.name || !studentFormData.email) {
      alert('Please fill in all required fields (Name and Email)');
      return;
    }

    try {
      console.log('Update attempt for student:', {
        id: editingStudent.id,
        data: {
          fullName: studentFormData.name,
          email: studentFormData.email,
          phone: studentFormData.phone,
          hostelBlock: studentFormData.block,
          roomNumber: studentFormData.room
        }
      });

      const response = await userAPI.updateUser(editingStudent.id, {
        fullName: studentFormData.name,
        email: studentFormData.email,
        phone: studentFormData.phone,
        hostelBlock: studentFormData.block,
        roomNumber: studentFormData.room
      });
      
      console.log('Update response:', response);
      setShowEditStudentModal(false);
      setEditingStudent(null);
      setStudentFormData({
        name: '',
        studentId: '',
        email: '',
        phone: '',
        block: '',
        room: '',
        status: 'Active'
      });
      alert('Student updated successfully!');
      fetchStudents(); // Refresh students
    } catch (error) {
      console.error('Update error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        studentId: editingStudent.id
      });
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update student';
      alert(`Error updating student: ${errorMessage}`);
    }
  };

  // Notice handlers
  const handleAddNotice = () => {
    setEditingNotice(null);
    setNoticeFormData({ title: '', content: '', type: 'maintenance', priority: 'medium' });
    setShowNoticeForm(true);
  };

  const handleEditNotice = (notice) => {
    setEditingNotice(notice);
    setNoticeFormData({ title: notice.title, content: notice.content, type: notice.type, priority: notice.priority });
    setShowNoticeForm(true);
  };

  const handleDeleteNotice = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await noticeAPI.deleteNotice(id);
        alert('Notice deleted successfully!');
        fetchNotices(); // Refresh notices
        window.dispatchEvent(new Event('noticesUpdated'));
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete notice');
      }
    }
  };

  const handleSaveNotice = async () => {
    if (!noticeFormData.title || !noticeFormData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingNotice) {
        await noticeAPI.updateNotice(editingNotice.id, noticeFormData);
        alert('Notice updated successfully!');
      } else {
        await noticeAPI.createNotice(noticeFormData);
        alert('Notice created successfully!');
      }
      setShowNoticeForm(false);
      setEditingNotice(null);
      setNoticeFormData({ title: '', content: '', type: 'maintenance', priority: 'medium' });
      fetchNotices(); // Refresh notices
      window.dispatchEvent(new Event('noticesUpdated'));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save notice');
    }
  };

  // Filter payments by month and year
  const filteredPayments = payments.filter(p => {
    if (selectedMonth && p.month !== selectedMonth) return false;
    if (selectedYear && p.year !== selectedYear) return false;
    return true;
  });

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>🛡️ Admin Panel</h2>
          <p>{currentUser?.fullName}</p>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-link ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'students' ? 'active' : ''}`}
            onClick={() => setActiveSection('students')}
          >
            👥 Students
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('payments')}
          >
            💰 All Payments
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'pending-payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('pending-payments')}
          >
            ⏳ Pending Payments
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'approved-payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('approved-payments')}
          >
            ✅ Approved Payments
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'rejected-payments' ? 'active' : ''}`}
            onClick={() => setActiveSection('rejected-payments')}
          >
            ❌ Rejected Payments
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveSection('rooms')}
          >
            🏠 Rooms
          </button>
          <button 
            className={`admin-nav-link ${activeSection === 'notices' ? 'active' : ''}`}
            onClick={() => setActiveSection('notices')}
          >
            📢 Notices
          </button>
        </nav>

        <button className="admin-logout-button" onClick={onLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1>PayMayHostel Admin Dashboard</h1>
        </div>

        <div className="admin-content">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{students.length}</h3>
                    <p>Total Students</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{payments.filter(p => p.status === 'pending').length}</h3>
                    <p>Pending Payments</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <h3>{payments.filter(p => p.status === 'success').length}</h3>
                    <p>Approved Payments</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-info">
                    <h3>Rs. {payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Section */}
          {activeSection === 'students' && (
            <div className="students-section">
              <h2>Student Management</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Name</th>
                      <th>Block</th>
                      <th>Room</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          No students registered yet
                        </td>
                      </tr>
                    ) : (
                      students.map(student => (
                        <tr key={student.id}>
                          <td>{student.studentId}</td>
                          <td>{student.name}</td>
                          <td>{student.block}</td>
                          <td>{student.room}</td>
                          <td><span className="badge-active">{student.status}</span></td>
                          <td>
                            <button className="btn-view" onClick={() => handleViewStudent(student)}>View</button>
                            <button className="btn-edit" onClick={() => handleEditStudent(student)}>Edit</button>
                            <button className="btn-delete" onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Payments Section */}
          {activeSection === 'payments' && (
            <div className="payments-section">
              <div className="section-header">
                <h2>All Payments</h2>
                <div className="room-filters">
                  <div className="filter-group">
                    <label htmlFor="monthFilter">Filter by Month:</label>
                    <select 
                      id="monthFilter"
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="yearFilter">Filter by Year:</label>
                    <select 
                      id="yearFilter"
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.reference}</td>
                        <td>{payment.student}</td>
                        <td>Rs. {payment.amount.toLocaleString()}</td>
                        <td>{payment.month}</td>
                        <td>{payment.year}</td>
                        <td>{payment.date}</td>
                        <td>
                          <span className={`status-text ${payment.status}`}>
                            {payment.status === 'pending' ? 'Pending' : payment.status === 'success' ? 'Approved' : 'Rejected'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Payments Section */}
          {activeSection === 'pending-payments' && (
            <div className="payments-section">
              <h2>Pending Payments</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Date</th>
                      <th>Receipt</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.filter(p => p.status === 'pending').map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.reference}</td>
                        <td>{payment.student}</td>
                        <td>Rs. {payment.amount.toLocaleString()}</td>
                        <td>{payment.month}</td>
                        <td>{payment.year}</td>
                        <td>{payment.date}</td>
                        <td>
                          <button 
                            className="btn-view-small"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            📄 View
                          </button>
                        </td>
                        <td>
                          <button 
                            className="btn-view-small"
                            onClick={() => handleViewDescription(payment)}
                          >
                            📝 View
                          </button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-approve"
                              onClick={() => handleApprovePayment(payment.id)}
                            >
                              Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => handleRejectPayment(payment.id)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.filter(p => p.status === 'pending').length === 0 && (
                  <div className="no-data">
                    <p>No pending payments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approved Payments Section */}
          {activeSection === 'approved-payments' && (
            <div className="payments-section">
              <div className="section-header">
                <h2>Approved Payments</h2>
                <div className="room-filters">
                  <div className="filter-group">
                    <label htmlFor="monthFilterApproved">Filter by Month:</label>
                    <select 
                      id="monthFilterApproved"
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="yearFilterApproved">Filter by Year:</label>
                    <select 
                      id="yearFilterApproved"
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.filter(p => p.status === 'success').map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.reference}</td>
                        <td>{payment.student}</td>
                        <td>Rs. {payment.amount.toLocaleString()}</td>
                        <td>{payment.month}</td>
                        <td>{payment.year}</td>
                        <td>{payment.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPayments.filter(p => p.status === 'success').length === 0 && (
                  <div className="no-data">
                    <p>No approved payments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rejected Payments Section */}
          {activeSection === 'rejected-payments' && (
            <div className="payments-section">
              <div className="section-header">
                <h2>Rejected Payments</h2>
                <div className="room-filters">
                  <div className="filter-group">
                    <label htmlFor="monthFilterRejected">Filter by Month:</label>
                    <select 
                      id="monthFilterRejected"
                      value={selectedMonth} 
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="yearFilterRejected">Filter by Year:</label>
                    <select 
                      id="yearFilterRejected"
                      value={selectedYear} 
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Student</th>
                      <th>Amount</th>
                      <th>Month</th>
                      <th>Year</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.filter(p => p.status === 'rejected').map(payment => (
                      <tr key={payment.id}>
                        <td>{payment.reference}</td>
                        <td>{payment.student}</td>
                        <td>Rs. {payment.amount.toLocaleString()}</td>
                        <td>{payment.month}</td>
                        <td>{payment.year}</td>
                        <td>{payment.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPayments.filter(p => p.status === 'rejected').length === 0 && (
                  <div className="no-data">
                    <p>No rejected payments</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rooms Section */}
          {activeSection === 'rooms' && (
            <div className="rooms-section">
              <div className="section-header">
                <h2>Room Management</h2>
                <div className="room-filters">
                  <div className="filter-group">
                    <label htmlFor="blockFilter">Block:</label>
                    <select 
                      id="blockFilter"
                      value={selectedBlock} 
                      onChange={(e) => {
                        setSelectedBlock(e.target.value);
                        setSelectedRoom(''); // Reset room when block changes
                      }}
                    >
                      <option value="">All Blocks</option>
                      <option value="A">Block A</option>
                      <option value="B">Block B</option>
                      <option value="C">Block C</option>
                      <option value="D">Block D</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label htmlFor="roomFilter">Room Number:</label>
                    <select 
                      id="roomFilter"
                      value={selectedRoom} 
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      disabled={!selectedBlock}
                    >
                      <option value="">All Rooms</option>
                      {availableRooms.map(room => (
                        <option key={room} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Block</th>
                      <th>Room Number</th>
                      <th>Student 1</th>
                      <th>Student 2</th>
                      <th>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRooms.map(room => (
                      <tr key={room.id}>
                        <td>{room.block}</td>
                        <td>{room.roomNumber}</td>
                        <td>{room.students[0]}</td>
                        <td>{room.students[1]}</td>
                        <td>
                          <span className="occupancy-badge">
                            {room.occupancy}/{room.capacity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notices Section */}
          {activeSection === 'notices' && (
            <div className="notices-section">
              <div className="section-header">
                <h2>Notice Management</h2>
                <button className="btn-add-notice" onClick={handleAddNotice}>
                  ➕ Add New Notice
                </button>
              </div>
              
              <div className="notices-grid">
                {notices.map(notice => (
                  <div key={notice.id} className={`notice-card priority-${notice.priority}`}>
                    <div className="notice-header">
                      <h3>{notice.title}</h3>
                      <span className={`notice-type ${notice.type}`}>{notice.type}</span>
                    </div>
                    <p className="notice-content">{notice.content}</p>
                    <div className="notice-footer">
                      <span className="notice-date">{notice.date}</span>
                      <div className="notice-actions">
                        <button className="btn-edit" onClick={() => handleEditNotice(notice)}>✏️ Edit</button>
                        <button className="btn-delete" onClick={() => handleDeleteNotice(notice.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notice Form Modal */}
              {showNoticeForm && (
                <div className="modal-overlay" onClick={() => setShowNoticeForm(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h3>{editingNotice ? 'Edit Notice' : 'Add New Notice'}</h3>
                    <div className="form-group">
                      <label>Title *</label>
                      <input
                        type="text"
                        value={noticeFormData.title}
                        onChange={(e) => setNoticeFormData({...noticeFormData, title: e.target.value})}
                        placeholder="Enter notice title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Content *</label>
                      <textarea
                        value={noticeFormData.content}
                        onChange={(e) => setNoticeFormData({...noticeFormData, content: e.target.value})}
                        placeholder="Enter notice content"
                        rows="5"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select
                          value={noticeFormData.type}
                          onChange={(e) => setNoticeFormData({...noticeFormData, type: e.target.value})}
                        >
                          <option value="maintenance">Maintenance</option>
                          <option value="payment">Payment</option>
                          <option value="event">Event</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Priority</label>
                        <select
                          value={noticeFormData.priority}
                          onChange={(e) => setNoticeFormData({...noticeFormData, priority: e.target.value})}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-actions">
                      <button className="btn-cancel" onClick={() => setShowNoticeForm(false)}>Cancel</button>
                      <button className="btn-save" onClick={handleSaveNotice}>Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Student View Modal */}
      {showStudentModal && selectedStudent && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content student-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Student Details</h3>
            <div className="student-details">
              <div className="detail-row">
                <span className="detail-label">Student ID:</span>
                <span className="detail-value">{selectedStudent.studentId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedStudent.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Block:</span>
                <span className="detail-value">{selectedStudent.block}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Room:</span>
                <span className="detail-value">{selectedStudent.room}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className="detail-value">
                  <span className="badge-active">{selectedStudent.status}</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment History:</span>
                <span className="detail-value">
                  {payments.filter(p => p.studentId === selectedStudent.studentId).length} payments
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowStudentModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Payment Receipt</h3>
            <div className="receipt-details">
              <div className="detail-row">
                <span className="detail-label">Reference Number:</span>
                <span className="detail-value">{selectedReceipt.reference}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Student Name:</span>
                <span className="detail-value">{selectedReceipt.student}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">Rs. {selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Month:</span>
                <span className="detail-value">{selectedReceipt.month} {selectedReceipt.year}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Date Submitted:</span>
                <span className="detail-value">{selectedReceipt.date}</span>
              </div>
              <div className="receipt-preview">
                <p className="preview-label">Receipt File:</p>
                <div className="file-info">
                  <span className="file-icon">📄</span>
                  <span className="file-name">{selectedReceipt.receipt}</span>
                </div>
                <button className="btn-download" onClick={() => handleDownloadReceipt(selectedReceipt)}>Download Receipt</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReceiptModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Description View Modal */}
      {showDescriptionModal && selectedDescription && (
        <div className="modal-overlay" onClick={() => setShowDescriptionModal(false)}>
          <div className="modal-content description-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Payment Description</h3>
            <div className="description-details">
              <div className="detail-row">
                <span className="detail-label">Reference:</span>
                <span className="detail-value">{selectedDescription.reference}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Student:</span>
                <span className="detail-value">{selectedDescription.student}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">Rs. {selectedDescription.amount.toLocaleString()}</span>
              </div>
              <div className="description-content">
                <p className="content-label">Description:</p>
                <p className="content-text">{selectedDescription.description}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDescriptionModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && (
        <div className="modal-overlay" onClick={() => setShowEditStudentModal(false)}>
          <div className="modal-content edit-student-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Student</h3>
            <div className="edit-student-form">
              <div className="form-group">
                <label htmlFor="editName">Name:</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  placeholder="Student Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editStudentId">Student ID:</label>
                <input
                  type="text"
                  id="editStudentId"
                  name="studentId"
                  value={studentFormData.studentId}
                  readOnly
                  placeholder="Student ID"
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">Email:</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={studentFormData.email}
                  onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                  placeholder="Email Address"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPhone">Phone:</label>
                <input
                  type="text"
                  id="editPhone"
                  name="phone"
                  value={studentFormData.phone}
                  onChange={(e) => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                  placeholder="Phone Number"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="editBlock">Block:</label>
                  <select
                    id="editBlock"
                    name="block"
                    value={studentFormData.block}
                    onChange={(e) => setStudentFormData({ ...studentFormData, block: e.target.value })}
                  >
                    <option value="">Select Block</option>
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="editRoom">Room:</label>
                  <select
                    id="editRoom"
                    name="room"
                    value={studentFormData.room}
                    onChange={(e) => setStudentFormData({ ...studentFormData, room: e.target.value })}
                  >
                    <option value="">Select Room</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        Room {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="editStatus">Status:</label>
                <select
                  id="editStatus"
                  name="status"
                  value={studentFormData.status}
                  onChange={(e) => setStudentFormData({ ...studentFormData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSaveStudent}>Save Changes</button>
              <button className="btn-cancel" onClick={() => setShowEditStudentModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
