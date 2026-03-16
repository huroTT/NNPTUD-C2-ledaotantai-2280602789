const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { checkLogin, checkRole } = require('../utils/authHandler');

// Get all roles (combined from both projects)
router.get('/', roleController.getAllRoles);

// Get role by ID (combined from both projects)
router.get('/:id', roleController.getRoleById);

// Create role (combined from both projects)
router.post('/', checkLogin, checkRole('admin'), roleController.createRole);

// Update role (combined from both projects)
router.put('/:id', checkLogin, checkRole('admin'), roleController.updateRole);

// Delete role (combined from both projects)
router.delete('/:id', checkLogin, checkRole('admin'), roleController.deleteRole);

module.exports = router;