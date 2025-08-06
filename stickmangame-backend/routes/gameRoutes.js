// stickmangame-backend/routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createGame, getGames, getGameById } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Cấu hình Multer cho thumbnail của game
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `game-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Định nghĩa routes
router.route('/')
  .post(protect, admin, upload.single('thumbnail'), createGame) // Chỉ admin mới được tạo game
  .get(getGames); // Mọi người đều có thể xem danh sách game
router.route('/:id').get(getGameById);
module.exports = router;