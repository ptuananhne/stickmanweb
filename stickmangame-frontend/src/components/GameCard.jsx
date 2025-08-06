// src/components/GameCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

const GameCard = ({ game }) => {
  return (
    <Link to={`/games/${game._id}`} className="game-card">
      <div className="game-card-thumbnail-wrapper">
        <img 
          src={`http://localhost:5000${game.thumbnailUrl}`} 
          alt={game.name} 
          className="game-card-thumbnail"
        />
      </div>
      <div className="game-card-body">
        <h3 className="game-card-title">{game.name}</h3>
        <p className="game-card-description">{game.description}</p>
      </div>
    </Link>
  );
};

export default GameCard;