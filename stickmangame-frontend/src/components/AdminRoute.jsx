import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  // PrivateRoute đã kiểm tra loading và isAuthenticated.
  // Ở đây chỉ cần kiểm tra vai trò của người dùng.
  // Thêm .toLowerCase() để xử lý trường hợp "Admin" hoặc "admin".
  return user && user.role && user.role.toLowerCase() === 'admin' 
    ? <Outlet /> 
    : <Navigate to="/" />;
};

export default AdminRoute;