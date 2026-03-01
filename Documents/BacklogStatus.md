# 📊 Backlog Status — LotoResults (Xổ Số Live)

> **Ngày cập nhật:** 2026-03-02  
> **Backlog:** [Backlog.md](file:///d:/Antigravity/LotoResults/Documents/Backlog.md)  
> **SRS:** [SRS.md](file:///d:/Antigravity/LotoResults/Documents/SRS.md)

---

## 🏆 Tổng quan tiến độ

```
Tổng items:     71 (52 Product + 19 Technical)
✅ Done:         47 (66%)
📋 To Do:        24 (34%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[██████████████████████░░░░░░░░] 66%
```

---

## ✅ ĐÃ HOÀN THÀNH (47 items)

### Sprint 1 — MVP + Core Features (2026-03-01) ✅

| ID | Tính năng | Verify |
|----|-----------|--------|
| PF-01 | Dashboard kết quả mới nhất 3 miền | ✅ |
| PF-02 | Bộ lọc DatePicker + Region + Province | ✅ |
| PF-03 | Bảng kết quả theo giải, responsive | ✅ |
| PF-04 | Trang Latest | ✅ |
| PF-06 | Tìm số nhanh + highlight | ✅ |
| PF-07 | Tìm kiếm nâng cao: contains/starts/ends | ✅ |
| PF-08 | Lọc theo giải (ĐB, G1-G8) | ✅ |
| PF-09 | Lọc chẵn/lẻ | ✅ |
| PF-11 | Lịch sử 7/30/90 ngày | ✅ |
| PF-12 | URL state chia sẻ | ✅ |
| PF-13 | Deep-link `/results/:region/:province/:date` | ✅ |
| PF-14 | Share link mở đúng màn hình | ✅ |
| PF-15 | Countdown đến kỳ quay | ✅ |
| PF-16 | Live mode auto-refresh 15-30s | ✅ |
| PF-17 | Trạng thái "Đang cập nhật" / "Đã chốt" | ✅ |
| PF-18 | Badge LIVE nhấp nháy | ✅ |
| PF-19 | So sánh 2-4 đài (ComparePage) | ✅ |
| PF-20 | Grid responsive Compare | ✅ |
| PF-21 | Thống kê tần suất 2-3 số cuối (BE API) | ✅ |
| PF-22 | Số nóng/lạnh (BE API) | ✅ |
| PF-23 | Export CSV thống kê (BE API) | ✅ |
| PF-28 | Copy kết quả clipboard | ✅ |
| PF-29 | Web Share API / fallback | ✅ |
| PF-30 | Export CSV kết quả | ✅ |
| PF-48 | Dark/Light theme toggle | ✅ |
| PF-49 | localStorage persist theme | ✅ |
| PF-50 | System preference detection | ✅ |
| TI-01 | CI: lint + type-check + test + build | ✅ |
| TI-02 | CD: Docker build → deploy | ✅ |
| TI-03 | Multi-stage Dockerfiles | ✅ |
| TI-04 | Docker Compose full-stack | ✅ |
| TI-05 | Rate limit API | ✅ |
| TI-06 | Input sanitization | ✅ |
| TI-07 | CORS dynamic config | ✅ |
| TI-08 | Nginx security headers | ✅ |
| TI-09 | Unit test parser + endpoint | ✅ |

### Sprint 2 — Data Reliability + SSE (2026-03-01 → 03-02) ✅

| ID | Tính năng | Verify |
|----|-----------|--------|
| PF-32 | SSE push event khi có data mới | ✅ |
| PF-33 | Toast notification (slide-in/out) | ✅ |
| PF-34 | Auto-invalidate React Query cache | ✅ |
| PF-35 | Crawl status banner (SearchPage) | ✅ |
| PF-36 | CrawlQueue (dedup, retry, rate limit) | ✅ |
| PF-37 | Auto-crawl on startup | ✅ |
| PF-38 | Non-blocking response + enqueue crawl | ✅ |
| PF-39 | Backfill lịch sử | ✅ |

---

## 📋 CHƯA THỰC HIỆN (24 items)

### Sprint 3 — Stats Frontend + UX Polish

| ID | Tính năng | PI # | Ưu tiên | Ghi chú |
|----|-----------|------|---------|---------|
| PF-24 | **Frontend StatsPage** | #8 | P2 | BE API đã sẵn sàng, chỉ cần FE page |
| PF-25 | Biểu đồ lô tô / đầu-đuôi | #9 | P2 | Bảng 0-9 × 0-9, highlight số vừa ra |
| PF-26 | Theo dõi xu hướng (UI) | #10 | P2 | Hiển thị "số nóng/lạnh" trên FE |
| PF-27 | So sánh 2 khoảng thời gian | #11 | P2 | 7 ngày gần nhất vs 30 ngày trước |
| PF-10 | Tìm theo "tổng chữ số", "đầu/đuôi" | #6 | P3 | Mở rộng search mode backend |
| PF-31 | Export ảnh PNG (html2canvas) | #20 | P3 | Cần install dependency |
| PF-51 | Keyboard navigation bảng kết quả | #18 | P3 | Accessibility improvement |
| PF-52 | Accessibility (font lớn, contrast) | #18 | P3 | |
| TI-17 | Virtualized list | #19 | P3 | react-window hoặc tương tự |
| TI-18 | Prefetch on hover/touch | #19 | P3 | queryClient.prefetchQuery |

### Sprint 4 — Pro Features (Vé, Alert)

| ID | Tính năng | PI # | Ưu tiên | Ghi chú |
|----|-----------|------|---------|---------|
| PF-40 | Lưu vé/số + miền/đài | #1 | P2 | Cần schema `user_tickets` |
| PF-41 | Đối chiếu tự động khi có kết quả | #1 | P2 | Trigger khi crawl xong |
| PF-42 | Web Push / Email notification | #1 | P3 | Cần setup push server |
| PF-43 | Rule "gần trúng" (2/3 số cuối) | #1 | P3 | |
| PF-45 | Dashboard cá nhân (My Stats) | #7 | P2 | Tỷ lệ trúng, lịch sử |
| PF-46 | Heatmap trúng theo thời gian | #7 | P3 | |
| PF-47 | Lưu lịch sử vé | #7 | P2 | |

### Sprint 5 — Reliability+ & PWA

| ID | Tính năng | PI # | Ưu tiên | Ghi chú |
|----|-----------|------|---------|---------|
| TI-10 | Multi-source reconciliation | #12 | P2 | Crawl 2-3 nguồn, detect conflict |
| TI-11 | Change detection parser | #13 | P2 | Snapshot HTML test, CI alert |
| TI-12 | Idempotency + checksum | #14 | P2 | Hash kỳ quay, log "data corrected" |
| TI-13 | Job monitor admin page | #15 | P2 | last-run, success/fail, latency |
| TI-15 | PWA manifest + Service Worker | #17 | P2 | Add to Home Screen |
| TI-16 | Offline-first cache | #17 | P2 | Cache kết quả đã xem |

### Sprint 6 — Advanced

| ID | Tính năng | PI # | Ưu tiên | Ghi chú |
|----|-----------|------|---------|---------|
| PF-05 | Trang chi tiết 1 kỳ quay | FP | P3 | |
| PF-44 | OCR quét vé bằng camera | #2 | P3 | Mobile-first, validate format |
| TI-14 | Alert Slack/Telegram | #15 | P3 | Khi crawl fail liên tục |
| TI-19 | E2E testing | FP | P3 | Playwright/Cypress |

---

## 📈 Thống kê theo Prompt_Improvement

| Nhóm | Tổng | ✅ Done | 📋 To Do |
|------|------|--------|----------|
| **1) Product Features** (#1-#7) | 15 items | 6 (40%) | 9 (60%) |
| **2) Data/Analytics** (#8-#11) | 7 items | 3 (43%) | 4 (57%) |
| **3) Reliability** (#12-#15) | 5 items | 0 (0%) | 5 (100%) |
| **4) UX/UI** (#16-#20) | 13 items | 9 (69%) | 4 (31%) |
| **Tổng** | **40 items** | **18 (45%)** | **22 (55%)** |

### Chi tiết mapping PI → Trạng thái

| PI # | Tính năng | Trạng thái | Sprint |
|------|-----------|------------|--------|
| 1 | Thông báo trúng thưởng | 📋 Chưa bắt đầu | 4 |
| 2 | Quét vé OCR | 📋 Chưa bắt đầu | 6 |
| 3 | Countdown | ✅ **Hoàn thành** | 1 |
| 4 | Live update | ✅ **Hoàn thành** | 1 |
| 5 | So sánh đài | ✅ **Hoàn thành** | 1 |
| 6 | Tìm kiếm nâng cao | ⚡ **3/4 hoàn thành** — còn "tổng chữ số, đầu/đuôi" | 1 + 3 |
| 7 | Thống kê cá nhân (My Stats) | 📋 Chưa bắt đầu | 4 |
| 8 | Thống kê tần suất | ⚡ **BE Done, FE chưa** — cần StatsPage | 1 + 3 |
| 9 | Biểu đồ lô tô | 📋 Chưa bắt đầu | 3 |
| 10 | Xu hướng nóng/lạnh | ⚡ **BE Done, FE chưa** — cần hiển thị trên UI | 1 + 3 |
| 11 | So sánh 2 khoảng thời gian | 📋 Chưa bắt đầu | 3 |
| 12 | Multi-source reconciliation | 📋 Chưa bắt đầu | 5 |
| 13 | Change detection parser | 📋 Chưa bắt đầu | 5 |
| 14 | Idempotency + checksum | 📋 Chưa bắt đầu | 5 |
| 15 | Job monitor | 📋 Chưa bắt đầu | 5 |
| 16 | Deep-link & bookmark | ✅ **Hoàn thành** | 1 |
| 17 | PWA + offline | 📋 Chưa bắt đầu | 5 |
| 18 | Dark mode + accessibility | ⚡ **Theme Done, A11y chưa** | 1 + 3 |
| 19 | Speed optimizations | 📋 Chưa bắt đầu | 3 |
| 20 | Export & chia sẻ | ⚡ **3/4 hoàn thành** — còn PNG export | 1 + 3 |

---

## 🎯 Đề xuất Sprint tiếp theo

**Sprint 3** là sprint có nhiều quick-win nhất:

| Ưu tiên cao nhất | Lý do |
|-------------------|-------|
| PF-24 Frontend StatsPage | BE API đã ready, chỉ cần build FE page |
| PF-25 Biểu đồ lô tô | Giá trị cao cho người dùng xổ số |
| PF-26 Xu hướng nóng/lạnh UI | BE API đã ready |
| PF-31 Export PNG | User feedback phổ biến |
