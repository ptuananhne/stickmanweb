import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Import file CSS
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext.jsx'; // Sửa import
axios.defaults.baseURL = 'http://localhost:5000';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
