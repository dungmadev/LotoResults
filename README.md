# 🎰 XỔ SỐ LIVE — Kết Quả Xổ Số Việt Nam

[![CI](https://github.com/dungmadev/LotoResults/actions/workflows/ci.yml/badge.svg)](https://github.com/dungmadev/LotoResults/actions/workflows/ci.yml)

Ứng dụng web tra cứu kết quả xổ số Việt Nam (XSMB, XSMT, XSMN) với giao diện hiện đại, hỗ trợ tìm kiếm nâng cao, so sánh đài, thống kê tần suất, live update, và thông báo real-time.

🔗 **Live Demo:**
- **Frontend:** https://lotoresults-frontend.onrender.com
- **Backend API:** https://lotoresults.onrender.com

## ✨ Tính năng

### 🏠 Dashboard
- Xem kết quả mới nhất 3 miền (MB/MT/MN)
- **Live Update** — auto-polling mỗi 15s trong khung giờ quay thưởng
- **Countdown Timer** — đếm ngược đến 3 kỳ quay sắp tới
- Badge **🔴 LIVE** nhấp nháy trên region card khi đang quay

### 🔍 Tra cứu & Tìm kiếm
- Bộ lọc theo **ngày**, **miền**, **đài/tỉnh** với URL params có thể chia sẻ
- **Deep-link** — URL dạng `/results/mb/hanoi/2026-03-01` bookmark được
- **Tìm kiếm nâng cao**:
  - Kiểu tìm: "chứa", "bắt đầu bằng", "kết thúc bằng"
  - Lọc theo giải cụ thể (ĐB, G1–G8)
  - Lọc theo số chẵn/lẻ
  - Highlight kết quả chứa số tìm kiếm

### ⚖️ So sánh đài
- Chọn tối đa 4 đài cùng ngày qua giao diện chip multi-select
- Hiển thị dạng grid responsive (2 cột desktop, 1 cột mobile)

### 📅 Lịch sử
- Xem kết quả 7/30/90 ngày trước với URL state

### 📊 Thống kê (Backend API)
- Tần suất xuất hiện 2–3 số cuối (1–365 ngày)
- Phân tích số nóng/lạnh (top N)
- Xuất CSV thống kê

### 📤 Export & Chia sẻ
- **📋 Sao chép** — copy kết quả dạng text có cấu trúc vào clipboard
- **📤 Chia sẻ** — Web Share API (mobile) / clipboard fallback (desktop)
- **📥 Export CSV** — tải file CSV (UTF-8 BOM)

### 🔔 Real-time Notifications (SSE)
- **Server-Sent Events** — nhận thông báo khi có dữ liệu mới hoặc lỗi crawl
- **Toast notifications** — slide-in/out animation, tự ẩn sau 5s
- **Auto-refresh** — invalidate React Query cache khi nhận event `data-ready`
- **CrawlQueue** — hàng đợi crawl với dedup, retry exponential backoff, rate limit

### 🎨 Giao diện
- **Dark/Light Theme** — toggle 🌙/☀️, lưu localStorage, detect system preference
- **Responsive** — tối ưu cho mobile
- **Smooth transitions** — animation mượt mà khi chuyển theme

### ⚡ Hiệu năng & Bảo mật
- **Caching** — TanStack Query (frontend) + LRU cache (backend)
- **Rate limit** — 100 req/phút chống spam API
- **Retry** — auto-retry khi lỗi (frontend + crawl queue)
- **CORS** — dynamic config qua biến môi trường `CORS_ORIGIN`
- **CodeQL Security** — đã scan, không phát hiện lỗ hổng

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, React Router DOM v7, TanStack Query v5 |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (`better-sqlite3`) |
| Cache | LRU Cache (in-memory) |
| Crawler | Axios + Cheerio (CrawlQueue + retry) |
| Real-time | Server-Sent Events (SSE) |
| Testing | Jest + ts-jest + Supertest |
| CI/CD | GitHub Actions, Docker, Nginx |
| Linting | ESLint 9 + react-hooks v7 + react-refresh + typescript-eslint |

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js >= 18
- npm >= 9

### Backend

```bash
cd backend
npm install
npm run seed    # Tạo dữ liệu mẫu
npm run dev     # Chạy server dev (http://localhost:3001)
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # Chạy Vite dev (http://localhost:5173)
```

### Docker (Full-stack)

```bash
docker-compose up --build
# Frontend: http://localhost:80
# Backend:  http://localhost:3001
```

### Chạy Test

```bash
cd backend
npm test
```

### Lint

```bash
cd frontend
npm run lint
```

## 📁 Cấu trúc dự án

```
LotoResults/
├── .agent/workflows/              # AI agent workflows
│   └── documentation.md           # Quy trình ghi tài liệu
├── .github/workflows/             # GitHub Actions
│   ├── ci.yml                     # CI: lint, type-check, test, build
│   └── cd.yml                     # CD: Docker → ghcr.io → deploy
├── backend/
│   ├── src/
│   │   ├── index.ts               # Express entry + auto-crawl on startup
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── crawler/
│   │   │   └── crawler.ts         # Web scraper (Cheerio parser)
│   │   ├── db/
│   │   │   ├── database.ts        # SQLite schema + connection
│   │   │   └── seed.ts            # Demo data seeder
│   │   ├── middleware/
│   │   │   └── index.ts           # Rate limit, sanitize, error handler
│   │   ├── routes/
│   │   │   └── api.ts             # RESTful API + SSE + stats endpoints
│   │   ├── services/
│   │   │   ├── results.ts         # Business logic (results + search)
│   │   │   ├── statistics.ts      # Frequency & hot-cold stats
│   │   │   ├── cache.ts           # LRU cache wrapper
│   │   │   ├── crawlQueue.ts      # CrawlQueue singleton (dedup, retry)
│   │   │   └── sseManager.ts      # SSE broadcast + heartbeat
│   │   └── utils/
│   │       └── provinces.ts       # Province data & draw schedules
│   ├── tests/                     # Jest test files
│   ├── Dockerfile                 # Multi-stage Docker build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx                # Root component + routing
│   │   ├── main.tsx               # Entry point
│   │   ├── index.css              # Global styles (dark/light theme, 100+ CSS vars)
│   │   ├── types.ts               # TypeScript interfaces
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Navigation + theme toggle
│   │   │   ├── ResultTable.tsx    # Result table + export/share buttons
│   │   │   ├── AdvancedSearchOptions.tsx  # Search filters UI
│   │   │   ├── ScheduleWidget.tsx # Countdown / LIVE indicator
│   │   │   ├── Countdown.tsx      # Countdown timer
│   │   │   ├── SSEProvider.tsx    # SSE + Toast integration
│   │   │   ├── Toast.tsx          # Toast notification UI
│   │   │   ├── LoadingSkeleton.tsx # Loading placeholder
│   │   │   └── ErrorState.tsx     # Error display
│   │   ├── hooks/
│   │   │   ├── ThemeContext.ts    # Theme context + types
│   │   │   ├── useTheme.tsx       # ThemeProvider component
│   │   │   ├── useThemeContext.ts # useTheme() hook
│   │   │   ├── useDrawSchedule.ts # Draw schedule + live detection
│   │   │   ├── useExport.ts      # Copy / share / export CSV
│   │   │   ├── useServerEvents.ts # SSE connection hook
│   │   │   └── useToast.ts       # Toast state management
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Trang chủ + live update
│   │   │   ├── SearchPage.tsx     # Tra cứu + tìm kiếm nâng cao
│   │   │   ├── HistoryPage.tsx    # Lịch sử kết quả
│   │   │   └── ComparePage.tsx    # So sánh nhiều đài
│   │   └── services/
│   │       └── api.ts             # Axios API client
│   ├── .env.production            # VITE_API_URL (Render backend)
│   ├── .env.development           # VITE_API_URL (localhost)
│   ├── Dockerfile                 # Multi-stage (Vite → Nginx)
│   ├── nginx.conf                 # SPA routing + API proxy
│   └── package.json
├── Documents/                     # Tài liệu thiết kế & kế hoạch
├── Reports/                       # Báo cáo công việc
├── Notes/                         # Ghi chú & planning
├── docker-compose.yml             # Full-stack orchestration
├── CHANGELOG.md                   # Lịch sử thay đổi
└── .gitignore
```

## 📡 API Endpoints

### Kết quả xổ số
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/results?date=&region=&province=` | Tra cứu kết quả theo bộ lọc |
| GET | `/api/results/latest?region=&province=` | Kết quả mới nhất mỗi đài |
| GET | `/api/provinces?region=` | Danh sách đài/tỉnh (có draw_time) |
| GET | `/api/search?number=&date=&region=&mode=&prize_code=` | Tìm kiếm theo số (mode: contains/starts/ends) |

### Thống kê
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/stats/frequency?region=&days=` | Tần suất 2-3 số cuối (1-365 ngày) |
| GET | `/api/stats/hot-cold?region=&days=&limit=` | Số nóng/lạnh (top 10 mặc định) |
| GET | `/api/stats/frequency/export?region=&days=` | Xuất CSV thống kê tần suất |

### Real-time & System
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/events` | SSE stream (real-time notifications) |
| GET | `/api/queue/status` | Trạng thái hàng đợi crawl |
| POST | `/api/crawl` | Trigger crawl (non-blocking, qua queue) |
| POST | `/api/backfill` | Backfill dữ liệu lịch sử |
| GET | `/health` | Health check |

## 🐳 Deployment

### Render (Production)
| Service | URL | Type |
|---------|-----|------|
| Backend | https://lotoresults.onrender.com | Web Service |
| Frontend | https://lotoresults-frontend.onrender.com | Static Site |

### Docker
- **Backend:** Multi-stage build, non-root user, SQLite volume, health check
- **Frontend:** Vite build → Nginx serving, SPA routing, API reverse proxy
- **Compose:** `docker-compose up --build`

### CI/CD (GitHub Actions)
- **CI** (`ci.yml`): Lint → Type-check → Test (coverage) → Build (backend & frontend song song)
- **CD** (`cd.yml`): Docker build → push `ghcr.io` → deploy staging → production + health check

## ⚠️ Lưu ý

- **Auto-crawl:** Backend tự động crawl dữ liệu ngày hôm nay cho cả 3 miền khi khởi động
- **Dữ liệu mẫu:** `npm run seed` tạo seed data (số ngẫu nhiên) cho demo
- **Nguồn dữ liệu:** Crawler được thiết kế cho các trang kết quả xổ số Việt Nam. Cần cấu hình parser phù hợp với nguồn cụ thể
- **CORS:** Có thể mở rộng domain được phép qua biến môi trường `CORS_ORIGIN` (comma-separated)

## 📝 Changelog

Xem [CHANGELOG.md](CHANGELOG.md) để biết chi tiết các phiên bản.

## 📄 License

MIT
