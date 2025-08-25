import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import GamePage from './pages/GamePage';
import SearchPage from './pages/SearchPage.jsx';
import PublicProfilePage from './pages/PublicProfilePage.jsx';
import { Toaster } from 'react-hot-toast'; // 1. Import Toaster

function App() {
  const { loading: isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <>
      <Header />
      <Toaster
        position="top-right"
        containerStyle={{
          top: 80,
        }}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #713200',
            padding: '16px',
          },
          success: {
            style: {
              background: '#1a84c2ff',
            },
          },
          // Style riêng cho toast lỗi
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/users/:username" element={<PublicProfilePage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/games/:id" element={<GamePage />} />
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
