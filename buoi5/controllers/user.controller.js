const User = require('../models/user.model');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: { $exists: false } }).populate('role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ 
      _id: req.params.id, 
      deletedAt: { $exists: false } 
    }).populate('role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    await user.populate('role');
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $exists: false } },
      req.body,
      { new: true }
    ).populate('role');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Soft delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $exists: false } },
      { deletedAt: new Date() },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enable user
exports.enableUser = async (req, res) => {
  try {
    const { email, username } = req.body;
    
    const user = await User.findOne({ email, username, deletedAt: { $exists: false } }).populate('role');
    
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
};

// Disable user
exports.disableUser = async (req, res) => {
  try {
    const { email, username } = req.body;
    
    const user = await User.findOne({ email, username, deletedAt: { $exists: false } }).populate('role');
    
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
};
