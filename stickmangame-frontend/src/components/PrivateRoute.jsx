// stickmangame-frontend/src/components/PrivateRoute.jsx

import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Nếu đã xác thực, cho phép truy cập. Nếu không, chuyển hướng về trang đăng nhập.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
