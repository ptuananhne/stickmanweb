import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig.js';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css';

const ProfilePage = () => {
  const { user: contextUser, fetchFullProfile, isAuthLoading } = useContext(AuthContext);
  
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', bio: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewSource, setPreviewSource] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAvatarSrc = (url) => {
    if (!url) {
      return 'https://placehold.co/150x150/EFEFEF/333?text=Avatar';
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  useEffect(() => {
    if (contextUser) {
      setFormData({
        displayName: contextUser.displayName || '',
        bio: contextUser.bio || ''
      });
      setPreviewSource(getAvatarSrc(contextUser.avatarUrl));
    }
  }, [contextUser]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    setIsSubmitting(true);
    setError('');

    const uploadData = new FormData();
    uploadData.append('displayName', formData.displayName);
    uploadData.append('bio', formData.bio);
    if (avatarFile) {
      uploadData.append('avatar', avatarFile);
    }

    try {
      await api.put('/api/users/profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchFullProfile();
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSendOTP = async () => {
    setIsSubmitting(true);
    setVerificationMessage('');
    try {
      const { data } = await api.post('/api/users/profile/send-otp');
      setVerificationMessage(data.message);
      setOtpSent(true);
    } catch (err) {
      setVerificationMessage(err.response?.data?.message || 'Lỗi khi gửi OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setVerificationMessage('');
    try {
      const { data } = await api.post('/api/users/profile/verify-otp', { otp });
      setVerificationMessage(data.message);
      await fetchFullProfile();
      setOtpSent(false);
    } catch (err) {
      setVerificationMessage(err.response?.data?.message || 'Lỗi khi xác minh OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isAuthLoading) {
    return <div className="page-container">Đang tải thông tin người dùng...</div>;
  }
  if (!contextUser) {
    return <div className="page-container error-message">Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</div>;
  }

  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const canEditDisplayName = !contextUser.lastInfoChange || (new Date() - new Date(contextUser.lastInfoChange) > thirtyDays);
  const nextEditDate = contextUser.lastInfoChange ? new Date(new Date(contextUser.lastInfoChange).getTime() + thirtyDays) : null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header"></div>
        <div className="profile-avatar-wrapper">
          <img 
            src={previewSource} 
            alt="Avatar" 
            className="profile-avatar" 
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x150/EFEFEF/333?text=Lỗi' }}
          />
        </div>
        
        {!isEditing ? (
          <div className="profile-body">
            <h2 className="profile-display-name">{contextUser.displayName || contextUser.username}</h2>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
              <p className="profile-username" style={{margin: 0}}>@{contextUser.username}</p>
              {contextUser.isPhoneVerified && (
                <span className="verified-badge">✅ Đã xác minh</span>
              )}
            </div>
            <p className="profile-bio">{contextUser.bio || 'Chưa có giới thiệu.'}</p>
            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)}>Chỉnh sửa trang cá nhân</button>
            </div>
          </div>
        ) : (
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="avatar">Ảnh đại diện</label>
              <input type="file" name="avatar" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} disabled={isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="displayName">Tên hiển thị</label>
              <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} disabled={!canEditDisplayName || isSubmitting} />
            </div>
            <div className="form-group">
              <label htmlFor="bio">Giới thiệu</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} disabled={isSubmitting}></textarea>
            </div>
            {!canEditDisplayName && (
              <p className="cooldown-message">
                Bạn có thể thay đổi lại Tên hiển thị sau ngày: {nextEditDate.toLocaleDateString('vi-VN')}
              </p>
            )}
            {error && <p className="error-message">{error}</p>}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Hủy</button>
              <button type="submit" className="save-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>

      {!contextUser.isPhoneVerified && (
        <div className="verification-section">
          <h3>Xác minh tài khoản để chơi game!</h3>
          <p>Bạn cần xác minh số điện thoại để có thể truy cập các trò chơi và nhận phần thưởng.</p>
          {!otpSent ? (
            <button onClick={handleSendOTP} disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Gửi mã xác minh'}</button>
          ) : (
            <form onSubmit={handleVerifyOTP} className="otp-form">
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP" required disabled={isSubmitting} />
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang xác minh...' : 'Xác minh'}</button>
            </form>
          )}
          {verificationMessage && <p style={{marginTop: '1rem'}}>{verificationMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
