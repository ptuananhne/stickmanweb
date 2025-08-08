import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import '../index.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRePassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(username, password,repassword, phoneNumber);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-panel">
          <h1>Gia nhập cộng đồng</h1>
          <p>Tạo tài khoản để bắt đầu hành trình và leo top bảng xếp hạng.</p>
        </div>
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Tạo tài khoản</h2>
            {error && <p className="auth-error-message">{error}</p>}
            
            <div className="form-group">
              <input id="username" type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
              <span className="input-icon">👤</span>
            </div>
            
            <div className="form-group">
              <input id="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
              <span className="input-icon">🔒</span>
            </div>
             <div className="form-group">
              <input id="repassword" type="password" placeholder="Nhập lại mật khẩu" value={repassword} onChange={(e) => setRePassword(e.target.value)} required disabled={loading} />
              <span className="input-icon">✒️</span>
            </div>
            <div className="form-group">
              <input id="phoneNumber" type="tel" placeholder="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required disabled={loading} />
              <span className="input-icon">📞</span>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Đăng Ký'}
            </button>
            
            <p className="auth-switch-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;