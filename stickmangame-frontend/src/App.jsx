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
import GamePage from './pages/GamePage'; // 1. Import GamePage

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Route công khai */}
          <Route path="/" element={<HomePage />} />

          {/* Route cho người chưa đăng nhập */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Route cho người đã đăng nhập */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* 2. Thêm route cho trang chi tiết game */}
            <Route path="/games/:id" element={<GamePage />} />

            {/* Route chỉ dành cho Admin */}
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