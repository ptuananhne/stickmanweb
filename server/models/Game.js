const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  gameUrl: { type: String, required: true }, 
  category: { type: String, default: 'Action' },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;