const Game = require('../models/Game');
const Comment = require('../models/Comment');
const User = require('../models/User');

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
      thumbnailUrl: `/${req.file.path.replace(/\\/g, "/")}`, 
    });

    const createdGame = await newGame.save();
    res.status(201).json(createdGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const updateGame = async (req, res) => {
  const { name, description, gameUrl, category } = req.body;
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy game' });
    }

    game.name = name || game.name;
    game.description = description || game.description;
    game.gameUrl = gameUrl || game.gameUrl;
    game.category = category || game.category;

    if (req.file) {
      // Note: This doesn't delete the old file. For a production app, consider removing the old file from the 'uploads' folder.
      game.thumbnailUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updatedGame = await game.save();
    res.json(updatedGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const deleteGame = async (req, res) => {
  try {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({ message: 'Không tìm thấy game' });
    }
    // Note: This doesn't delete the thumbnail file from the server.
    res.json({ message: 'Game đã được xóa' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const getGames = async (req, res) => {
  try {
    const games = await Game.find({});
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: 'Không tìm thấy game' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi Server' });
  }
};

const getGameLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    const gameIdKey = `playTurns.${id}`;

    const leaderboard = await User.find({ [gameIdKey]: { $exists: true, $gt: 0 } })
      .sort({ [gameIdKey]: -1 })
      .limit(100)
      .select('username displayName avatarUrl playTurns');

    const formattedLeaderboard = leaderboard.map(user => ({
      _id: user._id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      score: user.playTurns.get(id)
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bảng xếp hạng', error: error.message });
  }
};

const getGameComments = async (req, res) => {
  try {
    const comments = await Comment.find({ game: req.params.id })
      .populate('user', 'username displayName avatarUrl role')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận', error: error.message });
  }
};

const addGameComment = async (req, res) => {
  try {
    const { content } = req.body;
    const newComment = new Comment({
      content,
      game: req.params.id,
      user: req.user.id,
    });
    await newComment.save();
    const populatedComment = await newComment.populate('user', 'username displayName avatarUrl role');
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thêm bình luận', error: error.message });
  }
};

module.exports = { createGame, getGames, getGameById, updateGame, deleteGame, getGameLeaderboard, getGameComments, addGameComment };
