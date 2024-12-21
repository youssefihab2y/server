const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/checkout - Create new order (no auth)
router.post('/', async (req, res) => {
  console.log('Received checkout request:', req.body);
  
  const {
    email,
    firstName,
    lastName,
    address,
    city,
    postalCode,
    phone,
    cartItems,
    subtotal,
    shipping,
    tax,
    total
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert into orders table
    const [orderResult] = await conn.query(
      `INSERT INTO orders (
        email, first_name, last_name, 
        address, city, postal_code, phone,
        subtotal, shipping, tax, total, 
        payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, firstName, lastName,
        address, city, postalCode, phone,
        subtotal, shipping, tax, total,
        'cash'
      ]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, size, price
        ) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.id, item.quantity, item.size, item.price]
      );
    }

    await conn.commit();
    console.log('Order created successfully:', orderId);

    res.status(201).json({
      success: true,
      orderId,
      message: 'Order placed successfully'
    });

  } catch (error) {
    await conn.rollback();
    console.error('Checkout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message
    });
  } finally {
    conn.release();
  }
});

// GET /api/checkout/order/:id - Get order details (removed auth)
router.get('/order/:id', async (req, res) => {
  try {
    // Get order details (removed user_id check)
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const [orderItems] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      order: {
        ...orders[0],
        items: orderItems
      }
    });

  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details'
    });
  }
});

module.exports = router;