const User = require('../models/User');
const Game = require('../models/Game');

const searchAll = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
    const searchRegex = new RegExp(q, 'i'); // 'i' for case-insensitive

    const [users, games] = await Promise.all([
      User.find({
        $or: [
          { username: searchRegex },
          { displayName: searchRegex }
        ]
      }).select('username displayName avatarUrl'), // Chỉ chọn các trường công khai
      Game.find({ name: searchRegex })
    ]);

    res.json({ users, games });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ khi tìm kiếm', error: error.message });
  }
};

module.exports = { searchAll };