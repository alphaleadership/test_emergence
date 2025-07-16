import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setProfiles(response.data.profiles || []);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user_id } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user_id);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const register = async (email, password, full_name) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name
      });
      
      const { access_token, user_id } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user_id', user_id);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setCurrentProfile(null);
    setProfiles([]);
  };

  const createProfile = async (name, avatar = 'default.png', is_kids = false) => {
    try {
      const response = await api.post('/profiles', {
        name,
        avatar,
        is_kids
      });
      
      await checkAuthStatus(); // Refresh user data to get updated profiles
      return { success: true, profile_id: response.data.id };
    } catch (error) {
      console.error('Profile creation failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create profile' 
      };
    }
  };

  const selectProfile = (profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('current_profile', JSON.stringify(profile));
  };

  const getCurrentProfile = () => {
    if (currentProfile) return currentProfile;
    
    const savedProfile = localStorage.getItem('current_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setCurrentProfile(profile);
      return profile;
    }
    
    return null;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    currentProfile,
    profiles,
    login,
    register,
    logout,
    createProfile,
    selectProfile,
    getCurrentProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}