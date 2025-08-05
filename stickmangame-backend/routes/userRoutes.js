// stickmangame-backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)   // Lấy thông tin
  .put(protect, updateUserProfile); // Cập nhật thông tin

module.exports = router;