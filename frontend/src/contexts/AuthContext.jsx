import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token exists in localStorage, verify it's still valid
    if (token) {
      apiClient.get('/users/me/').then(response => {
        setUser(response.data);
        setLoading(false);
      }).catch(() => {
        // Token is invalid, clear everything
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await apiClient.post('/users/login/', { email, password });
    const newToken = response.data.token;
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (userData) => {
    const response = await apiClient.post('/users/register/', userData);
    const newToken = response.data.token;
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(response.data.user);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}