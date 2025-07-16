import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/profiles');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  if (loading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-netflix-red text-center mb-8 logo-animation">
            NETFLIX
          </h1>
          <h2 className="text-3xl font-bold text-white text-center">
            Sign In
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full netflix-button text-lg py-3"
            >
              Sign In
            </button>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              New to Netflix?{' '}
              <Link to="/register" className="text-netflix-red hover:underline">
                Sign up now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;