const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Public route
router.post('/login', adminController.adminLogin);

// Protected admin routes
router.get('/stats', protect, authorize('admin'), adminController.getDashboardStats);
router.get('/rooms', protect, authorize('admin'), adminController.getRoomOccupancy);
router.put('/payments/:id/approve', protect, authorize('admin'), adminController.approvePayment);
router.put('/payments/:id/reject', protect, authorize('admin'), adminController.rejectPayment);

module.exports = router;
