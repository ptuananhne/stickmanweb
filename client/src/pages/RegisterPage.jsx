import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast'; 
import '../index.css';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error('Tên đăng nhập không hợp lệ. Chỉ bao gồm chữ cái, số và dấu gạch dưới, từ 3-30 ký tự.');
      return false;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return false;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng 10 chữ số.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    setLoading(true);
    try {
      await authService.register(username, password, phoneNumber, confirmPassword);

      toast.success('Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
      
      setTimeout(() => {
        navigate('/login');
      }, 500); // Slightly increased delay for better UX

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng ký.';
      toast.error(errorMessage);
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

            <div className="form-group">
              <input 
                id="username" 
                type="text" 
                placeholder="Tên đăng nhập" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                disabled={loading} 
              />
              <span className="input-icon">👤</span>
            </div>
            
            <div className="form-group">
              <input 
                id="password" 
                type="password" 
                placeholder="Mật khẩu" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading} 
              />
              <span className="input-icon">🔒</span>
            </div>
            
            <div className="form-group">
              <input 
                id="confirmPassword" 
                type="password" 
                placeholder="Xác nhận mật khẩu" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
                disabled={loading} 
              />
              <span className="input-icon">✒️</span>
            </div>
            
            <div className="form-group">
              <input 
                id="phoneNumber" 
                type="tel" 
                placeholder="Số điện thoại" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
                disabled={loading} 
              />
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