const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');
const { validateOrderBooking } = require('../middleware/validateMiddleware');

// Public tracking lookup route
router.get('/track/:trackingNumber', orderController.trackByNumber);

// Customer parcel booking & history (requires authenticated user)
router.post('/', authenticateToken, requireRoles('customer', 'admin'), validateOrderBooking, orderController.createOrder);
router.get('/my-orders', authenticateToken, requireRoles('customer'), orderController.getMyOrders);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id/cancel', authenticateToken, requireRoles('customer', 'admin'), orderController.cancelOrder);
router.post('/:id/feedback', authenticateToken, requireRoles('customer'), orderController.submitFeedback);

module.exports = router;
