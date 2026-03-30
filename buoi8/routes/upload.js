var express = require("express");
var router = express.Router();
let { uploadImage, uploadExcel } = require('../utils/uploadHandler')
let path = require('path')
let excelJS = require('exceljs')
let fs = require('fs');
let productModel = require('../schemas/products')
let InventoryModel = require('../schemas/inventories')
let mongoose = require('mongoose')
let slugify = require('slugify')

router.post('/single', uploadImage.single('file'), function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        res.send(req.file.path)
    }
})
router.post('/multiple', uploadImage.array('files'), function (req, res, next) {
    if (!req.files) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        let data = req.body;
        console.log(data);
        let result = req.files.map(f => {
            return {
                filename: f.filename,
                path: f.path,
                size: f.size
            }
        })
        res.send(result)
    }
})
router.get('/:filename', function (req, res, next) {
    let fileName = req.params.filename;
    let pathFile = path.join(__dirname, '../uploads', fileName)
    res.sendFile(pathFile)

})

router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        res.status(404).send({
            message: "file upload rong"
        })
    } else {
        //workbook->worksheet-row/column->cell
        let pathFile = path.join(__dirname, '../uploads', req.file.filename)
        let workbook = new excelJS.Workbook();
        await workbook.xlsx.readFile(pathFile);
        let worksheet = workbook.worksheets[0];
        let products = await productModel.find({});
        let getTitle = products.map(p => p.title)
        let getSku = products.map(p => p.sku)
        let result = [];
        let errors = [];
        let batchsize = 50;
        let maxcommit = Math.ceil((worksheet.rowCount - 1) / batchsize);
        for (let timeCommit = 0; timeCommit < maxcommit; timeCommit++) {
            let start = 2 + batchsize * timeCommit;
            let end = Math.min(start + batchsize - 1, worksheet.rowCount);
            let validProduct = []
            let session = await mongoose.startSession()
            session.startTransaction()
            try {
                let mapProductToStock = new Map()
                for (let index = start; index <= end; index++) {
                    let errorRow = [];
                    const row = worksheet.getRow(index)
                    let sku = row.getCell(1).value;//unique
                    let title = row.getCell(2).value;
                    let category = row.getCell(3).value;
                    let price = Number.parseInt(row.getCell(4).value);
                    let stock = Number.parseInt(row.getCell(5).value);
                    if (price < 0 || isNaN(price)) {
                        errorRow.push("dinh dang price chua dung " + price)
                    }
                    if (stock < 0 || isNaN(stock)) {
                        errorRow.push("dinh dang stock chua dung " + stock)
                    }
                    if (getTitle.includes(title)) {
                        errorRow.push("title da ton tai")
                    }
                    if (getSku.includes(sku)) {
                        errorRow.push("sku da ton tai")
                    }
                    if (errorRow.length > 0) {
                        result.push({ success: false, data: errorRow })
                        continue;
                    } else {
                        let newObj = new productModel({
                            sku: sku,
                            title: title,
                            slug: slugify(title, {
                                replacement: '-', remove: undefined,
                                locale: 'vi',
                                trim: true
                            }), price: price,
                            description: title,
                            category: category
                        })
                        mapProductToStock.set(sku, stock);
                        validProduct.push(newObj)
                        getSku.push(sku);
                        getTitle.push(title)
                    }
                }
                listProduct = await productModel.insertMany(validProduct, { session })
                let validInventory = listProduct.map(function (e) {
                    return {
                        product: e._id,
                        stock: mapProductToStock.get(e.sku)
                    }
                })
                validInventory = await InventoryModel.insertMany(validInventory, { session })
                await session.commitTransaction();
                await session.endSession()
            } catch (error) {
                await session.abortTransaction();
                await session.endSession()
            }

        }
        // for (let index = 2; index <= worksheet.rowCount; index++) {
        //     let errorRow = [];
        //     const row = worksheet.getRow(index)
        //     let sku = row.getCell(1).value;//unique
        //     let title = row.getCell(2).value;
        //     let category = row.getCell(3).value;
        //     let price = Number.parseInt(row.getCell(4).value);
        //     let stock = Number.parseInt(row.getCell(5).value);
        //     //validate
        //     if (price < 0 || isNaN(price)) {
        //         errorRow.push("dinh dang price chua dung " + price)
        //     }
        //     if (stock < 0 || isNaN(stock)) {
        //         errorRow.push("dinh dang stock chua dung " + stock)
        //     }
        //     if (getTitle.includes(title)) {
        //         errorRow.push("title da ton tai")
        //     }
        //     if (getSku.includes(sku)) {
        //         errorRow.push("sku da ton tai")
        //     }
        //     if (errorRow.length > 0) {
        //         //errors.push({ success: false, data: errorRow })
        //         result.push({ success: false, data: errorRow })
        //         continue;
        //     } else {

        //         let session = await mongoose.startSession()
        //         session.startTransaction()
        //         try {
        //             let newObj = new productModel({
        //                 sku: sku,
        //                 title: title,
        //                 slug: slugify(title, {
        //                     replacement: '-', remove: undefined,
        //                     locale: 'vi',
        //                     trim: true
        //                 }), price: price,
        //                 description: title,
        //                 category: category
        //             })
        //             let newProduct = await newObj.save({ session });
        //             let newInv = new InventoryModel({
        //                 product: newProduct._id,
        //                 stock: stock
        //             })
        //             newInv = await newInv.save({ session })
        //             await newInv.populate('product')
        //             await session.commitTransaction();
        //             await session.endSession()
        //             getSku.push(sku);
        //             getTitle.push(title)
        //             result.push({ success: true, data: newInv });
        //         } catch (error) {
        //             await session.abortTransaction();
        //             await session.endSession()
        //             errorRow.push(error.message)
        //             result.push({ success: false, data: errorRow })
        //         }
        //     }
        // }
        result = result.map(function (e, index) {
            if (e.success) {
                return (index + 1) + ": " + e.data.product.title
            } else {
                return (index + 1) + ": " + e.data
            }
        })
        res.send(result)
        fs.unlinkSync(pathFile);

    }
})


let { sendUserPassword } = require('../utils/sendMailHandler');
let userModel = require('../schemas/users');
let roleModel = require('../schemas/roles');
let crypto = require('crypto');

function generateRandomPassword(length = 16) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') // Chuyển đổi thành chuỗi hex
        .slice(0, length); // Lấy độ dài mong muốn
}

router.post('/user-excel', uploadExcel.single('file'), async function (req, res, next) {
    if (!req.file) {
        return res.status(404).send({ message: "file upload rong" });
    }

    let pathFile = path.join(__dirname, '../uploads', req.file.filename);
    let workbook = new excelJS.Workbook();
    await workbook.xlsx.readFile(pathFile);
    let worksheet = workbook.worksheets[0];

    // Find the 'USER' role ID or create it if not exists.
    let userRole = await roleModel.findOne({ name: 'USER' });
    if (!userRole) {
        userRole = new roleModel({
            name: 'USER',
            description: 'Default user role'
        });
        await userRole.save();
    }

    let result = [];

    try {
        for (let index = 2; index <= worksheet.rowCount; index++) {
            const row = worksheet.getRow(index);
            let username = row.getCell(1).value;
            let email = row.getCell(2).value;

            // Handle potential cell objects from ExcelJS (e.g., hyperlinks)
            if (typeof username === 'object' && username !== null) username = username.text || username.result || "";
            if (typeof email === 'object' && email !== null) email = email.text || email.result || "";

            if (!username || !email) {
                result.push({ success: false, data: `Dòng ${index}: Thiếu thông tin username hoặc email` });
                continue;
            }

            // Check if user already exists
            let existingUser = await userModel.findOne({ $or: [{ username: username }, { email: email }] });
            if (existingUser) {
                result.push({ success: false, data: `Dòng ${index}: Username hoặc email đã tồn tại` });
                continue;
            }

            let plainPassword = generateRandomPassword(16);

            let newUser = new userModel({
                username: username,
                email: email,
                password: plainPassword, // the schema's pre-save hook will hash this
                role: userRole._id
            });

            await newUser.save();

            // Send email after creation
            try {
                await sendUserPassword(email, username, plainPassword);
                result.push({ success: true, data: `Dòng ${index}: Đã tạo user ${username} và gửi email` });
            } catch (emailError) {
                result.push({ success: true, data: `Dòng ${index}: Đã tạo user ${username} nhưng LỖI gửi email: ${emailError.message}` });
            }
        }

        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Gặp lỗi trong quá trình xử lý: " + error.message });
    } finally {
        fs.unlinkSync(pathFile);
    }
});

module.exports = router;