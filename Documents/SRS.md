# 📋 Software Requirements Specification (SRS)

# LotoResults — Xổ Số Live

> **Phiên bản:** 2.0  
> **Ngày cập nhật:** 2026-03-02  
> **Nguồn yêu cầu:**  
> - [FirstPrompt.md](file:///d:/Antigravity/LotoResults/Notes/FirstPrompt.md) — Yêu cầu gốc  
> - [Prompt_Improvement.md](file:///d:/Antigravity/LotoResults/Notes/Prompt_Improvement.md) — Backlog tính năng nâng cấp  
> - [DataImprovement.md](file:///d:/Antigravity/LotoResults/Notes/DataImprovement.md) — Yêu cầu cải thiện data  

---

## 1. Tổng quan

### 1.1 Mục đích
Ứng dụng web **tra cứu kết quả xổ số Việt Nam** (XSMB, XSMT, XSMN) với giao diện hiện đại, hỗ trợ tìm kiếm nâng cao, thống kê phân tích, thông báo real-time, và nhiều tiện ích cho người chơi xổ số.

### 1.2 Phạm vi
- **3 miền**: XSMB, XSMT, XSMN
- **Đa đài/tỉnh**: Cấu hình linh hoạt danh sách đài theo miền
- **Dữ liệu**: Crawl từ Internet, lưu SQLite, cache in-memory
- **Deploy**: Frontend (Render Static Site) + Backend (Render Web Service)

### 1.3 Đối tượng sử dụng
- Người chơi xổ số muốn tra cứu kết quả nhanh
- Người dùng muốn thống kê, phân tích tần suất số
- Người dùng mobile muốn trải nghiệm mượt mà

---

## 2. Yêu cầu chức năng (Functional Requirements)

### FR-01: Hiển thị kết quả xổ số
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-01.1 | Dashboard hiển thị kết quả mới nhất 3 miền (MB/MT/MN) | **Bắt buộc** |
| FR-01.2 | Bộ lọc: DatePicker + Region + Province | **Bắt buộc** |
| FR-01.3 | Bảng kết quả theo giải (ĐB, G1-G8), responsive mobile | **Bắt buộc** |
| FR-01.4 | Trang "Latest" cho từng miền/đài | **Bắt buộc** |
| FR-01.5 | Trang chi tiết 1 kỳ quay | Tùy chọn |

### FR-02: Tra cứu & Tìm kiếm
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-02.1 | Tìm số nhanh — nhập số → highlight kết quả chứa số đó | **Bắt buộc** |
| FR-02.2 | Tìm kiếm nâng cao: mode `contains` / `starts` / `ends` | **Bắt buộc** |
| FR-02.3 | Lọc theo giải cụ thể (ĐB, G1-G8) | **Bắt buộc** |
| FR-02.4 | Lọc theo chẵn/lẻ | **Bắt buộc** |
| FR-02.5 | Tìm theo "tổng chữ số", "đầu/đuôi" | Nên có |

### FR-03: Lịch sử kết quả
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-03.1 | Xem kết quả 7/30/90 ngày trước | **Bắt buộc** |
| FR-03.2 | URL state — chia sẻ link giữ đúng bộ lọc | **Bắt buộc** |

### FR-04: Deep-link & Bookmark
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-04.1 | URL path-based: `/results/:region/:province/:date` | **Bắt buộc** |
| FR-04.2 | Share link mở đúng màn hình với filter tương ứng | **Bắt buộc** |

### FR-05: Live Update & Countdown
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-05.1 | Lịch quay theo miền/đài + countdown đến kỳ tiếp theo | **Bắt buộc** |
| FR-05.2 | Bật "live mode" khi gần giờ quay (auto-refresh 15-30s) | **Bắt buộc** |
| FR-05.3 | Hiển thị trạng thái: "Đang cập nhật", "Đã chốt kết quả" | **Bắt buộc** |
| FR-05.4 | Badge LIVE (chấm đỏ nhấp nháy) trên region card | **Bắt buộc** |

### FR-06: So sánh nhiều đài
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-06.1 | Chọn 2-4 đài cùng ngày qua giao diện chip multi-select | **Bắt buộc** |
| FR-06.2 | Grid responsive (2 cột desktop, 1 cột mobile) | **Bắt buộc** |

### FR-07: Thống kê & Phân tích
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-07.1 | Tần suất xuất hiện 2-3 số cuối (1-365 ngày) — Backend API | **Bắt buộc** |
| FR-07.2 | Số nóng/lạnh — top N (Backend API) | **Bắt buộc** |
| FR-07.3 | Export CSV thống kê tần suất | **Bắt buộc** |
| FR-07.4 | **Frontend StatsPage** — hiển thị thống kê trên UI | **Nên có** |
| FR-07.5 | Biểu đồ "lô tô" (MB) / đầu-đuôi — bảng 0-9 × 0-9 | Nên có |
| FR-07.6 | Theo dõi xu hướng — "số nóng 7/30 ngày", "số lạnh lâu chưa xuất hiện" | Nên có |
| FR-07.7 | So sánh 2 khoảng thời gian (7 ngày gần nhất vs 30 ngày trước) | Nên có |

### FR-08: Export & Chia sẻ
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-08.1 | Copy kết quả dạng text có cấu trúc vào clipboard | **Bắt buộc** |
| FR-08.2 | Web Share API (mobile) / clipboard fallback (desktop) | **Bắt buộc** |
| FR-08.3 | Export CSV (UTF-8 BOM) | **Bắt buộc** |
| FR-08.4 | Export ảnh PNG của bảng kết quả (html2canvas) | Nên có |

### FR-09: Real-time Notifications (SSE)
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-09.1 | SSE endpoint — push event khi có dữ liệu mới | **Bắt buộc** |
| FR-09.2 | Toast notification — slide-in/out, tự ẩn 5s | **Bắt buộc** |
| FR-09.3 | Auto-invalidate React Query cache khi nhận event | **Bắt buộc** |
| FR-09.4 | Crawl status banner trên SearchPage | **Bắt buộc** |

### FR-10: CrawlQueue & Auto-crawl
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-10.1 | Hàng đợi crawl: dedup, retry (exponential backoff), rate limit | **Bắt buộc** |
| FR-10.2 | Auto-crawl ngày hôm nay khi server khởi động | **Bắt buộc** |
| FR-10.3 | Non-blocking response khi chưa có data → enqueue crawl | **Bắt buộc** |
| FR-10.4 | Backfill dữ liệu lịch sử (tối đa 90 ngày) | **Bắt buộc** |

### FR-11: Thông báo trúng thưởng (Alert) ⭐ CHƯA TRIỂN KHAI
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-11.1 | Lưu "vé/số" (2-6 chữ số) + chọn miền/đài + ngày | **Nên có** |
| FR-11.2 | Đối chiếu tự động khi có kết quả | **Nên có** |
| FR-11.3 | Thông báo: Web Push / Email / Zalo OA | Tùy chọn |
| FR-11.4 | Rule "gần trúng" (trùng 2/3 số cuối) | Tùy chọn |

### FR-12: Quét vé bằng camera (OCR) ⭐ CHƯA TRIỂN KHAI
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-12.1 | Mobile-first: chụp ảnh vé → nhận dạng dãy số | Tùy chọn |
| FR-12.2 | Auto tạo "vé đã lưu" từ kết quả OCR | Tùy chọn |
| FR-12.3 | Chỉnh tay nếu OCR sai | Tùy chọn |

### FR-13: Thống kê cá nhân (My Stats) ⭐ CHƯA TRIỂN KHAI
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-13.1 | Dashboard cá nhân: tỷ lệ trúng, tổng số lần trúng | Nên có |
| FR-13.2 | Heatmap trúng theo thời gian | Tùy chọn |
| FR-13.3 | Lưu lịch sử vé | Nên có |

### FR-14: Theme & Giao diện
| ID | Mô tả | Mức độ |
|----|--------|--------|
| FR-14.1 | Dark/Light theme toggle (🌙/☀️) | **Bắt buộc** |
| FR-14.2 | Lưu preference vào localStorage | **Bắt buộc** |
| FR-14.3 | Detect system `prefers-color-scheme` | **Bắt buộc** |
| FR-14.4 | Keyboard navigation cho bảng kết quả | Nên có |
| FR-14.5 | Font lớn, tương phản cao (accessibility) | Nên có |

---

## 3. Yêu cầu phi chức năng (Non-Functional Requirements)

### NFR-01: Hiệu năng
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-01.1 | Query ngày gần nhất trả về < 500ms (local/dev) | **Bắt buộc** |
| NFR-01.2 | Frontend caching (TanStack Query) — reload không spam requests | **Bắt buộc** |
| NFR-01.3 | Backend LRU cache — TTL theo ngày (kết quả cũ ít thay đổi) | **Bắt buộc** |
| NFR-01.4 | Virtualized list cho lịch sử dài | Nên có |
| NFR-01.5 | Prefetch ngày gần nhất khi hover/chạm | Nên có |

### NFR-02: Bảo mật
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-02.1 | Rate limit API (100 req/phút) | **Bắt buộc** |
| NFR-02.2 | Sanitize input query | **Bắt buộc** |
| NFR-02.3 | CORS dynamic config qua env `CORS_ORIGIN` | **Bắt buộc** |
| NFR-02.4 | Security headers (Nginx) | **Bắt buộc** |

### NFR-03: Độ tin cậy (Reliability)
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-03.1 | Crawler failover — chuyển nguồn khi lỗi | **Bắt buộc** |
| NFR-03.2 | Auto-retry với exponential backoff | **Bắt buộc** |
| NFR-03.3 | UI hiển thị lỗi thân thiện + nút retry | **Bắt buộc** |
| NFR-03.4 | Multi-source reconciliation — crawl 2-3 nguồn, detect conflict | Nên có |
| NFR-03.5 | Change detection cho parser — cảnh báo CI/CD khi DOM thay đổi | Nên có |
| NFR-03.6 | Idempotency + checksum — hash mỗi kỳ quay, log "data corrected" | Nên có |

### NFR-04: DevOps & CI/CD
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-04.1 | CI: lint, type-check, test, build (GitHub Actions) | **Bắt buộc** |
| NFR-04.2 | CD: Docker build → deploy staging → production | **Bắt buộc** |
| NFR-04.3 | Multi-stage Dockerfiles (backend + frontend) | **Bắt buộc** |
| NFR-04.4 | Docker Compose full-stack | **Bắt buộc** |

### NFR-05: Monitoring & Admin ⭐ CHƯA TRIỂN KHAI
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-05.1 | Job monitor admin page — last-run, thành công/thất bại, latency | Nên có |
| NFR-05.2 | Alert Slack/Telegram khi crawl fail liên tục | Tùy chọn |

### NFR-06: PWA & Offline ⭐ CHƯA TRIỂN KHAI
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-06.1 | Add to Home Screen (manifest.json) | Nên có |
| NFR-06.2 | Service Worker — cache kết quả đã xem | Nên có |
| NFR-06.3 | Offline-first — mở lại khi mất mạng | Nên có |

### NFR-07: Kiểm thử
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-07.1 | Unit test cho parser/normalizer | **Bắt buộc** |
| NFR-07.2 | Integration test cho endpoint chính | **Bắt buộc** |
| NFR-07.3 | Frontend E2E test | Tùy chọn |

### NFR-08: Pháp lý & Đạo đức
| ID | Mô tả | Mức độ |
|----|--------|--------|
| NFR-08.1 | Không scrape nguồn cấm; ưu tiên API chính thống | **Bắt buộc** |
| NFR-08.2 | Hiển thị "Nguồn dữ liệu" + thời điểm cập nhật trên UI | **Bắt buộc** |
| NFR-08.3 | Ghi rõ "chỉ là thống kê, không dự đoán" | **Bắt buộc** |

---

## 4. Data Model

### 4.1 Schema chính

```
draws
├── id (PK)
├── draw_date (DATE)
├── region (mb | mt | mn)
├── province_id (FK → provinces.id)
├── source (TEXT)
├── fetched_at (DATETIME)
└── checksum (TEXT)

prizes
├── id (PK)
├── draw_id (FK → draws.id)
├── prize_code (db | g1 | g2 | ... | g8)
└── numbers (JSON TEXT — ["12345", "67890"])

provinces
├── id (PK)
├── name (TEXT)
├── region (mb | mt | mn)
├── draw_days (JSON TEXT — [1,3,5])
├── draw_time (TEXT — "18:15")
└── active (BOOLEAN)
```

### 4.2 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/results?date=&region=&province=` | Tra cứu kết quả |
| GET | `/api/results/latest?region=&province=` | Kết quả mới nhất |
| GET | `/api/provinces?region=` | Danh sách đài/tỉnh |
| GET | `/api/search?number=&date=&region=&mode=&prize_code=` | Tìm kiếm |
| GET | `/api/stats/frequency?region=&days=` | Thống kê tần suất |
| GET | `/api/stats/hot-cold?region=&days=&limit=` | Số nóng/lạnh |
| GET | `/api/stats/frequency/export?region=&days=` | Xuất CSV |
| GET | `/api/events` | SSE stream |
| GET | `/api/queue/status` | Trạng thái crawl queue |
| POST | `/api/crawl` | Trigger crawl (non-blocking) |
| POST | `/api/backfill` | Backfill lịch sử |
| GET | `/health` | Health check |

---

## 5. Kiến trúc hệ thống

### 5.1 Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, React Router DOM v7, TanStack Query v5 |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (`better-sqlite3`) |
| Cache | LRU Cache (in-memory) |
| Crawler | Axios + Cheerio (CrawlQueue + retry + failover) |
| Real-time | Server-Sent Events (SSE) |
| Testing | Jest + ts-jest + Supertest |
| CI/CD | GitHub Actions, Docker, Nginx |
| Linting | ESLint 9 + react-hooks v7 + react-refresh + typescript-eslint |

### 5.2 Luồng dữ liệu

```
Server Start → Auto-crawl (mb, mt, mn) → CrawlQueue → Crawler → DB
                                                      ↓
                                               SSE broadcast
                                                      ↓
Frontend (SSEProvider) → Invalidate React Query → UI auto-refresh
                       → Toast notification
```

### 5.3 Deployment

| Service | URL | Platform |
|---------|-----|----------|
| Backend API | https://lotoresults.onrender.com | Render Web Service |
| Frontend | https://lotoresults-frontend.onrender.com | Render Static Site |
