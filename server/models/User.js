const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  playTurns: { type: Map, of: Number, default: {} },
  
  displayName: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  avatarUrl: { type: String, default: 'https://placehold.co/150x150/EFEFEF/333?text=Avatar' },
  lastInfoChange: { type: Date },
  
  phoneVerificationCode: { type: String },
  phoneVerificationExpires: { type: Date },

}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  if (this.isNew && !this.displayName) {
    this.displayName = this.username;
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
