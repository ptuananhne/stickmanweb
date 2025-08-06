import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig.js';
import GameCard from '../components/GameCard.jsx';
import '../index.css';

const HomePage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/games');
        setGames(data);
      } catch (error) {
        console.error("Không thể tải danh sách game:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Thế Giới Game Stickman</h1>
          <p>Khám phá, chinh phục và leo lên đỉnh vinh quang trong các trò chơi hấp dẫn nhất!</p>
          <a href="#game-list-section" className="hero-button">Chơi Ngay</a>
        </div>
      </section>

      <section id="game-list-section" className="game-list-section">
        <h2>Các Trò Chơi Nổi Bật</h2>
        {loading ? (
          <p>Đang tải danh sách game...</p>
        ) : (
          <div className="game-grid">
            {games.length > 0 ? (
              games.map(game => <GameCard key={game._id} game={game} />)
            ) : (
              <p>Chưa có game nào được thêm. Hãy quay lại sau nhé!</p>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;
