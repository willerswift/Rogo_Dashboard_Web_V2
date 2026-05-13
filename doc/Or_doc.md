# Tóm tắt Hệ thống Rogo Partner Dashboard

Tài liệu này giải đáp các câu hỏi cốt lõi về mô hình tổ chức và vận hành của dự án Rogo Dashboard V2.

## 1. Các khái niệm cơ bản
*   **Organisation (Tổ chức)**: Là một cấp quản lý trung gian nằm dưới Partner và trên Project. Nó dùng để nhóm các dự án có liên quan lại với nhau (ví dụ: nhóm theo phòng ban, một tổ chức...).
*   **Dấu hiệu nhận biết khi sử dụng Dashboard V2**: Trong cây thư mục (Access Tree), Organisation có biểu tượng tòa nhà. Một Project có thể nằm trong một Org hoặc đứng độc lập (Standalone).

## 2. Mô hình phân cấp dữ liệu
```
Partner (Đối tác - Cấp cao nhất)
├── Organization (Tổ chức - Cấp trung gian, không bắt buộc)
│   ├── Project (Dự án - Nơi chứa thiết bị/sản phẩm)
│   └── Product (Sản phẩm/Thiết bị trong dự án)
└── Project (Dự án đứng độc lập)
```

## 3. Cách quản lý Partner đối với Organisation
*   **Quyền hạn**: Partner Admin (L1) có toàn quyền tạo mới, chỉnh sửa hoặc xóa bất kỳ Organisation nào trong hệ thống của mình.
*   **Phân bổ**: Partner có thể di chuyển các Project từ Organisation này sang Organisation khác hoặc đưa ra ngoài thành dự án độc lập.

## 4. Quản lý Project và Product trong Organisation
*   **Project**: Được tạo bên trong Org để quản lý các tài nguyên IoT cụ thể. Mọi quyền truy cập vào Org có thể được thiết lập để tự động áp dụng cho tất cả Project bên trong (tính năng "Apply to all projects").
*   **Product**: Là các Model thiết bị, Firmware, hoặc Hardware thuộc về một Project. Việc quản lý Product tuân theo quyền hạn của Project đó (xem, sửa, hoặc toàn quyền).

## 5. Quản lý User và Thêm User vào hệ thống
*   **Nguyên tắc**: Không có đăng ký tự do. Tất cả tài khoản phải được Admin mời.
*   **Cách thêm User**: 
    1. Admin nhập Email và chọn phạm vi quyền hạn (theo Partner, Org hoặc Project).
    2. Hệ thống gửi Email mời kèm mã OTP 6 số. (Phần này đang đề xuất để thay thế cách gửi cho khách hàng tài khoản và mật khẩu sẵn như hiện tại)
    3. User kích hoạt tài khoản qua OTP và tự đặt mật khẩu để tham gia hệ thống.
*   **Phân quyền (ABAC)**: Sử dụng mô hình phân quyền dựa trên thuộc tính. Admin có thể cấp quyền cụ thể như `view` (chỉ xem) hoặc `edit` (thêm/sửa/xóa) cho từng tài nguyên.

## 6. Framework và Công nghệ sử dụng
*   **Framework chính**: **Next.js 16 (App Router)**.
*   **Ngôn ngữ**: TypeScript (đảm bảo an toàn kiểu dữ liệu).
*   **Giao diện**: Tailwind CSS (Styling nhanh, linh hoạt).
*   **Quản lý trạng thái/Dữ liệu**: React Server Components kết hợp với Client Components và API Proxy qua Route Handlers để bảo mật API Key.
*   **Lý do chọn**: Next.js 16 cung cấp hiệu năng tốt, hỗ trợ SEO (nếu cần) và khả năng mở rộng mạnh mẽ cho các ứng dụng Dashboard phức tạp.
