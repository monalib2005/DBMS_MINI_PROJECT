const express = require('express');
const router = express.Router();
const {
  getMenu,
  addMenuItem,
  updateMenuAvailability,
  deleteMenuItem
} = require('../controller/menuController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Public route - anyone can view menu
router.get('/', getMenu);

// Admin routes (later you can add authentication middleware)
router.post('/', upload.single('image'), addMenuItem);
router.patch('/:id/available', updateMenuAvailability);
router.delete('/:id', deleteMenuItem);

module.exports = router;
