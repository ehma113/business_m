import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ehma50.pythonanywhere.com/api/'
});

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