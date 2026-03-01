1. Khi mới khởi động, hình như backend không tự động load data từ internet về. 
Cần phải cải thiện điều này.
2. Quá trình crawl dữ liệu đôi khi bị lỗi, cần phải cải thiện điều này.
3. Cần có cơ chế hàng đợi để xử lý các yêu cầu crawl dữ liệu.
4. Khi Frontend yêu cầu dữ liệu, Backend thông báo ngay là đang xử lý, 
đưa yêu cầu vào hàng đợi. Khi kết quả trả về từ internet, 
Backend xử lý và lưu vào database, sau đó trả về dữ liệu cho Frontend.
5. Cần có cơ chế thông báo cho Frontend khi có dữ liệu mới.
6. Cần có cơ chế thông báo cho Frontend khi có lỗi xảy ra.
7. Có lẽ cần cài thêm thư viện để backend có thể gửi thông báo cho Frontend.
8. 
