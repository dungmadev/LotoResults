Dưới đây là **prompt tiếng Việt** (copy/paste được) để yêu cầu Antigravity xây dựng **ứng dụng ReactJS** thu thập và hiển thị **kết quả xổ số Việt Nam**. Mình viết theo kiểu “spec + acceptance criteria” để họ triển khai đúng ý.

---

### Prompt gửi Antigravity

Bạn là Antigravity, hãy **xây dựng ứng dụng web ReactJS** (SPA) để **thu thập (crawl/ingest) và hiển thị kết quả xổ số Việt Nam**. Mục tiêu: người dùng chọn **ngày + đài/tỉnh + loại xổ số** và xem kết quả nhanh, có lịch sử, có tìm kiếm. Triển khai theo hướng **dễ mở rộng, có caching, có xử lý lỗi, có kiểm thử**.

## 1) Phạm vi dữ liệu

* Hỗ trợ tối thiểu:

  * **Xổ số Miền Bắc (XSMB)**
  * **Xổ số Miền Trung (XSMT)**
  * **Xổ số Miền Nam (XSMN)**
* Cho phép cấu hình danh sách **đài/tỉnh** theo miền.
* Dữ liệu cần lưu/hiển thị:

  * Ngày quay, miền/đài
  * Các giải theo chuẩn từng miền (ví dụ: ĐB, G1, G2…)
  * Ký hiệu/series (nếu nguồn có)
  * Thời điểm cập nhật, nguồn dữ liệu
* Ưu tiên thiết kế data model “normalize”:

  * `draw_date`, `region`, `province`, `prize_code`, `numbers[]`, `source`, `fetched_at`, `checksum/hash`

## 2) Kiến trúc đề xuất

### Frontend (ReactJS)

* React 18 + TypeScript
* Router (React Router) với các trang:

  1. Dashboard (ngày hôm nay)
  2. Tra cứu theo ngày/đài/miền
  3. Lịch sử (7/30/90 ngày)
  4. Trang chi tiết 1 kỳ quay
* UI:

  * Bộ lọc: DatePicker + Region + Province + “Loại” (MB/MT/MN)
  * Bảng kết quả theo giải, hiển thị rõ ràng trên mobile
  * Tìm kiếm nhanh theo số (ví dụ nhập “12345” → highlight các giải chứa số đó)
  * Nút “Làm mới” + trạng thái loading/skeleton
* State/data fetching:

  * Dùng TanStack Query (React Query) để caching + retry + stale time
  * Chặn spam: debounce khi đổi filter
* i18n: tiếng Việt mặc định

### Backend (bắt buộc có để “thu thập”)

* Tạo service Node.js (Express/Nest) hoặc serverless (Next API route đều được), nhưng **React thuần không thể crawl ổn định** do CORS và nguồn thay đổi.
* Backend cung cấp API chuẩn:

  * `GET /api/results?date=YYYY-MM-DD&region=mb|mt|mn&province=...`
  * `GET /api/results/latest?region=...&province=...`
  * `GET /api/provinces?region=...`
* Ingestion/Crawler:

  * Có cơ chế fetch từ **ít nhất 2 nguồn** (primary + fallback)
  * Chuẩn hoá dữ liệu về schema nội bộ
  * Detect thay đổi HTML và failover
  * Có logging + metrics cơ bản

### Lưu trữ & cache

* Tối thiểu: SQLite/Postgres + Prisma ORM
* Cache:

  * In-memory (LRU) hoặc Redis (nếu có)
  * TTL theo ngày (kết quả cũ ít thay đổi)
* Tự động cập nhật:

  * Cron job (ví dụ mỗi 1–5 phút trong khung giờ quay số theo miền)
  * Nếu job fail → cảnh báo log rõ

## 3) Yêu cầu phi chức năng

* Độ tin cậy: nếu nguồn A lỗi → tự chuyển nguồn B
* Hiệu năng: query ngày gần nhất trả về < 500ms (trong điều kiện local/dev)
* Bảo mật:

  * Rate limit API
  * Sanitize input query
* Kiểm thử:

  * Unit test cho parser/normalizer
  * Integration test cho endpoint chính
* Dev UX:

  * README đầy đủ (setup, env, run, test, deploy)
  * Docker Compose (tùy chọn nhưng ưu tiên)

## 4) Deliverables

1. Repo gồm:

   * `frontend/` ReactTS
   * `backend/` Node service + crawler + DB schema
2. Bộ mẫu dữ liệu (seed) cho 3 miền trong 3 ngày gần nhất
3. Ảnh chụp màn hình UI (desktop + mobile)
4. Checklist acceptance criteria (mục 5)

## 5) Acceptance criteria (bắt buộc)

* Người dùng chọn **ngày + miền + đài** và xem đúng kết quả theo giải
* Có trang “Latest” cho từng miền/đài
* Khi API lỗi: UI hiển thị thông báo thân thiện + nút retry
* Caching hoạt động: reload trang không spam request liên tục
* Crawler có fallback nguồn và log rõ nguyên nhân khi fail
* Có test cho parser + 1 endpoint chính

## 6) Lưu ý pháp lý/đạo đức dữ liệu

* Không scrape nếu nguồn cấm; ưu tiên nguồn cho phép hoặc API chính thống nếu có.
* Luôn hiển thị “Nguồn dữ liệu” và thời điểm cập nhật.

Hãy bắt đầu bằng:

1. Đề xuất schema dữ liệu chuẩn hoá,
2. Danh sách endpoint,
3. Thiết kế UI (wireframe mô tả),
4. Kế hoạch crawl + fallback,
5. Cấu trúc thư mục repo,
6. Sau đó triển khai mã nguồn.

---

Nếu bạn muốn, mình có thể tạo thêm **phiên bản prompt “ngắn gọn”** (1 đoạn) hoặc prompt nhấn mạnh **deploy lên Vercel/Render** và **giới hạn phạm vi chỉ XSMB** để làm MVP nhanh.
