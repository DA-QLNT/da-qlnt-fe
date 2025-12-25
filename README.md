# 🏠 Smart Accommodation Management System (SAMS)

**Smart Accommodation Management System** là giải pháp toàn diện giúp tối ưu hóa việc quản lý nhà trọ, kết nối mượt mà giữa Chủ trọ (Owner) và Khách thuê (Tenant). Hệ thống giúp tự động hóa quy trình thanh toán, theo dõi hợp đồng và quản lý bảo trì tài sản theo thời gian thực.

## ✨ Các tính năng cốt lõi

### 🧑‍💼 Phân hệ Chủ trọ (Owner)

- **Quản lý Bất động sản:** Quản lý đa nhà trọ, đa phòng với các thông số diện tích, giá thuê, tầng.
- **Hợp đồng thông minh:** Tạo, ký duyệt, gia hạn và chấm dứt hợp đồng điện tử. Hỗ trợ xuất file Word mẫu chuẩn pháp lý.
- **Hóa đơn & Dịch vụ:** Tự động chốt số điện/nước hàng tháng. Quản lý các dịch vụ đi kèm (Wifi, Vệ sinh, Gửi xe).
- **Dashboard Thống kê:** Hệ thống biểu đồ Pie Chart trực quan về tỉ lệ lấp đầy, trạng thái hợp đồng và tiến độ sửa chữa.

### 👤 Phân hệ Khách thuê (Tenant)

- **Cổng thanh toán Online:** Tích hợp **VNPay Gateway**, cho phép thanh toán hóa đơn an toàn, nhanh chóng.
- **Yêu cầu Sửa chữa:** Gửi yêu cầu kèm hình ảnh thực tế, theo dõi trạng thái tiếp nhận từ chủ trọ.
- **Lịch sử Hóa đơn:** Xem chi tiết và xuất báo cáo Excel cho từng kỳ thanh toán.

### 🛡️ Phân hệ Quản trị (Admin)

- **Giám sát hệ thống:** Dashboard tổng quan về lượng người dùng, doanh thu toàn sàn.
- **Phân quyền (RBAC):** Quản lý vai trò (Admin, Owner, Tenant) và quyền truy cập chi tiết (Permissions).

---

## 🛠️ Công nghệ sử dụng

### Frontend Stack

- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS + Shadcn UI (Component-based UI)
- **State Management:** Redux Toolkit & **RTK Query** (Advanced Caching & Synchronization)
- **Form Handling:** React Hook Form + Zod Validation
- **Utilities:** Lucide Icons, Date-fns, Recharts

### Backend Interaction

- **API Client:** Axios (Customized with Auto-refresh Token Interceptor)
- **Authentication:** JWT (Json Web Token) with Blacklist Logout mechanism

---

## 🚀 Cài đặt & Chạy thử

### Yêu cầu hệ thống

- Node.js (phiên bản 18.x trở lên)
- NPM hoặc Yarn

### Các bước cài đặt

1. **Clone project:**

```bash
git clone https://github.com/yourusername/sams-project.git
cd sams-project

```

2. **Cài đặt thư viện:**

```bash
npm install

```

3. **Cấu hình môi trường:**
   Tạo file `.env` tại thư mục gốc:

```env
VITE_BASE_API=http://localhost:8080/api/v1

```

4. **Chạy ứng dụng:**

```bash
npm run dev

```

---

## 📐 Kiến trúc nổi bật

Dự án được xây dựng với tư duy **Clean Architecture** và **Modular Pattern**:

- **RTK Query Integration:** Tối ưu hóa hiệu năng bằng cách giảm thiểu request thừa, quản lý server state một cách chuyên nghiệp.
- **Debounce Optimization:** Tích hợp hook `useDebounce` tùy chỉnh cho mọi ô tìm kiếm, giúp giảm tải 70% áp lực lên server.
- **Higher-Order Components:** Bảo mật route dựa trên vai trò (Role-based protected routes).

---

## 📩 Liên hệ

- **Tác giả:** [Lương Mạnh Hòa]
- **Email:** [itlmh23@gmail.com]

---

⭐ _Nếu bạn thấy dự án này hữu ích, hãy tặng cho nó 1 sao nhé!_

---
