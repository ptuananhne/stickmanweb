import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import '../index.css';

const ProfilePage = () => {
  const { user: contextUser, fetchFullProfile, loading: isAuthLoading } = useContext(AuthContext);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', bio: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewSource, setPreviewSource] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [games, setGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('turns'); // 'turns', 'friends', 'requests'

  useEffect(() => {
    if (contextUser) {
      setFormData({
        displayName: contextUser.displayName || '',
        bio: contextUser.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPreviewSource(getAvatarSrc(contextUser.avatarUrl));
      // Dữ liệu bạn bè và yêu cầu đã được populate từ backend
      setFriends(contextUser.friends || []);
      setFriendRequests(contextUser.friendRequestsReceived || []);
    }
  }, [contextUser]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get('/games');
        setGames(data);
      } catch (error) {
        console.error("Không thể tải danh sách game:", error);
      }
    };
    fetchGames();
  }, []);

  const getAvatarSrc = (url) => {
    if (!url) return 'https://placehold.co/150x150/EFEFEF/333?text=Avatar';
    return url.startsWith('http') || url.startsWith('data:') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setPreviewSource(reader.result);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uploadData = new FormData();
    uploadData.append('displayName', formData.displayName);
    uploadData.append('bio', formData.bio);
    if (avatarFile) uploadData.append('avatar', avatarFile);

    try {
      await api.put('/users/profile', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await fetchFullProfile();
      setIsEditModalOpen(false);
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setIsPasswordModalOpen(false);
      toast.success('Đổi mật khẩu thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/users/profile/send-otp');
      setOtpSent(true);
      toast.success(data.message || 'Mã OTP đã được gửi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/users/profile/verify-otp', { otp });
      await fetchFullProfile();
      setOtpSent(false);
      toast.success(data.message || 'Xác minh thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xác minh OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendAction = async (action, userId) => {
    try {
      let message = '';
      switch (action) {
        case 'accept':
          await api.post(`/users/friends/accept/${userId}`);
          message = 'Đã chấp nhận yêu cầu.';
          break;
        case 'reject':
          await api.post(`/users/friends/reject/${userId}`);
          message = 'Đã từ chối yêu cầu.';
          break;
        case 'remove':
          if (window.confirm('Bạn có chắc muốn hủy kết bạn?')) {
            await api.delete(`/users/friends/${userId}`);
            message = 'Đã hủy kết bạn.';
          } else {
            return;
          }
          break;
        default: return;
      }
      toast.success(message);
      fetchFullProfile(); // This will re-trigger the useEffect to fetch social data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const handlePrivacyChange = async (e) => {
    try {
      await api.put('/profile/privacy', { privacy: e.target.value });
      toast.success('Đã cập nhật quyền riêng tư.');
      fetchFullProfile();
    } catch (err) {
      toast.error('Lỗi khi cập nhật.');
    }
  };

  if (isAuthLoading) {
    return <div className="page-container">Đang tải thông tin người dùng...</div>;
  }

  if (!contextUser) {
    return <div className="page-container error-message">Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</div>;
  }

  const playTurnsArray = contextUser.playTurns ? Object.entries(contextUser.playTurns) : [];

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-actions">
          <button className="btn-edit-profile" onClick={() => setIsEditModalOpen(true)}>Chỉnh sửa</button>
          <button className="btn-change-password" onClick={() => setIsPasswordModalOpen(true)}>Đổi mật khẩu</button>
        </div>
        <div className="profile-header"></div>
        <div className="profile-avatar-wrapper">
          <img src={getAvatarSrc(contextUser.avatarUrl)} alt="Avatar" className="profile-avatar" onError={(e) => (e.target.src = 'https://placehold.co/150x150/EFEFEF/333?text=Lỗi')} />
        </div>
        <div className="profile-body">
          <h2 className="profile-display-name">
            {contextUser.displayName || contextUser.username}
            {contextUser.isPhoneVerified && <span className="verified-badge">✅ Đã xác minh</span>}
          </h2>
          <p className="profile-username">@{contextUser.username}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{playTurnsArray.reduce((acc, [, turns]) => acc + turns, 0)}</span>
              <span className="stat-label">Tổng lượt chơi</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{new Date(contextUser.createdAt).toLocaleDateString('vi-VN')}</span>
              <span className="stat-label">Ngày tham gia</span>
            </div>
          </div>
          <p className="profile-bio">{contextUser.bio || 'Chưa có giới thiệu.'}</p>
        </div>
      </div>

      <div className="profile-content-tabs">
        <button className={`profile-tab-button ${activeTab === 'turns' ? 'active' : ''}`} onClick={() => setActiveTab('turns')}>Lượt chơi</button>
        <button className={`profile-tab-button ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>Bạn bè ({friends.length})</button>
        <button className={`profile-tab-button ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
          Yêu cầu ({friendRequests.length})
          {friendRequests.length > 0 && <span className="notification-dot"></span>}
        </button>
      </div>

      {activeTab === 'turns' && playTurnsArray.length > 0 && (
        <div className="admin-card">
          <h2>Lượt chơi của bạn</h2>
          <div className="play-turns-grid">
            {playTurnsArray.map(([gameId, turns]) => {
              const game = games.find(g => g._id === gameId);
              if (!game) return null;
              return (
                <Link to={`/games/${game._id}`} key={gameId} className="play-turn-item">
                  <img src={getAvatarSrc(game.thumbnailUrl)} alt={game.name} className="play-turn-thumbnail" />
                  <div className="play-turn-info">
                    <span className="play-turn-name">{game.name}</span>
                    <span className="play-turn-count">{turns} lượt</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'friends' && (
        <div className="admin-card">
          <h2>Danh sách bạn bè</h2>
          <div className="social-list">
            {friends.length > 0 ? friends.map(friend => (
              <div key={friend._id} className="social-item">
                <Link to={`/users/${friend.username}`}><img src={getAvatarSrc(friend.avatarUrl)} alt={friend.displayName} className="social-avatar" /></Link>
                <Link to={`/users/${friend.username}`} className="social-name">{friend.displayName}</Link>
                <div className="social-actions">
                  <button className="btn-social-action remove" onClick={() => handleFriendAction('remove', friend._id)}>Hủy bạn</button>
                </div>
              </div>
            )) : <p>Bạn chưa có bạn bè nào.</p>}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="admin-card">
          <h2>Yêu cầu kết bạn</h2>
          <div className="social-list">
            {friendRequests.length > 0 ? friendRequests.map(requestUser => (
              <div key={requestUser._id} className="social-item">
                <Link to={`/users/${requestUser.username}`}><img src={getAvatarSrc(requestUser.avatarUrl)} alt={requestUser.displayName} className="social-avatar" /></Link>
                <Link to={`/users/${requestUser.username}`} className="social-name">{requestUser.displayName}</Link>
                <div className="social-actions">
                  <button className="btn-social-action accept" onClick={() => handleFriendAction('accept', requestUser._id)}>Chấp nhận</button>
                  <button className="btn-social-action reject" onClick={() => handleFriendAction('reject', requestUser._id)}>Từ chối</button>
                </div>
              </div>
            )) : <p>Không có yêu cầu kết bạn nào.</p>}
          </div>
        </div>
      )}

      {!contextUser.isPhoneVerified && (
        <div className="verification-section">
          <h3>Xác minh tài khoản để chơi game!</h3>
          <p>Bạn cần xác minh số điện thoại để có thể truy cập các trò chơi và nhận phần thưởng.</p>
          {!otpSent ? (
            <button onClick={handleSendOTP} disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi mã xác minh'}
            </button>
          ) : (
            <form onSubmit={handleVerifyOTP} className="otp-form">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP" required disabled={isSubmitting} />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xác minh...' : 'Xác minh'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="admin-card">
        <h2>Cài đặt</h2>
        <div className="form-group">
          <label htmlFor="privacy-setting">Ai có thể xem trang cá nhân của bạn?</label>
          <select id="privacy-setting" name="privacy" value={contextUser.privacy} onChange={handlePrivacyChange} className="privacy-select">
            <option value="public">Mọi người</option>
            <option value="friends-only">Chỉ bạn bè</option>
          </select>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Chỉnh sửa trang cá nhân</h2>
            <form className="edit-form" onSubmit={handleSubmitProfile}>
              <div className="form-group">
                <label htmlFor="avatar">Ảnh đại diện</label>
                <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label htmlFor="displayName">Tên hiển thị</label>
                <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Giới thiệu</label>
                <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={isSubmitting}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Đổi mật khẩu</h2>
            <form className="edit-form" onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Mật khẩu mới</label>
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required disabled={isSubmitting} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsPasswordModalOpen(false)} disabled={isSubmitting}>Hủy</button>
                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
