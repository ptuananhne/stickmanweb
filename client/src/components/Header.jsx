import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      setSearchQuery('');
      closeMenu();
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

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
    <>
      <div className={`menu-overlay ${isMenuOpen ? 'show' : ''}`} onClick={closeMenu}></div>
      <header className="main-header">
        <Link to="/" className="logo" onClick={closeMenu}>Stickman<span>Game</span></Link>
        
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="search"
            placeholder="Tìm kiếm game, người dùng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button" aria-label="Tìm kiếm">🔍</button>
        </form>

        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
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
    </>
  );
};

export default Header;
