// stickmangame-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Không có quyền truy cập, token không hợp lệ' });
    }
  } else {
    res.status(401).json({ message: 'Không có quyền truy cập, không tìm thấy token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập, chỉ admin mới được phép' });
  }
};

module.exports = { protect, admin };
