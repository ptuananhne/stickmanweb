import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import './GamePage.css';

const GamePage = () => {
  const { id } = useParams(); // Lấy ID game từ URL
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/games/${id}`);
        setGame(data);
      } catch (err) {
        setError('Không thể tải thông tin game. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [id]);

  if (loading) {
    return <div className="page-container">Đang tải game...</div>;
  }

  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }

  if (!game) {
    return <div className="page-container">Không tìm thấy game.</div>;
  }

  return (
    <div className="game-page">
      <div className="game-container">
        <div className="game-viewport">
          {/* Đây là nơi game Unity sẽ được nhúng vào */}
          <div className="game-placeholder">
            <p>Game "{game.name}" sẽ được tải ở đây.</p>
            <p>(URL: {game.gameUrl})</p>
          </div>
        </div>
      </div>

      <div className="game-details">
        <h1>{game.name}</h1>
        <p>{game.description}</p>
      </div>

      <div className="comment-section">
        <h2>Bình luận</h2>
        <div className="comment-placeholder">
          <p>Tính năng bình luận sẽ được phát triển ở các bước sau.</p>
        </div>
      </div>
    </div>
  );
};

export default GamePage;
