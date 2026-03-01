# 📋 Product Backlog — LotoResults (Xổ Số Live)

> **Ngày cập nhật:** 2026-03-02  
> **SRS:** [SRS.md](file:///d:/Antigravity/LotoResults/Documents/SRS.md)  
> **Project Plan:** [ProjectPlan.md](file:///d:/Antigravity/LotoResults/Documents/ProjectPlan.md)

---

## Quy ước

**Ưu tiên:** P1 (Bắt buộc) → P2 (Nên có) → P3 (Tùy chọn)  
**Trạng thái:** ✅ Done | 🔄 In Progress | 📋 To Do | ❌ Cancelled  
**Nguồn:** FP = FirstPrompt | PI = Prompt_Improvement | DI = DataImprovement

---

## 1️⃣ Product Features — Tính năng người dùng

| ID | Tính năng | Ưu tiên | Sprint | Nguồn | SRS Ref |
|----|-----------|---------|--------|-------|---------|
| PF-01 | Dashboard — kết quả mới nhất 3 miền | P1 | 1 | FP | FR-01.1 |
| PF-02 | Bộ lọc: DatePicker + Region + Province | P1 | 1 | FP | FR-01.2 |
| PF-03 | Bảng kết quả theo giải, responsive mobile | P1 | 1 | FP | FR-01.3 |
| PF-04 | Trang Latest cho từng miền/đài | P1 | 1 | FP | FR-01.4 |
| PF-05 | Trang chi tiết 1 kỳ quay | P3 | 6 | FP | FR-01.5 |
| PF-06 | Tìm số nhanh — highlight kết quả | P1 | 1 | FP | FR-02.1 |
| PF-07 | Tìm kiếm nâng cao: contains/starts/ends | P1 | 1 | PI #6 | FR-02.2 |
| PF-08 | Lọc theo giải cụ thể (ĐB, G1-G8) | P1 | 1 | PI #6 | FR-02.3 |
| PF-09 | Lọc theo chẵn/lẻ | P1 | 1 | PI #6 | FR-02.4 |
| PF-10 | Tìm theo "tổng chữ số", "đầu/đuôi" | P3 | 3 | PI #6 | FR-02.5 |
| PF-11 | Lịch sử kết quả 7/30/90 ngày | P1 | 1 | FP | FR-03.1 |
| PF-12 | URL state chia sẻ link giữ bộ lọc | P1 | 1 | FP | FR-03.2 |
| PF-13 | Deep-link `/results/:region/:province/:date` | P1 | 1 | PI #16 | FR-04.1 |
| PF-14 | Share link mở đúng màn hình | P1 | 1 | PI #16 | FR-04.2 |
| PF-15 | Countdown đến kỳ quay tiếp theo | P1 | 1 | PI #3 | FR-05.1 |
| PF-16 | Live mode auto-refresh 15-30s | P1 | 1 | PI #4 | FR-05.2 |
| PF-17 | Trạng thái: "Đang cập nhật", "Đã chốt" | P1 | 1 | PI #4 | FR-05.3 |
| PF-18 | Badge LIVE nhấp nháy | P1 | 1 | PI #4 | FR-05.4 |
| PF-19 | So sánh 2-4 đài (ComparePage) | P1 | 1 | PI #5 | FR-06.1 |
| PF-20 | Grid responsive cho Compare | P1 | 1 | PI #5 | FR-06.2 |
| PF-21 | Thống kê tần suất 2-3 số cuối (API) | P1 | 1 | PI #8 | FR-07.1 |
| PF-22 | Số nóng/lạnh (API) | P1 | 1 | PI #10 | FR-07.2 |
| PF-23 | Export CSV thống kê | P1 | 1 | PI #8 | FR-07.3 |
| PF-24 | **Frontend StatsPage** | P2 | 3 | PI #8 | FR-07.4 |
| PF-25 | Biểu đồ lô tô / đầu-đuôi | P2 | 3 | PI #9 | FR-07.5 |
| PF-26 | Theo dõi xu hướng số nóng/lạnh (UI) | P2 | 3 | PI #10 | FR-07.6 |
| PF-27 | So sánh 2 khoảng thời gian | P2 | 3 | PI #11 | FR-07.7 |
| PF-28 | Copy kết quả vào clipboard | P1 | 1 | PI #20 | FR-08.1 |
| PF-29 | Web Share API / clipboard fallback | P1 | 1 | PI #20 | FR-08.2 |
| PF-30 | Export CSV kết quả | P1 | 1 | PI #20 | FR-08.3 |
| PF-31 | Export ảnh PNG (html2canvas) | P2 | 3 | PI #20 | FR-08.4 |
| PF-32 | SSE — push event khi có data mới | P1 | 2 | DI | FR-09.1 |
| PF-33 | Toast notification (slide-in/out, 5s) | P1 | 2 | DI | FR-09.2 |
| PF-34 | Auto-invalidate React Query cache | P1 | 2 | DI | FR-09.3 |
| PF-35 | Crawl status banner (SearchPage) | P1 | 2 | DI | FR-09.4 |
| PF-36 | CrawlQueue (dedup, retry, rate limit) | P1 | 2 | DI | FR-10.1 |
| PF-37 | Auto-crawl on startup | P1 | 2 | DI | FR-10.2 |
| PF-38 | Non-blocking response + enqueue crawl | P1 | 2 | DI | FR-10.3 |
| PF-39 | Backfill lịch sử (tối đa 90 ngày) | P1 | 2 | DI | FR-10.4 |
| PF-40 | Lưu vé/số (2-6 chữ số) + miền/đài | P2 | 4 | PI #1 | FR-11.1 |
| PF-41 | Đối chiếu tự động khi có kết quả | P2 | 4 | PI #1 | FR-11.2 |
| PF-42 | Web Push / Email / Zalo OA notification | P3 | 4-6 | PI #1 | FR-11.3 |
| PF-43 | Rule "gần trúng" (2/3 số cuối) | P3 | 4 | PI #1 | FR-11.4 |
| PF-44 | OCR quét vé bằng camera | P3 | 6 | PI #2 | FR-12 |
| PF-45 | Dashboard cá nhân (My Stats) | P2 | 4 | PI #7 | FR-13.1 |
| PF-46 | Heatmap trúng theo thời gian | P3 | 4 | PI #7 | FR-13.2 |
| PF-47 | Lưu lịch sử vé | P2 | 4 | PI #7 | FR-13.3 |
| PF-48 | Dark/Light theme toggle | P1 | 1 | PI #18 | FR-14.1 |
| PF-49 | localStorage persist theme | P1 | 1 | PI #18 | FR-14.2 |
| PF-50 | System preference detection | P1 | 1 | PI #18 | FR-14.3 |
| PF-51 | Keyboard navigation bảng kết quả | P3 | 3 | PI #18 | FR-14.4 |
| PF-52 | Accessibility (font lớn, contrast cao) | P3 | 3 | PI #18 | FR-14.5 |

---

## 2️⃣ Technical / Infrastructure

| ID | Tính năng | Ưu tiên | Sprint | Nguồn | SRS Ref |
|----|-----------|---------|--------|-------|---------|
| TI-01 | CI: lint + type-check + test + build | P1 | 1 | FP | NFR-04.1 |
| TI-02 | CD: Docker build → deploy | P1 | 1 | FP | NFR-04.2 |
| TI-03 | Multi-stage Dockerfiles | P1 | 1 | FP | NFR-04.3 |
| TI-04 | Docker Compose full-stack | P1 | 1 | FP | NFR-04.4 |
| TI-05 | Rate limit API | P1 | 1 | FP | NFR-02.1 |
| TI-06 | Input sanitization | P1 | 1 | FP | NFR-02.2 |
| TI-07 | CORS dynamic config | P1 | 1 | FP | NFR-02.3 |
| TI-08 | Nginx security headers | P1 | 1 | FP | NFR-02.4 |
| TI-09 | Unit test parser + endpoint | P1 | 1 | FP | NFR-07.1-2 |
| TI-10 | Multi-source reconciliation | P2 | 5 | PI #12 | NFR-03.4 |
| TI-11 | Change detection parser (CI alert) | P2 | 5 | PI #13 | NFR-03.5 |
| TI-12 | Idempotency + checksum | P2 | 5 | PI #14 | NFR-03.6 |
| TI-13 | Job monitor admin page | P2 | 5 | PI #15 | NFR-05.1 |
| TI-14 | Alert Slack/Telegram | P3 | 5 | PI #15 | NFR-05.2 |
| TI-15 | PWA manifest + Service Worker | P2 | 5 | PI #17 | NFR-06.1-2 |
| TI-16 | Offline-first cache | P2 | 5 | PI #17 | NFR-06.3 |
| TI-17 | Virtualized list (lịch sử dài) | P3 | 3 | PI #19 | NFR-01.4 |
| TI-18 | Prefetch on hover/touch | P3 | 3 | PI #19 | NFR-01.5 |
| TI-19 | E2E testing | P3 | 6 | FP | NFR-07.3 |

---

## 3️⃣ Mapping: Prompt_Improvement → Backlog

Bảng map **20 tính năng** từ file [Prompt_Improvement.md](file:///d:/Antigravity/LotoResults/Notes/Prompt_Improvement.md):

| PI # | Tên tính năng | Backlog ID | Trạng thái |
|------|---------------|------------|------------|
| 1 | Thông báo trúng thưởng (Alert) | PF-40 → PF-43 | 📋 Sprint 4 |
| 2 | Quét vé bằng camera (OCR) | PF-44 | 📋 Sprint 6 |
| 3 | Lịch quay số + countdown | PF-15 | ✅ Sprint 1 |
| 4 | Chế độ "Live update" | PF-16, PF-17, PF-18 | ✅ Sprint 1 |
| 5 | So sánh nhanh nhiều đài | PF-19, PF-20 | ✅ Sprint 1 |
| 6 | Tìm kiếm nâng cao | PF-07, PF-08, PF-09 | ✅ Sprint 1 |
| — | Tìm "tổng chữ số", "đầu/đuôi" | PF-10 | 📋 Sprint 3 |
| 7 | Thống kê cá nhân (My Stats) | PF-45, PF-46, PF-47 | 📋 Sprint 4 |
| 8 | Thống kê tần suất (Frequency) | PF-21, PF-23 | ✅ Sprint 1 (BE) |
| — | Frontend StatsPage | PF-24 | 📋 Sprint 3 |
| 9 | Biểu đồ lô tô / đầu-đuôi | PF-25 | 📋 Sprint 3 |
| 10 | Theo dõi xu hướng (nóng/lạnh) | PF-22, PF-26 | ✅ BE Sprint 1 / 📋 FE Sprint 3 |
| 11 | So sánh 2 khoảng thời gian | PF-27 | 📋 Sprint 3 |
| 12 | Multi-source reconciliation | TI-10 | 📋 Sprint 5 |
| 13 | Change detection parser | TI-11 | 📋 Sprint 5 |
| 14 | Idempotency + checksum | TI-12 | 📋 Sprint 5 |
| 15 | Job monitor | TI-13, TI-14 | 📋 Sprint 5 |
| 16 | Bookmark & deep-link | PF-13, PF-14 | ✅ Sprint 1 |
| 17 | Offline-first & PWA | TI-15, TI-16 | 📋 Sprint 5 |
| 18 | Dark mode + accessibility | PF-48 → PF-52 | ✅ Theme Sprint 1 / 📋 A11y Sprint 3 |
| 19 | Speed optimizations | TI-17, TI-18 | 📋 Sprint 3 |
| 20 | Export & chia sẻ | PF-28 → PF-31 | ✅ Sprint 1 (text/share/CSV) / 📋 PNG Sprint 3 |
