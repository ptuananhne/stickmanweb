const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');

// @route   GET /api/search?q=...
// @desc    Tìm kiếm game và người dùng
// @access  Public
router.get('/', searchAll);

module.exports = router;