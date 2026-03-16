const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { checkLogin, checkRole } = require('../utils/authHandler');

// Get all products with filtering (from buoi6)
router.get('/', productController.getAllProducts);

// Get product by ID (from buoi6)
router.get('/:id', productController.getProductById);

// Create product (from buoi6)
router.post('/', checkLogin, checkRole('admin', 'mod'), productController.createProduct);

// Update product (from buoi6)
router.put('/:id', checkLogin, checkRole('admin', 'mod'), productController.updateProduct);

// Delete product (from buoi6)
router.delete('/:id', checkLogin, checkRole('admin'), productController.deleteProduct);

module.exports = router;