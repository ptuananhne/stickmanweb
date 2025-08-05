// stickmangame-frontend/src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig.js';
import '../index.css'; // Sẽ tạo file này ngay sau đây

const AdminPage = () => {
  const [games, setGames] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data } = await api.get('/api/games');
        setGames(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách game:", err);
      }
    };
    fetchGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('gameUrl', gameUrl);
    formData.append('thumbnail', thumbnail);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await api.post('/api/games', formData, config);
      setGames([...games, data]);
      // Reset form
      setName('');
      setDescription('');
      setGameUrl('');
      setThumbnail(null);
      e.target.reset(); // Xóa file đã chọn khỏi input
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm game.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Bảng điều khiển Admin</h1>
        
        <div className="admin-section">
          <h2>Thêm Game Mới</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            {error && <p className="error-message">{error}</p>}
            <input type="text" placeholder="Tên Game" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea placeholder="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
            <input type="text" placeholder="URL của Game" value={gameUrl} onChange={(e) => setGameUrl(e.target.value)} required />
            <label>Ảnh Thumbnail:</label>
            <input type="file" onChange={(e) => setThumbnail(e.target.files[0])} required />
            <button type="submit" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm Game'}</button>
          </form>
        </div>

        <div className="admin-section">
          <h2>Danh sách Game hiện có</h2>
          <div className="game-list-admin">
            {games.map(game => (
              <div key={game._id} className="game-item-admin">
                <img src={`http://localhost:5000${game.thumbnailUrl}`} alt={game.name} />
                <span>{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
