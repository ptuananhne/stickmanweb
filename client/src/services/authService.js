import api from '../api/axiosConfig.js'; 

const API_URL = '/api/auth';

const register = (username, password, phoneNumber) => {
  return api.post(`${API_URL}/register`, {
    username,
    password,
    phoneNumber,
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