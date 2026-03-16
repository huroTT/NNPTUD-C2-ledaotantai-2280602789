const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { postUserValidator, validateResult } = require('../utils/validatorHandler');
const { checkLogin, checkRole } = require('../utils/authHandler');

// Get all users (combined from both projects)
router.get('/', checkLogin, userController.getAllUsers);

// Get user by ID (combined from both projects)
router.get('/:id', checkLogin, userController.getUserById);

// Create user (combined from both projects)
router.post('/', postUserValidator, validateResult, userController.createUser);

// Update user (combined from both projects)
router.put('/:id', checkLogin, userController.updateUser);

// Delete user (combined from both projects)
router.delete('/:id', checkLogin, checkRole('admin'), userController.deleteUser);

// Enable user (from buoi5)
router.post('/enable', checkLogin, checkRole('admin'), userController.enableUser);

// Disable user (from buoi5)
router.post('/disable', checkLogin, checkRole('admin'), userController.disableUser);

module.exports = router;