const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Game = require('../models/Game'); // Import Game model

const registerUser = async (req, res) => {
  const { username, password, phoneNumber, confirmPassword } = req.body;

  try {
    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Mật khẩu xác nhận không khớp' });
    }

    // Tạo người dùng mới
    // Mật khẩu sẽ được tự động hash bởi pre-save hook trong User model
    const user = new User({ username, password, phoneNumber });

    // Đặt lượt chơi mặc định cho người dùng mới
    const allGames = await Game.find({}).select('_id');
    if (allGames.length > 0) {
      allGames.forEach(game => {
        // Đặt 50 lượt chơi mặc định cho mỗi game
        user.playTurns.set(game._id.toString(), 50);
      });
    }

    await user.save(); // Lưu người dùng với lượt chơi mặc định

    // Tạo JWT token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, data: { token } });
  } catch (error) {
    console.error(error.message);
    // Xử lý lỗi validation từ Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    // Xử lý lỗi duplicate key
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc số điện thoại đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm người dùng theo tên đăng nhập
    // Phải dùng .select('+password') vì schema đã ẩn mật khẩu
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // KIỂM TRA NẾU TÀI KHOẢN BỊ KHÓA
    if (user.isLocked) {
      return res.status(403).json({ success: false, message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Thông tin đăng nhập không hợp lệ' });
    }

    // Tạo JWT token
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ success: true, data: { token } });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  registerUser,
  loginUser,
};