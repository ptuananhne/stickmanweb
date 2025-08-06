import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axiosConfig.js';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFullProfile = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get('/api/users/profile', config);
      setUser(data);
    } catch (err) {
      console.error("Không thể lấy thông tin profile", err);
      const { user: basicUser } = jwtDecode(token);
      setUser(basicUser);
    }
  };

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchFullProfile(token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const initializeAuth = async () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 > Date.now()) {
            await fetchFullProfile(token);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Token không hợp lệ", error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading, 
    fetchFullProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
