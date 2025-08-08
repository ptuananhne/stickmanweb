const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { getUserProfile, updateUserProfile, sendVerificationOTP, verifyPhoneNumber } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
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

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('avatar'), updateUserProfile);

router.post('/profile/send-otp', protect, sendVerificationOTP);
router.post('/profile/verify-otp', protect, verifyPhoneNumber);

module.exports = router;
