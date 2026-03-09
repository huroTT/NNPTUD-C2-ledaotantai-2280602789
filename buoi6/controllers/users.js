let userModel = require('../schemas/users');
let bcrypt = require('bcrypt');

module.exports = {
    CreateAnUser: async function (username, password, email, role,
        avatarUrl, fullName, status, loginCount
    ) {
        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            avatarUrl: avatarUrl,
            fullName: fullName,
            status: status,
            loginCount: loginCount
        })
        await newUser.save();
        return newUser;
    },
    QueryByUserNameAndPassword: async function (username, password) {
        let getUser = await userModel.findOne({ username: username });
        if (!getUser) {
            return false;
        }
        return getUser;
    },
    FindUserById: async function (id) {
        return await userModel.findOne({
            _id: id,
            isDeleted:false
        }).populate('role');
    },
    ChangePassword: async function (userId, oldPassword, newPassword) {
        try {
            let user = await userModel.findById(userId);
            
            if (!user) {
                return { success: false, message: "Không tìm thấy người dùng" };
            }

            let isMatch = bcrypt.compareSync(oldPassword, user.password);
            
            if (!isMatch) {
                return { success: false, message: "Mật khẩu cũ không đúng" };
            }

            let salt = bcrypt.genSaltSync(10);
            user.password = bcrypt.hashSync(newPassword, salt);
            await user.save();

            return { success: true, message: "Đổi mật khẩu thành công" };
        } catch (error) {
            return { success: false, message: "Lỗi khi đổi mật khẩu" };
        }
    }
}