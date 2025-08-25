const User = require('../models/User');
const Game = require('../models/Game');

const searchAll = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ message: 'Yêu cầu tìm kiếm phải có ít nhất 2 ký tự.' });
  }

  try {
    const searchQuery = new RegExp(q, 'i'); // 'i' for case-insensitive

    // Tìm kiếm người dùng theo username và displayName
    const users = await User.find({
      $or: [{ username: searchQuery }, { displayName: searchQuery }],
    }).select('_id username displayName avatarUrl'); // Chỉ lấy các trường public

    // Tìm kiếm game theo tên
    const games = await Game.find({ name: searchQuery }).select('_id name thumbnailUrl description');

    res.json({ users, games });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = { searchAll };