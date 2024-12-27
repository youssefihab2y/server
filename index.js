const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const productsRouter = require('./routes/products');
const checkoutRouter = require('./routes/checkout');
const authRoutes = require('./routes/auth');
const ordersRouter = require('./routes/orders');
const chatbotRoutes = require('./routes/chatbot');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request Body:', req.body);
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRouter);
app.use('/api/chatbot', chatbotRoutes);

// Test route to verify server is working
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - this should be last
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});