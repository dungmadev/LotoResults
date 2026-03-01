# Refactor Progress Bar: Đổi từ Source-based sang Province-based

**Ngày thực hiện:** 2026-03-02

## Mô tả

Người dùng phản ánh rằng khi fetch dữ liệu xổ số, có **quá nhiều thông báo hiện lên** trên giao diện (toast notifications + progress bar liên tục cập nhật message). Nguyên nhân là backend emit nhiều SSE event trung gian cho từng **source** (fetching/parsing/done/failed) cho mỗi job.

### Giải pháp

1. **Backend:** Refactor `crawlQueue` để tracking progress theo **số tỉnh (province)** thay vì số region
   - Sử dụng `getProvincesForDate()` để tính tổng số tỉnh xổ trong ngày trước khi bắt đầu
   - Mỗi job hoàn thành, increment `batchCompleted` theo `provinceCount` thực tế
   - Bỏ source progress callback → giảm từ 15-24 events xuống còn ~6-9 events cho 3 regions

2. **Backend:** Thay đổi `crawl()` return type từ `number` sang `CrawlResult`
   - Trả về `{ savedCount, provinceCount, provinceNames, sourceName }`
   - Bỏ `onSourceProgress` callback parameter
   - Bỏ fake progress delays

3. **Frontend:** Bỏ `sourceInfo` khỏi toàn bộ chain
   - `SSEEvent`, `QueueProgressState`, `useQueueProgress`, `SSEProvider`, `ProcessIndicator`
   - Progress bar giờ chỉ hiện message + percentage, không hiện source info

## Danh sách thay đổi

### Backend
| File | Thay đổi |
|------|---------|
| `backend/src/utils/provinces.ts` | Thêm `getProvincesForDate()`, `countProvincesForDate()` — tính tỉnh xổ theo ngày |
| `backend/src/services/crawlQueue.ts` | Refactor batch tracking: đếm province thay vì region, bỏ source progress events |
| `backend/src/crawler/crawler.ts` | Đổi `crawl()` trả về `CrawlResult`, bỏ `onSourceProgress`, bỏ fake delays |
| `backend/src/services/sseManager.ts` | Bỏ `sourceInfo` khỏi SSE broadcast payload |

### Frontend
| File | Thay đổi |
|------|---------|
| `frontend/src/hooks/useServerEvents.ts` | Bỏ `sourceInfo` khỏi `SSEEvent` interface |
| `frontend/src/hooks/QueueProgressContext.ts` | Bỏ `sourceInfo` khỏi `QueueProgressState` |
| `frontend/src/hooks/useQueueProgress.ts` | Bỏ `sourceInfo` references trong state updates |
| `frontend/src/components/SSEProvider.tsx` | Bỏ `sourceInfo` khỏi context value |
| `frontend/src/components/ProcessIndicator.tsx` | Bỏ winner source badge, chỉ hiện message + % |

## Kết quả

- ✅ Backend: `tsc --noEmit` pass
- ✅ Frontend: `npm run lint` pass
- ✅ Frontend: `npm run build` pass

## Ghi chú

- Progress bar giờ chính xác hơn: ví dụ crawl ngày Thứ Hai sẽ hiện total = tổng tỉnh MB + MT + MN xổ vào Thứ Hai (≈6-8 tỉnh), thay vì luôn là 3 (3 regions)
- SSE events giảm đáng kể → UX mượt hơn, progress bar cập nhật ít lần nhưng có ý nghĩa hơn
- `sourceInfo` đã bị remove hoàn toàn — nếu cần thêm lại sau, sẽ cần update lại cả chain
