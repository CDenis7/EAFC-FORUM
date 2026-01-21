import { defineStore } from 'pinia';
import apiClient from '@/services/api';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isModerator: (state) => state.user?.role === 'moderator' || state.user?.role === 'admin',
    isOwner: (state) => (username) => state.user?.username === username,
  },
  
  actions: {
    async login(credentials) {
      const response = await apiClient.post('/auth/login', credentials);
      this.setAuth(response.data.token, response.data.user);
      router.push('/');
    },
    
    async register(userData) {
      const response = await apiClient.post('/auth/register', userData);
      this.setAuth(response.data.token, response.data.user);
      router.push('/');
    },

    updateUser(updatedUser) {
      this.user = { ...this.user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(this.user));
    },
    
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },
    
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      router.push('/login');
    }
  }
});