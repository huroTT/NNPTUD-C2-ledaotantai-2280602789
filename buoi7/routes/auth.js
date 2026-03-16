const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const userController = require('../controllers/user.controller');
const { generateToken, checkLogin } = require('../utils/authHandler');
const User = require('../models/user.model');

// Register (from buoi6)
router.post('/register', async function (req, res, next) {
  try {
    const { username, password, email, role } = req.body;
    
    const newUser = new User({
      username,
      password,
      email,
      role: role || "69a5462f086d74c9e772b804" // Default role ID
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: "Đăng ký thành công"
    });
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Login (from buoi6)
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, isDeleted: false });
    
    if (!user) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
    
    const isMatch = bcrypt.compareSync(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
    
    // Update login count
    user.loginCount += 1;
    await user.save();
    
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Get current user info (from buoi6)
router.get('/me', checkLogin, async function(req, res, next) {
  try {
    const user = await userController.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Change password (from buoi6)
router.post('/change-password', checkLogin, async function(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Vui lòng cung cấp mật khẩu cũ và mật khẩu mới"
      });
    }

    const result = await userController.changePassword(req.userId, oldPassword, newPassword);
    
    if (result.success) {
      res.json({
        message: "Đổi mật khẩu thành công"
      });
    } else {
      res.status(400).json({
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server"
    });
  }
});

module.exports = router;