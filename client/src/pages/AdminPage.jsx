import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig.js';
import '../index.css';
import { AuthContext } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const AdminPage = () => {
  // Game State
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({ name: '', description: '', gameUrl: '' });
  const [thumbnail, setThumbnail] = useState(null);

  // Edit Game State
  const [isEditing, setIsEditing] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [editingThumbnail, setEditingThumbnail] = useState(null);

  // User State
  const [users, setUsers] = useState([]);
  // Add Turns Modal State
  const [addTurnsModal, setAddTurnsModal] = useState({ isOpen: false, user: null });
  const [turnsData, setTurnsData] = useState({ gameId: '', turns: 1 });

  const { user: currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('games'); // 'games' or 'users'
  // General State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesRes, usersRes] = await Promise.all([
          api.get('/games'),
          api.get('/users') // New endpoint for fetching all users
        ]);
        setGames(gamesRes.data);
        setUsers(usersRes.data);
        // Pre-select the first game in the dropdown if games exist
        if (gamesRes.data.length > 0) {
          setTurnsData(prev => ({ ...prev, gameId: gamesRes.data[0]._id }));
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu admin:", err);
        toast.error("Không thể tải dữ liệu cho trang admin.");
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Game Handlers ---

  const handleNewGameChange = (e) => {
    setNewGame({ ...newGame, [e.target.name]: e.target.value });
  };

  const handleAddGameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', newGame.name);
    formData.append('description', newGame.description);
    formData.append('gameUrl', newGame.gameUrl);
    formData.append('thumbnail', thumbnail);

    try {
      const { data } = await api.post('/games', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setGames([...games, data]);
      setNewGame({ name: '', description: '', gameUrl: '' });
      setThumbnail(null);
      e.target.reset();
      toast.success('Thêm game thành công!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi thêm game.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa game này không?')) {
      try {
        await api.delete(`/games/${gameId}`);
        setGames(games.filter(g => g._id !== gameId));
        toast.success('Game đã được xóa.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi khi xóa game.');
      }
    }
  };

  const openEditModal = (game) => {
    setEditingGame({ ...game });
    setIsEditing(true);
  };

  const handleEditGameChange = (e) => {
    setEditingGame({ ...editingGame, [e.target.name]: e.target.value });
  };

  const handleUpdateGameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', editingGame.name);
    formData.append('description', editingGame.description);
    formData.append('gameUrl', editingGame.gameUrl);
    if (editingThumbnail) {
      formData.append('thumbnail', editingThumbnail);
    }

    try {
      const { data } = await api.put(`/games/${editingGame._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setGames(games.map(g => (g._id === editingGame._id ? data : g)));
      setIsEditing(false);
      setEditingGame(null);
      setEditingThumbnail(null);
      toast.success('Cập nhật game thành công!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật game.');
    } finally {
      setLoading(false);
    }
  };

  // --- User Handlers ---

  const handleToggleLockUser = async (user) => {
    const action = user.isLocked ? 'unlock' : 'lock';
    const actionText = user.isLocked ? 'mở khóa' : 'khóa';
    if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản ${user.username}?`)) {
      try {
        await api.put(`/users/${user._id}/${action}`);
        setUsers(users.map(u => u._id === user._id ? { ...u, isLocked: !u.isLocked } : u));
        toast.success(`Đã ${actionText} tài khoản ${user.username}.`);
      } catch (err) {
        toast.error(err.response?.data?.message || `Lỗi khi ${actionText} tài khoản.`);
      }
    }
  };

  const handlePromoteUser = async (user) => {
    if (window.confirm(`Bạn có chắc muốn nâng cấp ${user.username} thành Admin?`)) {
      try {
        await api.put(`/users/${user._id}/role`, { role: 'admin' });
        setUsers(users.map(u => u._id === user._id ? { ...u, role: 'admin' } : u));
        toast.success(`${user.username} đã trở thành Admin.`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi khi nâng cấp vai trò.');
      }
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (currentUser?._id === userToDelete._id) {
      toast.error("Bạn không thể xóa chính mình.");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản ${userToDelete.username}? Hành động này không thể hoàn tác.`)) {
      try {
        await api.delete(`/users/${userToDelete._id}`);
        setUsers(users.filter(u => u._id !== userToDelete._id));
        toast.success(`Đã xóa tài khoản ${userToDelete.username}.`);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Lỗi khi xóa tài khoản.');
      }
    }
  };

  const openAddTurnsModal = (user) => {
    setAddTurnsModal({ isOpen: true, user: user });
  };

  const handleTurnsDataChange = (e) => {
    setTurnsData({ ...turnsData, [e.target.name]: e.target.value });
  };

  const handleAddTurnsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { user } = addTurnsModal;
    const { gameId, turns } = turnsData;

    if (!gameId || !turns || parseInt(turns) <= 0) {
      toast.error("Vui lòng chọn một game và nhập số lượt chơi hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/users/${user._id}/add-turns`, { gameId, turns: parseInt(turns) });
      toast.success(`Đã cộng ${turns} lượt chơi cho người dùng ${user.username}.`);
      setAddTurnsModal({ isOpen: false, user: null });
      setTurnsData({ gameId: games.length > 0 ? games[0]._id : '', turns: 1 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cộng lượt chơi.');
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return <div className="page-container">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>Bảng điều khiển</h1>

        <div className="admin-tabs">
          <button className={`admin-tab-button ${activeTab === 'games' ? 'active' : ''}`} onClick={() => setActiveTab('games')}>
            Quản lý Game
          </button>
          <button className={`admin-tab-button ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Quản lý Người dùng
          </button>
        </div>

        {activeTab === 'games' && (
          <>
            <details className="admin-card collapsible-form">
              <summary><h2>Thêm Game Mới</h2></summary>
              <form onSubmit={handleAddGameSubmit} className="admin-form">
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                  <label htmlFor="new-game-name">Tên Game</label>
                  <input id="new-game-name" type="text" name="name" placeholder="Tên Game" value={newGame.name} onChange={handleNewGameChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="new-game-desc">Mô tả</label>
                  <textarea id="new-game-desc" name="description" placeholder="Mô tả" value={newGame.description} onChange={handleNewGameChange} required></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="new-game-url">URL của Game</label>
                  <input id="new-game-url" type="text" name="gameUrl" placeholder="URL của Game (vd: /games/flappy-bird/index.html)" value={newGame.gameUrl} onChange={handleNewGameChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="new-game-thumb">Ảnh Thumbnail</label>
                  <input id="new-game-thumb" type="file" onChange={(e) => setThumbnail(e.target.files[0])} required />
                </div>
                <button type="submit" disabled={loading}>{loading ? 'Đang thêm...' : 'Thêm Game'}</button>
              </form>
            </details>

            <div className="admin-card">
              <h2>Danh sách Game</h2>
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Tên Game</th>
                      <th style={{ textAlign: 'right' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game._id}>
                        <td><img src={`${import.meta.env.VITE_API_BASE_URL}${game.thumbnailUrl}`} alt={game.name} className="admin-table-thumbnail" /></td>
                        <td>{game.name}</td>
                        <td className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                          <button className="admin-btn-edit" onClick={() => openEditModal(game)}>Sửa</button>
                          <button className="admin-btn-delete" onClick={() => handleDeleteGame(game._id)}>Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="admin-card">
            <h2>Danh sách Người dùng</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.role}</td>
                      <td>{user.isLocked ? <span className="status-locked">Đã khóa</span> : <span className="status-active">Hoạt động</span>}</td>
                      <td className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className={`admin-btn-${user.isLocked ? 'unlock' : 'lock'}`} onClick={() => handleToggleLockUser(user)}>
                          {user.isLocked ? 'Mở khóa' : 'Khóa'}
                        </button>
                        {user.role !== 'admin' && (
                          <button className="admin-btn-promote" onClick={() => handlePromoteUser(user)}>Nâng quyền</button>
                        )}
                        <button className="admin-btn-add-turns" onClick={() => openAddTurnsModal(user)}>Cộng lượt</button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => handleDeleteUser(user)}
                          disabled={currentUser?._id === user._id}>
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isEditing && editingGame && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Chỉnh sửa Game</h2>
            <form onSubmit={handleUpdateGameSubmit} className="admin-form">
              <input type="text" name="name" placeholder="Tên Game" value={editingGame.name} onChange={handleEditGameChange} required />
              <textarea name="description" placeholder="Mô tả" value={editingGame.description} onChange={handleEditGameChange} required></textarea>
              <input type="text" name="gameUrl" placeholder="URL của Game" value={editingGame.gameUrl} onChange={handleEditGameChange} required />
              <label>Ảnh Thumbnail mới (tùy chọn):</label>
              <input type="file" onChange={(e) => setEditingThumbnail(e.target.files[0])} />
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditing(false)} disabled={loading}>Hủy</button>
                <button type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addTurnsModal.isOpen && addTurnsModal.user && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Cộng lượt chơi cho {addTurnsModal.user.username}</h2>
            <form onSubmit={handleAddTurnsSubmit} className="admin-form">
              <div className="form-group">
                <label htmlFor="gameId">Chọn Game</label>
                <select id="gameId" name="gameId" value={turnsData.gameId} onChange={handleTurnsDataChange} required>
                  {games.map(game => (
                    <option key={game._id} value={game._id}>{game.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="turns">Số lượt chơi</label>
                <input
                  type="number"
                  id="turns"
                  name="turns"
                  value={turnsData.turns}
                  onChange={handleTurnsDataChange}
                  min="1"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setAddTurnsModal({ isOpen: false, user: null })} disabled={loading}>Hủy</button>
                <button type="submit" disabled={loading}>{loading ? 'Đang cộng...' : 'Xác nhận'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
