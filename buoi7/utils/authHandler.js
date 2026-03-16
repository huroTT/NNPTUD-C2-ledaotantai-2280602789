const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

module.exports = {
  checkLogin: async function (req, res, next) {
    let token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer")) {
      return res.status(403).json({ message: "Bạn chưa đăng nhập" });
    }
    
    token = token.split(' ')[1];
    try {
      const result = jwt.verify(token, JWT_SECRET);
      if (result && result.exp * 1000 > Date.now()) {
        req.userId = result.id;
        next();
      } else {
        res.status(403).json({ message: "Token đã hết hạn" });
      }
    } catch (error) {
      res.status(403).json({ message: "Token không hợp lệ" });
    }
  },

  checkRole: function(...allowedRoles) {
    return async function (req, res, next) {
      try {
        const user = await User.findById(req.userId).populate('role');
        
        if (!user) {
          return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        if (!user.role) {
          return res.status(403).json({ message: "Người dùng chưa có quyền" });
        }

        const roleName = user.role.name.toLowerCase();
        
        if (allowedRoles.includes(roleName)) {
          req.userRole = roleName;
          next();
        } else {
          res.status(403).json({ 
            message: "Bạn không có quyền thực hiện thao tác này" 
          });
        }
      } catch (error) {
        res.status(500).json({ message: "Lỗi kiểm tra quyền" });
      }
    }
  },

  generateToken: function(userId) {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
  }
};