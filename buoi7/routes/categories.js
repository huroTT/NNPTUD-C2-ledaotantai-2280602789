const express = require('express');
const router = express.Router();

// Categories routes (placeholder from buoi6)
router.get('/', function(req, res, next) {
  res.json({ message: 'Categories endpoint - to be implemented' });
});

router.get('/:id', function(req, res, next) {
  res.json({ message: 'Category by ID endpoint - to be implemented' });
});

module.exports = router;