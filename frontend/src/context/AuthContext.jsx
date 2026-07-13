import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [screen, setScreen] = useState('landing');
  const [params, setParams] = useState({});

  const navigate = (targetScreen, targetParams = {}) => {
    setScreen(targetScreen);
    setParams(targetParams);
  };

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Detect Google OAuth redirect parameters on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oauthToken = urlParams.get('token');
    const oauthError = urlParams.get('error');

    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (oauthError) {
      console.error('Google OAuth authentication failed:', oauthError);
      setScreen('login');
      alert(`Google Authentication Error: ${decodeURIComponent(oauthError)}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      if (!token) {
        setUser(null);
        setScreen('landing');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setScreen('dashboard');
      } catch (err) {
        console.error('Failed to sync authentication profile:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setScreen('dashboard');
      return { success: true };
    } catch (err) {
      console.error('Login action error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please double-check credentials.'
      };
    }
  };

  const register = async (name, email, password, targetJobRole) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        targetJobRole
      });
      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setScreen('dashboard');
      return { success: true };
    } catch (err) {
      console.error('Register action error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed. Try using another email.'
      };
    }
  };

  const loginWithToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setScreen('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setScreen('landing');
  };

  const getAuthHeaders = () => {
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, getAuthHeaders, API_URL, loginWithToken, screen, params, navigate }}>
      {children}
    </AuthContext.Provider>
  );
};
