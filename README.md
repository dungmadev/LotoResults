# 🎰 XỔ SỐ LIVE — Kết Quả Xổ Số Việt Nam

Ứng dụng web tra cứu kết quả xổ số Việt Nam (XSMB, XSMT, XSMN) với giao diện hiện đại, có lịch sử, tìm kiếm nâng cao, và thống kê tần suất.

## ✨ Tính năng

### Tra cứu & Hiển thị
- 🏠 **Dashboard**: Xem kết quả mới nhất 3 miền (MB/MT/MN) với countdown đến kỳ quay tiếp theo
- 🔍 **Tra cứu nâng cao**: Bộ lọc theo ngày, miền, đài/tỉnh với URL params có thể chia sẻ
- 📅 **Lịch sử**: Xem kết quả 7/30/90 ngày trước với URL state
- ⏰ **Countdown Timer**: Hiển thị 3 kỳ quay sắp tới với đếm ngược thời gian thực

### Tìm kiếm Thông minh
- 🔢 **Tìm số nhanh**: Nhập số → highlight kết quả chứa số đó
- 🎯 **Tìm kiếm nâng cao**:
  - Chọn kiểu tìm: "chứa", "bắt đầu bằng", "kết thúc bằng"
  - Lọc theo giải cụ thể (ĐB, G1-G8)
  - Lọc theo số chẵn/lẻ
  - Giao diện thu gọn/mở rộng

### Thống kê (Backend API)
- 📊 **Thống kê tần suất**: API tính tần suất xuất hiện 2-3 số cuối
- 🔥 **Số nóng/lạnh**: Phân tích số xuất hiện nhiều/ít trong khoảng thời gian
- 📥 **Xuất CSV**: Export dữ liệu thống kê ra file CSV

### Hiệu năng & Bảo mật
- ⚡ **Caching**: TanStack Query (frontend) + LRU cache (backend)
- 🛡️ **Rate limit**: Chống spam API (100 req/phút)
- 🔄 **Retry**: UI tự động retry khi lỗi
- 📱 **Responsive**: Tối ưu cho mobile
- 🔒 **CodeQL Security**: Đã scan, không phát hiện lỗ hổng

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, React Router, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (better-sqlite3) |
| Cache | LRU Cache (in-memory) |
| Crawler | Axios + Cheerio (có failover) |
| Test | Jest + ts-jest |

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

### Chạy Test

```bash
cd backend
npm test
```

## 📁 Cấu trúc dự án

```
LotoResults/
├── frontend/                 # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── ResultTable.tsx
│   │   │   ├── Countdown.tsx            # ⭐ NEW: Live countdown timer
│   │   │   ├── AdvancedSearchOptions.tsx # ⭐ NEW: Advanced search filters
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── pages/            # Pages with routing
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SearchPage.tsx           # Enhanced with URL params
│   │   │   └── HistoryPage.tsx          # Enhanced with URL params
│   │   ├── services/         # API client
│   │   │   └── api.ts                   # ⭐ NEW: Stats API functions
│   │   └── types.ts          # TypeScript types
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routes
│   │   │   └── api.ts                   # ⭐ NEW: Stats endpoints
│   │   ├── services/         # Business logic
│   │   │   ├── results.ts
│   │   │   ├── statistics.ts            # ⭐ NEW: Frequency/Hot-Cold stats
│   │   │   └── cache.ts
│   │   ├── crawler/          # Data collection
│   │   ├── db/               # Database
│   │   │   ├── database.ts              # ⭐ UPDATED: Added draw_time
│   │   │   └── seed.ts                  # ⭐ UPDATED: Draw schedules
│   │   └── middleware/       # Rate limit + validation
│   └── data/                 # SQLite database
└── Notes/
    └── FirstPrompt.md        # Original requirements
```

## 📡 API Endpoints

### Kết quả xổ số
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/results?date=&region=&province=` | Tra cứu kết quả theo bộ lọc |
| GET | `/api/results/latest?region=&province=` | Kết quả mới nhất mỗi đài |
| GET | `/api/provinces?region=` | Danh sách đài/tỉnh (có draw_time) |
| GET | `/api/search?number=&date=&region=` | Tìm kiếm theo số (1-6 chữ số) |

### Thống kê ⭐ NEW
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/stats/frequency?region=&days=` | Tần suất 2-3 số cuối (1-365 ngày) |
| GET | `/api/stats/hot-cold?region=&days=&limit=` | Số nóng/lạnh (top 10 mặc định) |
| GET | `/api/stats/frequency/export?region=&days=` | Xuất CSV thống kê tần suất |

### System
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/health` | Health check |

## ⚠️ Lưu ý

- **Dữ liệu mẫu**: Ứng dụng sử dụng seed data (số ngẫu nhiên) cho demo. Crawler thực cần được cấu hình parser phù hợp với nguồn HTML cụ thể.
- **Nguồn dữ liệu**: Ưu tiên sử dụng nguồn cho phép crawl hoặc API chính thống.
- **Luôn hiển thị**: Nguồn dữ liệu + thời gian cập nhật trên UI.

## 🎯 Phase 1 Upgrade (Hoàn thành)

✅ **Deep-linking**: URL có thể chia sẻ cho SearchPage và HistoryPage  
✅ **Countdown Timer**: Hiển thị kỳ quay sắp tới với đếm ngược  
✅ **Enhanced Search**: Tìm kiếm nâng cao với bộ lọc (chứa/bắt đầu/kết thúc, giải, chẵn/lẻ)  
✅ **Statistics Backend**: API tần suất & số nóng/lạnh + export CSV  
✅ **Code Quality**: Code review passed, CodeQL security scan passed  

### Roadmap tiếp theo
- 📊 Frontend StatsPage để hiển thị thống kê
- 🔄 Comparison view - so sánh nhiều đài
- 🔒 Multi-source verification
- 📱 PWA support & Dark mode
- 🎨 Export/Share features

## 📝 License

MIT
