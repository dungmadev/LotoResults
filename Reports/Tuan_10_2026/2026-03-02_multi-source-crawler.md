# 🏗️ Multi-Source Crawler — Race & Fallback Implementation

**Ngày thực hiện:** 2026-03-02  
**Trạng thái:** ✅ Hoàn thành  

---

## 📋 Mô tả

Nâng cấp hệ thống crawl kết quả xổ số từ **1 nguồn (xoso.com.vn)** lên **3 nguồn** với cơ chế **Race & Fallback** sử dụng `Promise.any` + Axios `CancelToken`:

- **Nguồn 1**: xoso.com.vn (nguồn hiện tại, đã có parser)
- **Nguồn 2**: minhngoc.net.vn (parser mới)
- **Nguồn 3**: xskt.com.vn (parser mới)

### Cơ chế hoạt động:
1. Fetch đồng thời từ 3 nguồn cùng lúc
2. Nguồn đầu tiên trả về dữ liệu "đủ" (>= `EXPECTED_PRIZE_COUNT`) → thắng cuộc
3. Hủy ngay các request còn lại qua `CancelToken`
4. Nếu tất cả nguồn fail → `AggregateError` được log chi tiết

### Cải thiện Frontend:
- Progress Bar hiển thị source đang fetch (SSE emit source info)
- Source badge hiển thị nguồn thắng cuộc (🏆)
- Sticky positioning (`sticky top-0`) không overlay nội dung

---

## 📝 Danh sách thay đổi

### Backend

| File | Hành động | Mô tả |
|------|-----------|-------|
| `backend/tsconfig.json` | Sửa | Upgrade `target`/`lib` từ ES2020 → ES2021 (cho `Promise.any` + `AggregateError`) |
| `backend/src/types.ts` | Sửa | Thêm `EXPECTED_PRIZE_COUNT` constant (MB=27, MN=18, MT=18) |
| `backend/src/crawler/crawlerUtils.ts` | **Tạo mới** | Shared utils: `CrawledResult` type, `logCrawl`, `padNumber`, `countPrizeNumbers`, `getRandomUserAgent` |
| `backend/src/crawler/parseMinhNgoc.ts` | **Tạo mới** | Parser cho minhngoc.net.vn (MB: `table.bkqtinhmienbac`, MT/MN: `table.bkqtinh`) |
| `backend/src/crawler/parseXSKT.ts` | **Tạo mới** | Parser cho xskt.com.vn (MB: `table.kqmb`, MT/MN: `section#xsmt/xsmn`) |
| `backend/src/crawler/crawler.ts` | **Viết lại** | Race & Fallback với `Promise.any` + `CancelToken`, giữ nguyên existing parser xoso.com.vn |
| `backend/src/services/crawlQueue.ts` | Sửa | Thêm `sourceInfo` vào `CrawlQueueEvent`, pass `onSourceProgress` callback vào `crawl()` |
| `backend/src/services/sseManager.ts` | Sửa | Forward `progress` + `sourceInfo` trong SSE broadcast |

### Frontend

| File | Hành động | Mô tả |
|------|-----------|-------|
| `frontend/src/hooks/useServerEvents.ts` | Sửa | Thêm `sourceInfo` vào `SSEEvent` type |
| `frontend/src/hooks/QueueProgressContext.ts` | Sửa | Thêm `sourceInfo` vào `QueueProgressState` |
| `frontend/src/hooks/useQueueProgress.ts` | Sửa | Pass `sourceInfo` vào state updates |
| `frontend/src/components/SSEProvider.tsx` | Sửa | Destructure + forward `sourceInfo` |
| `frontend/src/components/ProcessIndicator.tsx` | **Viết lại** | Thêm source badge (`🏆 source_name`) |
| `frontend/src/index.css` | Sửa | `sticky top-0`, thêm `.process-indicator-source` badge style |

---

## ✅ Kết quả kiểm tra

| Check | Kết quả |
|-------|---------|
| `npx tsc --noEmit` (backend) | ✅ Pass |
| `npm run build` (backend) | ✅ Pass |
| `npm test` (backend) | ✅ 13/13 tests pass |
| `npm run lint` (frontend) | ✅ Pass |
| `npm run build` (frontend) | ✅ Pass |

---

## 📌 Ghi chú

1. **`xosothudo.com.vn` bị loại**: TLS error (`tls: unrecognized name`), thay bằng `xskt.com.vn`
2. **Fake Progress Delay**: Thêm 250ms delay giữa các bước để UX mượt hơn
3. **User-Agent Rotation**: 5 UA strings random để tránh bị block
4. **ES2021 Upgrade**: Cần thiết cho `Promise.any` + `AggregateError` — không ảnh hưởng compatibility vì Node.js runtime đã hỗ trợ từ lâu
5. **Parser Robustness**: Mỗi parser có fallback selectors (multiple CSS selectors) + row-index-based detection khi label detection fail
6. **Không dùng Tailwind**: Notes gốc yêu cầu Tailwind nhưng project dùng Vanilla CSS — đã tuân thủ coding standards
