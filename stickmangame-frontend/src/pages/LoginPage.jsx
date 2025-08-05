// stickmangame-frontend/src/pages/LoginPage.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Thêm state loading
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Bắt đầu loading
    try {
      const response = await authService.login(username, password);
      if (response.data.token) {
        login(response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  return (
    <div className="form-container">
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        {/* ... các input fields ... */}
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
