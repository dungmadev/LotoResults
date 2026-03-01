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


Hiện tại khi fetch vẫn thấy nhiều thông báo hiện lên
tôi muốn bạn thu thập số lượng các tỉnh rồi thu thập, xử lý được thì cập nhật progress bar
không hiện các thông báo như cũ


/fix 
1.  trong một số trường hợp việc crawl bị lỗi giữa chừng có vẻ khi có miền không có kết quả và thanh progress đứng mãi không biết xong hay không
2. Tôi muốn bạn đầu tiên hãy đếm số lượng các tỉnh cần xử lý sau đó mới bắt đầu xử lý và cập nhật progress bar và hiển thị phần trăm dựa trên số lượng các tỉnh đã xử lý được
3. Kết quả có các trường hợp không đồng nhất. Khi tôi thay đổi ngày thì có kết quả, khi tôi gõ ngay tại cửa sổ https://lotoresults-frontend.onrender.com/search?date=2026-01-02 thì lại không có kết quả. Hãy kiểm tra lại logic xử lý và đảm bảo kết quả luôn đồng nhất
4. tại trang https://lotoresults-frontend.onrender.com/compare khi tôi đổi ngày bất kỳ khác mặc định thì hiển thị không có dữ liệu. Hãy kiểm tra lại logic xử lý và đảm bảo kết quả luôn đồng nhất



Tại http://localhost:5173/compare có vẻ sai khi đổi ngày bất kỳ thì trong nhiều trường hợp backend không thấy log  crawler. Trường hợp trong ảnh thì backend có vè có dữ liệu đồng nai, cần thơ nhưng frontend không thấy dữ liệu. Hãy kiểm tra lại logic xử lý và đảm bảo kết quả luôn đồng nhất


1. Cần thêm tỉnh động tức là nếu phát hiện địa phương chưa có trong danh sách thì cập nhật thêm "on the fly"
2. Hãy cho phép đổi ngày ngay trên trang chủ
3. Có vẻ minhngoc.net.vn cấm truy cập nhiều chăng. Hãy đề xuất giải pháp
minhngoc.net.vn returned insufficient data (0 numbers, expected ≥18)    
[2026-03-01T22:32:40.540Z] [CRAWLER] [WARN] [Race] ❌ minhngoc.net.vn failed: Insufficient data from minhngoc.net.vn: got 0 numbers, expected ≥18



1. Không rõ vì sao phải insert dữ liệu trước khi chạy. Tôi muốn khi chạy, phần mềm sẽ xử lý
2. Có những lúc bị lỗi như sau
![Hiển thị số không đúng](image.png)
3. Thống nhất phương án A để xử lý minhngoc.net.vn


1. CSDL kết quả xổ số lâu lâu xoá cũng được nếu dữ liệu lớn

1. Trên giao diện trang chủ ô xem ngày khác phải để giá trị ngày tháng đùng, không để mm/đ/yyyy
2. Cấ sử dụng format dd/mm/yyyy
3. Toàn bộ khung ở trên làm gọn lại, từ chữ kết quả xổ số việt nam cho đến tải lại nguồn, làm sao cho nó gọn lại và để ở trên cùng


1. Kiểm tra việc đổi ngày tháng ở tất cả các trang đều theo format dd/mm/yyyy
2. 