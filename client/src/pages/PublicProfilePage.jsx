import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import '../index.css';

const PublicProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, fetchFullProfile } = useContext(AuthContext);

  const [profileUser, setProfileUser] = useState(null);
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftData, setGiftData] = useState({ gameId: '', turns: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGames, setUserGames] = useState([]);

  useEffect(() => {
    if (currentUser && username.toLowerCase() === currentUser.username.toLowerCase()) {
      navigate('/profile', { replace: true });
    }
  }, [currentUser, username, navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileRes, ranksRes] = await Promise.all([
          api.get(`/users/public/${username}`),
          api.get(`/users/${username}/ranks`),
        ]);
        setProfileUser(profileRes.data);

        // Only set ranks if the profile is not private or if they are friends
        if (profileRes.data.privacy === 'public' || profileRes.data.friendStatus === 'friends') {
          setRanks(ranksRes.data);
        } else {
          setRanks([]);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          // Handle privacy error for ranks gracefully
          setRanks([]);
        } else {
          setError('Không thể tải thông tin người dùng này.');
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [username]);

  useEffect(() => {
    const fetchUserGames = async () => {
      if (currentUser?.playTurns) {
        try {
          const { data } = await api.get('/games');
          const gamesWithTurns = data.filter(game => currentUser.playTurns[game._id] > 0);
          setUserGames(gamesWithTurns);
          if (gamesWithTurns.length > 0) {
            setGiftData(prev => ({ ...prev, gameId: gamesWithTurns[0]._id }));
          }
        } catch (error) { console.error("Failed to fetch games for gifting", error); }
      }
    };
    if (isGiftModalOpen) fetchUserGames();
  }, [isGiftModalOpen, currentUser]);

  const handleGiftSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/users/${profileUser._id}/transfer-turns`, giftData);
      toast.success('Tặng lượt chơi thành công!');
      fetchFullProfile(); // Refresh current user's data
      setIsGiftModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tặng lượt chơi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFriendAction = async (action, userId) => {
    try {
      let message = '';
      switch (action) {
        case 'add':
          await api.post(`/users/friends/request/${userId}`);
          message = 'Đã gửi yêu cầu kết bạn.';
          break;
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
        default:
          return;
      }
      toast.success(message);
      // Refetch profile data to update friend status
      const { data } = await api.get(`/users/public/${username}`);
      setProfileUser(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.');
    }
  };

  const getAvatarSrc = (url) => {
    if (!url) return 'https://placehold.co/150x150/EFEFEF/333?text=Avatar';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  if (loading) {
    return <div className="page-container">Đang tải trang cá nhân...</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!profileUser) {
    return <div className="page-container">Không tìm thấy người dùng.</div>;
  }

  const canViewFullProfile = profileUser.privacy === 'public' || profileUser.friendStatus === 'friends';

  const renderFriendButton = () => {
    if (!isAuthenticated || currentUser?._id === profileUser._id) return null;

    switch (profileUser.friendStatus) {
      case 'friends':
        return <button className="btn-change-password" onClick={() => handleFriendAction('remove', profileUser._id)}>Hủy kết bạn</button>;
      case 'request_sent':
        return <button className="btn-change-password" disabled>Đã gửi yêu cầu</button>;
      case 'request_received':
        return (
          <>
            <button className="btn-edit-profile" onClick={() => handleFriendAction('accept', profileUser._id)}>Chấp nhận</button>
            <button className="btn-change-password" onClick={() => handleFriendAction('reject', profileUser._id)}>Từ chối</button>
          </>
        );
      default:
        return <button className="btn-edit-profile" onClick={() => handleFriendAction('add', profileUser._id)}>Thêm bạn bè</button>;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-actions">
          {renderFriendButton()}
          {profileUser.friendStatus === 'friends' && (
            <button className="btn-edit-profile" onClick={() => setIsGiftModalOpen(true)}>Tặng lượt</button>
          )}
        </div>
        <div className="profile-header"></div>
        <div className="profile-avatar-wrapper">
          <img src={getAvatarSrc(profileUser.avatarUrl)} alt="Avatar" className="profile-avatar" />
        </div>
        <div className="profile-body">
          <h2 className="profile-display-name">{profileUser.displayName}</h2>
          <p className="profile-username">@{profileUser.username}</p>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-value">{new Date(profileUser.createdAt).toLocaleDateString('vi-VN')}</span>
              <span className="stat-label">Ngày tham gia</span>
            </div>
          </div>
          <p className="profile-bio">{profileUser.bio || 'Chưa có giới thiệu.'}</p>
        </div>
      </div>

      {canViewFullProfile ? (
        <div className="admin-card">
          <h2>Bảng xếp hạng</h2>
          {ranks.length > 0 ? (
            <div className="play-turns-grid">
              {ranks.map(({ game, rank }) => (
                <Link to={`/games/${game._id}`} key={game._id} className="play-turn-item rank-item">
                  <img src={getAvatarSrc(game.thumbnailUrl)} alt={game.name} className="play-turn-thumbnail" />
                  <div className="play-turn-info">
                    <span className="play-turn-name">{game.name}</span>
                    <span className="play-turn-count rank-text">Hạng: #{rank}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p>Người dùng này chưa có xếp hạng nào.</p>}
        </div>
      ) : (
        <div className="admin-card privacy-notice">
          <p>🔒 Thông tin này chỉ dành cho bạn bè.</p>
        </div>
      )}

      {isGiftModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Tặng lượt chơi cho {profileUser.displayName}</h2>
            {userGames.length > 0 ? (
              <form className="edit-form" onSubmit={handleGiftSubmit}>
                <div className="form-group">
                  <label htmlFor="gameId">Chọn Game để tặng</label>
                  <select
                    id="gameId"
                    name="gameId"
                    value={giftData.gameId}
                    onChange={(e) => setGiftData({ ...giftData, gameId: e.target.value })}
                    required
                  >
                    {userGames.map(game => (
                      <option key={game._id} value={game._id}>
                        {game.name} (Bạn có: {currentUser.playTurns[game._id]} lượt)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="turns">Số lượt muốn tặng</label>
                  <input
                    type="number"
                    id="turns"
                    name="turns"
                    value={giftData.turns}
                    onChange={(e) => setGiftData({ ...giftData, turns: parseInt(e.target.value, 10) || 1 })}
                    min="1"
                    max={currentUser.playTurns[giftData.gameId] || 1}
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsGiftModalOpen(false)} disabled={isSubmitting}>Hủy</button>
                  <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang tặng...' : 'Xác nhận'}</button>
                </div>
              </form>
            ) : (
              <div>
                <p>Bạn không có lượt chơi nào để tặng.</p>
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setIsGiftModalOpen(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;