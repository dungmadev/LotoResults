# 📊 Project Plan — LotoResults (Xổ Số Live)

> **Ngày cập nhật:** 2026-03-02  
> **SRS:** [SRS.md](file:///d:/Antigravity/LotoResults/Documents/SRS.md)

---

## 1. Tổng quan Sprint

| Sprint | Tên | Thời gian | Trạng thái |
|--------|-----|-----------|------------|
| Sprint 1 | MVP + Core Features | 2026-03-01 | ✅ Hoàn thành |
| Sprint 2 | Data Reliability + SSE | 2026-03-01 → 03-02 | 🔄 Đang thực hiện |
| Sprint 3 | Stats Frontend + UX Polish | TBD | 📋 Planned |
| Sprint 4 | Pro Features (Vé, Alert) | TBD | 📋 Planned |
| Sprint 5 | Reliability+ & PWA | TBD | 📋 Planned |
| Sprint 6 | Advanced (OCR, Admin) | TBD | 📋 Planned |

---

## 2. Chi tiết từng Sprint

### Sprint 1 — MVP + Core Features ✅

**Mục tiêu:** Xây dựng ứng dụng hoàn chỉnh từ đầu, từ khởi tạo repo đến deploy production.

| # | Task | SRS Ref | Trạng thái |
|---|------|---------|------------|
| 1.1 | Khởi tạo monorepo (backend + frontend) | — | ✅ |
| 1.2 | Database schema + seed data | §4.1 | ✅ |
| 1.3 | Crawler dữ liệu xổ số (Axios + Cheerio) | FR-10 | ✅ |
| 1.4 | RESTful API: results, latest, provinces, search | §4.2 | ✅ |
| 1.5 | LRU Cache + Rate limit + CORS | NFR-01, NFR-02 | ✅ |
| 1.6 | Frontend: Dashboard, SearchPage, HistoryPage | FR-01, FR-02, FR-03 | ✅ |
| 1.7 | Deep-link & Bookmark | FR-04 | ✅ |
| 1.8 | Tìm kiếm nâng cao (mode + prizeCode) | FR-02.2, FR-02.3 | ✅ |
| 1.9 | Live Update + Countdown | FR-05 | ✅ |
| 1.10 | So sánh nhiều đài (ComparePage) | FR-06 | ✅ |
| 1.11 | Export & Chia sẻ (clipboard, share, CSV) | FR-08.1-3 | ✅ |
| 1.12 | Statistics Backend (frequency, hot-cold, CSV) | FR-07.1-3 | ✅ |
| 1.13 | Theme Sáng/Tối | FR-14.1-3 | ✅ |
| 1.14 | CI/CD Pipeline (GitHub Actions + Docker) | NFR-04 | ✅ |
| 1.15 | Fix lint errors frontend | — | ✅ |
| 1.16 | Deploy Render (kết nối frontend-backend) | — | ✅ |

**Báo cáo:** [Reports/Tuan_09_2026/](file:///d:/Antigravity/LotoResults/Reports/Tuan_09_2026/)

---

### Sprint 2 — Data Reliability + SSE 🔄

**Mục tiêu:** Cải thiện thu thập dữ liệu và real-time notifications.

| # | Task | SRS Ref | Trạng thái |
|---|------|---------|------------|
| 2.1 | CrawlQueue singleton (dedup, retry, rate limit) | FR-10.1 | ✅ |
| 2.2 | Auto-crawl on startup | FR-10.2 | ✅ |
| 2.3 | Non-blocking response + enqueue crawl | FR-10.3 | ✅ |
| 2.4 | SSE Manager (broadcast, heartbeat, cleanup) | FR-09.1 | ✅ |
| 2.5 | SSE + Queue status API endpoints | §4.2 | ✅ |
| 2.6 | Frontend SSE hook (useServerEvents) | FR-09.1 | ✅ |
| 2.7 | Toast notification component | FR-09.2 | ✅ |
| 2.8 | SSEProvider + React Query invalidation | FR-09.3 | ✅ |
| 2.9 | Crawl status banner (SearchPage) | FR-09.4 | ✅ |
| 2.10 | Update ComparePage, HistoryPage cho response mới | — | ✅ |
| 2.11 | Fix crawler multi-province data | — | ✅ |
| 2.12 | Cập nhật README + CHANGELOG | NFR-04 | ✅ |
| 2.13 | Cập nhật SRS + Project Plan | — | ✅ |

**Báo cáo:** [2026-03-01_data-improvement-crawl-queue-sse.md](file:///d:/Antigravity/LotoResults/Reports/2026-03-01_data-improvement-crawl-queue-sse.md)

---

### Sprint 3 — Stats Frontend + UX Polish 📋

**Mục tiêu:** Xây dựng StatsPage trên frontend, cải thiện UX, và polish giao diện.

| # | Task | SRS Ref | Ưu tiên |
|---|------|---------|---------|
| 3.1 | Frontend **StatsPage** — hiển thị tần suất, số nóng/lạnh | FR-07.4 | P1 |
| 3.2 | Biểu đồ "lô tô" / đầu-đuôi (bảng 0-9 × 0-9) | FR-07.5 | P2 |
| 3.3 | Theo dõi xu hướng — "số nóng 7/30 ngày" | FR-07.6 | P2 |
| 3.4 | So sánh 2 khoảng thời gian | FR-07.7 | P3 |
| 3.5 | Tìm theo "tổng chữ số", "đầu/đuôi" | FR-02.5 | P3 |
| 3.6 | Export ảnh PNG (html2canvas) | FR-08.4 | P3 |
| 3.7 | Keyboard navigation cho bảng kết quả | FR-14.4 | P3 |
| 3.8 | Accessibility — font lớn, tương phản cao | FR-14.5 | P3 |
| 3.9 | Virtualized list cho lịch sử dài | NFR-01.4 | P3 |
| 3.10 | Prefetch ngày gần nhất khi hover/chạm | NFR-01.5 | P3 |

---

### Sprint 4 — Pro Features (Vé, Alert) 📋

**Mục tiêu:** Tính năng cho người dùng lưu vé và nhận thông báo trúng thưởng.

| # | Task | SRS Ref | Ưu tiên |
|---|------|---------|---------|
| 4.1 | Backend: schema lưu vé/số (user_tickets table) | FR-11.1 | P1 |
| 4.2 | API: CRUD vé/số | FR-11.1 | P1 |
| 4.3 | Service đối chiếu tự động khi có kết quả | FR-11.2 | P1 |
| 4.4 | Frontend: UI lưu vé + dashboard "My Stats" | FR-13.1, FR-13.3 | P1 |
| 4.5 | Web Push notification khi trúng | FR-11.3 | P2 |
| 4.6 | Rule "gần trúng" (2/3 số cuối) | FR-11.4 | P2 |
| 4.7 | Heatmap trúng theo thời gian | FR-13.2 | P3 |

---

### Sprint 5 — Reliability+ & PWA 📋

**Mục tiêu:** Nâng cao độ tin cậy dữ liệu và trải nghiệm offline.

| # | Task | SRS Ref | Ưu tiên |
|---|------|---------|---------|
| 5.1 | Multi-source reconciliation (crawl 2-3 nguồn) | NFR-03.4 | P1 |
| 5.2 | Change detection cho parser (test snapshot HTML) | NFR-03.5 | P2 |
| 5.3 | Idempotency + checksum cho kỳ quay | NFR-03.6 | P2 |
| 5.4 | PWA manifest + Service Worker | NFR-06.1-2 | P1 |
| 5.5 | Offline-first — cache kết quả đã xem | NFR-06.3 | P2 |
| 5.6 | Job monitor admin page | NFR-05.1 | P2 |
| 5.7 | Alert Slack/Telegram khi crawl fail | NFR-05.2 | P3 |

---

### Sprint 6 — Advanced (OCR, Admin) 📋

**Mục tiêu:** Tính năng nâng cao.

| # | Task | SRS Ref | Ưu tiên |
|---|------|---------|---------|
| 6.1 | OCR quét vé bằng camera | FR-12 | P3 |
| 6.2 | Trang chi tiết 1 kỳ quay | FR-01.5 | P3 |
| 6.3 | E2E testing (Playwright/Cypress) | NFR-07.3 | P3 |
| 6.4 | Email notification khi trúng | FR-11.3 | P3 |

---

## 3. Milestones

| Milestone | Tiêu chí hoàn thành | Ngày hoàn thành |
|-----------|---------------------|-----------------|
| 🏁 MVP Launch | App chạy được, tra cứu + tìm kiếm + lịch sử | 2026-03-01 ✅ |
| 🏁 Production Deploy | Frontend + Backend live trên Render | 2026-03-01 ✅ |
| 🏁 Real-time Ready | CrawlQueue + SSE + Toast hoạt động | 2026-03-02 ✅ |
| 🏁 Stats Complete | StatsPage frontend hiển thị đầy đủ | TBD |
| 🏁 Pro Release | Lưu vé + đối chiếu + thông báo | TBD |
| 🏁 PWA Release | Offline-first, Add to Home Screen | TBD |

---

## 4. Rủi ro & Giảm thiểu

| Rủi ro | Mức độ | Giảm thiểu |
|--------|--------|------------|
| Nguồn HTML thay đổi → crawler lỗi | Cao | Multi-source + change detection parser |
| Render free tier cold start chậm | Trung bình | Auto-crawl on startup để warm up |
| SQLite không scale khi data lớn | Thấp | Migrate sang PostgreSQL khi cần |
| OCR accuracy thấp | Trung bình | Cho phép chỉnh tay + validate format |
