const express = require('express');
const router = express.Router();
const natural = require('natural');
const classifier = new natural.BayesClassifier();

// Greeting patterns
const greetings = [
  'Hello', 'Hi', 'Hey', 'Good morning', 'Good evening', 'Hi there',
  'Hello there', 'Greetings', 'How are you', 'How can I help',
  'Need help', 'Can you help me', 'I need assistance'
];

// Shipping and Delivery
const shipping = [
  'shipping cost', 'delivery time', 'shipping price', 'delivery fee',
  'how long does shipping take', 'when will I receive my order',
  'shipping options', 'delivery options', 'express shipping',
  'free shipping', 'shipping to my address', 'international shipping',
  'shipping policy', 'track order', 'track my package',
  'order status', 'where is my order', 'delivery tracking'
];

// Returns and Refunds
const returns = [
  'return policy', 'refund', 'can i return', 'how to return',
  'return item', 'exchange policy', 'money back',
  'wrong size return', 'damaged item', 'return shipping cost',
  'return window', 'return period', 'exchange for different size',
  'return label', 'return address', 'return status'
];

// Sizing Information
const sizing = [
  'size guide', 'what size', 'size chart', 'measurement',
  'fit', 'size recommendation', 'true to size',
  'does it run small', 'does it run large', 'size conversion',
  'measurements guide', 'how does it fit', 'is it oversized',
  'size comparison', 'plus size', 'petite size'
];

// Payment Related
const payment = [
  'payment methods', 'how to pay', 'payment options',
  'do you accept credit cards', 'accepted cards',
  'PayPal', 'Apple Pay', 'Google Pay', 'payment security',
  'payment failed', 'payment declined', 'payment issue',
  'installment options', 'buy now pay later', 'discount codes'
];

// Product Information
const products = [
  'product materials', 'fabric type', 'washing instructions',
  'care instructions', 'available colors', 'color options',
  'new arrivals', 'latest collection', 'sale items',
  'discounted items', 'product quality', 'product details',
  'stock availability', 'when will it be back in stock'
];

// Train the classifier with all patterns
[...greetings].forEach(pattern => classifier.addDocument(pattern, 'greeting'));
[...shipping].forEach(pattern => classifier.addDocument(pattern, 'shipping'));
[...returns].forEach(pattern => classifier.addDocument(pattern, 'returns'));
[...sizing].forEach(pattern => classifier.addDocument(pattern, 'sizing'));
[...payment].forEach(pattern => classifier.addDocument(pattern, 'payment'));
[...products].forEach(pattern => classifier.addDocument(pattern, 'products'));

// Train the classifier
classifier.train();

// Enhanced response templates
const responseTemplates = {
  greeting: [
    'Hello! Welcome to our clothing store. How can I assist you today?',
    'Hi there! Looking for anything specific in our collection?',
    'Welcome! I\'m here to help you find the perfect outfit. What are you looking for?'
  ],
  shipping: [
    'We offer free shipping on orders over $100! Standard delivery takes 3-5 business days.',
    'Our shipping options include: Standard (3-5 days, $7.99) and Express (1-2 days, $15).',
    'We ship worldwide! Domestic orders typically arrive within 3-5 business days. Want to know the cost for your location?'
  ],
  returns: [
    'Our hassle-free return policy allows returns within 30 days of purchase. We\'ll even provide a free return shipping label!',
    'Not happy with your purchase? You can return items within 30 days, unworn with tags attached. Need help initiating a return?',
    'Returns are easy! Just go to your order history, click "Return Item", and we\'ll guide you through the process.'
  ],
  sizing: [
    'Our detailed size guide can help you find the perfect fit! Would you like me to share our measurement chart?',
    'We recommend measuring yourself and comparing with our size chart for the best fit. Need help with measurements?',
    'Our sizes typically run true to size. For the most accurate fit, check our size guide. Would you like to see it?'
  ],
  payment: [
    'We accept all major credit cards, PayPal, Apple Pay, and Google Pay. All transactions are secure and encrypted.',
    'Payment options include credit/debit cards, PayPal, and digital wallets. We also offer Buy Now, Pay Later through Klarna!',
    'We ensure secure payments and accept all major payment methods. Having trouble with payment? I can help!'
  ],
  products: [
    'Our products are made with high-quality materials and designed for comfort and style. What specific information are you looking for?',
    'We regularly update our collection with new arrivals. Would you like to see our latest pieces?',
    'Each product comes with detailed care instructions. Looking for something specific?'
  ],
  default: [
    'I\'m not quite sure about that. Could you please rephrase your question?',
    'I want to help you better. Could you provide more details about your question?',
    'For this specific query, you might want to speak with our customer service team. Would you like their contact information?'
  ]
};

// Add console logging for debugging
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('=== Chatbot Request ===');
    console.log('Message received:', message);
    console.log('Request headers:', req.headers);
    console.log('Full request body:', req.body);

    if (!message) {
      throw new Error('No message provided');
    }

    const category = classifier.classify(message);
    console.log('Classified as:', category);

    const responses = responseTemplates[category] || responseTemplates.default;
    const response = responses[Math.floor(Math.random() * responses.length)];
    console.log('Selected response:', response);
    
    console.log('=== Sending Response ===');
    console.log('Response:', { success: true, response });

    res.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error('=== Chatbot Error ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'Chatbot routes connected' });
});

module.exports = router; 