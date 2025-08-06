import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  const getAvatarSrc = (url) => {
    if (!url) {
      return 'https://placehold.co/36x36/EFEFEF/333?text=A';
    }
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  return (
    <header className="main-header">
      <Link to="/" className="logo" onClick={closeMenu}>Stickman<span>Game</span></Link>
      
      <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✕' : '☰'}
      </button>

      <nav className={isMenuOpen ? 'nav-open' : ''}>
        <ul>
          <li onClick={closeMenu}><Link to="/">Trang Chủ</Link></li>
          <li onClick={closeMenu}><Link to="/leaderboard">Xếp Hạng</Link></li>
          {user ? (
            <>
              <li onClick={closeMenu}>
                <Link to="/profile" className="profile-link">
                  <img 
                    src={getAvatarSrc(user.avatarUrl)} 
                    alt="Avatar" 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/36x36' }}
                  />
                  <span>{user.displayName || user.username}</span>
                </Link>
              </li>
              <li><button onClick={handleLogout} className="logout-button">Đăng Xuất</button></li>
            </>
          ) : (
            <>
              <li onClick={closeMenu}><Link to="/login">Đăng Nhập</Link></li>
              <li onClick={closeMenu}><Link to="/register">Đăng Ký</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
