// stickmangame-frontend/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            {/* Các trang cần đăng nhập khác sẽ được đặt ở đây */}
          </Route>
        </Routes>
      </main>
    </>
  );
}

export default App;
