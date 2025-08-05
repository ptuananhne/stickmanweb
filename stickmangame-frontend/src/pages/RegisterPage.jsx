import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authService.register(username, password, phoneNumber);
      navigate('/login'); // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="form-container">
      <h2>Đăng Ký</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tên đăng nhập</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Số điện thoại</label>
          <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Đăng Ký</button>
      </form>
    </div>
  );
};

export default RegisterPage;