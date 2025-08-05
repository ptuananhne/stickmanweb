// stickmangame-backend/controllers/userController.js
const User = require('../models/User');

// @desc    Lấy thông tin cá nhân của người dùng
const getUserProfile = async (req, res) => {
  // req.user được gắn từ middleware `protect`
  if (req.user) {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      displayName: req.user.displayName,
      bio: req.user.bio,
      avatarUrl: req.user.avatarUrl,
      lastInfoChange: req.user.lastInfoChange,
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

// @desc    Cập nhật thông tin cá nhân
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { displayName, bio, avatarUrl } = req.body;
    let infoChanged = false;

    // Chỉ cho phép thay đổi displayName và bio sau 90 ngày
    if (displayName !== user.displayName || bio !== user.bio) {
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      if (user.lastInfoChange && (new Date() - user.lastInfoChange < ninetyDays)) {
        return res.status(400).json({ message: 'Bạn chỉ có thể thay đổi thông tin cá nhân 3 tháng một lần.' });
      }
      infoChanged = true;
    }

    user.displayName = displayName || user.displayName;
    user.bio = bio || user.bio;
    user.avatarUrl = avatarUrl || user.avatarUrl;
    if (infoChanged) {
      user.lastInfoChange = new Date();
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      lastInfoChange: updatedUser.lastInfoChange,
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

module.exports = { getUserProfile, updateUserProfile };