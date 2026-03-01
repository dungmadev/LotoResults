
> **Nhiệm vụ:** Nâng cấp logic fetch dữ liệu xổ số từ 3 nguồn (Minh Ngọc, XSKT, Xổ Số Thủ Đô) bằng NodeJS và cập nhật Progress Bar trên ReactJS thông qua Socket.io/Websocket.
> **Yêu cầu kỹ thuật chi tiết:**
> **1. Backend (NodeJS): Cơ chế "Race & Fallback" thông minh**
> * **Fetch đồng thời (Concurrent):** Sử dụng `Promise.any` hoặc `Promise.all` kết hợp với logic kiểm tra dữ liệu để fetch từ 3 nguồn:
> * Nguồn 1: `minhngoc.net.vn` (Cấu trúc URL theo ngày).
> * Nguồn 2: `xskt.com.vn` (Bố cục tối giản).
> * Nguồn 3: `xosothudo.com.vn` (Dành riêng cho miền Bắc).
> 
> 
> * **Điều kiện "Đủ":** Một nguồn được coi là thành công khi lấy đủ số lượng giải (Ví dụ: Miền Bắc 27 giải, Miền Nam/Trung 18 giải).
* **Bổ sung thông tin** Cần chạy 1 lần để ghi cấu hình, mỗi miền có chính xác bao nhiêu giải ví dụ
miền bắc 27 giải, miền nam 18 giải, miền trung 13 giải  
> * **Xử lý Queue:** >   - Ngay khi **nguồn đầu tiên** trả về dữ liệu "Đủ", lập tức hủy (Abort) các request đang chạy từ các nguồn còn lại để tiết kiệm tài nguyên.
> * Sau khi trả dữ liệu về Client thành công, thực hiện **xóa Task khỏi Queue** ngay lập tức.
> 
> 
> * **Emit Trạng thái:** Gửi Socket liên tục:
> * Bắt đầu: `{ progress: 10, message: "Đang kết nối các nguồn dữ liệu..." }`.
> * Đang fetch: `{ progress: 50, message: "Đang lấy dữ liệu từ Minh Ngọc/XSKT..." }`.
> * Hoàn thành: `{ progress: 100, message: "Đã lấy đủ dữ liệu!", status: "success" }`.
> 
> 
> **2. Frontend (ReactJS): Progress Bar tự động ẩn**
> * **Component `QueueProgressBar`:** >   - Vị trí: `sticky top-0`, nằm trên cùng danh sách dữ liệu, không che nội dung.
> * Style: Sử dụng **Tailwind CSS**, màu xanh gradient, hiệu ứng transition mượt (`duration-500`).
> * **Logic ẩn/hiện:** >     - Hiện khi bắt đầu có tiến trình.
> * Khi `progress === 100`, sử dụng `setTimeout` để **Fade-out** (độ mờ về 0) sau 1.2 giây rồi mới `setHide(true)`.
> 
> **3. Ràng buộc:**
> * Giữ nguyên cấu trúc dữ liệu trả về hiện tại của hệ thống.
> * Xử lý Error Handling: Nếu cả 3 nguồn đều không có dữ liệu "Đủ", gửi thông báo lỗi và dừng Progress Bar ở trạng thái lỗi.
> 
### Các lưu ý dành cho bạn khi áp dụng code từ AI:

1. **Cơ chế Abort (Quan trọng):** Khi sử dụng fetch đồng thời, hãy nhắc AI dùng `AbortController`. Nếu Nguồn 1 đã về "Đủ", nó phải ngắt kết nối với Nguồn 2 và 3 để tránh lãng phí RAM/Network và tránh bị các site này đánh dấu là spam.
2. **Độ trễ tiến trình (Fake Progress):** Vì fetch dữ liệu thường rất nhanh, bạn nên yêu cầu AI thêm một chút độ trễ nhỏ (khoảng 200-300ms) khi cập nhật thanh Progress để người dùng kịp nhìn thấy sự chuyển động, tạo cảm giác hệ thống "đang làm việc".
3. **Xác thực dữ liệu:** Do cấu trúc HTML của 3 trang này khác nhau hoàn toàn, hãy yêu cầu AI viết 3 hàm `parser` riêng biệt (`parseMinhNgoc`, `parseXSKT`, `parseXoSoThuDo`) nhưng cuối cùng phải trả về một **Object JSON chuẩn hóa** duy nhất.