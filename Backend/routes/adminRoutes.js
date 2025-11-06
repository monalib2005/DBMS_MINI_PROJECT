const express = require('express');
const router = express.Router();
const {
  adminRegister,
  adminLogin,
  getAllOrders,
  updateOrderStatus,
  verifyOrderQR
} = require('../controller/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Admin login (no auth)
router.post('/register',adminRegister);
router.post('/login', adminLogin);

// Protected routes
router.get('/orders', verifyToken, verifyAdmin, getAllOrders);
router.patch('/orders/:order_uuid', verifyToken, verifyAdmin, updateOrderStatus);
router.post('/verify-order', verifyToken, verifyAdmin, verifyOrderQR);

module.exports = router;
