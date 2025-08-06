import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Đợi cho đến khi quá trình xác thực hoàn tất
  if (loading) {
    return <div className="page-container">Đang tải...</div>;
  }

  // Nếu đã xác thực, cho phép truy cập. Nếu không, chuyển hướng.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;