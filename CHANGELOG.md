# 📝 Changelog — LotoResults (Xổ Số Live)

Tất cả thay đổi đáng chú ý của dự án sẽ được ghi nhận trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### 🚀 Added — CrawlQueue & SSE Real-time Notifications
> **Branch:** `feat/010326_CrawQueue` → merged `develop` (PR #10)  
> **Báo cáo:** [2026-03-01_data-improvement-crawl-queue-sse.md](Reports/2026-03-01_data-improvement-crawl-queue-sse.md)

**Backend:**
- `CrawlQueue` singleton — hàng đợi crawl với dedup, retry (exponential backoff), rate limit, EventEmitter (`crawlQueue.ts`)
- `SSE Manager` — broadcast real-time events, heartbeat 30s, auto-cleanup (`sseManager.ts`)
- Auto-crawl ngày hôm nay (3 miền MB/MT/MN) khi server khởi động
- API mới: `GET /api/events` (SSE stream), `GET /api/queue/status` (trạng thái hàng đợi)
- `POST /api/crawl` chuyển sang sử dụng queue (non-blocking)
- `getResults()` trả về `{ results, meta: { status } }`, enqueue crawl khi không có data thay vì blocking

**Frontend:**
- `useServerEvents` hook — kết nối SSE endpoint, auto-reconnect, event dispatch
- `useToast` hook + `Toast` component — thông báo real-time (slide-in/out animation, tự ẩn 5s)
- `SSEProvider` component — tích hợp SSE + Toast, auto-invalidate React Query cache khi nhận event
- Crawl status banner trên `SearchPage` khi data đang được crawl
- Cập nhật `ComparePage`, `HistoryPage` để xử lý cấu trúc response mới (`.results` extraction)

---

## [1.0.0] — 2026-03-01

> **Ngày phát hành:** 2026-03-01  
> **Branch:** `main` ← `develop` ← `dev/010326_StartApp`  
> **Commit khởi tạo:** `43abf02`

### 🏗️ Init — Khởi tạo dự án
> **Báo cáo:** [2026-03-01_sprint1-mvp-plus.md](Reports/Tuan_09_2026/2026-03-01_sprint1-mvp-plus.md)

- Khởi tạo monorepo: **Backend** (Node.js + Express + TypeScript) & **Frontend** (React 19 + Vite + TypeScript)
- SQLite database với `better-sqlite3`, seed data cho demo
- Crawler dữ liệu xổ số từ Internet (Axios + Cheerio), hỗ trợ 3 miền MB/MT/MN
- RESTful API: `/api/results`, `/api/results/latest`, `/api/provinces`, `/api/search`
- LRU Cache (in-memory) cho backend, TanStack React Query cho frontend
- Rate limiting (100 req/phút), CORS, centralized error handling
- Responsive UI với Dark theme mặc định, Navbar, ResultTable, LoadingSkeleton, ErrorState
- React Router DOM v7 — routing cho Dashboard, SearchPage, HistoryPage

### ✨ Added — MVP+ Feature Upgrades (Sprint 1)
> **Báo cáo:** [2026-03-01_sprint1-mvp-plus.md](Reports/Tuan_09_2026/2026-03-01_sprint1-mvp-plus.md)

- **Deep-link & Bookmark** — URL dạng `/results/:region/:province/:date` có thể chia sẻ
- **Tìm kiếm nâng cao** — mode: `contains` / `starts` / `ends`, lọc theo `prizeCode` (ĐB, G1-G8), lọc chẵn/lẻ
- **Live Update + Countdown** — `useDrawSchedule` hook phát hiện giờ quay, auto-polling 15s khi LIVE, `ScheduleWidget` hiển thị countdown
- **So sánh nhiều đài** — `ComparePage` chip multi-select tối đa 4 đài, responsive grid
- **Export & Chia sẻ** — `useExport` hook: clipboard copy, Web Share API, export CSV (UTF-8 BOM)
- **Statistics Backend** — API tần suất 2-3 số cuối, số nóng/lạnh, export CSV (`/api/stats/*`)

### 🎨 Added — Theme Sáng/Tối
> **Báo cáo:** [2026-03-01_theme-toggle.md](Reports/Tuan_09_2026/2026-03-01_theme-toggle.md)

- Toggle button 🌙/☀️ trên Navbar với animation xoay mượt
- Lưu preference vào `localStorage` (key `xoso-theme`)
- Tự detect system `prefers-color-scheme`
- ~100 CSS custom properties cho light theme, smooth transition 0.3s
- Kiến trúc 3 file: `ThemeContext.ts` → `useTheme.tsx` → `useThemeContext.ts` (tuân thủ react-refresh)

### 🔧 Added — CI/CD Pipeline
> **Báo cáo:** [2026-03-01_cicd-setup.md](Reports/Tuan_09_2026/2026-03-01_cicd-setup.md)

- **CI** (GitHub Actions `ci.yml`): lint, type-check, test (coverage), build — backend & frontend song song + quality gate
- **CD** (GitHub Actions `cd.yml`): Docker build → push ghcr.io → deploy staging → production + health check
- Multi-stage Dockerfiles: backend (deps → build → production, non-root user, SQLite volume, health check) & frontend (Vite build → Nginx serving)
- `docker-compose.yml` full-stack orchestration
- Nginx config: SPA routing, API reverse proxy `/api/` → backend:3001, gzip, security headers, asset caching

### 🌐 Fixed — Kết nối Frontend–Backend trên Render
> **Báo cáo:** [2026-03-01_render-deploy-fix.md](Reports/Tuan_09_2026/2026-03-01_render-deploy-fix.md)

- Tạo `.env.production` với `VITE_API_URL` trỏ tới backend Render
- Tạo `.env.development` với `VITE_API_URL` trỏ localhost
- Thêm Render frontend URL vào CORS allowed origins
- Hỗ trợ mở rộng CORS qua biến môi trường `CORS_ORIGIN` (comma-separated)

### 🐛 Fixed — Lint Errors Frontend
> **Báo cáo:** [2026-03-01_lint-fixes.md](Reports/Tuan_09_2026/2026-03-01_lint-fixes.md)

- Fix `react-hooks/rules-of-hooks`: `useQuery` trong `.map()` → `useQueries()` (Dashboard)
- Fix `react-refresh/only-export-components`: tách `useTheme.tsx` thành 3 file riêng biệt
- Fix `react-hooks/refs`: ref access trong render → event handler (SearchPage)
- Fix `@typescript-eslint/no-unused-vars` + `no-explicit-any` (HistoryPage)

### 🐛 Fixed — Crawler & Multi-province Data
- Fix crawler chỉ hiện 1 địa phương — cập nhật parser HTML cho multi-province data
- Fix API `/api/backfill` hoạt động đúng cho tất cả regions và dates

---

## Quy ước

- 🚀 **Added** — Tính năng mới
- 🔧 **Changed** — Thay đổi tính năng hiện có
- 🐛 **Fixed** — Sửa lỗi
- 🗑️ **Removed** — Xóa tính năng
- ⚠️ **Deprecated** — Tính năng sắp bị loại bỏ
- 🔒 **Security** — Sửa lỗi bảo mật
