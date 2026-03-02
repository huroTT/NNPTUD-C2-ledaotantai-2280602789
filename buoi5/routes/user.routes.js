const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Enable/Disable routes
router.post('/enable', userController.enableUser);
router.post('/disable', userController.disableUser);

module.exports = router;
