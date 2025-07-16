import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, full_name) => api.post('/auth/register', { email, password, full_name }),
  getMe: () => api.get('/auth/me'),
};

export const profileAPI = {
  createProfile: (name, avatar, is_kids) => api.post('/profiles', { name, avatar, is_kids }),
  getProfiles: () => api.get('/profiles'),
};

export const movieAPI = {
  getMovies: (genre, limit) => api.get('/movies', { params: { genre, limit } }),
  getMovie: (id) => api.get(`/movies/${id}`),
  addMovie: (movie) => api.post('/movies', movie),
};

export const seriesAPI = {
  getSeries: (genre, limit) => api.get('/series', { params: { genre, limit } }),
  addSeries: (series) => api.post('/series', series),
};

export const searchAPI = {
  searchContent: (query, content_type) => api.get('/search', { params: { q: query, content_type } }),
};

export const watchlistAPI = {
  addToWatchlist: (profile_id, content_id) => api.post(`/watchlist/${profile_id}/${content_id}`),
  removeFromWatchlist: (profile_id, content_id) => api.delete(`/watchlist/${profile_id}/${content_id}`),
  getWatchlist: (profile_id) => api.get(`/watchlist/${profile_id}`),
};