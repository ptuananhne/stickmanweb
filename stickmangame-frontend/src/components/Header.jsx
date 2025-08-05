import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="main-header">
      <Link to="/" className="logo">StickmanGame</Link>
      <nav>
        <ul>
          <li><Link to="/">Trang Chủ</Link></li>
          <li><Link to="/leaderboard">Xếp Hạng</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/profile">Trang Cá Nhân</Link></li>
              <li><button onClick={handleLogout} className="logout-button">Đăng Xuất</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Đăng Nhập</Link></li>
              <li><Link to="/register">Đăng Ký</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;