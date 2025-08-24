const User = require('../models/User');

const getUserProfile = async (req, res) => {
  if (req.user) {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      displayName: req.user.displayName,
      bio: req.user.bio,
      avatarUrl: req.user.avatarUrl,
      lastInfoChange: req.user.lastInfoChange,
      isPhoneVerified: req.user.isPhoneVerified,
      role: req.user.role, 
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { displayName, bio } = req.body;
    let infoChanged = false;

    if (displayName && displayName !== user.displayName) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (user.lastInfoChange && (new Date() - new Date(user.lastInfoChange) < thirtyDays)) {
        return res.status(400).json({ message: 'Bạn chỉ có thể thay đổi Tên hiển thị 30 ngày một lần.' });
      }
      user.displayName = displayName;
      user.lastInfoChange = new Date();
    }
    
    user.bio = bio || '';
    
    if (req.file) {
      user.avatarUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      displayName: updatedUser.displayName,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      lastInfoChange: updatedUser.lastInfoChange,
      isPhoneVerified: updatedUser.isPhoneVerified,
      role: updatedUser.role, 
    });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};

const sendVerificationOTP = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationCode = otp;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; 
    await user.save();
    console.log(`Gửi OTP ${otp} cho SĐT ${user.phoneNumber}`);
    res.json({ message: `Một mã OTP đã được gửi đến SĐT của bạn. (Mã là: ${otp})` });
  } else {
    res.status(404).json({ message: 'Không tìm thấy người dùng' });
  }
};
const verifyPhoneNumber = async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.user._id);
  if (user && user.phoneVerificationCode === otp && user.phoneVerificationExpires > Date.now()) {
    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();
    res.json({ message: 'Xác minh số điện thoại thành công!' });
  } else {
    res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
  }
};

module.exports = { getUserProfile, updateUserProfile, sendVerificationOTP, verifyPhoneNumber };
