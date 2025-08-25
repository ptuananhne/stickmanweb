const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createGame, getGames, getGameById, updateGame, deleteGame, getGameLeaderboard, getGameComments, addGameComment } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/authMiddleware'); // Use consistent admin middleware

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `game-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

router.route('/')
  .post(protect, admin, upload.single('thumbnail'), createGame) 
  .get(getGames); 
router.route('/:id')
  .get(getGameById)
  .put(protect, admin, upload.single('thumbnail'), updateGame)
  .delete(protect, admin, deleteGame);

router.get('/:id/leaderboard', getGameLeaderboard);
router.route('/:id/comments')
  .get(getGameComments)
  .post(protect, addGameComment);

module.exports = router;