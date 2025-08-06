import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const AdminRoute = () => {
  const { user } = useContext(AuthContext);

  return user && user.role && user.role.toLowerCase() === 'admin' 
    ? <Outlet /> 
    : <Navigate to="/" />;
};

export default AdminRoute;