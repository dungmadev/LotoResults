> **Context:** Tôi đang có một dự án web dùng **NodeJS** (Backend) và **ReactJS** (Frontend). Hệ thống hiện tại nhận dữ liệu từ một **Queue** (hàng đợi) và đang hiển thị thông báo liên tục cho người dùng. Tôi muốn thay đổi hành vi này.
> **Yêu cầu (Yêu cầu viết code):**
> 1. **Frontend (ReactJS):** Tạo một Component `ProcessIndicator` đặt ngay trên đầu danh sách dữ liệu (không được che khuất dữ liệu).
> * Component này chứa một **Progress Bar** (Thanh tiến trình).
> * Sử dụng **Tailwind CSS** để tạo thanh bar mượt mà (có `transition-all duration-500`).
> * **Logic hiển thị:** >        - Khi bắt đầu nhận message đầu tiên từ Queue, thanh bar xuất hiện (hiệu ứng Fade-in).
> * Cập nhật `%` dựa trên thông tin từ Server gửi về (ví dụ: `current/total`).
> * Khi đạt **100%**, giữ lại 1.5 giây sau đó tự động ẩn đi (Fade-out).
> * Nếu có Task mới trong khi Task cũ chưa xong, Reset và chạy lại từ đầu hoặc cộng dồn (ưu tiên Reset).
> 
> 
> 
> 
> 2. **Backend (NodeJS):** Giả định tôi dùng **Socket.io** (hoặc WebSockets), hãy viết logic xử lý tại Controller để thay vì gửi thông báo đơn lẻ, hãy gửi một Object trạng thái: `{ jobId, current, total, status }`.
> 3. **Integration:** Viết một Custom Hook `useQueueProgress` trong React để quản lý State này, giúp code gọn gàng và dễ tái sử dụng cho các trang khác .
> 
> 
---

# ## 2. Gợi ý kỹ thuật để "Prompt" này chạy chuẩn nhất

Vì bạn là một Project Manager kiêm Developer, bạn nên lưu ý 3 điểm sau khi AI trả về kết quả:

* **Z-Index & Layout:** Nhắc AI sử dụng `sticky top-0` hoặc `relative` cho thanh Progress Bar để đảm bảo nó luôn nằm trên danh sách nhưng không "đè" (overlay) lên nội dung, tránh làm hỏng layout hiện tại của bạn.
* **State Reset:** Đảm bảo khi `progress === 100`, biến `show` được set về `false` sau một `setTimeout`. Nếu không, thanh bar sẽ bị kẹt ở mức 100% mãi mãi.
* **Socket Room:** Nếu ứng dụng của bạn có nhiều người dùng, hãy yêu cầu AI sử dụng `socket.to(userId).emit` để tránh việc tiến trình của người này hiện lên màn hình của người khác.

---
