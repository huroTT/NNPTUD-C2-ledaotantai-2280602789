const { body, validationResult } = require('express-validator');
const util = require('util');

const options = {
  password: {
    minLength: 8,
    minLowercase: 1,
    minSymbols: 1,
    minUppercase: 1,
    minNumbers: 1
  }
};

module.exports = {
  postUserValidator: [
    body("email").isEmail().withMessage("Email không đúng định dạng"),
    body("password").isStrongPassword(options.password).withMessage(
      util.format("Mật khẩu dài ít nhất %d ký tự, có ít nhất %d số, %d chữ viết hoa, %d chữ viết thường và %d ký tự đặc biệt",
        options.password.minLength,
        options.password.minNumbers,
        options.password.minUppercase,
        options.password.minLowercase,
        options.password.minSymbols,
      ))
  ],
  
  validateResult: function (req, res, next) {
    const result = validationResult(req);
    if (result.errors.length > 0) {
      return res.status(400).json(
        result.errors.map(error => ({
          field: error.path,
          message: error.msg
        }))
      );
    } else {
      next();
    }
  }
};