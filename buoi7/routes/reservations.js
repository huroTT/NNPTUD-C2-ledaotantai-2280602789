const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { checkLogin } = require('../utils/authHandler');

// Get all reservations của user
router.get('/', checkLogin, reservationController.getAllReservations);

// Get 1 reservation của user
router.get('/:id', checkLogin, reservationController.getReservationById);

// Reserve a cart (POST với transaction)
router.post('/reserveACart', checkLogin, reservationController.reserveACart);

// Reserve items (POST với transaction)
router.post('/reserveItems', checkLogin, reservationController.reserveItems);

// Cancel reserve (POST không cần transaction)
router.post('/cancelReserve/:id', checkLogin, reservationController.cancelReserve);

module.exports = router;