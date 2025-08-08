import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import { AuthContext } from '../context/AuthContext.jsx';
import '../index.css'; 

const GamePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthLoading } = useContext(AuthContext);
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]); 
  const [error, setError] = useState('');
  const iframeRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isAuthLoading && user && !user.isPhoneVerified) {
        alert('Bạn cần xác minh số điện thoại trong trang cá nhân để chơi game!');
        navigate('/profile');
        return;
    }

    const fetchGameData = async () => {
      try {
        const gameResponse = await api.get(`/api/games/${id}`);
        setGame(gameResponse.data);

        const allGamesResponse = await api.get('/api/games');
        const otherGames = allGamesResponse.data
          .filter(g => g._id !== id) 
          .slice(0, 4); 
        setRelatedGames(otherGames);

      } catch (err) {
        setError('Không thể tải thông tin game. Vui lòng thử lại sau.');
        console.error(err);
      }
    };
    
    if (!isAuthLoading && user) {
        fetchGameData();
    }
  }, [id, user, navigate, isAuthLoading]);

  const handleFullScreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen().catch(err => {
        console.error(`Lỗi khi bật toàn màn hình: ${err.message}`);
      });
    }
  };

  if (isAuthLoading || (!game && !error)) {
    return <div className="page-container">Đang tải game...</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  return (
    <div className="game-page-wrapper">
      <div className="game-layout">
        <div className="game-main-content">
          <div className="game-viewport">
            <iframe
              ref={iframeRef}
              src={game.gameUrl}
              title={game.name}
              className="game-iframe"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>

        <aside className="game-sidebar">
          <div className="game-details-card">
            <div className="game-header">
              <img 
                src={`${import.meta.env.VITE_API_BASE_URL}${game.thumbnailUrl}`} 
                alt={game.name} 
                className="game-thumbnail-small"
              />
              <h1 className="game-title-details">{game.name}</h1>
            </div>
            
            <div className="game-description-details">
              <h3>Mô tả</h3>
              <p>{game.description}</p>
            </div>

            <div className="game-meta">
               <div className="meta-item">
                  <span>👤</span>
                  <span><strong>Tác giả:</strong> StickmanGame</span>
               </div>
               <div className="meta-item">
                  <span>📅</span>
                  <span><strong>Ngày đăng:</strong> {new Date(game.createdAt).toLocaleDateString('vi-VN')}</span>
               </div>
            </div>

            <button className="fullscreen-button" onClick={handleFullScreen}>
              <span>↗</span>
              Chơi toàn màn hình
            </button>
          </div>

          {relatedGames.length > 0 && (
            <div className="related-games-card">
              <h3>Các trò chơi khác</h3>
              <div className="related-games-list">
                {relatedGames.map(relatedGame => (
                  <Link to={`/games/${relatedGame._id}`} key={relatedGame._id} className="related-game-item">
                    <img 
                      src={`${import.meta.env.VITE_API_BASE_URL}${relatedGame.thumbnailUrl}`} 
                      alt={relatedGame.name} 
                    />
                    <span>{relatedGame.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default GamePage;
