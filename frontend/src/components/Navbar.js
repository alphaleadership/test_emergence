import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout, currentProfile } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profiles');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-netflix-black bg-opacity-90 backdrop-blur z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <Link to="/browse" className="text-netflix-red text-2xl font-bold logo-animation">
            NETFLIX
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/browse" className="text-white hover:text-gray-300 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-white hover:text-gray-300 transition-colors">
              Search
            </Link>
            <Link to="/watchlist" className="text-white hover:text-gray-300 transition-colors">
              My List
            </Link>
          </div>
        </div>

        {/* Profile Menu */}
        <div className="flex items-center space-x-4">
          {currentProfile && (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
              >
                <div className="profile-avatar">
                  {currentProfile.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block">{currentProfile.name}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-netflix-gray border border-gray-600 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                    >
                      Manage Profiles
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;