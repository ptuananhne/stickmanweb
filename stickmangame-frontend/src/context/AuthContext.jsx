// stickmangame-frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Sửa import

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Kiểm tra xem token đã hết hạn chưa
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser(decodedToken.user);
        } else {
          localStorage.removeItem('token'); // Xóa token hết hạn
        }
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decodedToken = jwtDecode(token);
    setUser(decodedToken.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
