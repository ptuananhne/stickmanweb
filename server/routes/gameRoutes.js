const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { createGame, getGames, getGameById } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');


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
router.route('/:id').get(getGameById);
module.exports = router;