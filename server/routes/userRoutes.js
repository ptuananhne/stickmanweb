const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { getUserProfile, updateUserProfile, sendVerificationOTP, verifyPhoneNumber, changePassword, getAllUsers, updateUserRole, addPlayTurns, lockUserAccount, unlockUserAccount, deleteUserAccount, getPublicProfile, getUserRanks, transferPlayTurns, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, removeFriend, updatePrivacy } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

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

// == Current User Routes (self-management) ==
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('avatar'), updateUserProfile);
router.put('/profile/privacy', protect, updatePrivacy);

router.post('/change-password', protect, changePassword);
router.post('/profile/send-otp', protect, sendVerificationOTP);
router.post('/profile/verify-otp', protect, verifyPhoneNumber);

// == Public User Routes ==
router.get('/public/:username', getPublicProfile);
router.get('/:username/ranks', getUserRanks);

// == Friend Management Routes ==
router.post('/friends/request/:recipientId', protect, sendFriendRequest);
router.post('/friends/accept/:senderId', protect, acceptFriendRequest);
router.post('/friends/reject/:senderId', protect, rejectFriendRequest);
router.delete('/friends/request/cancel/:recipientId', protect, cancelFriendRequest); // Route mới
router.delete('/friends/:friendId', protect, removeFriend);

// == Admin Routes (user management) ==
// IMPORTANT: Place general routes before parameterized routes to avoid conflicts
router.get('/', protect, admin, getAllUsers); // Get all users

router.put('/:userId/role', protect, admin, updateUserRole);
router.post('/:userId/add-turns', protect, admin, addPlayTurns);
router.post('/:recipientId/transfer-turns', protect, transferPlayTurns); // Gifting turns
router.put('/:userId/lock', protect, admin, lockUserAccount);
router.put('/:userId/unlock', protect, admin, unlockUserAccount);
router.delete('/:userId', protect, admin, deleteUserAccount);

module.exports = router;
