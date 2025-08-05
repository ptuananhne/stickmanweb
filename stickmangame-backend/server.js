const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Cấu hình để đọc file .env
dotenv.config();

// Kết nối tới Database
connectDB();

// Khởi tạo ứng dụng express
const app = express();

// Sử dụng các middleware
app.use(cors());
app.use(express.json());

// Định nghĩa Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Chào mừng đến với API của StickmanGame!' });
});

// Sử dụng auth routes
app.use('/api/auth', require('./routes/authRoutes'));


// Lấy cổng từ file .env hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;

// Lắng nghe kết nối trên cổng đã định
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});