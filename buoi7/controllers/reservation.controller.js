const Reservation = require('../models/reservation.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class ReservationController {
  // Get all reservations của user
  async getAllReservations(req, res) {
    try {
      const reservations = await Reservation.find({ 
        user: req.userId, 
        isDeleted: false 
      })
      .populate('user', 'username email fullName')
      .populate('items.product', 'title price images')
      .populate('cart')
      .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }

  // Get 1 reservation của user
  async getReservationById(req, res) {
    try {
      const reservation = await Reservation.findOne({
        _id: req.params.id,
        user: req.userId,
        isDeleted: false
      })
      .populate('user', 'username email fullName')
      .populate('items.product', 'title price images description')
      .populate('cart');

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy reservation'
        });
      }

      res.json({
        success: true,
        data: reservation
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Reservation không tồn tại'
      });
    }
  }

  // Reserve a cart
  async reserveACart(req, res) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const { cartId } = req.body;

        // Tìm cart của user
        const cart = await Cart.findOne({
          _id: cartId,
          user: req.userId,
          status: 'active',
          isDeleted: false
        }).populate('items.product').session(session);

        if (!cart) {
          throw new Error('Không tìm thấy cart hoặc cart đã được reserve');
        }

        if (cart.items.length === 0) {
          throw new Error('Cart trống, không thể reserve');
        }

        // Kiểm tra tồn kho cho tất cả sản phẩm
        for (const item of cart.items) {
          const product = await Product.findById(item.product._id).session(session);
          if (!product || product.isDeleted) {
            throw new Error(`Sản phẩm ${item.product.title} không còn tồn tại`);
          }
        }

        // Tạo reservation từ cart
        const reservation = new Reservation({
          user: req.userId,
          items: cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
          })),
          reservationType: 'cart',
          cart: cart._id
        });

        await reservation.save({ session });

        // Cập nhật status của cart
        cart.status = 'reserved';
        await cart.save({ session });

        await reservation.populate([
          { path: 'user', select: 'username email fullName' },
          { path: 'items.product', select: 'title price images' },
          { path: 'cart' }
        ]);

        res.status(201).json({
          success: true,
          message: 'Reserve cart thành công',
          data: reservation
        });
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      await session.endSession();
    }
  }

  // Reserve items (list products và quantity)
  async reserveItems(req, res) {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const { items } = req.body; // [{ productId, quantity }]

        if (!items || !Array.isArray(items) || items.length === 0) {
          throw new Error('Danh sách sản phẩm không hợp lệ');
        }

        const reservationItems = [];

        // Kiểm tra và chuẩn bị dữ liệu cho từng item
        for (const item of items) {
          const { productId, quantity } = item;

          if (!productId || !quantity || quantity <= 0) {
            throw new Error('ProductId và quantity phải hợp lệ');
          }

          const product = await Product.findOne({
            _id: productId,
            isDeleted: false
          }).session(session);

          if (!product) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
          }

          reservationItems.push({
            product: product._id,
            quantity: parseInt(quantity),
            price: product.price
          });
        }

        // Tạo reservation
        const reservation = new Reservation({
          user: req.userId,
          items: reservationItems,
          reservationType: 'items'
        });

        await reservation.save({ session });

        await reservation.populate([
          { path: 'user', select: 'username email fullName' },
          { path: 'items.product', select: 'title price images' }
        ]);

        res.status(201).json({
          success: true,
          message: 'Reserve items thành công',
          data: reservation
        });
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      await session.endSession();
    }
  }

  // Cancel reserve (không dùng transaction vì chỉ là cancel)
  async cancelReserve(req, res) {
    try {
      const reservationId = req.params.id;

      const reservation = await Reservation.findOne({
        _id: reservationId,
        user: req.userId,
        isDeleted: false
      });

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy reservation'
        });
      }

      if (reservation.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Reservation đã được hủy trước đó'
        });
      }

      if (reservation.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy reservation đã hoàn thành'
        });
      }

      // Cập nhật status thành cancelled
      reservation.status = 'cancelled';
      await reservation.save();

      // Nếu reservation từ cart, cập nhật lại cart status
      if (reservation.reservationType === 'cart' && reservation.cart) {
        await Cart.findByIdAndUpdate(
          reservation.cart,
          { status: 'active' }
        );
      }

      res.json({
        success: true,
        message: 'Hủy reservation thành công',
        data: reservation
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReservationController();