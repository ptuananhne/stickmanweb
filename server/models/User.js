const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Tên đăng nhập là bắt buộc.'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự.'],
    maxlength: [30, 'Tên đăng nhập không được vượt quá 30 ký tự.'],
    match: [/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới.']
  },
  password: { type: String, required: [true, 'Mật khẩu là bắt buộc.'], minlength: 6, select: false },
  phoneNumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc.'],
    unique: true,
    match: [/^\d{10}$/, 'Số điện thoại phải có đúng 10 chữ số.']
  },
  isPhoneVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isLocked: { type: Boolean, default: false },
  playTurns: { type: Map, of: Number, default: {} },
  privacy: { type: String, enum: ['public', 'friends-only'], default: 'public' },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsSent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  friendRequestsReceived: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  displayName: { type: String, default: '' },
  bio: { type: String, maxlength: 200, default: '' },
  avatarUrl: { type: String, default: 'https://placehold.co/150x150/EFEFEF/333?text=Avatar' },
  lastInfoChange: { type: Date },

  phoneVerificationCode: { type: String, select: false },
  phoneVerificationExpires: { type: Date, select: false },

}, {
  timestamps: true
});

// Middleware để tự động đặt displayName khi tạo mới
userSchema.pre('save', function(next) {
  if (this.isNew && !this.displayName) {
    this.displayName = this.username;
  }
  next();
});

// Middleware để tự động hash mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash mật khẩu nếu nó đã được thay đổi (hoặc là mới)
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
