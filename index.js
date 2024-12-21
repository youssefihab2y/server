const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');
const checkoutRouter = require('./routes/checkout');
require('dotenv').config();
const path = require('path');
const authRoutes = require('./routes/auth');
const ordersRouter = require('./routes/orders');

const app = express();

// Update CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept']
}));

app.use(express.json());

// Debugging middleware for all requests
app.use((req, res, next) => {
  console.log(`${req.method} Request to ${req.url}`, {
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
});

// Routes
app.use('/api/products', productsRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/auth', authRoutes);
app.use('/api/orders', ordersRouter);

// Serve static files
app.use('/images/Products', express.static(path.join(__dirname, 'public/images/Products')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

console.log('Static files path:', path.join(__dirname, 'public/images/Products'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Handle 404 errors
app.use((req, res) => {
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