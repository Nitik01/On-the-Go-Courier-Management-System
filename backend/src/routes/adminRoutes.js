const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(authenticateToken, requireRoles('admin'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/orders', adminController.getAllOrders);
router.post('/orders/:orderId/assign', adminController.assignCourier);
router.get('/couriers', adminController.getAllCouriers);
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/toggle-status', adminController.toggleUserStatus);
router.get('/reports', adminController.getSummaryReports);

module.exports = router;
