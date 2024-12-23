const express = require('express');
const router = express.Router();
const db = require('../config/database');

console.log('Initializing orders router');

// Test GET route
router.get('/test', (req, res) => {
  console.log('GET /test route hit');
  res.json({ message: 'Orders route is working' });
});

// Get orders by email
router.get('/user/:email', async (req, res) => {
  try {
    const userEmail = decodeURIComponent(req.params.email);
    console.log('Fetching orders for email:', userEmail);

    // Get orders by email instead of user_id
    const [orders] = await db.query(`
      SELECT o.*, oi.id as item_id, oi.quantity, oi.size, oi.price as item_price,
             p.name as product_name, p.image_url
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.email = ?
      ORDER BY o.created_at DESC
    `, [userEmail]);

    if (orders.length === 0) {
      return res.json({
        success: true,
        data: [] // Return empty array for no orders
      });
    }

    // Group items by order
    const ordersMap = orders.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name,
          address: row.address,
          city: row.city,
          postal_code: row.postal_code,
          phone: row.phone,
          subtotal: row.subtotal,
          shipping: row.shipping,
          tax: row.tax,
          total: row.total,
          payment_method: row.payment_method,
          created_at: row.created_at,
          orderItems: []
        };
      }
      
      if (row.item_id) {
        acc[row.id].orderItems.push({
          id: row.item_id,
          quantity: row.quantity,
          size: row.size,
          price: row.item_price,
          name: row.product_name,
          image_url: row.image_url
        });
      }
      
      return acc;
    }, {});

    const ordersWithItems = Object.values(ordersMap);
    console.log('Found orders:', ordersWithItems.length);

    res.json({
      success: true,
      data: ordersWithItems
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT o.*, oi.id as item_id, oi.quantity, oi.size, oi.price as item_price,
             p.name, p.image_url
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = ?
    `, [req.params.orderId]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Group items for the order
    const order = {
      id: orders[0].id,
      email: orders[0].email,
      first_name: orders[0].first_name,
      last_name: orders[0].last_name,
      address: orders[0].address,
      city: orders[0].city,
      postal_code: orders[0].postal_code,
      phone: orders[0].phone,
      subtotal: orders[0].subtotal,
      shipping: orders[0].shipping,
      tax: orders[0].tax,
      total: orders[0].total,
      payment_method: orders[0].payment_method,
      created_at: orders[0].created_at,
      orderItems: orders
        .filter(row => row.item_id)
        .map(row => ({
          id: row.item_id,
          quantity: row.quantity,
          size: row.size,
          price: row.item_price,
          name: row.name,
          image_url: row.image_url
        }))
    };

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order',
      error: error.message
    });
  }
});

console.log('Orders router initialized');

module.exports = router; 