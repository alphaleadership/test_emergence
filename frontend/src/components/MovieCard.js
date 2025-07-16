import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { watchlistAPI } from '../services/api';

function MovieCard({ content, onPlay }) {
  const { currentProfile } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    if (!currentProfile) return;

    setLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistAPI.removeFromWatchlist(currentProfile.id, content.id);
        setIsInWatchlist(false);
      } else {
        await watchlistAPI.addToWatchlist(currentProfile.id, content.id);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Watchlist toggle failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay(content);
  };

  return (
    <div className="movie-card group relative bg-netflix-gray rounded-lg overflow-hidden">
      <img
        src={content.image_url || 'https://via.placeholder.com/300x450/333/fff?text=No+Image'}
        alt={content.title}
        className="w-full h-64 object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="text-center">
          <button
            onClick={handlePlay}
            className="netflix-button mb-2 text-sm"
          >
            ▶ Play
          </button>
          <button
            onClick={handleWatchlistToggle}
            disabled={loading}
            className="netflix-button-secondary text-sm"
          >
            {loading ? '...' : isInWatchlist ? '✓ Added' : '+ My List'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 truncate">{content.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className="genre-badge">{content.genre}</span>
          <span>{content.year}</span>
        </div>
        <div className="flex items-center mt-2">
          <div className="rating-stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(content.rating) ? 'text-yellow-400' : 'text-gray-500'}>
                ★
              </span>
            ))}
          </div>
          <span className="ml-2 text-gray-400 text-sm">
            {content.duration ? `${content.duration}min` : `${content.seasons} seasons`}
          </span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;