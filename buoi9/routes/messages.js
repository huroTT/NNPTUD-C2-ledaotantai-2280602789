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
        let currentUserId = new mongoose.Types.ObjectId(req.userId);
        
        let recentMessages = await messageModel.aggregate([
            {
                // Lọc tin nhắn của user hiện tại
                $match: {
                    $or: [
                        { from: currentUserId },
                        { to: currentUserId }
                    ]
                }
            },
            {
                // Sắp xếp mới nhất trước
                $sort: { createdAt: -1 }
            },
            {
                // Nhóm theo "đối tác chat"
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$from", currentUserId] },
                            "$to",
                            "$from"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);
        
        // Tuỳ chọn: map thông tin user
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
        
        let messages = await messageModel.find({
            $or: [
                { from: currentUserId, to: targetUserId },
                { from: targetUserId, to: currentUserId }
            ]
        }).sort({ createdAt: 1 }); // Thời gian tăng dần (cũ nhất ở trên, mới nhất ở dưới)
        
        res.send(messages);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

// 2. POST / : Tạo message (chứa text hoặc file)
router.post('/', checkLogin, uploadFile.single('file'), async function(req, res, next) {
    try {
        let currentUserId = req.userId;
        let to = req.body.to;
        let textInput = req.body.text;
        
        if (!to) {
            return res.status(400).send({ message: "Thiếu thông tin người nhận 'to'" });
        }

        let msgType = 'text';
        let msgText = textInput;

        // Nếu gửi kèm file
        if (req.file) {
            msgType = 'file';
            msgText = req.file.path.replace(/\\/g, "/");
        } else if (!textInput) {
            return res.status(400).send({ message: "Hãy cung cấp văn bản hoặc định kèm file" });
        }

        let newMessage = new messageModel({
            from: currentUserId,
            to: to,
            messageContent: {
                type: msgType,
                text: msgText
            }
        });
        
        await newMessage.save();
        res.send(newMessage);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;
