const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.adminRegister = async (req, res) => {
  try {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ error: 'Name, username and password are required' });
    }

    // Check if username already exists
    const existingAdmin = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    const result = await pool.query(
      `INSERT INTO admins (username, password, name) 
       VALUES ($1, $2, $3) RETURNING admin_id, username, name, created_at`,
      [username, hashedPassword, name]
    );

    const admin = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { id: admin.admin_id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin
    });
  } catch (err) {
    console.error('Error during admin registration:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};


// ✅ Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Query from admins table, not users
    const adminResult = await pool.query(
      'SELECT * FROM admins WHERE username = $1',
      [username]
    );

    if (adminResult.rows.length === 0) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    const admin = adminResult.rows[0];

    const validPass = await bcrypt.compare(password, admin.password);
    if (!validPass) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.admin_id, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Admin login successful',
      token,
      admin: { id: admin.admin_id, name: admin.name, username: admin.username }
    });

  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ✅ Fetch all live orders (any status except completed)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.order_uuid, o.user_id, o.total_amount, o.status, o.created_at,
             u.name AS user_name, u.email AS user_email,
             json_agg(json_build_object('menu_id', oi.menu_id, 'quantity', oi.quantity, 'price', oi.price)) AS items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status != 'completed'
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// ✅ Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_uuid } = req.params;
    const { status } = req.body; // e.g., preparing, ready, completed

    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE order_uuid = $2 RETURNING *`,
      [status, order_uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// ✅ Verify Order via QR (Admin Scan)
exports.verifyOrderQR = async (req, res) => {
  try {
    const { order_uuid } = req.body;

    const result = await pool.query(
      `SELECT * FROM orders WHERE order_uuid = $1`,
      [order_uuid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ verified: false, message: 'Invalid QR code' });
    }

    const order = result.rows[0];

    if (order.status === 'completed') {
      return res.status(200).json({ verified: false, message: 'Order already completed' });
    }

    await pool.query(
      `UPDATE orders SET status = 'completed' WHERE order_uuid = $1`,
      [order_uuid]
    );

    res.status(200).json({ verified: true, message: 'Order verified and marked as completed' });
  } catch (err) {
    console.error('Error verifying QR:', err);
    res.status(500).json({ error: 'Failed to verify order' });
  }
};
