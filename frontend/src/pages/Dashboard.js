import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { currentProfile } = useAuth();
  const navigate = useNavigate();

  // Redirect to browse if profile is selected
  if (currentProfile) {
    navigate('/browse');
    return null;
  }

  // Redirect to profile selection if no profile is selected
  navigate('/profiles');
  return null;
}

export default Dashboard;