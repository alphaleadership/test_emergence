import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { searchAPI } from '../services/api';

function Search() {
  const { currentProfile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (query.length > 2) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query, filterType]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await searchAPI.searchContent(
        query, 
        filterType === 'all' ? null : filterType
      );
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
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

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      
      <div className="pt-20 px-4 md:px-16">
        {/* Search Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies and TV shows..."
              className="search-bar"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex space-x-4 mb-6">
            {['all', 'movies', 'series'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filterType === type
                    ? 'bg-netflix-red text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : query.length > 2 ? (
            <>
              {results.length > 0 ? (
                <>
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Search results for "{query}" ({results.length} results)
                  </h2>
                  <div className="content-grid">
                    {results.map((content) => (
                      <MovieCard
                        key={content.id}
                        content={content}
                        onPlay={handlePlay}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
                  <p className="text-gray-500">Try different keywords or check your spelling</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Start typing to search</h3>
              <p className="text-gray-500">Search for your favorite movies and TV shows</p>
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

export default Search;