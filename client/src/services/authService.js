import api from '../api/axiosConfig.js'; 

const API_URL = '/auth';

const register = (username, password, phoneNumber, confirmPassword) => {
  return api.post(`${API_URL}/register`, {
    username,
    password,
    phoneNumber,
    confirmPassword 
  });
};

const login = (username, password) => {
  return api.post(`${API_URL}/login`, {
    username,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;