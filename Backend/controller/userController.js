const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

exports.registerUser = async (req, res) => {
    const {name, email, password} = req.body;

    try{
        if(!name || !email || !password){
            return res.status(400).json({message: 'All fields are required'});
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
        `INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING user_id, name, email`,
        [name, email, hashedPassword]
        );

        res.status(201).json({
        message: 'User registered successfully!',
        user: newUser.rows[0],
        });

        } catch (error) {
            console.error('❌ Register Error:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required.' });

    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found.' });

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials.' });

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch all completed or cancelled orders
    const orders = await pool.query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.order_date,
              json_agg(json_build_object('item_name', f.name, 'quantity', oi.quantity, 'subtotal', oi.subtotal)) AS items
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN food_items f ON f.item_id = oi.item_id
       WHERE o.user_id = $1 AND o.order_status IN ('completed', 'cancelled')
       GROUP BY o.order_id
       ORDER BY o.order_date DESC;`,
      [userId]
    );

    res.json({ history: orders.rows });

  } catch (error) {
    console.error('❌ Order History Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

// 🔹 GET USER ACTIVE (IN-PROGRESS) ORDERS
exports.getActiveOrders = async (req, res) => {
  const userId = req.params.id;

  try {
    const orders = await pool.query(
      `SELECT o.order_id, o.total_amount, o.order_status, o.order_date,
              json_agg(json_build_object('item_name', f.name, 'quantity', oi.quantity, 'subtotal', oi.subtotal)) AS items
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN food_items f ON f.item_id = oi.item_id
       WHERE o.user_id = $1 AND o.order_status IN ('pending', 'preparing', 'ready')
       GROUP BY o.order_id
       ORDER BY o.order_date DESC;`,
      [userId]
    );

    res.json({ active_orders: orders.rows });

  } catch (error) {
    console.error('❌ Active Orders Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};