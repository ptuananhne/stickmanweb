import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const PublicRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);

  // Nếu đã đăng nhập, chuyển hướng về trang chủ.
  // Nếu chưa, cho phép truy cập các trang public như Login, Register.
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};

export default PublicRoute;
