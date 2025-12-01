import React, { useState } from 'react';
import './MakePayment.css';
import { paymentAPI } from '../../services/api';

const MakePayment = ({ onAddPayment }) => {
  const [formData, setFormData] = useState({
    amount: '20000',
    paymentMethod: 'card',
    description: '',
    paymentMonth: '',
    paymentYear: new Date().getFullYear().toString()
  });
  const [bankSlipFile, setBankSlipFile] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bankSlip' && files && files[0]) {
      setBankSlipFile(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!formData.paymentMonth) {
      alert('Please select a payment month');
      return;
    }

    if (!bankSlipFile) {
      alert('Please upload a bank slip');
      return;
    }

    setIsProcessing(true);
    
    try {
      const paymentFormData = new FormData();
      paymentFormData.append('amount', formData.amount);
      paymentFormData.append('month', formData.paymentMonth);
      paymentFormData.append('year', formData.paymentYear);
      paymentFormData.append('paymentDate', new Date().toISOString());
      paymentFormData.append('description', formData.description);
      paymentFormData.append('bankSlip', bankSlipFile);
      
      await paymentAPI.submitPayment(paymentFormData);
      
      setShowSuccess(true);
      
      if (onAddPayment) {
        onAddPayment();
      }
      
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          amount: '20000',
          paymentMethod: 'card',
          description: '',
          paymentMonth: '',
          paymentYear: new Date().getFullYear().toString()
        });
        setBankSlipFile(null);
        document.getElementById('bankSlip').value = '';
      }, 2000);
    } catch (error) {
      console.error('Payment submission error:', error);
      alert(error.response?.data?.message || 'Payment submission failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="make-payment">
      <h2>Make a Payment</h2>
      
      <div className="hostel-bank-details">
        <h3>📋 Hostel Payment Details</h3>
        <div className="bank-info">
          <div className="bank-detail-item">
            <span className="detail-label">Bank Name:</span>
            <span className="detail-value">BOC</span>
          </div>
          <div className="bank-detail-item">
            <span className="detail-label">Branch:</span>
            <span className="detail-value">Matara</span>
          </div>
          <div className="bank-detail-item">
            <span className="detail-label">Account Number:</span>
            <span className="detail-value">1753466</span>
          </div>
        </div>
        <p className="bank-note">Please use the above details to make your payment and upload the bank slip below.</p>
      </div>
      
      <div className="payment-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-section">
            <h3>Payment Information</h3>
            
            <div className="form-group">
              <label htmlFor="amount">Amount (Rs.) *</label>
              <div className="amount-input-wrapper">
                <span className="currency-prefix">Rs.</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  readOnly
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bankSlip">Upload Bank Slip *</label>
              <input
                type="file"
                id="bankSlip"
                name="bankSlip"
                accept="image/*,.pdf"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="paymentMonth">Payment Month *</label>
              <select
                id="paymentMonth"
                name="paymentMonth"
                value={formData.paymentMonth}
                onChange={handleChange}
                required
              >
                <option value="">Select Month</option>
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

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add any notes about this payment..."
                rows="4"
              />
            </div>
          </div>

          <div className="payment-summary">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Amount:</span>
              <span className="amount">Rs. {parseFloat(formData.amount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total Amount:</span>
              <span className="total-amount">Rs. {parseFloat(formData.amount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isProcessing}>
              {isProcessing ? '⏳ Processing...' : '✓ Confirm Payment'}
            </button>
          </div>
        </form>

        {showSuccess && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p>Your payment has been processed successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakePayment;
