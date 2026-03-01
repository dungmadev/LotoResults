# Sprint 1 — MVP+ Feature Upgrades

**Ngày thực hiện:** 2026-03-01  
**Trạng thái:** ✅ Hoàn thành  
**Verification:** Lint ✅ | TypeScript ✅ (zero errors)

## Mô tả

Triển khai 6 tính năng MVP+ nâng cấp cho LotoResults dựa trên backlog `Notes/Prompt_2.md`. Bao gồm: deep-link/bookmark, tìm kiếm nâng cao, live update + countdown, so sánh đài, và export/share. Tất cả backend + frontend thay đổi đều pass lint và tsc.

## Danh sách thay đổi

### 1.1 Deep-link & Bookmark (#16)

Trước đây, trang tra cứu chỉ sử dụng query string (`/search?region=mb&date=...`) để quản lý bộ lọc. Điều này khiến URL dài, khó đọc và không thân thiện khi chia sẻ. Thay đổi này bổ sung một route mới dạng path-based (`/results/:region?/:province?/:date?`), cho phép người dùng bookmark hoặc chia sẻ URL dạng `/results/mb/hanoi/2026-03-01`. `SearchPage` được cập nhật để đọc tham số từ cả `useParams()` (deep-link) lẫn `useSearchParams()` (query string cũ), với path params được ưu tiên. Khi người dùng thay đổi bộ lọc, URL tự động cập nhật sang định dạng deep-link qua `useNavigate()`.

| File | Thay đổi |
|------|----------|
| `frontend/src/App.tsx` | Thêm route `/results/:region?/:province?/:date?` |
| `frontend/src/pages/SearchPage.tsx` | Đọc `useParams` + `useSearchParams`, sync URL sang deep-link format |

### 1.2 Tìm kiếm nâng cao (#6)

Chức năng tìm kiếm cũ chỉ hỗ trợ tìm số theo kiểu "chứa chuỗi" (`LIKE '%number%'`), không cho phép lọc theo giải thưởng cụ thể. Nâng cấp này mở rộng hàm `searchByNumber()` ở backend với tham số `mode` (3 chế độ: `contains`, `starts`, `ends`) để thay đổi pattern SQL LIKE tương ứng, cùng tham số `prizeCode` để giới hạn kết quả theo giải cụ thể (ĐB, G1, G2...). API route `/api/search` được bổ sung validation cho các query params mới. Ở frontend, `SearchPage` thêm hai dropdown điều khiển: "Kiểu tìm" và "Lọc giải". Khi có số tìm kiếm, component tự chuyển sang gọi search API thay vì results API thông thường.

| File | Thay đổi |
|------|----------|
| `backend/src/services/results.ts` | `searchByNumber()` hỗ trợ `mode` (contains/starts/ends) + `prizeCode` filter |
| `backend/src/routes/api.ts` | Import `SearchMode`, thêm `mode`/`prize_code` query params + validation |
| `frontend/src/services/api.ts` | Thêm `mode` + `prize_code` params cho `searchByNumber()` |
| `frontend/src/pages/SearchPage.tsx` | Dropdown "Kiểu tìm" + "Lọc giải", conditional search vs results API |

### 1.3 Live Update (#4) + 1.4 Countdown (#3)

Trước đây, Dashboard chỉ tải kết quả một lần khi mở trang. Trong khung giờ quay thưởng, người dùng phải bấm refresh thủ công để xem kết quả mới. Thay đổi này tạo hook `useDrawSchedule` — tính toán real-time giờ quay cho từng miền (MB 18:15, MT 17:15, MN 16:15), phát hiện miền nào đang trong khung giờ quay (30 phút kể từ giờ bắt đầu), và tính countdown đến kỳ quay tiếp theo. Component `ScheduleWidget` hiển thị widget countdown hoặc trạng thái LIVE kèm tên miền đang quay. Dashboard được tích hợp: khi miền nào đang live, React Query tự động polling mỗi 15 giây cho miền đó; đồng thời hiển thị badge LIVE (chấm đỏ nhấp nháy) trên region card tương ứng.

| File | Thay đổi |
|------|----------|
| `frontend/src/hooks/useDrawSchedule.ts` | **[NEW]** Hook: phát hiện giờ quay, countdown, live status |
| `frontend/src/components/ScheduleWidget.tsx` | **[NEW]** Widget countdown/live indicator |
| `frontend/src/pages/Dashboard.tsx` | Tích hợp ScheduleWidget, auto-refetch 15s khi live, LIVE badge trên region card |
| `frontend/src/index.css` | CSS cho schedule-widget, live-indicator, live-dot animation |

### 1.5 So sánh nhiều đài (#5)

Người dùng trước đây chỉ xem được kết quả từng đài riêng lẻ, không có cách nào so sánh nhanh giữa các đài cùng ngày. Trang `ComparePage` mới cho phép chọn ngày, miền, và tối đa 4 đài thông qua giao diện chip multi-select. Kết quả hiển thị dạng grid responsive (2 cột trên desktop, 1 cột trên mobile), mỗi đài là một card chứa bảng kết quả đầy đủ. Chip đã chọn có highlight màu tím, chip bị disable khi đạt giới hạn 4 đài.

| File | Thay đổi |
|------|----------|
| `frontend/src/pages/ComparePage.tsx` | **[NEW]** Page so sánh: chip multi-select max 4 đài, responsive grid |
| `frontend/src/App.tsx` | Thêm route `/compare` |
| `frontend/src/components/Navbar.tsx` | Thêm "⚖️ So sánh" link |
| `frontend/src/index.css` | CSS cho compare-chips, chip, compare-grid |

### 1.6 Export & Chia sẻ (#20)

Trước đây không có cách nào để chia sẻ hoặc lưu kết quả xổ số ngoài việc chụp màn hình. Hook `useExport` cung cấp ba chức năng zero-dependency: `copyResultText` format kết quả thành text có cấu trúc (giải → số) và copy vào clipboard; `shareResult` sử dụng Web Share API trên mobile hoặc fallback sang clipboard trên desktop; `exportCsv` tạo file CSV (UTF-8 BOM) và trigger download. Hai nút "📋 Sao chép" và "📤 Chia sẻ" được thêm vào cuối mỗi bảng `ResultTable`, kèm feedback "✅ Đã sao chép!" hiển thị 2 giây khi copy thành công.

| File | Thay đổi |
|------|----------|
| `frontend/src/hooks/useExport.ts` | **[NEW]** Hook: `copyResultText`, `shareResult` (Web Share API), `exportCsv` |
| `frontend/src/components/ResultTable.tsx` | Thêm nút "📋 Sao chép" + "📤 Chia sẻ" dưới bảng kết quả |
| `frontend/src/index.css` | CSS cho result-actions |

## Kết quả

- **6/6 tính năng** hoàn thành
- **4 files mới** tạo: `useDrawSchedule.ts`, `ScheduleWidget.tsx`, `ComparePage.tsx`, `useExport.ts`
- **9 files sửa**: `App.tsx`, `SearchPage.tsx`, `Dashboard.tsx`, `Navbar.tsx`, `ResultTable.tsx`, `api.ts` (BE+FE), `results.ts`, `api.ts` (routes), `index.css`
- `npm run lint` → ✅ zero errors
- `npx tsc -b --noEmit` → ✅ zero errors

## Ghi chú

- **Export PNG** (html2canvas) chưa triển khai — cần install dependency bổ sung. Thay thế bằng Web Share API + clipboard copy (zero deps).
- **Deep-link placeholder:** khi chọn ngày mà không chọn đài, URL dùng `_` làm placeholder cho province segment.
- **Sprint 2 (Pro)** sẵn sàng triển khai tiếp: thống kê tần suất, biểu đồ lô tô, xu hướng, PWA, accessibility, speed optimization.
