import React from 'react';
import './ReceiptModal.css';

const ReceiptModal = ({ onClose }) => {
  const receiptData = {
    receiptNumber: 'RCP-2024-0001',
    date: new Date().toLocaleDateString(),
    amount: 5000,
    description: 'Monthly Hostel Fee',
    studentName: 'Student Name',
    studentId: 'STU-2024-001',
    method: 'Credit Card',
    status: 'Success'
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Receipt downloaded successfully!');
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-header">
          <h2>Payment Receipt</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="receipt-content">
          <div className="receipt-section">
            <div className="section-title">Receipt Details</div>
            <div className="receipt-row">
              <span>Receipt Number:</span>
              <span className="value">{receiptData.receiptNumber}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span className="value">{receiptData.date}</span>
            </div>
          </div>

          <div className="receipt-section">
            <div className="section-title">Student Information</div>
            <div className="receipt-row">
              <span>Name:</span>
              <span className="value">{receiptData.studentName}</span>
            </div>
            <div className="receipt-row">
              <span>Student ID:</span>
              <span className="value">{receiptData.studentId}</span>
            </div>
          </div>

          <div className="receipt-section">
            <div className="section-title">Payment Details</div>
            <div className="receipt-row">
              <span>Description:</span>
              <span className="value">{receiptData.description}</span>
            </div>
            <div className="receipt-row">
              <span>Payment Method:</span>
              <span className="value">{receiptData.method}</span>
            </div>
            <div className="receipt-row">
              <span>Amount:</span>
              <span className="value amount">Rs. {receiptData.amount}</span>
            </div>
            <div className="receipt-row">
              <span>Status:</span>
              <span className="value status-success">✓ {receiptData.status}</span>
            </div>
          </div>

          <div className="receipt-footer">
            <p>Thank you for your payment</p>
          </div>
        </div>

        <div className="receipt-actions">
          <button className="btn-print" onClick={handlePrint}>🖨️ Print</button>
          <button className="btn-download" onClick={handleDownload}>⬇️ Download</button>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;