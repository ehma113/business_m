import axios from 'axios';

const apiClient = axios.create({
  // Removed the VITE_API_URL line for now to force it to use PythonAnywhere
  baseURL: 'http://ehma50.pythonanywhere.com/api/'
});

// ✅ ADD THIS LINE to tell the browser to allow the connection
apiClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

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