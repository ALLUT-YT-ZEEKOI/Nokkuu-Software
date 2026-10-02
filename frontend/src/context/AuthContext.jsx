import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('uply_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await api.get('/profile');
      setUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    const { token: authToken, user: userData } = response.data;
    localStorage.setItem('uply_token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/register', { name, email, password });
    const { token: authToken, user: userData } = response.data;
    localStorage.setItem('uply_token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  // Demo user quick login for seamless experience
  const loginAsDemo = async (email = 'ameen@gmail.com') => {
    const password = email === 'ameen@gmail.com' ? 'ameen@gmail.com' : 'password123';
    return await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('uply_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, loginAsDemo, logout, refreshUser: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
