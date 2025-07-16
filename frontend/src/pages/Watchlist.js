import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { watchlistAPI } from '../services/api';

function Watchlist() {
  const { currentProfile } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    if (currentProfile) {
      loadWatchlist();
    }
  }, [currentProfile]);

  const loadWatchlist = async () => {
    try {
      const response = await watchlistAPI.getWatchlist(currentProfile.id);
      setWatchlist(response.data);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (content) => {
    setCurrentVideo(content);
  };

  const handleCloseVideo = () => {
    setCurrentVideo(null);
  };

  if (!currentProfile) {
    return <LoadingSpinner message="Please select a profile..." />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <Navbar />
        <div className="pt-20">
          <LoadingSpinner message="Loading your watchlist..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">My List</h1>
            <p className="text-gray-400">
              {currentProfile.name}'s watchlist • {watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'}
            </p>
          </div>

          {/* Watchlist Content */}
          {watchlist.length > 0 ? (
            <div className="content-grid">
              {watchlist.map((content) => (
                <MovieCard
                  key={content.id}
                  content={content}
                  onPlay={handlePlay}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-gray-600 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">Your list is empty</h3>
              <p className="text-gray-500 mb-6">
                Add movies and TV shows to your list to watch them later
              </p>
              <button
                onClick={() => window.location.href = '/browse'}
                className="netflix-button"
              >
                Browse Content
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayer content={currentVideo} onClose={handleCloseVideo} />
      )}
    </div>
  );
}

export default Watchlist;