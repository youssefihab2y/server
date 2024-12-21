const express = require('express');
const router = express.Router();
const { sendOrderConfirmation } = require('../utils/emailService');

console.log('Initializing orders router');

// Test GET route
router.get('/test', (req, res) => {
  console.log('GET /test route hit');
  res.json({ message: 'Orders route is working' });
});

// Test email route
router.post('/test-email', (req, res) => {
  console.log('POST /test-email route hit');
  console.log('Request body:', req.body);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const testOrder = {
      email: email,
      firstName: "Yossef",
      lastName: "Ehab",
      orderId: "TEST" + Date.now(),
      orderItems: [
        {
          id: 1,
          name: "Test Product 1",
          size: "XL",
          quantity: 2,
          price: "29.99"
        }
      ],
      subtotal: "79.97",
      shipping: "10.00",
      tax: "8.00",
      total: "97.97",
      address: "alex",
      city: "alex",
      postalCode: "93939933"
    };

    console.log('Attempting to send email...');
    
    sendOrderConfirmation(testOrder)
      .then(emailSent => {
        if (emailSent) {
          res.json({ 
            success: true, 
            message: 'Test email sent successfully',
            sentTo: email,
            orderDetails: testOrder
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Failed to send test email' 
          });
        }
      })
      .catch(error => {
        console.error('Email error:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Failed to send test email',
          error: error.message 
        });
      });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process request',
      error: error.message 
    });
  }
});

console.log('Orders router initialized');

module.exports = router; 