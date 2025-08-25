import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import '../index.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      // Destructure để code an toàn và rõ ràng hơn
      const { success, data, message } = response.data || {};

      if (success && data?.token) {
        await login(data.token); // Gọi hàm login từ AuthContext
        toast.success('Đăng nhập thành công!');
        navigate('/profile'); // Chuyển hướng đến trang profile
      } else {
        // Xử lý trường hợp đăng nhập không thành công từ server (ví dụ: sai thông tin)
        toast.error(message || 'Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      // Xử lý lỗi mạng hoặc lỗi server (ví dụ: 500)
      const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      toast.error(errorMessage);
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
            <div className="form-group">
              <label htmlFor="username" className="sr-only">Tên đăng nhập</label>
              <input 
                id="username" 
                type="text" 
                placeholder="Tên đăng nhập" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                autoComplete="username"
                required 
                disabled={loading} 
              />
              <span className="input-icon">👤</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <input 
                id="password" 
                type="password" 
                placeholder="Mật khẩu" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                autoComplete="current-password"
                required 
                disabled={loading} 
              />
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
