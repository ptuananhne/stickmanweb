import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js';
import '../ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // State cho form và file
  const [formData, setFormData] = useState({ displayName: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewSource, setPreviewSource] = useState('');

  const fetchProfile = async () => {
    // ... (hàm fetchProfile không đổi)
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get('/api/users/profile', config);
      setProfile(data);
      setFormData({ displayName: data.displayName, bio: data.bio });
      setPreviewSource(data.avatarUrl); // Đặt ảnh xem trước ban đầu
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

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPreviewSource(reader.result);
      };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Sử dụng FormData để gửi cả text và file
    const uploadData = new FormData();
    uploadData.append('displayName', formData.displayName);
    uploadData.append('bio', formData.bio);
    if (avatarFile) {
      uploadData.append('avatar', avatarFile); // 'avatar' phải khớp với tên trong upload.single()
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data', // Quan trọng!
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await api.put('/api/users/profile', uploadData, config);
      setProfile(data);
      setPreviewSource(data.avatarUrl);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setLoading(false);
    }
  };

  // ... (phần render JSX)
  if (loading && !profile) return <div className="page-container">Đang tải...</div>;
  if (error && !profile) return <div className="page-container error-message">{error}</div>;

  const ninetyDays = 90 * 24 * 60 * 60 * 1000;
  const canEditInfo = !profile.lastInfoChange || (new Date() - new Date(profile.lastInfoChange) > ninetyDays);
  const nextEditDate = profile.lastInfoChange ? new Date(new Date(profile.lastInfoChange).getTime() + ninetyDays) : null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header"></div>
        <div className="profile-avatar-wrapper">
          <img 
            src={previewSource.startsWith('data:') ? previewSource : `http://localhost:5000${previewSource}`} 
            alt="Avatar" 
            className="profile-avatar" 
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EFEFEF/333?text=Lỗi' }}
          />
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
              <label htmlFor="avatar">Ảnh đại diện</label>
              <input type="file" name="avatar" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} disabled={loading} />
            </div>
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