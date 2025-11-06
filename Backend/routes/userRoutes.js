const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserOrders,
  getActiveOrders
} = require('../controller/userController');

// Endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/:id/orders', getUserOrders);
router.get('/:id/progress', getActiveOrders);

module.exports = router;
