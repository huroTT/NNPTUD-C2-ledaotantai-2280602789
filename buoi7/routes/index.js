const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ 
    message: 'Welcome to Buoi7 Combined API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      roles: '/api/v1/roles',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      reservations: '/api/v1/reservations'
    }
  });
});

module.exports = router;