var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let multer = require('multer');
let path = require('path');

let messageModel = require('../schemas/message');
let { checkLogin } = require('../utils/authHandler.js.js'); 

// Cấu hình Multer lưu file (không giới hạn ảnh)
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname)
        let fileName = Date.now() + "-" + Math.round(Math.random() * 1000_000_000) + ext;
        cb(null, fileName)
    }
})
let uploadFile = multer({ storage: storage });

// 3. GET / : lấy message cuối cùng của mỗi user mà user hiện tại nhắn tin hoặc user khác nhắn
router.get('/', checkLogin, async function(req, res, next) {
    try {
        let currentUserId = req.userId;
        
        // BƯỚC 1: Lấy tất cả tin nhắn liên quan tới user hiện tại
        // Sắp xếp giảm dần (-1) để tin nhắn mới nhất nằm ở trên cùng
        let allMessages = await messageModel.find({
            $or: [
                { from: currentUserId },
                { to: currentUserId }
            ]
        }).sort({ createdAt: -1 });
        
        // BƯỚC 2: Tạo các biến để lọc tin nhắn cuối cùng
        let chattedUsers = []; // Danh sách những người mình đã từng nhắn tin
        let recentMessages = []; // Danh sách tin nhắn mới nhất với từng người
        
        // BƯỚC 3: Duyệt qua tất cả tin nhắn
        for (let i = 0; i < allMessages.length; i++) {
            let message = allMessages[i];
            
            // Tìm ra người kia trong đoạn chat là ai (có thể là người gửi hoặc người nhận)
            let otherUserId = "";
            let fromIdString = message.from.toString();
            let currentIdString = currentUserId.toString();
            
            if (fromIdString === currentIdString) {
                // Nếu mình là người gửi, thì người kia là người nhận
                otherUserId = message.to.toString();
            } else {
                // Nếu mình không phải ng gửi, thì ng kia là người gửi
                otherUserId = message.from.toString();
            }
            
            // Nếu người kia chưa có mặt trong danh sách đã check
            // Nghĩa là đây là tin nhắn đầu tiên (và mới nhất) của mình với họ mà code đọc qua
            if (chattedUsers.includes(otherUserId) === false) {
                chattedUsers.push(otherUserId); // Lưu lại người này đã xử lý
                recentMessages.push(message); // Đưa tin nhắn này vào kết quả
            }
        }
        
        // BƯỚC 4: Hiển thị thêm thông tin (Tùy chọn cho đẹp)
        await messageModel.populate(recentMessages, { path: 'from to', select: 'username email avatarUrl' });
        
        res.send(recentMessages);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// 1. GET /:userID - Lấy toàn bộ message giữa user hiện tại và target user
router.get('/:userID', checkLogin, async function(req, res, next) {
    try {
        let currentUserId = req.userId;
        let targetUserId = req.params.userID;
        
        // Tìm trong CSDL các tin nhắn thoả mãn 1 trong 2 điều kiện:
        // - from là User hiện tại VÀ to là Target User (Mình gửi cho họ)
        // - HOẶC from là Target User VÀ to là User hiện tại (Họ gửi cho mình)
        let messages = await messageModel.find({
            $or: [
                { from: currentUserId, to: targetUserId },
                { from: targetUserId, to: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Xếp thời gian tăng dần (cũ nằm trên, mới nằm dưới)
        
        res.send(messages);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// 2. POST / : Tạo message (chứa text hoặc file)
router.post('/', checkLogin, uploadFile.single('file'), async function(req, res, next) {
    try {
        let currentUserId = req.userId;
        let toUser = req.body.to;
        let textContent = req.body.text; // Text do người dùng gửi
        let fileContent = req.file;      // File do người dùng gửi
        
        // Nếu không có người nhận
        if (toUser === undefined || toUser === null || toUser === "") {
            return res.status(400).send({ message: "Thiếu thông tin người nhận (to)" });
        }

        let typeOfMessage = "";
        let contentOfMessage = "";

        // Ưu tiên 1: Chứa file
        if (fileContent !== undefined) {
            typeOfMessage = "file";
            // Lấy đường dẫn file, đổi dấu \ thành / để chạy trên windows không bị lỗi
            contentOfMessage = fileContent.path.replace(/\\/g, "/"); 
        } 
        // Ưu tiên 2: Chứa chữ (text)
        else if (textContent !== undefined && textContent !== "") {
            typeOfMessage = "text";
            contentOfMessage = textContent;
        } 
        // Nếu không có cả tin nhắn lẫn file
        else {
            return res.status(400).send({ message: "Hãy nhập văn bản hoặc đính kèm file" });
        }

        // Gom các dữ liệu tìm đươc để tạo Mới
        let newMessage = new messageModel({
            from: currentUserId,
            to: toUser,
            messageContent: {
                type: typeOfMessage,
                text: contentOfMessage
            }
        });
        
        // Lưu và đẩy thông báo thành công
        await newMessage.save();
        res.send(newMessage);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;
