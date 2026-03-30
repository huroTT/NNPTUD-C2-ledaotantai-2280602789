let nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 25,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "7ed389f6f05356",
        pass: "3815ece09696e1",
    },
});
module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: '"admin@" <admin@nnptud.com>',
            to: to,
            subject: "mail reset password",
            text: "click vào đây để đổi mật khẩu",
            html: "click vào <a href='" + url + "'>đây</a> để đổi mật khẩu",
        });
    },
    sendUserPassword: async function (to, username, password) {
        await transporter.sendMail({
            from: '"Admin" <admin@nnptud.com>',
            to: to,
            subject: "Chào mừng - Thông tin đăng nhập mới",
            html: `
                <h3>Chào mừng ${username},</h3>
                <p>Tài khoản của bạn đã được tạo thành công.</p>
                <p><strong>Thông tin đăng nhập:</strong></p>
                <ul>
                    <li>Username: ${username}</li>
                    <li>Password: <b>${password}</b></li>
                </ul>
                <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể.</p>
            `,
        });
    }
}