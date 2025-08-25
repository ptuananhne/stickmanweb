const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import the path module
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config(); // Load environment variables

connectDB(); // Connect to the database

const app = express();

// Enable CORS with specific options for security
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Update to match your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies
};
app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json());

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.json({ message: 'Chào mừng đến với API của StickmanGame!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '/uploads'))); // Fixed path module usage

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});