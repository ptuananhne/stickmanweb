import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ game }) => {
  const thumbnailUrl = `${import.meta.env.VITE_API_BASE_URL}${game.thumbnailUrl}`;

  return (
    <Link to={`/games/${game._id}`} className="game-card">
      <div className="game-card-thumbnail-wrapper">
        <img 
          src={thumbnailUrl} 
          alt={game.name} 
          className="game-card-thumbnail"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/300x200/cccccc/ffffff?text=Image+Error' }}
        />
      </div>
      <div className="game-card-body">
        <h3 className="game-card-title">{game.name}</h3>
        <p className="game-card-description">
          {game.description.length > 100 ? `${game.description.substring(0, 97)}...` : game.description}
        </p>
      </div>
    </Link>
  );
};

export default GameCard;
