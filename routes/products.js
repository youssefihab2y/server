const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Debugging middleware
router.use((req, res, next) => {
  console.log('API Request:', {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body
  });
  next();
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    res.json({ data: products });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products by category_id
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log('Fetching products for category:', categoryId);

    const [products] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ?
    `, [categoryId]);

    // Just send the data as is, since URLs are already properly formatted in DB
    res.json({ data: products });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Get search results
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchQuery = `%${q}%`;
    
    const query = `
      SELECT * FROM products 
      WHERE name LIKE ? 
      OR description LIKE ? 
      LIMIT 8
    `;
    
    const [results] = await db.query(query, [searchQuery, searchQuery]);
    
    res.json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search products'
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching product ID:', id);
    
    const [products] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: `Product not found with ID: ${id}` });
    }

    const [productImages] = await db.query(`
      SELECT id, product_id, image_url 
      FROM product_images 
      WHERE product_id = ?
    `, [id]);
    
    const response = {
      ...products[0],
      mainImage: products[0].image_url,
      additionalImages: productImages.map(img => img.image_url),
      allImages: [
        products[0].image_url,
        ...productImages.map(img => img.image_url)
      ]
    };

    res.json({ data: response });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;