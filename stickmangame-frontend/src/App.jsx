import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* --- Cấu trúc Route mới và logic hơn --- */}

          {/* Route công khai mà ai cũng xem được */}
          <Route path="/" element={<HomePage />} />

          {/* Các route chỉ dành cho người chưa đăng nhập */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Các route chỉ dành cho người đã đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Route chỉ dành cho Admin (được lồng bên trong PrivateRoute) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
          
        </Routes>
      </main>
    </>
  );
}

export default App;