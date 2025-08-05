import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

const HomePage = () => {
  return (
    <>
      <section className="hero-section">
        <div className="hero-content">
          <h1>Thế Giới Game Stickman</h1>
          <p>Khám phá, chinh phục và leo lên đỉnh vinh quang trong các trò chơi hấp dẫn nhất!</p>
          <Link to="/games" className="hero-button">Chơi Ngay</Link>
        </div>
      </section>

      <section className="game-list-section">
        <h2>Các Trò Chơi Nổi Bật</h2>
        <div className="game-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="game-card-placeholder">
              <div className="thumbnail">Game {i}</div>
              <h3>Tên Game {i}</h3>
              <p>Mô tả ngắn gọn về trò chơi này.</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
