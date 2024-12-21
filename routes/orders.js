const express = require('express');
const router = express.Router();
const db = require('../config/database');

console.log('Initializing orders router');

// Test GET route
router.get('/test', (req, res) => {
  console.log('GET /test route hit');
  res.json({ message: 'Orders route is working' });
});


// Updated GET order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const [order] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [req.params.orderId]
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const [orderItems] = await db.query(
      `SELECT 
        oi.*,
        p.name AS product_name,
        p.price AS product_price,
        pi.image_url AS product_image
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE oi.order_id = ?`,
      [req.params.orderId]
    );

    res.json({
      success: true,
      data: {
        ...order,
        orderItems
      }
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

// Updated GET orders by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    // First get all orders for the user
    const [orders] = await db.query(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [req.params.userId]);

    // Get order items with product details for all orders
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      return {
        ...order,
        orderItems: items
      };
    }));

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

console.log('Orders router initialized');

module.exports = router; 