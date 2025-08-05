// stickmangame-backend/middleware/adminMiddleware.js
const admin = (req, res, next) => {
  // Middleware này nên được dùng sau middleware `protect`
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Không có quyền truy cập, yêu cầu quyền Admin.' });
  }
};

module.exports = { admin };