const express = require('express');
const router = express.Router();
const { searchAll } = require('../controllers/searchController');

// @route   GET /api/search?q=<query>
// @desc    Search for users and games
// @access  Public
router.get('/', searchAll);

module.exports = router;