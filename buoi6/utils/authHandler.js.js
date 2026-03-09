let jwt = require('jsonwebtoken');
let userModel = require('../schemas/users');

module.exports = {
    checkLogin: async function (req, res, next) {
        let token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer")) {
            res.status(403).send({ message: "Bạn chưa đăng nhập" });
            return;
        }
        token = token.split(' ')[1];
        try {
            let result = jwt.verify(token, 'secret');
            if (result && result.exp * 1000 > Date.now()) {
                req.userId = result.id;
                next();
            } else {
                res.status(403).send({ message: "Token đã hết hạn" });
            }
        } catch (error) {
            res.status(403).send({ message: "Token không hợp lệ" });
        }
    },

    checkRole: function(...allowedRoles) {
        return async function (req, res, next) {
            try {
                let user = await userModel.findById(req.userId).populate('role');
                
                if (!user) {
                    return res.status(404).send({ message: "Không tìm thấy người dùng" });
                }

                if (!user.role) {
                    return res.status(403).send({ message: "Người dùng chưa có quyền" });
                }

                let roleName = user.role.name.toLowerCase();
                
                if (allowedRoles.includes(roleName)) {
                    req.userRole = roleName;
                    next();
                } else {
                    res.status(403).send({ 
                        message: "Bạn không có quyền thực hiện thao tác này" 
                    });
                }
            } catch (error) {
                res.status(500).send({ message: "Lỗi kiểm tra quyền" });
            }
        }
    }
}