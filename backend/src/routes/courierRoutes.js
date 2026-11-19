const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');
const { authenticateToken, requireRoles } = require('../middleware/authMiddleware');

// All courier routes require authentication and courier/admin role
router.use(authenticateToken, requireRoles('courier', 'admin'));

// Courier deliveries and workflows
router.get('/profile', courierController.getCourierProfile);
router.get('/deliveries', courierController.getAssignedDeliveries);
router.get('/available', courierController.getAvailableDeliveries);
router.post('/deliveries/:orderId/accept', courierController.acceptDelivery);
router.put('/deliveries/:orderId/status', courierController.updateDeliveryStatus);
router.put('/availability', courierController.toggleAvailability);

module.exports = router;
