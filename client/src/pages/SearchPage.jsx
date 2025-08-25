import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import '../index.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState({ users: [], games: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/search?q=${query}`);
        setResults(data);
      } catch (err) {
        setError('Lỗi khi tìm kiếm. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const getAvatarSrc = (url) => {
    if (!url) return 'https://placehold.co/60x60/EFEFEF/333?text=A';
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL}${url}`;
  };

  if (loading) {
    return <div className="page-container">Đang tìm kiếm...</div>;
  }

  return (
    <div className="page-container search-page">
      <h1>Kết quả tìm kiếm cho "{query}"</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="search-results-container">
        <div className="admin-card">
          <h2>Người dùng</h2>
          {results.users.length > 0 ? (
            <div className="search-results-list">
              {results.users.map(user => (
                <Link to={`/users/${user.username}`} key={user._id} className="search-result-item user-item">
                  <img src={getAvatarSrc(user.avatarUrl)} alt={user.username} />
                  <div className="item-info">
                    <span className="item-name">{user.displayName}</span>
                    <span className="item-subtext">@{user.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p>Không tìm thấy người dùng nào.</p>}
        </div>

        <div className="admin-card">
          <h2>Game</h2>
          {results.games.length > 0 ? (
            <div className="search-results-list">
              {results.games.map(game => (
                <Link to={`/games/${game._id}`} key={game._id} className="search-result-item game-item">
                  <img src={getAvatarSrc(game.thumbnailUrl)} alt={game.name} />
                  <div className="item-info">
                    <span className="item-name">{game.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p>Không tìm thấy game nào.</p>}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;