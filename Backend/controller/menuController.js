const pool = require('../config/db');

// ✅ Get all menu items (optional category filter)
exports.getMenu = async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM menu_items ORDER BY created_at DESC';
    const params = [];

    if (category) {
      query = 'SELECT * FROM menu_items WHERE LOWER(category) = LOWER($1) ORDER BY created_at DESC';
      params.push(category);
    }

    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching menu:', err);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

// ✅ Add new menu item
exports.addMenuItem = async (req, res) => {
  try {
     const { name, description, category, price, availability } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await pool.query(
    `INSERT INTO menu_items (name, description, category, price, image_url, availability)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name, description, category, price, image_url, availability]
  );

    res.status(201).json({
      message: '✅ Menu item added successfully',
      item: result.rows[0],
    });
  } catch (err) {
    console.error('❌ Error adding menu item:', err);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
};

// ✅ Update a menu item
exports.updateMenuAvailability = async (req, res) => {
  try {
    const { id } = req.params;               // menu item id
    const { availability } = req.body;       // true or false

    if (availability === undefined) {
      return res.status(400).json({ error: 'Availability value is required' });
    }

    const result = await pool.query(
      `UPDATE menu_items
       SET availability = $1
       WHERE item_id = $2
       RETURNING *`,
      [availability, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.status(200).json({
      message: '✅ Menu item availability updated',
      item: result.rows[0],
    });
  } catch (err) {
    console.error('❌ Error updating menu availability:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// ✅ Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM menu_items WHERE item_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Menu item not found' });

    res.status(200).json({
      message: '🗑️ Menu item deleted successfully',
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('❌ Error deleting menu item:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
