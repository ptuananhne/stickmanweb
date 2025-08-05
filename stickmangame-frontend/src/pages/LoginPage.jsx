import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 1. Chuyển handleSubmit thành hàm async
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.data.token) {
        // 2. Đợi cho hàm login trong context hoàn thành
        await login(response.data.token);
        navigate('/');
      }
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
          <h1>Chào mừng trở lại!</h1>
          <p>Đăng nhập để tiếp tục cuộc phiêu lưu cùng StickmanGame.</p>
        </div>
        <div className="auth-form-container">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Đăng Nhập</h2>
            {error && <p className="auth-error-message">{error}</p>}
            
            <div className="form-group">
              <input id="username" type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
              <span className="input-icon">👤</span>
            </div>
            
            <div className="form-group">
              <input id="password" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
              <span className="input-icon">🔒</span>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
            
            <p className="auth-switch-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;