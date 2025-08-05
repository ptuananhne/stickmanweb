import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js'; // Import instance api đã cấu hình, thêm .js
import './ProfilePage.css'; // Import file CSS mới

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await api.get('/api/users/profile', config);
      setProfile(data);
      setFormData({
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      });
      setLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin cá nhân.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Xóa lỗi cũ khi submit
    try {
        const token = localStorage.getItem('token');
        const config = {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        };
        const { data } = await api.put('/api/users/profile', formData, config);
        setProfile(data);
        setIsEditing(false);
    } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="page-container">Đang tải...</div>;
  }

  if (error && !profile) {
    return <div className="page-container error-message">{error}</div>;
  }

  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const canEditInfo = !profile.lastInfoChange || (new Date() - new Date(profile.lastInfoChange) > ninetyDays);
  const nextEditDate = profile.lastInfoChange ? new Date(new Date(profile.lastInfoChange).getTime() + ninetyDays) : null;


  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header"></div>
        <div className="profile-avatar-wrapper">
          <img src={profile.avatarUrl} alt="Avatar" className="profile-avatar" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EFEFEF/333?text=Lỗi' }}/>
        </div>
        
        {!isEditing ? (
          <div className="profile-body">
            <h2 className="profile-display-name">{profile.displayName}</h2>
            <p className="profile-username">@{profile.username}</p>
            <p className="profile-bio">{profile.bio || 'Chưa có giới thiệu.'}</p>
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)}>Chỉnh sửa trang cá nhân</button>
            </div>
          </div>
        ) : (
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="displayName">Tên hiển thị</label>
              <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} disabled={!canEditInfo || loading} />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Giới thiệu</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={!canEditInfo || loading}></textarea>
            </div>
            {!canEditInfo && (
              <p className="cooldown-message">
                Bạn có thể thay đổi lại Tên hiển thị và Giới thiệu sau ngày: {nextEditDate.toLocaleDateString('vi-VN')}
              </p>
            )}
            <div className="form-group">
              <label htmlFor="avatarUrl">URL Ảnh đại diện</label>
              <input type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleInputChange} disabled={loading} />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={loading}>Hủy</button>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;