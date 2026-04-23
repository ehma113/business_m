import axios from 'axios';

const apiClient = axios.create({
  // ✅ THIS MAGIC LINE detects if you are local or live
  baseURL: import.meta.env.VITE_API_URL || 'http://ehma50.pythonanywhere.com/api/'
});

// This interceptor will automatically add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;