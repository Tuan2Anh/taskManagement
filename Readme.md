# Task Management System

Dự án quản lý công việc (Task Management) mạnh mẽ và linh hoạt, được xây dựng với MERN Stack (MongoDB, Express, React, Node.js) và hỗ trợ triển khai container hóa với Docker.

## Tính Năng Nổi Bật

### 1. Quản Lý Công Việc (Task Management)
*   **CRUD Đầy Đủ**: Tạo, Xem, Cập nhật, và Xóa công việc.
*   **Gán Việc Đa Người Dùng (Multi-Assignee)**: Phân công một task cho nhiều thành viên cùng lúc.
*   **Phân Loại Thông Minh**:
    *   **Tags**: Gắn thẻ (nhãn) để phân loại task (Ví dụ: `Frontend`, `Urgent`).
    *   **Priority & Status**: Quản lý mức độ ưu tiên (Low/Medium/High) và trạng thái (Todo/In Progress/Done).
*   **Bộ Lọc & Tìm Kiếm**:
    *   Lọc theo: Trạng thái, Độ ưu tiên, Người được giao (Assignee), Tags, Ngày hết hạn (Due Date).
    *   Tìm kiếm theo tên hoặc mô tả.
    *   Phân trang (Pagination) mượt mà.

### 2. Cộng Tác & Tương Tác
*   **Bình Luận (Comments)**: Thảo luận trực tiếp ngay trong task.
*   **Lịch Sử Hoạt Động (Activity Logs)**: Theo dõi ai đã làm gì, vào lúc nào (Tạo, sửa, xóa, comment...).
*   **Thông Báo (Notifications)**: Tự động thông báo cho người dùng khi họ được gán task mới.

### 3. Bảo Mật & Phân Quyền (Security & RBAC)
*   **Authentication**: Đăng ký, Đăng nhập, Quên mật khẩu (Gửi link qua email), Xác thực email.
*   **Authorization**: Sử dụng JWT (JSON Web Token).
*   **Role-Based Access Control (RBAC)**:
    *   **Admin**: Toàn quyền quản lý hệ thống.
    *   **User**: Chỉ có quyền chỉnh sửa/xóa các task do mình tạo ra hoặc mình được gán.

### 4. Tiện Ích Khác
*   **Export Excel**: Xuất danh sách công việc ra file Excel.
*   **Giao Diện Hiện Đại**: Thiết kế với TailwindCSS, Responsive, hỗ trợ các Modal tương tác.

---

## Công Nghệ Sử Dụng

### Frontend
*   **Core**: React (Vite)
*   **Styling**: TailwindCSS
*   **Icons**: Lucide React
*   **State/API**: Context API, Axios (với Interceptors)
*   **Notifications**: React Toastify

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Security**: Bcryptjs, JWT, Helmet, Rate Limiting, XSS Clean
*   **Testing**: Jest, Supertest

### DevOps
*   **Containerization**: Docker, Docker Compose

---

## Hướng Dẫn Cài Đặt & Chạy Dự Án

### Cách 1: Chạy Bằng Docker (Khuyên Dùng)

Đây là cách nhanh nhất để chạy toàn bộ hệ thống (Frontend + Backend + Database) mà không cần cài đặt môi trường phức tạp.

**Yêu cầu**: Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1.  Mở terminal tại thư mục gốc dự án.
2.  Chạy lệnh:
    ```bash
    docker-compose up --build
    ```
3.  Truy cập ứng dụng:
    *   **Frontend**: [http://localhost:5173](http://localhost:5173)
    *   **Backend API**: [http://localhost:5000](http://localhost:5000)

### Cách 2: Chạy Thủ Công (Development Mode)

Nếu bạn muốn chạy từng phần để phát triển (Dev).

#### 1. Backend (Server)

1.  Di chuyển vào thư mục server:
    ```bash
    cd server
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Tạo file `.env` (copy từ `.env.example` hoặc xem mẫu bên dưới).
4.  Chạy server:
    ```bash
    npm run dev
    ```

#### 2. Frontend (Client)

1.  Di chuyển vào thư mục client:
    ```bash
    cd client
    ```
2.  Cài đặt dependencies:
    ```bash
    npm install
    ```
3.  Chạy frontend:
    ```bash
    npm run dev
    ```

---

## Cấu Hình Biến Môi Trường (.env)

Tạo file `.env` trong thư mục `server/`. Dưới đây là mẫu cấu hình:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/task-manager
# Nếu dùng Docker thì MONGO_URI nên là: mongodb://mongo:27017/task-manager

# Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Email Service (Dùng cho tính năng Quên Mật Khẩu)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
CLIENT_URL=http://localhost:5173
```

---

## Chạy Kiểm Thử (Unit Tests)

Dự án bao gồm bộ Unit Test cho Backend để đảm bảo tính ổn định của API.

1.  Di chuyển vào thư mục server:
    ```bash
    cd server
    ```
2.  Chạy test:
    ```bash
    npm test
    ```
3.  Kết quả test sẽ hiển thị chi tiết trên terminal.

---

## Cấu Trúc Thư Mục

```
taskManagement/
├── client/                 # Mã nguồn Frontend (React)
│   ├── src/
│   │   ├── components/     # Các thành phần tái sử dụng (Modal, Filter, Item...)
│   │   ├── pages/          # Các trang chính (Dashboard, Login, Register...)
│   │   ├── context/        # Quản lý Auth State
│   │   └── api/            # Cấu hình Axios
│   └── Dockerfile          # Cấu hình Docker cho Client
│
├── server/                 # Mã nguồn Backend (Node.js)
│   ├── src/
│   │   ├── controllers/    # Logic xử lý nghiệp vụ
│   │   ├── models/         # Schema MongoDB (Task, User, Log...)
│   │   ├── routes/         # Định tuyến API
│   │   └── middlewares/    # Middleware (Auth, Error Handler...)
│   ├── tests/              # Unit Tests
│   └── Dockerfile          # Cấu hình Docker cho Server
│
├── docker-compose.yml      # File cấu hình chạy toàn bộ hệ thống
└── README.md               # Tài liệu dự án
```

---
**Author**: Tuấn Anh
