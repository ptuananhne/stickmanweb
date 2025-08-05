const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// --- CẤU HÌNH MULTER ---
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Nơi lưu file
  },
  filename(req, file, cb) {
    // Tạo tên file duy nhất
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Chỉ chấp nhận file ảnh (jpg, jpeg, png)!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
// --- KẾT THÚC CẤU HÌNH MULTER ---

// /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)
  // Thêm middleware upload.single('avatar')
  .put(protect, upload.single('avatar'), updateUserProfile);

module.exports = router;