import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="page-container">
      <h1>Chào mừng đến với StickmanGame</h1>
      {isAuthenticated ? (
        <p>Bạn đã đăng nhập! Hãy bắt đầu khám phá các trò chơi.</p>
      ) : (
        <p>Vui lòng đăng nhập hoặc đăng ký để có trải nghiệm tốt nhất.</p>
      )}
      {/* Trong tương lai, danh sách các game sẽ được hiển thị ở đây */}
    </div>
  );
};

export default HomePage;