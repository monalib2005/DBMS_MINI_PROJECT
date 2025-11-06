const pool = require('../config/db');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// ✅ Place Order
// exports.placeOrder = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     const { user_id, items } = req.body; // items = [{ menu_id, quantity }]

//     if (!user_id || !items || items.length === 0) {
//       return res.status(400).json({ error: 'User ID and items are required' });
//     }

//     // Calculate total price
//     const itemIds = items.map(i => i.menu_id);
//     const menuQuery = await pool.query(
//       `SELECT id, price FROM menu WHERE id = ANY($1)`,
//       [itemIds]
//     );

//     let totalAmount = 0;
//     const menuMap = {};
//     menuQuery.rows.forEach(item => (menuMap[item.id] = item.price));

//     items.forEach(it => {
//       totalAmount += menuMap[it.menu_id] * it.quantity;
//     });

//     // Begin transaction
//     await client.query('BEGIN');

//     // Create order
//     const order_uuid = uuidv4();
//     const orderResult = await client.query(
//       `INSERT INTO orders (order_uuid, user_id, total_amount)
//        VALUES ($1, $2, $3) RETURNING id`,
//       [order_uuid, user_id, totalAmount]
//     );
//     const order_id = orderResult.rows[0].id;

//     // Insert order items
//     for (const it of items) {
//       await client.query(
//         `INSERT INTO order_items (order_id, menu_id, quantity, price)
//          VALUES ($1, $2, $3, $4)`,
//         [order_id, it.menu_id, it.quantity, menuMap[it.menu_id]]
//       );
//     }

//     // Generate QR code (encode UUID)
//     const qrData = `${order_uuid}`;
//     const qrImage = await QRCode.toDataURL(qrData);

//     // Update order with QR URL
//     await client.query(
//       `UPDATE orders SET qr_code_url = $1 WHERE id = $2`,
//       [qrImage, order_id]
//     );

//     await client.query('COMMIT');

//     res.status(201).json({
//       message: 'Order placed successfully',
//       order_uuid,
//       qr_code_url: qrImage,
//       total_amount: totalAmount
//     });
//   } catch (err) {
//     await client.query('ROLLBACK');
//     console.error('Error placing order:', err);
//     res.status(500).json({ error: 'Failed to place order' });
//   } finally {
//     client.release();
//   }
// };

// // ✅ Fetch user orders
// exports.getUserOrders = async (req, res) => {
//   try {
//     const { user_id } = req.params;

//     const result = await pool.query(
//       `SELECT o.order_id, o.order_uuid, o.total_amount, o.status, o.qr_code_url, o.order_date,
//               json_agg(
//                 json_build_object(
//                   'item_id', oi.item_id,
//                   'quantity', oi.quantity,
//                   'menu_item', oi.menu_item
//                 )
//               ) AS items
//        FROM orders o
//        JOIN order_items oi ON o.order_id = oi.order_id
//        WHERE o.user_id = $1
//        GROUP BY o.order_id
//        ORDER BY o.order_date DESC`,
//       [user_id]
//     );

//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error('Error fetching user orders:', err);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// };


// // ✅ Update order status (Admin)
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { order_uuid } = req.params;
//     const { status } = req.body; // e.g., 'preparing', 'ready', 'completed'

//     const result = await pool.query(
//       `UPDATE orders SET status = $1 WHERE order_uuid = $2 RETURNING *`,
//       [status, order_uuid]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     res.status(200).json({ message: 'Order status updated', order: result.rows[0] });
//   } catch (err) {
//     console.error('Error updating order status:', err);
//     res.status(500).json({ error: 'Failed to update order status' });
//   }
// };

// // ✅ QR Verification (Admin scans QR)
// exports.verifyOrder = async (req, res) => {
//   try {
//     const { order_uuid } = req.body;

//     const result = await pool.query(
//       `SELECT * FROM orders WHERE order_uuid = $1`,
//       [order_uuid]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ verified: false, message: 'Invalid QR code' });
//     }

//     const order = result.rows[0];
//     if (order.status === 'completed') {
//       return res.status(200).json({ verified: false, message: 'Order already completed' });
//     }

//     // Mark as completed
//     await pool.query(`UPDATE orders SET status = 'completed' WHERE order_uuid = $1`, [order_uuid]);

//     res.status(200).json({ verified: true, message: 'Order verified and marked completed' });
//   } catch (err) {
//     console.error('Error verifying QR:', err);
//     res.status(500).json({ error: 'QR verification failed' });
//   }
// };

// POST /api/cart
exports.addOrUpdateCartItem = async (req, res) => {
  try {
    const { user_id, item_id, quantity } = req.body;

    // ✅ Proper validation
    if (user_id === undefined || item_id === undefined || quantity === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if item is already in cart (order_id IS NULL)
    const existing = await pool.query(
      "SELECT * FROM order_items WHERE user_id=$1 AND item_id=$2 AND order_id IS NULL",
      [user_id, item_id]
    );

    if (existing.rows.length > 0) {
      // If quantity <= 0, delete the item
      if (quantity <= 0) {
        await pool.query(
          "DELETE FROM order_items WHERE order_item_id=$1",
          [existing.rows[0].order_item_id]
        );
        return res.status(200).json({ message: "Item removed from cart" });
      }

      // Otherwise, update quantity
      const updated = await pool.query(
        "UPDATE order_items SET quantity=$1 WHERE order_item_id=$2 RETURNING *",
        [quantity, existing.rows[0].order_item_id]
      );

      return res.status(200).json({ item: updated.rows[0] });
    } else {
      // If quantity <= 0, nothing to insert
      if (quantity <= 0) {
        return res.status(400).json({ error: "Quantity must be greater than 0" });
      }

      // Get menu item details
      const menuItem = await pool.query(
        "SELECT * FROM menu_items WHERE item_id=$1",
        [item_id]
      );

      if (menuItem.rows.length === 0)
        return res.status(404).json({ error: "Menu item not found" });

      // Insert new item into cart
      const inserted = await pool.query(
        "INSERT INTO order_items (user_id, item_id, quantity, menu_item) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, item_id, quantity, JSON.stringify(menuItem.rows[0])]
      );

      return res.status(201).json({ item: inserted.rows[0] });
    }
  } catch (err) {
    console.error("❌ Error adding/updating cart item:", err);
    return res.status(500).json({ error: "Failed to add/update cart item" });
  }
};


// GET /api/cart/:user_id
exports.getCartItems = async (req, res) => {
  try {
    const { user_id } = req.params;

    const cartItems = await pool.query(
      "SELECT * FROM order_items WHERE user_id=$1 AND order_id IS NULL",
      [user_id]
    );

    res.status(200).json(cartItems.rows);
  } catch (err) {
    console.error("❌ Error fetching cart items:", err);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
};
// DELETE /api/cart/:user_id/:item_id
exports.removeCartItem = async (req, res) => {
  try {
    const { user_id, item_id } = req.params;

    await pool.query(
      "DELETE FROM order_items WHERE user_id=$1 AND item_id=$2 AND order_id IS NULL",
      [user_id, item_id]
    );

    res.status(200).json({ message: "✅ Item removed from cart" });
  } catch (err) {
    console.error("❌ Error removing cart item:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};

// POST /api/order
exports.proceedToOrder = async (req, res) => {
  try {
    const { user_id } = req.body;

    // Get all cart items
    const cartItems = await pool.query(
      "SELECT * FROM order_items WHERE user_id=$1 AND order_id IS NULL",
      [user_id]
    );

    if (cartItems.rows.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Create new order
    const orderUUID = require("uuid").v4();
    const newOrder = await pool.query(
      "INSERT INTO orders (user_id, order_uuid, status, order_date) VALUES ($1, $2, $3, NOW()) RETURNING *",
      [user_id, orderUUID, "Pending"]
    );

    const orderId = newOrder.rows[0].order_id;

    // Link cart items to this order
    await pool.query(
      "UPDATE order_items SET order_id=$1 WHERE user_id=$2 AND order_id IS NULL",
      [orderId, user_id]
    );

    res.status(201).json({ order: newOrder.rows[0] });
  } catch (err) {
    console.error("❌ Error proceeding to order:", err);
    res.status(500).json({ error: "Failed to proceed to order" });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get all orders for this user
    const ordersRes = await pool.query(
      `SELECT o.order_id, o.order_uuid, o.status, o.order_date, o.completed_at,
              json_agg(
                json_build_object(
                  'item_id', oi.item_id,
                  'quantity', oi.quantity,
                  'menu_item', oi.menu_item
                )
              ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.order_id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.order_id
       ORDER BY o.order_date DESC`,
      [user_id]
    );

    res.status(200).json(ordersRes.rows);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.order_uuid,
        json_build_object('id', u.user_id, 'name', u.name) AS user,
        o.status,
        COALESCE(
          json_agg(
            json_build_object(
              'name', mi.name,
              'quantity', oi.quantity
            )
          ) FILTER (WHERE mi.item_id IS NOT NULL),
          '[]'
        ) AS order_items
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN menu_items mi ON oi.item_id = mi.item_id
      GROUP BY o.order_uuid, u.user_id, u.name, o.status
      ORDER BY o.order_uuid DESC;
    `;

    const { rows } = await pool.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ============================================================
   ✅ 2. Update Order Status
============================================================ */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { order_uuid } = req.params;
    const { status } = req.body;

    if (!["Pending", "Preparing", "Ready", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const query = `
    UPDATE orders
    SET status = $1,
        completed_at = CASE WHEN $1::varchar = 'Completed' THEN NOW() ELSE NULL END
    WHERE order_uuid = $2
    RETURNING *;
    `;

    const { rows } = await pool.query(query, [status, order_uuid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order: rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating order status:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
