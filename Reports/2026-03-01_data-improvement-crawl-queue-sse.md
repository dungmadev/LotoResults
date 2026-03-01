# Data Improvement: CrawlQueue + SSE Real-time Notifications

**Ngày:** 2026-03-01  
**Loại:** Tính năng mới  
**Trạng thái:** ✅ Hoàn thành

---

## Tổng quan

Triển khai hệ thống **Crawl Queue**, **Auto-crawl on startup**, và **Server-Sent Events (SSE)** để cải thiện trải nghiệm tải dữ liệu xổ số. Frontend nhận thông báo real-time khi có dữ liệu mới hoặc lỗi.

## Yêu cầu gốc

Từ [Notes/DataImprovement.md](file:///d:/Antigravity/LotoResults/Notes/DataImprovement.md):
1. Backend tự động load data khi khởi động
2. Cải thiện quá trình crawl (retry, error handling)
3. Cơ chế hàng đợi cho crawl requests
4. Non-blocking response khi chưa có data
5. Thông báo cho Frontend khi có dữ liệu mới
6. Thông báo cho Frontend khi có lỗi

## Các file thay đổi

### Backend (Mới)
| File | Mô tả |
|------|-------|
| `backend/src/services/crawlQueue.ts` | CrawlQueue singleton — dedup, retry (exponential backoff), rate limit, EventEmitter |
| `backend/src/services/sseManager.ts` | SSE Manager — broadcast events, heartbeat 30s, auto-cleanup |

### Backend (Cập nhật)
| File | Thay đổi |
|------|----------|
| `backend/src/index.ts` | Auto-crawl today's data (3 miền) on startup |
| `backend/src/routes/api.ts` | Thêm `GET /api/events` (SSE), `GET /api/queue/status`, cập nhật `POST /api/crawl` dùng queue |
| `backend/src/services/results.ts` | `getResults()` trả về `{ results, meta: { status } }`, enqueue crawl thay vì blocking |

### Frontend (Mới)
| File | Mô tả |
|------|-------|
| `frontend/src/hooks/useServerEvents.ts` | SSE hook — auto-reconnect, event dispatch |
| `frontend/src/hooks/useToast.ts` | Toast state management hook |
| `frontend/src/components/Toast.tsx` | Toast notification UI (slide-in/out animation) |
| `frontend/src/components/SSEProvider.tsx` | SSE + Toast integration, auto-invalidate React Query cache |

### Frontend (Cập nhật)
| File | Thay đổi |
|------|----------|
| `frontend/src/App.tsx` | Wrap router trong SSEProvider |
| `frontend/src/services/api.ts` | `fetchResults` trả về `FetchResultsResponse { results, meta }` |
| `frontend/src/pages/SearchPage.tsx` | Crawl status banner, normalize response format |
| `frontend/src/pages/ComparePage.tsx` | Updated `.results` extraction |
| `frontend/src/pages/HistoryPage.tsx` | Updated `.results` extraction |
| `frontend/src/types.ts` | Thêm `status`, `message` vào `ApiResponse.meta` |
| `frontend/src/index.css` | Toast + Crawl banner styles |

## Kiến trúc luồng dữ liệu

```
Server Start → Auto-crawl (mb, mt, mn) → CrawlQueue → Crawler → DB
                                                     ↓
                                              SSE broadcast
                                                     ↓
Frontend (SSEProvider) → Invalidate React Query → UI auto-refresh
                       → Toast notification
```

## API mới

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/events` | GET | SSE stream (real-time events) |
| `/api/queue/status` | GET | Trạng thái hàng đợi crawl |

## Verification

- ✅ Backend `tsc --noEmit` — pass
- ✅ Frontend `npm run lint` — pass (0 errors)
- ✅ Frontend `npm run build` — pass (787ms)
