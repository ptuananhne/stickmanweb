// stickmangame-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];
      
      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Lấy thông tin user từ token và gắn vào request (trừ mật khẩu)
      req.user = await User.findById(decoded.user.id).select('-password');
      
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
  }
};

module.exports = { protect };
