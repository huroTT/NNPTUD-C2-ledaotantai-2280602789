# Buoi7 - Combined Project

Đây là project tổng hợp từ buoi5 và buoi6, gom các chức năng tương tự lại với nhau.

## Cấu trúc Project

```
buoi7/
├── app.js                 # Main application file
├── package.json          # Dependencies và scripts
├── models/               # Database models
│   ├── user.model.js     # User model (gom từ cả buoi5 và buoi6)
│   ├── role.model.js     # Role model (gom từ cả buoi5 và buoi6)
│   ├── product.model.js  # Product model (từ buoi6)
│   ├── cart.model.js     # Cart model (mới thêm)
│   └── reservation.model.js # Reservation model (mới thêm)
├── controllers/          # Business logic
│   ├── user.controller.js    # User controller (gom từ cả buoi5 và buoi6)
│   ├── role.controller.js    # Role controller (gom từ cả buoi5 và buoi6)
│   ├── product.controller.js # Product controller (từ buoi6)
│   └── reservation.controller.js # Reservation controller (mới thêm)
├── routes/              # API routes
│   ├── index.js         # Main routes
│   ├── auth.js          # Authentication routes (từ buoi6)
│   ├── users.js         # User routes (gom từ cả buoi5 và buoi6)
│   ├── roles.js         # Role routes (gom từ cả buoi5 và buoi6)
│   ├── products.js      # Product routes (từ buoi6)
│   ├── categories.js    # Categories routes (từ buoi6)
│   └── reservations.js  # Reservation routes (mới thêm)
└── utils/               # Utility functions
    ├── authHandler.js   # Authentication middleware (từ buoi6)
    └── validatorHandler.js # Validation middleware (từ buoi6)
```

## Chức năng đã gom

### User Management (từ cả buoi5 và buoi6)
- CRUD operations cho users
- Enable/Disable user (từ buoi5)
- Authentication và authorization (từ buoi6)
- Password hashing và validation
- Change password functionality

### Role Management (từ cả buoi5 và buoi6)
- CRUD operations cho roles
- Soft delete functionality
- Role-based access control

### Product Management (từ buoi6)
- CRUD operations cho products
- Product filtering và pagination
- Slug generation
- Role-based access (admin, mod)

### Reservation System (mới thêm)
- Reserve cart - đặt trước toàn bộ giỏ hàng
- Reserve items - đặt trước danh sách sản phẩm cụ thể
- Cancel reservation - hủy đặt trước
- Get reservations - xem danh sách đặt trước
- Transaction support cho tất cả POST operations (trừ cancel)

### Authentication System (từ buoi6)
- JWT-based authentication
- Login/Register
- Password change
- Role-based authorization middleware

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Đăng ký
- POST `/api/v1/auth/login` - Đăng nhập
- GET `/api/v1/auth/me` - Thông tin user hiện tại
- POST `/api/v1/auth/change-password` - Đổi mật khẩu

### Users
- GET `/api/v1/users` - Lấy danh sách users
- GET `/api/v1/users/:id` - Lấy user theo ID
- POST `/api/v1/users` - Tạo user mới
- PUT `/api/v1/users/:id` - Cập nhật user
- DELETE `/api/v1/users/:id` - Xóa user
- POST `/api/v1/users/enable` - Kích hoạt user
- POST `/api/v1/users/disable` - Vô hiệu hóa user

### Roles
- GET `/api/v1/roles` - Lấy danh sách roles
- GET `/api/v1/roles/:id` - Lấy role theo ID
- POST `/api/v1/roles` - Tạo role mới
- PUT `/api/v1/roles/:id` - Cập nhật role
- DELETE `/api/v1/roles/:id` - Xóa role

### Products
- GET `/api/v1/products` - Lấy danh sách products (có filter)
- GET `/api/v1/products/:id` - Lấy product theo ID
- POST `/api/v1/products` - Tạo product mới
- PUT `/api/v1/products/:id` - Cập nhật product
- DELETE `/api/v1/products/:id` - Xóa product

### Reservations
- GET `/api/v1/reservations` - Lấy danh sách reservations của user
- GET `/api/v1/reservations/:id` - Lấy reservation theo ID
- POST `/api/v1/reservations/reserveACart` - Đặt trước cart (có transaction)
- POST `/api/v1/reservations/reserveItems` - Đặt trước danh sách items (có transaction)
- POST `/api/v1/reservations/cancelReserve/:id` - Hủy reservation

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy server
npm start

# Chạy với nodemon (development)
npm run dev
```

## Database

Project sử dụng MongoDB với connection string: `mongodb://localhost:27017/buoi7-combined-db`

## Ghi chú

- Tất cả các chức năng từ buoi5 và buoi6 đã được gom lại
- Code không bị thay đổi, chỉ được tổ chức lại và gom nhóm
- Sử dụng soft delete cho tất cả các models
- Có authentication và authorization đầy đủ
- Password được hash tự động khi save
- **Reservation system mới:**
  - Tất cả POST operations (trừ cancel) sử dụng MongoDB transactions
  - Support cả reserve cart và reserve items riêng lẻ
  - Tự động tính total amount
  - Có expiry date cho reservations (24h)
  - Cart status được cập nhật khi reserve/cancel

## API Examples

### Reserve a Cart
```json
POST /api/v1/reservations/reserveACart
{
  "cartId": "cart_object_id"
}
```

### Reserve Items
```json
POST /api/v1/reservations/reserveItems
{
  "items": [
    {
      "productId": "product_object_id_1",
      "quantity": 2
    },
    {
      "productId": "product_object_id_2", 
      "quantity": 1
    }
  ]
}
```