import React from 'react';
import './PaymentHistory.css';

const PaymentHistory = ({ paymentHistory = [], onResubmit }) => {

  const handleResubmit = (payment) => {
    if (window.confirm(`Resubmit payment for ${payment.month} ${payment.year}?`)) {
      onResubmit(payment);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success':
        return '✓ Success';
      case 'rejected':
        return '✗ Rejected';
      case 'pending':
        return '⏳ Pending';
      default:
        return status;
    }
  };

  return (
    <div className="payment-history">
      <h2>Payment History</h2>
      <div className="history-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Month</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paymentHistory.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                  No payment history available
                </td>
              </tr>
            ) : (
              paymentHistory.map((payment, index) => (
                <tr key={payment.id || index}>
                  <td>{payment.date}</td>
                  <td>{payment.month || 'N/A'}</td>
                  <td>{payment.year || 'N/A'}</td>
                  <td className="amount">Rs. {payment.amount}</td>
                  <td>{payment.method}</td>
                  <td className="reference">{payment.reference}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {getStatusBadge(payment.status)}
                    </span>
                  </td>
                  <td>
                    {payment.status === 'rejected' && (
                      <button 
                        className="btn-resubmit"
                        onClick={() => handleResubmit(payment)}
                      >
                        🔄 Resubmit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;
