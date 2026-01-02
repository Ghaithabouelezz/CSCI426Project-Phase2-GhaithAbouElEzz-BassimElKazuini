
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://bookstore-backend-production-5d76.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Get current user ID from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// ========== BOOK APIs ==========
export const getBooks = () => API.get('/books');
export const searchBooks = (term) => API.get(`/books/search?term=${encodeURIComponent(term)}`);
export const filterBooksByGenre = (genre) => API.get(`/books/filter/${encodeURIComponent(genre)}`);

// ========== CART APIs ==========
export const addToCart = (bookId) => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return Promise.reject(new Error('User not logged in'));
  }
  return API.post('/cart/add', { userId: user.id, bookId });
};

export const getCartItems = () => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return Promise.resolve({ data: [] });
  }
  return API.get(`/cart?userId=${user.id}`);
};

export const removeFromCart = (cartItemId) => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return Promise.reject(new Error('User not logged in'));
  }
  return API.delete(`/cart/${cartItemId}`, { 
    data: { userId: user.id } 
  });
};

// SIMPLIFIED: Clear cart - just send userId in body
export const clearCart = () => {
  const user = getCurrentUser();
  if (!user || !user.id) {
    return Promise.reject(new Error('User not logged in'));
  }
  
  // Simple POST request with userId in body
  return API.delete('/cart/clear', {
    data: { userId: user.id }
  });
};

// ========== USER APIs ==========
export const loginUser = (username, password) => {
  return API.post('/login', { username, password });
};

export const registerUser = (username, password) => {
  return API.post('/register', { username, password });
};

// Add response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);

export default API;
