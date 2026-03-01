Dưới đây là các “tính năng hay ho” để nâng cấp app theo 3 lớp: **giá trị người dùng**, **độ tin cậy dữ liệu**, và **trải nghiệm sản phẩm**. Bạn có thể copy phần này và dán vào prompt cho Antigravity như một backlog.

## 1) Tính năng nâng cấp cho người dùng (Product features)

1. **Thông báo trúng thưởng (Alert)**

* Người dùng lưu “vé/số” (2–6 chữ số, hoặc cả dãy) + chọn miền/đài + ngày.
* Khi có kết quả, hệ thống đối chiếu và gửi:

  * Web push / Email / Zalo OA (tuỳ chọn)
* Cho phép rule “gần trúng” (ví dụ trùng 2 số cuối / 3 số cuối).

2. **Quét vé bằng camera (OCR)**

* Mobile-first: chụp ảnh vé → nhận dạng dãy số → auto tạo “vé đã lưu”.
* Có chế độ chỉnh tay nếu OCR sai.
* (Nếu làm nhanh: chỉ hỗ trợ nhận dạng chuỗi số + validate format.)

3. **Lịch quay số + countdown**

* Hiển thị lịch quay theo miền/đài (giờ quay) + countdown đến kỳ tiếp theo.
* Khi gần đến giờ quay: bật “live mode”.

4. **Chế độ “Live update”**

* Trong khung giờ quay: tự refresh mỗi 15–30s (có backoff).
* Hiển thị trạng thái: “Đang cập nhật”, “Đã chốt kết quả”, “Nguồn dự phòng”.

5. **So sánh nhanh nhiều đài**

* Chọn 2–4 đài cùng ngày → hiển thị dạng tabs/columns để so sánh.

6. **Tìm kiếm nâng cao**

* Tìm số theo:

  * “chứa chuỗi” (contains)
  * “bắt đầu/kết thúc bằng”
  * “tổng chữ số”, “chẵn/lẻ”, “đầu/đuôi”
* Cho phép filter theo giải (ĐB, G1, …).

7. **Thống kê cá nhân (My Stats)**

* Người dùng lưu lịch sử vé → dashboard:

  * tỷ lệ trúng (theo rule), tổng số lần trúng
  * heatmap trúng theo thời gian
* Không cổ vũ cờ bạc; chỉ “tra cứu & lưu lịch sử”.

## 2) Tính năng thống kê/phân tích dữ liệu (Data/Analytics)

8. **Thống kê tần suất (Frequency)**

* Theo miền/đài + khoảng thời gian:

  * tần suất xuất hiện 2 số cuối/3 số cuối
  * top/bottom phổ biến
* Cho phép export CSV.

9. **Biểu đồ “lô tô” (MB) / đầu-đuôi**

* Dạng bảng đầu 0–9, đuôi 0–9 (tuỳ miền/chuẩn).
* Highlight các số vừa ra.

10. **Theo dõi xu hướng**

* “Số nào đang ‘nóng’ trong 7/30 ngày”
* “Số nào ‘lạnh’ lâu chưa xuất hiện”
* (Gắn nhãn rõ: chỉ là thống kê, không dự đoán.)

11. **Chế độ so sánh 2 khoảng thời gian**

* So tần suất 7 ngày gần nhất vs 30 ngày trước đó.

## 3) Tính năng nâng độ tin cậy thu thập dữ liệu (Reliability)

12. **Multi-source reconciliation (hòa giải dữ liệu)**

* Crawl từ 2–3 nguồn.
* Nếu lệch nhau:

  * đánh cờ “conflict”
  * ưu tiên nguồn đáng tin + hiển thị cảnh báo
  * lưu cả raw payload để debug.

13. **Change detection cho parser**

* Test snapshot HTML (hoặc JSON) hằng ngày.
* Nếu cấu trúc DOM thay đổi → cảnh báo CI/CD (GitHub Actions).

14. **Idempotency + checksum**

* Mỗi kỳ quay có hash; nếu hash đổi sau khi “chốt” → log sự kiện “data corrected”.

15. **Job monitor**

* Trang admin nhỏ:

  * job last-run
  * số kỳ crawl thành công/thất bại
  * latency theo nguồn
* Alert qua Slack/Telegram khi fail liên tục.

## 4) UX/UI “xịn” hơn (Experience)

16. **Bookmark & deep-link**

* URL phản ánh filter:

  * `/results/mb/hanoi/2026-03-01`
* Share link là mở đúng màn hình đó.

17. **Offline-first & PWA**

* Add to Home Screen
* Cache kết quả đã xem để mở lại khi mất mạng.

18. **Dark mode + accessibility**

* Dark/light, font lớn, tương phản cao
* Keyboard navigation cho bảng kết quả.

19. **Speed optimizations**

* Virtualized list cho lịch sử dài
* Prefetch ngày gần nhất khi hover/chạm.

20. **Export & chia sẻ**

* Export ảnh (PNG) của bảng kết quả (đẹp để share)
* Copy nhanh “ĐB + G1…” theo format chuẩn.

## 5) Gợi ý gói tính năng theo mức độ (để triển khai nhanh)

* **MVP+ (1–2 ngày):** deep-link, live update, tìm kiếm nâng cao, export CSV.
* **Pro (3–5 ngày):** lưu vé + đối chiếu trúng, thống kê tần suất, PWA offline.
* **Reliability+ (song song):** multi-source reconciliation, job monitor, parser change detection.

---

### Đoạn bổ sung để dán thẳng vào prompt (ngắn gọn)

Yêu cầu bổ sung: thêm các tính năng nâng cấp gồm (1) lưu vé & đối chiếu trúng + thông báo, (2) live update trong giờ quay + countdown, (3) thống kê tần suất số theo 7/30/90 ngày + biểu đồ đầu/đuôi, (4) deep-link theo bộ lọc & chia sẻ, (5) PWA offline + dark mode, (6) multi-source reconciliation + job monitor + cảnh báo khi parser thay đổi.

Nếu bạn muốn mình “chốt” luôn **1 roadmap cụ thể** (theo tuần / sprint) hoặc **định nghĩa schema & endpoint** tương ứng cho các tính năng trên, mình sẽ viết luôn bản spec triển khai chi tiết.
