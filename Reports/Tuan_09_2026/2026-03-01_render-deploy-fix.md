# 📋 Báo cáo: Kết nối Frontend–Backend trên Render

**Ngày thực hiện:** 2026-03-01  
**Trạng thái:** ✅ Hoàn thành (cần push code)  
**Người thực hiện:** AI Agent (Antigravity)

---

## 1. Mô tả

Frontend deploy trên Render không kết nối được với Backend vì 2 vấn đề:
- Frontend vẫn gọi `http://localhost:3001/api` (URL dev) thay vì backend Render
- Backend chặn CORS từ domain `lotoresults-frontend.onrender.com`

## 2. Thông tin Deploy

| Service | URL | Platform |
|---------|-----|----------|
| Backend API | https://lotoresults.onrender.com | Render Web Service |
| Frontend | https://lotoresults-frontend.onrender.com | Render Static Site |

## 3. Vấn đề & Cách fix

### Vấn đề 1: Frontend API URL sai

**Nguyên nhân:** Biến `VITE_API_URL` không được set cho production build → fallback về `http://localhost:3001/api`

**Fix:** Tạo file `.env.production` với URL backend Render

```env
# frontend/.env.production
VITE_API_URL=https://lotoresults.onrender.com/api
```

Vite tự động load `.env.production` khi chạy `vite build`.

### Vấn đề 2: Backend chặn CORS

**Nguyên nhân:** CORS `origin` chỉ chứa `localhost` addresses

**Fix:** Thêm URL frontend Render vào danh sách allowed origins + hỗ trợ env variable `CORS_ORIGIN`

```typescript
// backend/src/index.ts
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://lotoresults-frontend.onrender.com',  // ← THÊM
];

// Cho phép mở rộng qua env (comma-separated)
if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(...process.env.CORS_ORIGIN.split(',').map(s => s.trim()));
}
```

## 4. Danh sách thay đổi

| # | File | Thay đổi |
|---|------|----------|
| 1 | `backend/src/index.ts` | **SỬA** — thêm Render frontend URL vào CORS + env variable support |
| 2 | `frontend/.env.production` | **MỚI** — `VITE_API_URL=https://lotoresults.onrender.com/api` |
| 3 | `frontend/.env.development` | **MỚI** — `VITE_API_URL=http://localhost:3001/api` |

## 5. Kết quả

- ✅ Backend health check xác nhận đang chạy: `GET /health → {"status":"ok"}`
- ✅ Build frontend thành công, URL backend được inject vào bundle
- ✅ Verified: `lotoresults.onrender.com` có trong JS bundle sau build
- ⏳ Cần push code lên GitHub để Render tự rebuild

## 6. Hướng dẫn hoàn tất

```bash
git add backend/src/index.ts frontend/.env.production frontend/.env.development
git commit -m "fix: connect frontend to Render backend (CORS + env)"
git push
```

## 7. Ghi chú

- Có thể set `VITE_API_URL` trực tiếp trên Render Dashboard (Environment tab) — sẽ override file `.env.production`
- Biến `CORS_ORIGIN` trên backend cho phép thêm domain mà không cần sửa code
- Render sẽ tự rebuild khi phát hiện push mới trên branch kết nối
