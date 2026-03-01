# 🎰 XỔ SỐ LIVE — Kết Quả Xổ Số Việt Nam

Ứng dụng web tra cứu kết quả xổ số Việt Nam (XSMB, XSMT, XSMN) với giao diện hiện đại, có lịch sử, tìm kiếm nhanh theo số.

## ✨ Tính năng

- 🏠 **Dashboard**: Xem kết quả mới nhất 3 miền (MB/MT/MN)
- 🔍 **Tra cứu**: Bộ lọc theo ngày, miền, đài/tỉnh
- 📅 **Lịch sử**: Xem kết quả 7/30/90 ngày trước
- 🔢 **Tìm số nhanh**: Nhập số → highlight kết quả chứa số đó
- ⚡ **Caching**: TanStack Query (frontend) + LRU cache (backend)
- 🛡️ **Rate limit**: Chống spam API
- 🔄 **Retry**: UI tự động retry khi lỗi
- 📱 **Responsive**: Tối ưu cho mobile

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
SportScores/
├── frontend/                 # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/       # UI components (Navbar, ResultTable, etc.)
│   │   ├── pages/            # Dashboard, SearchPage, HistoryPage
│   │   ├── services/         # API client (axios)
│   │   └── types.ts          # TypeScript types
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── routes/           # Express routes (API endpoints)
│   │   ├── services/         # Business logic + cache
│   │   ├── crawler/          # Crawl + parse + normalize
│   │   ├── db/               # Database init + seed
│   │   ├── middleware/       # Rate limit + validation
│   │   └── index.ts          # Server entry point
│   ├── tests/                # Unit tests
│   └── data/                 # SQLite database (auto-created)
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/results?date=&region=&province=` | Tra cứu kết quả |
| GET | `/api/results/latest?region=&province=` | Kết quả mới nhất |
| GET | `/api/provinces?region=` | Danh sách đài/tỉnh |
| GET | `/api/search?number=&date=&region=` | Tìm kiếm theo số |
| GET | `/health` | Health check |

## ⚠️ Lưu ý

- **Dữ liệu mẫu**: Ứng dụng sử dụng seed data (số ngẫu nhiên) cho demo. Crawler thực cần được cấu hình parser phù hợp với nguồn HTML cụ thể.
- **Nguồn dữ liệu**: Ưu tiên sử dụng nguồn cho phép crawl hoặc API chính thống.
- **Luôn hiển thị**: Nguồn dữ liệu + thời gian cập nhật trên UI.

## 📝 License

MIT
