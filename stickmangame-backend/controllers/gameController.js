// stickmangame-backend/controllers/gameController.js
const Game = require('../models/Game');

// @desc    Tạo một game mới
const createGame = async (req, res) => {
  const { name, description, gameUrl, category } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Vui lòng tải lên ảnh thumbnail.' });
  }

  try {
    const gameExists = await Game.findOne({ name });
    if (gameExists) {
      return res.status(400).json({ message: 'Tên game đã tồn tại.' });
    }

    const newGame = new Game({
      name,
      description,
      gameUrl,
      category,
      thumbnailUrl: `/${req.file.path.replace(/\\/g, "/")}`, // Lưu đường dẫn ảnh
    });

    const createdGame = await newGame.save();
    res.status(201).json(createdGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

// @desc    Lấy tất cả game
const getGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

module.exports = { createGame, getGames };