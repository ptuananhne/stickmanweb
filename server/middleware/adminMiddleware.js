const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Không có quyền truy cập, yêu cầu quyền Admin.' });
  }
};

module.exports = { admin };