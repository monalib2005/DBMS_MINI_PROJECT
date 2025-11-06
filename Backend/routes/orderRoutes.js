const express = require('express');
const router = express.Router();
const {
  addOrUpdateCartItem,
  getCartItems,
  removeCartItem,
  proceedToOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controller/orderController');

// User places order

router.post('/cart',addOrUpdateCartItem);

router.get('/cart/:user_id',getCartItems);

router.delete('/cart/:user_id/:item_id',removeCartItem);

router.post('/order',proceedToOrder);

router.get("/user/:user_id", getUserOrders);

// ✅ GET all orders
router.get("/verify-order", getAllOrders);

// ✅ PATCH order status
router.patch("/:order_uuid", updateOrderStatus);

// Admin verifies QR


module.exports = router;
