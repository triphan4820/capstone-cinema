# 🎬 Cinema Booking Engine API (`cinepass-server`)

![NestJS](https://img.shields.io/badge/NestJS-v11.2-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_ORM-v7.10-2D3748?style=flat-square&logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_%2F_MariaDB-8.0%2B-4479A1?style=flat-square&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT_%26_RBAC-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-Swagger_UI-85EA2D?style=flat-square&logo=swagger&logoColor=black)

Nền tảng Backend RESTful API quản lý hệ thống rạp chiếu phim, lịch chiếu và đặt vé thời gian thực chuẩn Enterprise, xây dựng trên **NestJS 11**, **Prisma 7 (MariaDB Adapter)** và **Cloudinary**.

---

## 📌 Mục Lục

- [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
- [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Thiết Kế Cơ Sở Dữ Liệu (ERD)](#-thiết-kế-cơ-sở-dữ-liệu-erd)
- [Cài Đặt & Khởi Chạy](#-cài-đặt--khởi-chạy)
- [Chuẩn Hóa Response & Bảo Mật](#-chuẩn-hóa-response--bảo-mật)
- [Tài Liệu Chi Tiết 26 API Endpoints](#-tài-liệu-chi-tiết-26-api-endpoints)
- [Kiểm Thử & Quản Lý Chất Lượng](#-kiểm-thử--quản-lý-chất-lượng)

---

## ✨ Tính Năng Nổi Bật

- **Kiến trúc Modular & Clean Layered**: Tách biệt rõ ràng tầng `core` (Guards, Filters, Interceptors, Decorators), `shared` (Database, JWT, Cloud Storage) và `modules` nghiệp vụ.
- **Đặt vé Atomic Transaction**: Sử dụng Prisma Interactive Transactions (`$transaction`) kết hợp ràng buộc Unique Index `(showId, seatId)` chống đặt trùng ghế (race-condition / double-booking).
- **Xác thực & Phân quyền đa tầng (JWT + RBAC)**: Bảo vệ toàn cục với `JwtAuthGuard` và `RolesGuard`, hỗ trợ mở khóa linh hoạt qua `@Public()` và giới hạn quyền quản trị qua `@Roles('QuanTri')`.
- **Quản lý Media đám mây**: Tích hợp trực tiếp `Multer` + `Cloudinary` stream upload tự động tối ưu hóa hình ảnh poster/banner phim.
- **Tương thích ngược (Backward Compatibility)**: Hỗ trợ linh hoạt cả hai chuẩn truyền tham số (camelCase & PascalCase query/body), đáp ứng đồng bộ toàn bộ quy chuẩn tích hợp Frontend.

---

## 🛠 Công Nghệ Sử Dụng

| Phân lớp | Công nghệ | Phiên bản | Vai trò |
| :--- | :--- | :---: | :--- |
| **Core Framework** | `@nestjs/core`, `@nestjs/common` | `^11.2.8` | Dependency Injection, Modular Architecture, Lifecycle |
| **Database & ORM** | `prisma`, `@prisma/client`, `@prisma/adapter-mariadb` | `^7.10.1` | Type-safe ORM, Connection Pooling, Transaction Management |
| **Authentication** | `jsonwebtoken`, `bcrypt` | `^9.0.3` / `^6.0.0` | Mã hóa mật khẩu & cấp phát/xác thực Access/Refresh Token |
| **Validation** | `class-validator`, `class-transformer` | `^0.15.1` / `^0.5.1` | Kiểm tra hợp lệ DTO & ép kiểu dữ liệu tự động qua Pipe |
| **Media Storage** | `cloudinary`, `multer` | `^2.11.0` / `^2.5.0` | Xử lý `multipart/form-data` & lưu trữ ảnh trên Cloud |
| **API Docs** | `@nestjs/swagger`, `swagger-ui-express` | `^11.4.8` / `^5.0.1` | Tự động sinh tài liệu OpenAPI 3.0 & giao diện thử nghiệm |

---

## 🏗 Kiến Trúc Hệ Thống

### 1. Luồng Xử Lý Request (Request Lifecycle)

```mermaid
flowchart LR
    Client(["Client / Frontend"]) --> CORS["CORS & Global Prefix (/api)"]
    CORS --> Guard1["JwtAuthGuard (@Public check)"]
    Guard1 --> Guard2["RolesGuard (@Roles check)"]
    Guard2 --> IntIn["LoggingInterceptor"]
    IntIn --> Pipe["ValidationPipe (DTO)"]
    Pipe --> Ctrl["Controller"]
    Ctrl --> Svc["Service (Business Logic)"]
    Svc --> Prisma[("Prisma / MariaDB")]
    Svc --> Cloud[("Cloudinary Storage")]
    Ctrl --> IntOut["TransformInterceptor (Envelope)"]
    IntOut --> Client
    Guard1 -.->|Exception| Filter["AllExceptionsFilter"]
    Guard2 -.->|Exception| Filter
    Pipe -.->|Exception| Filter
    Svc -.->|Exception| Filter
    Filter --> Client
```

### 2. Cấu Trúc Thư Mục

```text
capstone-movie-main/
├── database/
│   └── schema.sql                      # SQL Dump khởi tạo cấu trúc bảng & dữ liệu mẫu
├── prisma/
│   └── schema.prisma                   # Định nghĩa Prisma Schema & quan hệ thực thể
├── src/
│   ├── core/                           # Thành phần cắt ngang toàn hệ thống (Cross-cutting)
│   │   ├── constants/                  # Quản lý biến môi trường tập trung & hằng số
│   │   ├── decorators/                 # @Public(), @Roles(), @CurrentUser()
│   │   ├── filters/                    # AllExceptionsFilter (chuẩn hóa lỗi HTTP & Prisma)
│   │   ├── guards/                     # JwtAuthGuard (xác thực), RolesGuard (phân quyền)
│   │   └── interceptors/               # LoggingInterceptor, TransformInterceptor
│   ├── shared/                         # Hạ tầng kỹ thuật dùng chung (Shared Infrastructure)
│   │   ├── database/                   # PrismaModule, PrismaService & Generated Client
│   │   ├── jwt/                        # JwtTokenService (ký & giải mã Access/Refresh Token)
│   │   └── storage/                    # StorageService (upload stream lên Cloudinary)
│   ├── modules/                        # Các phân hệ nghiệp vụ chính (Domain Modules)
│   │   ├── quan-ly-nguoi-dung/         # Auth, Hồ sơ, CRUD người dùng & tìm kiếm phân trang
│   │   ├── quan-ly-phim/               # Banner, CRUD Phim, Lọc theo ngày & Upload Poster
│   │   ├── quan-ly-rap/                # Hệ thống rạp, Cụm rạp & Cây lịch chiếu đa tầng
│   │   └── quan-ly-dat-ve/             # Sơ đồ ghế phòng chiếu, Đặt vé & Tạo lịch chiếu
│   ├── app.module.ts                   # Root Module kết nối toàn bộ hệ thống
│   └── main.ts                         # Khởi tạo ứng dụng, Pipes, Interceptors & Swagger
├── test/                               # Bộ kịch bản kiểm thử E2E & Data Verification
│   ├── app.e2e-spec.ts                 # 30 E2E Test Cases kiểm tra Payload & Response
│   ├── verify-all-data.js              # Script kiểm thử tự động toàn bộ 26 API Endpoints
│   ├── mock-prisma.helper.js           # In-memory Relational Engine phục vụ chạy test độc lập
│   └── jest-e2e.json                   # Cấu hình Jest E2E
├── .env.example                        # Mẫu cấu hình biến môi trường
├── docker-compose.yml                  # Khởi chạy nhanh bằng Docker Compose
└── prisma.config.ts                    # Cấu hình Prisma 7 CLI
```

---

## 🗄 Thiết Kế Cơ Sở Dữ Liệu (ERD)

Hệ thống gồm **9 bảng thực thể** có hỗ trợ cơ chế xóa mềm (`isDeleted`) và dấu thời gian (`createAt`, `updateAt`):

```mermaid
erDiagram
    Brands ||--o{ Cinemas : "sở hữu"
    Cinemas ||--o{ Screens : "bao gồm"
    Screens ||--o{ Seats : "có"
    Screens ||--o{ Showtime : "tổ chức"
    Movies ||--o{ Banners : "quảng bá"
    Movies ||--o{ Showtime : "được chiếu"
    Users ||--o{ Booking : "đặt"
    Booking ||--|{ BookingDetail : "chi tiết"
    Showtime ||--o{ BookingDetail : "thuộc suất"
    Seats ||--o{ BookingDetail : "vị trí ghế"

    Users {
        int userId PK
        string userFullname
        string userEmail UK
        string userPhone
        string userPassword
        string userType "KhachHang | QuanTri"
        boolean isDeleted
    }
    Movies {
        int movieId PK
        string movieName
        string movieTrailer
        string movieImage
        text movieDescription
        datetime dateRelease
        int movieRating
        boolean isTrending
        boolean isShowing
        boolean isUpcoming
        boolean isDeleted
    }
    Brands {
        int brandId PK
        string brandName
        string brandLogo
        boolean isDeleted
    }
    Cinemas {
        int cinemaId PK
        string cinemaName
        string cinemaAddress
        int brandId FK
        boolean isDeleted
    }
    Screens {
        int screenId PK
        string screenName
        int cinemaId FK
        boolean isDeleted
    }
    Seats {
        int seatId PK
        char seatName
        string seatType "Thuong | Vip"
        int screenId FK
        boolean isDeleted
    }
    Showtime {
        int showId PK
        int screenId FK
        int movieId FK
        datetime showTime
        int bookingPrice
        boolean isDeleted
    }
    Booking {
        int bookingId PK
        int userId FK
        timestamp createAt
    }
    BookingDetail {
        int detailId PK
        int bookingId FK
        int showId FK "UK(showId, seatId)"
        int seatId FK "UK(showId, seatId)"
    }
```

---

## 🚀 Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- **Node.js**: `>= 20.x`
- **MySQL** `>= 8.0` hoặc **MariaDB** `>= 10.6`
- Tài khoản **Cloudinary** (dùng cho tính năng upload hình ảnh phim)

### 2. Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án:

```env
# Server Configuration
PORT=3000

# Database Connection (MySQL / MariaDB)
DATABASE_URL="mysql://root:your_password@localhost:3306/cinema_db"

# JWT Secrets
ACCESS_TOKEN_SECRET="your_super_secret_access_jwt_key"
REFRESH_TOKEN_SECRET="your_super_secret_refresh_jwt_key"

# Cloudinary Storage Configuration
CLOUDINARY_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

### 3. Khởi tạo Cơ sở dữ liệu & Prisma Client

```bash
# 1. Tạo database và nạp dữ liệu từ file SQL
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p cinema_db < database/schema.sql

# 2. Cài đặt dependencies
npm install

# 3. Sinh Prisma Client (output vào src/shared/database/generated/prisma)
npx prisma generate
```

### 4. Chạy ứng dụng

```bash
# Chế độ phát triển (Hot-reload)
npm run start:dev

# Build và chạy Production
npm run build
npm run start:prod
```

- **Base API URL**: `http://localhost:3000/api`
- **Swagger UI**: `http://localhost:3000/api/docs`

---

## 🛡 Chuẩn Hóa Response & Bảo Mật

### 1. Định dạng Response Envelope
Mọi phản hồi từ API đều được chuẩn hóa qua [`TransformInterceptor`](./src/core/interceptors/transform.interceptor.ts) và [`AllExceptionsFilter`](./src/core/filters/all-exceptions.filter.ts):

**Response Thành công (`200 OK` / `201 Created`):**
```json
{
  "statusCode": 200,
  "message": "Xử lý thành công!",
  "content": { ... },
  "dateTime": "2026-11-04T09:58:00.000Z"
}
```

**Response Lỗi (`4xx` / `5xx`):**
```json
{
  "statusCode": 400,
  "message": "Ghế [12] đã có người đặt!",
  "content": "Bad Request",
  "dateTime": "2026-11-04T09:58:00.000Z"
}
```

### 2. Cơ chế Xác thực & Phân quyền
Truyền JWT Access Token nhận được từ API `DangNhap` vào Header:
```http
Authorization: Bearer <accessToken>
```
- **`Public`**: Truy cập tự do không cần token.
- **`Bearer Token`**: Yêu cầu người dùng đã đăng nhập (`KhachHang` hoặc `QuanTri`).
- **`Admin (QuanTri)`**: Yêu cầu JWT hợp lệ và trường `maLoaiNguoiDung` / `userType` là `QuanTri`.

### 3. Tài Khoản Mẫu (Seed Data trong `database/schema.sql`)

| Vai trò | Email (`taiKhoan`) | Mật khẩu (`matKhau`) | Quyền hạn (`maLoaiNguoiDung`) |
| :--- | :--- | :---: | :---: |
| **Quản trị viên** | `admin@email.com` | `qweasd` | `QuanTri` (`admin`) |
| **Quản trị viên 2** | `bao.pham@cinepass.vn` | `qweasd` | `QuanTri` (`admin`) |
| **Khách hàng 1** | `d@gmail.com` | `qweasd` | `KhachHang` (`user`) |
| **Khách hàng 2** | `hoang.tran@cinepass.vn` | `qweasd` | `KhachHang` (`user`) |
| **Khách hàng 3** | `trang.le@cinepass.vn` | `qweasd` | `KhachHang` (`user`) |

---

## 📖 Tài Liệu Chi Tiết 26 API Endpoints

### 1. Quản Lý Người Dùng (`/api/QuanLyNguoiDung`) — *13 Endpoints*

| Phương thức | Endpoint | Quyền | Tham số (Query / Body) | Mô tả chi tiết |
| :---: | :--- | :---: | :--- | :--- |
| `POST` | `/DangNhap` | `Public` | **Body**: `taiKhoan` (hoặc `email`), `matKhau` | Xác thực tài khoản và trả về `accessToken` kèm thông tin người dùng. |
| `POST` | `/DangKy` | `Public` | **Body**: `email`, `matKhau`, `hoTen`, `soDt`, `taiKhoan` | Đăng ký tài khoản khách hàng mới (`KhachHang`). |
| `GET` | `/LayDanhSachLoaiNguoiDung` | `Public` | *Không* | Trả về danh mục vai trò: `KhachHang` và `QuanTri`. |
| `GET` | `/LayDanhSachNguoiDung` | `Public` | **Query**: `tuKhoa` *(tùy chọn)* | Lấy toàn bộ người dùng hoặc lọc theo từ khóa (họ tên, email, SĐT). |
| `GET` | `/TimKiemNguoiDung` | `Public` | **Query**: `tuKhoa` *(tùy chọn)* | Tìm kiếm người dùng theo từ khóa. |
| `GET` | `/LayDanhSachNguoiDungPhanTrang` | `Public` | **Query**: `soTrang`, `soPhanTuTrenTrang`, `tuKhoa` | Lấy danh sách người dùng có phân trang (`currentPage`, `totalCount`, `items`). |
| `GET` | `/TimKiemNguoiDungPhanTrang` | `Public` | **Query**: `soTrang`, `soPhanTuTrenTrang`, `tuKhoa` | Tìm kiếm người dùng kết hợp phân trang. |
| `POST` | `/ThongTinTaiKhoan` | `Bearer` | *Dựa trên JWT hiện tại* | Lấy hồ sơ cá nhân kèm lịch sử đặt vé (`thongTinDatVe`) chi tiết. |
| `POST` | `/LayThongTinNguoiDung` | `Bearer` | **Query/Body**: `taiKhoan` *(tùy chọn)* | Lấy thông tin chi tiết của một người dùng theo ID/email hoặc token. |
| `POST` | `/ThemNguoiDung` | `Admin` | **Body**: `email`, `matKhau`, `hoTen`, `soDt`, `maLoaiNguoiDung` | Quản trị viên tạo mới tài khoản (`KhachHang` / `QuanTri`). |
| `PUT` | `/CapNhatThongTinNguoiDung` | `Bearer` | **Body**: `taiKhoan`, `email`, `hoTen`, `soDt`, `matKhau`, `maLoaiNguoiDung` | Cập nhật thông tin tài khoản (Method `PUT`). |
| `POST` | `/CapNhatThongTinNguoiDung` | `Bearer` | **Body**: *(tương tự PUT)* | Alias phương thức `POST` để cập nhật thông tin người dùng. |
| `DELETE` | `/XoaNguoiDung` | `Admin` | **Query**: `TaiKhoan` (ID hoặc Email) | Xóa mềm (`isDeleted = true`) người dùng khỏi hệ thống. |

---

### 2. Quản Lý Phim (`/api/QuanLyPhim`) — *10 Endpoints*

| Phương thức | Endpoint | Quyền | Tham số (Query / FormData) | Mô tả chi tiết |
| :---: | :--- | :---: | :--- | :--- |
| `GET` | `/LayDanhSachBanner` | `Public` | *Không* | Lấy danh sách banner quảng bá phim đang hoạt động. |
| `GET` | `/LayDanhSachPhim` | `Public` | **Query**: `tenPhim` *(tùy chọn)* | Lấy danh sách phim đang hoạt động, hỗ trợ tìm theo tên phim. |
| `GET` | `/LayDanhSachPhimPhanTrang` | `Public` | **Query**: `soTrang`, `soPhanTuTrenTrang`, `tenPhim` | Lấy danh sách phim phân trang. |
| `GET` | `/LayDanhSachPhimTheoNgay` | `Public` | **Query**: `tuNgay`, `denNgay`, `soTrang`, `soPhanTuTrenTrang`, `tenPhim` | Lọc phim phát hành trong khoảng ngày (`dd/MM/yyyy` hoặc `yyyy-MM-dd`). |
| `GET` | `/LayThongTinPhim` | `Public` | **Query**: `MaPhim` | Lấy thông tin chi tiết phim và danh sách lịch chiếu trực thuộc. |
| `POST` | `/ThemPhimUploadHinh` | `Admin` | **FormData**: `tenPhim`, `trailer`, `moTa`, `ngayKhoiChieu`, `danhGia`, `hot`, `dangChieu`, `sapChieu`, `File` | Thêm phim mới và upload poster trực tiếp lên Cloudinary. |
| `POST` | `/CapNhatPhimUpload` | `Admin` | **FormData**: `maPhim` + các trường như thêm phim + `File` *(tùy chọn)* | Cập nhật thông tin phim và thay đổi poster nếu có đính kèm file. |
| `POST` | `/api/QuanLyPhim` | `Public` | **FormData**: `tenPhim`, `File` *(hoặc cập nhật theo tên)* | Endpoint upload/tạo nhanh thông tin hình ảnh phim. |
| `DELETE` | `/XoaPhim` | `Admin` | **Query**: `MaPhim` | Xóa mềm phim theo mã phim. |
| `DELETE` | `/XP` | `Admin` | **Query**: `MaPhim` | Alias rút gọn để xóa mềm phim. |

---

### 3. Quản Lý Rạp (`/api/QuanLyRap`) — *4 Endpoints*

| Phương thức | Endpoint | Quyền | Tham số (Query) | Mô tả chi tiết |
| :---: | :--- | :---: | :--- | :--- |
| `GET` | `/LayThongTinHeThongRap` | `Public` | **Query**: `maHeThongRap` *(tùy chọn, hỗ trợ ID hoặc tên)* | Lấy danh sách thương hiệu rạp (CGV, BHD, Galaxy, Lotte...). |
| `GET` | `/LayThongTinCumRapTheoHeThong` | `Public` | **Query**: `maHeThongRap` | Lấy danh sách cụm rạp kèm danh sách phòng chiếu (`danhSachRap`) thuộc hệ thống. |
| `GET` | `/LayThongTinLichChieuHeThongRap` | `Public` | **Query**: `maHeThongRap` *(tùy chọn)* | Trả về cây phân cấp 4 tầng: Hệ thống rạp -> Cụm rạp -> Danh sách phim -> Lịch chiếu. |
| `GET` | `/LayThongTinLichChieuPhim` | `Public` | **Query**: `MaPhim` | Trả về thông tin phim kèm lịch chiếu gom nhóm theo Hệ thống rạp & Cụm rạp. |

---

### 4. Quản Lý Đặt Vé (`/api/QuanLyDatVe`) — *3 Endpoints*

| Phương thức | Endpoint | Quyền | Tham số (Query / Body) | Mô tả chi tiết |
| :---: | :--- | :---: | :--- | :--- |
| `GET` | `/LayDanhSachPhongVe` | `Public` | **Query**: `MaLichChieu` | Trả về `thongTinPhim` của suất chiếu và `danhSachGhe` kèm trạng thái `daDat` và `taiKhoanNguoiDat`. |
| `POST` | `/DatVe` | `Bearer` | **Body**: `{ maLichChieu: number, danhSachVe: [{ maGhe: number, giaVe: number }] }` | Kiểm tra trạng thái ghế và tạo `Booking` + `BookingDetail` trong 1 Database Transaction. |
| `POST` | `/TaoLichChieu` | `Admin` | **Body**: `{ maPhim: number, ngayChieuGioChieu: string, maRap: number, giaVe: number }` | Tạo suất chiếu mới (tự động nhận diện `maRap` là `screenId` hoặc `cinemaId`). |

---

## 🧪 Kiểm Thử & Quản Lý Chất Lượng

```bash
# Kiểm tra quy chuẩn code (ESLint + Prettier)
npm run lint

# Định dạng lại toàn bộ mã nguồn
npm run format

# Chạy Unit Tests
npm run test

# Chạy End-to-End (E2E) Tests (30/30 kịch bản Payload & Response)
npm run test:e2e

# Chạy kịch bản kiểm thử tích hợp toàn bộ 26 Endpoints (báo cáo dạng bảng)
node test/verify-all-data.js

# Báo cáo độ phủ kiểm thử (Test Coverage)
npm run test:cov
```
