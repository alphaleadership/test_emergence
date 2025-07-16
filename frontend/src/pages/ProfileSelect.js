import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

function ProfileSelect() {
  const { user, profiles, createProfile, selectProfile } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', is_kids: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createProfile(newProfile.name, 'default.png', newProfile.is_kids);
    
    if (result.success) {
      setShowCreateForm(false);
      setNewProfile({ name: '', is_kids: false });
    }
    
    setLoading(false);
  };

  const handleProfileSelect = (profile) => {
    selectProfile(profile);
    navigate('/browse');
  };

  const avatarColors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-yellow-500 to-yellow-600'
  ];

  if (!user) {
    return <LoadingSpinner message="Loading profiles..." />;
  }

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Who's watching?</h1>
          <p className="text-gray-400">Select a profile to continue</p>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {profiles.map((profile, index) => (
            <div
              key={profile.id}
              onClick={() => handleProfileSelect(profile)}
              className="text-center cursor-pointer hover-scale group"
            >
              <div className={`w-24 h-24 mx-auto mb-4 rounded-lg bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-2xl font-bold group-hover:ring-4 group-hover:ring-netflix-red transition-all`}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <p className="text-white group-hover:text-netflix-red transition-colors">
                {profile.name}
              </p>
              {profile.is_kids && (
                <p className="text-xs text-gray-400 mt-1">Kids</p>
              )}
            </div>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <div
              onClick={() => setShowCreateForm(true)}
              className="text-center cursor-pointer hover-scale group"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-gray-700 flex items-center justify-center text-white text-3xl group-hover:bg-gray-600 group-hover:ring-4 group-hover:ring-netflix-red transition-all">
                +
              </div>
              <p className="text-white group-hover:text-netflix-red transition-colors">
                Add Profile
              </p>
            </div>
          )}
        </div>

        {/* Create Profile Form */}
        {showCreateForm && (
          <div className="modal-backdrop">
            <div className="bg-netflix-gray p-8 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Create Profile
              </h2>
              
              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div>
                  <label className="form-label">Profile Name</label>
                  <input
                    type="text"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
                    required
                    className="form-input"
                    placeholder="Enter profile name"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_kids"
                    checked={newProfile.is_kids}
                    onChange={(e) => setNewProfile({...newProfile, is_kids: e.target.checked})}
                    className="w-4 h-4 text-netflix-red bg-gray-700 border-gray-600 rounded"
                  />
                  <label htmlFor="is_kids" className="text-white">Kids profile</label>
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="netflix-button flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="netflix-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSelect;