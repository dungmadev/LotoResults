# 📋 Báo cáo: Fix Lint Errors Frontend

**Ngày thực hiện:** 2026-03-01  
**Trạng thái:** ✅ Hoàn thành  
**Người thực hiện:** AI Agent (Antigravity)

---

## 1. Mô tả

Fix toàn bộ 5 lỗi ESLint trong frontend React, bao gồm violations về React Hooks rules, unused variables, unsafe type annotations, và react-refresh compatibility.

## 2. Danh sách lỗi đã fix

| # | File | Rule | Lỗi | Cách fix |
|---|------|------|-----|----------|
| 1 | `hooks/useTheme.tsx` | `react-refresh/only-export-components` | File export cả component lẫn hook | Tách thành 3 file: `ThemeContext.ts`, `useTheme.tsx`, `useThemeContext.ts` |
| 2 | `pages/Dashboard.tsx` | `react-hooks/rules-of-hooks` | `useQuery` gọi bên trong `.map()` callback | Chuyển sang `useQueries()` — API chính thức cho parallel queries |
| 3–4 | `pages/SearchPage.tsx` | `react-hooks/refs` | Đọc/ghi `ref.current` trong render | Chuyển sang `handleRegionChange` event handler trực tiếp |
| 5 | `pages/HistoryPage.tsx` | `@typescript-eslint/no-unused-vars` | `getDateRange()` khai báo nhưng không dùng | Xóa function |
| 5+ | `pages/HistoryPage.tsx` | `@typescript-eslint/no-explicit-any` | `r: any` trong reduce | Thay bằng `r: DrawResult` với typed `reduce<Record<>>` |

## 3. Files đã sửa

| # | File | Thay đổi |
|---|------|----------|
| 1 | `src/hooks/ThemeContext.ts` | **MỚI** — tách context + types ra file riêng |
| 2 | `src/hooks/useTheme.tsx` | **SỬA** — chỉ export ThemeProvider (default export) |
| 3 | `src/hooks/useThemeContext.ts` | **MỚI** — tách hook `useTheme()` ra file riêng |
| 4 | `src/App.tsx` | **SỬA** — cập nhật import ThemeProvider |
| 5 | `src/components/Navbar.tsx` | **SỬA** — cập nhật import useTheme |
| 6 | `src/pages/Dashboard.tsx` | **SỬA** — `useQuery` trong `.map()` → `useQueries()` |
| 7 | `src/pages/SearchPage.tsx` | **SỬA** — ref-based tracking → event handler; fix error cast |
| 8 | `src/pages/HistoryPage.tsx` | **SỬA** — xóa unused function, fix `any` type, fix error cast |

## 4. Kết quả

- ✅ `npm run lint` — 0 errors, 0 warnings
- ✅ `npm run build` — build thành công
- ✅ App hoạt động bình thường sau fix

## 5. Ghi chú

- Lỗi `react-hooks/rules-of-hooks` trong Dashboard là lỗi **nghiêm trọng** — `useQuery` trong `.map()` vi phạm quy tắc hooks và có thể gây bug runtime. Fix bằng `useQueries` là cách đúng theo docs TanStack Query.
- Lỗi `react-refresh/only-export-components` không gây bug nhưng làm Fast Refresh (HMR) không hoạt động tối ưu trong dev.
