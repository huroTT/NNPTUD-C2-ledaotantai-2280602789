const User = require('../models/user.model');
const bcrypt = require('bcrypt');

class UserController {
  // Get all users (combined from both projects)
  async getAllUsers(req, res) {
    try {
      const users = await User.find({ isDeleted: false }).populate('role');
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get user by ID (combined from both projects)
  async getUserById(req, res) {
    try {
      const user = await User.findOne({ 
        _id: req.params.id, 
        isDeleted: false 
      }).populate('role');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(404).json({ message: 'User not found' });
    }
  }

  // Create user (combined from both projects)
  async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      const savedUser = await User.findById(user._id).populate('role');
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Update user (combined from both projects)
  async updateUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user || user.isDeleted) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update fields
      for (const key of Object.keys(req.body)) {
        user[key] = req.body[key];
      }
      
      await user.save();
      const updatedUser = await User.findById(user._id).populate('role');
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Soft delete user (combined from both projects)
  async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // Enable user (from buoi5)
  async enableUser(req, res) {
    try {
      const { email, username } = req.body;
      
      const user = await User.findOne({ 
        email, 
        username, 
        isDeleted: false 
      }).populate('role');
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy người dùng với email và username này' 
        });
      }
      
      user.status = true;
      await user.save();
      
      res.json({
        success: true,
        message: 'Kích hoạt tài khoản thành công',
        data: user
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Lỗi server: ' + error.message 
      });
    }
  }

  // Disable user (from buoi5)
  async disableUser(req, res) {
    try {
      const { email, username } = req.body;
      
      const user = await User.findOne({ 
        email, 
        username, 
        isDeleted: false 
      }).populate('role');
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'Không tìm thấy người dùng với email và username này' 
        });
      }
      
      user.status = false;
      await user.save();
      
      res.json({
        success: true,
        message: 'Vô hiệu hóa tài khoản thành công',
        data: user
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Lỗi server: ' + error.message 
      });
    }
  }

  // Authentication methods (from buoi6)
  async queryByUserNameAndPassword(username, password) {
    const user = await User.findOne({ username: username });
    if (!user) {
      return false;
    }
    return user;
  }

  async findUserById(id) {
    return await User.findOne({
      _id: id,
      isDeleted: false
    }).populate('role');
  }

  async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return { success: false, message: "Không tìm thấy người dùng" };
      }

      const isMatch = bcrypt.compareSync(oldPassword, user.password);
      
      if (!isMatch) {
        return { success: false, message: "Mật khẩu cũ không đúng" };
      }

      user.password = newPassword; // Will be hashed by pre-save hook
      await user.save();

      return { success: true, message: "Đổi mật khẩu thành công" };
    } catch (error) {
      return { success: false, message: "Lỗi khi đổi mật khẩu" };
    }
  }
}

module.exports = new UserController();