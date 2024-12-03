const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Router-level debugging middleware
router.use((req, res, next) => {
  console.log('=== Products Router ===');
  console.log('Original URL:', req.originalUrl);
  console.log('Base URL:', req.baseUrl);
  console.log('Path:', req.path);
  console.log('===================');
  next();
});
// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.query('SELECT * FROM products');
    console.log('Fetched products:', products); // Log the fetched products
    res.json({ data: products }); // Ensure the response format matches what the client expects
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /api/products/type/:typeId
router.get('/type/:typeId', async (req, res) => {
  console.log('Type route hit with typeId:', req.params.typeId);
  try {
    const { typeId } = req.params;
    const query = `
      SELECT *
      FROM products 
      WHERE type_id = ?
      ORDER BY created_at DESC
    `;

    const [products] = await db.query(query, [typeId]);
    console.log(`Found ${products.length} products for type ${typeId}`);
    
    return res.json({ 
      success: true,
      data: products 
    });
  } catch (error) {
    console.error('Type route error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// GET /api/products/category/:categoryId
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

// GET /api/products/search
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


// GET /api/products/:id (MUST be last)
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

// Add this new route for combined filtering
router.get('/category/:categoryId/type/:typeId', async (req, res) => {
  console.log('Combined category/type route hit:', req.params);
  try {
    const { categoryId, typeId } = req.params;
    const query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.type_id = ?
      ORDER BY p.created_at DESC
    `;

    const [products] = await db.query(query, [categoryId, typeId]);
    console.log(`Found ${products.length} products for category ${categoryId} and type ${typeId}`);
    
    return res.json({ 
      success: true,
      data: products 
    });
  } catch (error) {
    console.error('Combined filter route error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;