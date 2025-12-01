import React, { useState } from 'react';
import './PaymentModal.css';

const PaymentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'card',
    description: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Make a Payment</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="amount">Amount to Pay (Rs.) *</label>
            <div className="amount-input-wrapper">
              <span className="currency">Rs.</span>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                step="100"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method *</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
            >
              <option value="card">Credit/Debit Card</option>
              <option value="bank">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="wallet">Digital Wallet</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Payment Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Monthly hostel fee"
              rows="3"
            />
          </div>

          <div className="payment-summary">
            <div className="summary-row">
              <span>Amount:</span>
              <span className="amount">Rs. {formData.amount || '0'}</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span className="amount">Rs. {formData.amount || '0'}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="pay-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
