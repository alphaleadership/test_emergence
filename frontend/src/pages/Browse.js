import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import ContentRow from '../components/ContentRow';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { movieAPI, seriesAPI } from '../services/api';

function Browse() {
  const { currentProfile } = useAuth();
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [featuredContent, setFeaturedContent] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [moviesRes, seriesRes] = await Promise.all([
        movieAPI.getMovies(null, 20),
        seriesAPI.getSeries(null, 20)
      ]);

      setMovies(moviesRes.data);
      setSeries(seriesRes.data);
      
      // Set featured content (first movie or series)
      if (moviesRes.data.length > 0) {
        setFeaturedContent(moviesRes.data[0]);
      } else if (seriesRes.data.length > 0) {
        setFeaturedContent(seriesRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
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

  if (loading) {
    return <LoadingSpinner message="Loading content..." />;
  }

  if (!currentProfile) {
    return <LoadingSpinner message="Please select a profile..." />;
  }

  // Group content by genres
  const actionMovies = movies.filter(movie => movie.genre.toLowerCase().includes('action'));
  const comedyMovies = movies.filter(movie => movie.genre.toLowerCase().includes('comedy'));
  const dramaMovies = movies.filter(movie => movie.genre.toLowerCase().includes('drama'));
  const horrorMovies = movies.filter(movie => movie.genre.toLowerCase().includes('horror'));
  
  const actionSeries = series.filter(serie => serie.genre.toLowerCase().includes('action'));
  const comedySeries = series.filter(serie => serie.genre.toLowerCase().includes('comedy'));
  const dramaSeries = series.filter(serie => serie.genre.toLowerCase().includes('drama'));

  return (
    <div className="min-h-screen bg-netflix-black">
      <Navbar />
      
      {/* Hero Section */}
      {featuredContent && (
        <div className="relative h-screen">
          <div className="absolute inset-0">
            <img
              src={featuredContent.image_url || 'https://via.placeholder.com/1920x1080/333/fff?text=Featured+Content'}
              alt={featuredContent.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          </div>
          
          <div className="relative z-10 flex items-center h-full px-4 md:px-16">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 fade-in">
                {featuredContent.title}
              </h1>
              <p className="text-lg text-gray-300 mb-6 fade-in">
                {featuredContent.description}
              </p>
              <div className="flex items-center space-x-4 mb-6 fade-in">
                <div className="flex items-center space-x-2">
                  <span className="genre-badge">{featuredContent.genre}</span>
                  <span className="text-gray-300">{featuredContent.year}</span>
                </div>
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(featuredContent.rating) ? 'text-yellow-400' : 'text-gray-500'}>
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 fade-in">
                <button 
                  onClick={() => handlePlay(featuredContent)}
                  className="netflix-button text-lg px-8 py-3"
                >
                  ▶ Play
                </button>
                <button className="netflix-button-secondary text-lg px-8 py-3">
                  ⓘ More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <div className="relative z-10 -mt-32 pb-12">
        <ContentRow title="Trending Movies" content={movies.slice(0, 10)} onPlay={handlePlay} />
        <ContentRow title="Popular Series" content={series.slice(0, 10)} onPlay={handlePlay} />
        
        {actionMovies.length > 0 && (
          <ContentRow title="Action Movies" content={actionMovies} onPlay={handlePlay} />
        )}
        
        {comedyMovies.length > 0 && (
          <ContentRow title="Comedy Movies" content={comedyMovies} onPlay={handlePlay} />
        )}
        
        {dramaMovies.length > 0 && (
          <ContentRow title="Drama Movies" content={dramaMovies} onPlay={handlePlay} />
        )}
        
        {horrorMovies.length > 0 && (
          <ContentRow title="Horror Movies" content={horrorMovies} onPlay={handlePlay} />
        )}
        
        {actionSeries.length > 0 && (
          <ContentRow title="Action Series" content={actionSeries} onPlay={handlePlay} />
        )}
        
        {comedySeries.length > 0 && (
          <ContentRow title="Comedy Series" content={comedySeries} onPlay={handlePlay} />
        )}
        
        {dramaSeries.length > 0 && (
          <ContentRow title="Drama Series" content={dramaSeries} onPlay={handlePlay} />
        )}
      </div>

      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayer content={currentVideo} onClose={handleCloseVideo} />
      )}
    </div>
  );
}

export default Browse;