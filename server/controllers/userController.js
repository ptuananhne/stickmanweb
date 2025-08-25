const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Game = require('../models/Game');
const mongoose = require('mongoose');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    const { displayName, bio } = req.body;

    if (displayName !== undefined && displayName !== user.displayName) {
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      if (user.lastInfoChange && (new Date() - new Date(user.lastInfoChange) < thirtyDays)) {
        return res.status(400).json({ message: 'Bạn chỉ có thể thay đổi Tên hiển thị 30 ngày một lần.' });
      }
      user.displayName = displayName;
      user.lastInfoChange = new Date();
    }
    
    if (bio !== undefined) {
      user.bio = bio;
    }
    
    if (req.file) {
      user.avatarUrl = `/${req.file.path.replace(/\\/g, "/")}`;
    }

    const updatedUser = await user.save();
    
    // Trả về đối tượng người dùng đã cập nhật (loại bỏ mật khẩu)
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin', error: err.message });
  }
};

const sendVerificationOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    // Sử dụng crypto để tạo OTP an toàn hơn
    const otp = crypto.randomInt(100000, 999999).toString();
    user.phoneVerificationCode = otp;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();
    
    // Trong môi trường production, bạn sẽ tích hợp dịch vụ SMS ở đây
    console.log(`OTP for ${user.phoneNumber}: ${otp}`); // Chỉ dành cho mục đích debug
    
    res.json({ message: 'Một mã OTP đã được gửi đến SĐT của bạn.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi mã OTP', error: err.message });
  }
};

const verifyPhoneNumber = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findOne({ _id: req.user._id, phoneVerificationCode: otp, phoneVerificationExpires: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn.' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();
    res.json({ message: 'Xác minh số điện thoại thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xác minh OTP', error: err.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Vui lòng cung cấp mật khẩu hợp lệ (mới và cũ, mật khẩu mới ít nhất 6 ký tự).' });
  }

  try {
    // Phải dùng .select('+password') vì schema đã ẩn mật khẩu
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu hiện tại không chính xác.' });
    }

    // Gán mật khẩu mới, pre-save hook sẽ tự động hash
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Đổi mật khẩu thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: err.message });
  }
};

// Lock a user account
const lockUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.isLocked = true;
    await user.save();

    res.json({ message: 'Tài khoản đã bị khóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi khóa tài khoản', error: err.message });
  }
};

// Unlock a user account
const unlockUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    user.isLocked = false;
    await user.save();

    res.json({ message: 'Tài khoản đã được mở khóa thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi mở khóa tài khoản', error: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: err.message });
  }
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (req.user.id === userId && role === 'user') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) {
            return res.status(400).json({ message: 'Không thể hạ vai trò của admin cuối cùng.' });
        }
    }

    user.role = role;
    await user.save();
    res.json({ message: `Vai trò của người dùng đã được cập nhật thành ${role}.` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật vai trò', error: err.message });
  }
};

const addPlayTurns = async (req, res) => {
  const { userId } = req.params;
  const { gameId, turns } = req.body;
  const turnsToAdd = parseInt(turns, 10);

  if (!gameId || !turnsToAdd || isNaN(turnsToAdd) || turnsToAdd <= 0) {
    return res.status(400).json({ message: 'Vui lòng cung cấp Game ID và số lượt chơi hợp lệ.' });
  }

  try {
    const user = await User.findByIdAndUpdate(userId, { $inc: { [`playTurns.${gameId}`]: turnsToAdd } }, { new: true, upsert: true });
    res.json({ message: `Đã cộng ${turnsToAdd} lượt chơi cho game ${gameId}.`, user });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cộng lượt chơi', error: err.message });
  }
};

const deleteUserAccount = async (req, res) => {
  const { userId } = req.params;

  try {
    // Ngăn admin tự xóa tài khoản của mình
    if (req.user.id === userId) {
      return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của mình.' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Ngăn việc xóa admin cuối cùng
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Không thể xóa admin cuối cùng của hệ thống.' });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Tài khoản đã được xóa thành công.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa tài khoản', error: err.message });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const targetUser = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-password -phoneVerificationCode -phoneVerificationExpires');

    if (!targetUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    let friendStatus = 'none';
    let canViewFullProfile = targetUser.privacy === 'public';

    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser.friends.includes(targetUser._id)) {
        friendStatus = 'friends';
        canViewFullProfile = true; // Friends can always view full profile
      } else if (currentUser.friendRequestsSent.includes(targetUser._id)) {
        friendStatus = 'request_sent';
      } else if (currentUser.friendRequestsReceived.includes(targetUser._id)) {
        friendStatus = 'request_received';
      }
    }

    if (canViewFullProfile) {
      const userObject = targetUser.toObject();
      userObject.friendStatus = friendStatus;
      return res.json(userObject);
    } else {
      // Return limited profile for non-friends if privacy is 'friends-only'
      const limitedProfile = {
        _id: targetUser._id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        bio: targetUser.bio,
        avatarUrl: targetUser.avatarUrl,
        createdAt: targetUser.createdAt,
        privacy: targetUser.privacy,
        friendStatus,
      };
      return res.json(limitedProfile);
    }
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ.', error: err.message });
  }
};

const getUserRanks = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    // Privacy check
    if (user.privacy === 'friends-only') {
      const isOwnProfile = req.user && req.user.id === user._id.toString();
      const isFriend = req.user && user.friends.includes(req.user.id);
      if (!isOwnProfile && !isFriend) {
        return res.status(403).json({ message: 'Thông tin này chỉ dành cho bạn bè.' });
      }
    }

    const playTurnsMap = user.playTurns;
    if (!playTurnsMap || playTurnsMap.size === 0) {
      return res.json([]);
    }

    const gameIds = Array.from(playTurnsMap.keys());

    const ranks = await Promise.all(
      gameIds.map(async (gameId) => {
        try {
          const userTurns = playTurnsMap.get(gameId);
          
          const higherRankedCount = await User.countDocuments({
            [`playTurns.${gameId}`]: { $gt: userTurns }
          });

          const rank = higherRankedCount + 1;

          const game = await Game.findById(gameId).select('name thumbnailUrl').lean();
          
          if (!game) return null;

          return { game, rank };
        } catch (e) {
          console.error(`Error calculating rank for game ${gameId}:`, e);
          return null;
        }
      })
    );

    res.json(ranks.filter(r => r !== null));
  } catch (err) {
    res.status(500).json({ message: 'Lỗi máy chủ khi lấy bảng xếp hạng.', error: err.message });
  }
};

const transferPlayTurns = async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.params;
  const { gameId, turns } = req.body;
  const turnsToTransfer = parseInt(turns, 10);

  if (!gameId || !turnsToTransfer || isNaN(turnsToTransfer) || turnsToTransfer <= 0) {
    return res.status(400).json({ message: 'Vui lòng cung cấp Game ID và số lượt chơi hợp lệ.' });
  }

  if (senderId === recipientId) {
    return res.status(400).json({ message: 'Bạn không thể tự tặng lượt chơi cho chính mình.' });
  }

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!sender || !recipient) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (!sender.friends.includes(recipientId)) {
      return res.status(403).json({ message: 'Bạn chỉ có thể tặng lượt chơi cho bạn bè.' });
    }

    const senderTurns = sender.playTurns.get(gameId) || 0;
    if (senderTurns < turnsToTransfer) {
      return res.status(400).json({ message: 'Bạn không có đủ lượt chơi để tặng.' });
    }

    sender.playTurns.set(gameId, senderTurns - turnsToTransfer);
    const recipientTurns = recipient.playTurns.get(gameId) || 0;
    recipient.playTurns.set(gameId, recipientTurns + turnsToTransfer);

    await sender.save();
    await recipient.save();

    res.json({ message: `Tặng ${turnsToTransfer} lượt chơi thành công!` });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Giao dịch thất bại.' });
  }
};

const sendFriendRequest = async (req, res) => {
  const senderId = req.user.id;
  const { recipientId } = req.params;

  if (senderId === recipientId) {
    return res.status(400).json({ message: 'Bạn không thể tự kết bạn với chính mình.' });
  }

  try {
    const sender = await User.findById(senderId);
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng này.' });
    }

    if (sender.friends.includes(recipientId) || recipient.friendRequestsReceived.includes(senderId)) {
      return res.status(400).json({ message: 'Yêu cầu đã được gửi hoặc đã là bạn bè.' });
    }

    sender.friendRequestsSent.push(recipientId);
    recipient.friendRequestsReceived.push(senderId);

    await sender.save();
    await recipient.save();

    res.json({ message: 'Đã gửi yêu cầu kết bạn.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi gửi yêu cầu kết bạn.', error: err.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  const recipientId = req.user.id;
  const { senderId } = req.params;

  try {
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!sender || !recipient.friendRequestsReceived.includes(senderId)) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu kết bạn.' });
    }

    // Add to friends lists
    recipient.friends.push(senderId);
    sender.friends.push(recipientId);

    // Remove from requests lists
    recipient.friendRequestsReceived.pull(senderId);
    sender.friendRequestsSent.pull(recipientId);

    await recipient.save();
    await sender.save();

    res.json({ message: 'Đã chấp nhận yêu cầu kết bạn.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi chấp nhận yêu cầu.', error: err.message });
  }
};

const rejectFriendRequest = async (req, res) => {
  const recipientId = req.user.id;
  const { senderId } = req.params;

  try {
    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!sender || !recipient.friendRequestsReceived.includes(senderId)) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu kết bạn.' });
    }

    // Remove from requests lists
    recipient.friendRequestsReceived.pull(senderId);
    sender.friendRequestsSent.pull(recipientId);

    await recipient.save();
    await sender.save();

    res.json({ message: 'Đã từ chối yêu cầu kết bạn.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi từ chối yêu cầu.', error: err.message });
  }
};

const removeFriend = async (req, res) => {
  const currentUserId = req.user.id;
  const { friendId } = req.params;

  try {
    const currentUser = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!friend || !currentUser.friends.includes(friendId)) {
      return res.status(404).json({ message: 'Không tìm thấy bạn bè.' });
    }

    currentUser.friends.pull(friendId);
    friend.friends.pull(currentUserId);

    await currentUser.save();
    await friend.save();

    res.json({ message: 'Đã xóa bạn bè.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa bạn bè.', error: err.message });
  }
};

const updatePrivacy = async (req, res) => {
  const { privacy } = req.body;
  if (!['public', 'friends-only'].includes(privacy)) {
    return res.status(400).json({ message: 'Cài đặt quyền riêng tư không hợp lệ.' });
  }
  try {
    const user = await User.findById(req.user.id);
    user.privacy = privacy;
    await user.save();
    res.json({ message: 'Đã cập nhật quyền riêng tư.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật quyền riêng tư.', error: err.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, sendVerificationOTP, verifyPhoneNumber, changePassword, lockUserAccount, unlockUserAccount, getAllUsers, updateUserRole, addPlayTurns, deleteUserAccount, getPublicProfile, getUserRanks, transferPlayTurns, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, updatePrivacy };
