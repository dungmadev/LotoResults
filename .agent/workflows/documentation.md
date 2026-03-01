---
description: Quy trình ghi tài liệu và báo cáo cho mọi nội dung thực hiện trong dự án
---

# 📝 Quy trình ghi tài liệu (Documentation Workflow)

## Quy tắc bắt buộc

Mọi nội dung thực hiện đều **PHẢI** được ghi thành tài liệu báo cáo. Đây là luật áp dụng cho tất cả các tác vụ: phát triển, fix bug, cấu hình, deploy, refactor, v.v.

## Cấu trúc thư mục Reports

```
Reports/
├── <tài liệu quan trọng>.md          ← Tài liệu quan trọng (ở root)
└── Tuan_<WW>_<YYYY>/                 ← Thư mục theo tuần (ISO week)
    └── <tài liệu thường>.md          ← Tài liệu bình thường
```

### Quy tắc phân loại

| Mức độ | Vị trí lưu | Ví dụ |
|--------|-----------|-------|
| **Quan trọng** | `Reports/` (root) | Kiến trúc hệ thống, quyết định công nghệ lớn, sự cố production, thay đổi breaking, migration guide |
| **Bình thường** | `Reports/Tuan_<WW>_<YYYY>/` | Tính năng mới, bug fix, refactor, cấu hình CI/CD, cải thiện UI, deploy thường |

### Quy tắc đặt tên tuần

- Sử dụng format: `Tuan_<WW>_<YYYY>` trong đó `<WW>` là số tuần ISO 2 chữ số, `<YYYY>` là năm
- Ví dụ: `Tuan_09_2026` cho tuần 9 năm 2026
- Nếu chưa có thư mục tuần, tạo mới

### Quy tắc đặt tên file

- Format: `<YYYY-MM-DD>_<mô-tả-ngắn>.md`
- Ví dụ: `2026-03-01_cicd-setup.md`, `2026-03-01_theme-toggle.md`
- Dùng tiếng Việt hoặc tiếng Anh đều được, nhưng nhất quán trong cùng 1 file

## Nội dung tối thiểu của mỗi báo cáo

Mỗi báo cáo phải bao gồm:

1. **Tiêu đề** — mô tả ngắn gọn nội dung đã làm
2. **Ngày thực hiện** — ngày bắt đầu/hoàn thành
3. **Mô tả** — tóm tắt vấn đề/yêu cầu và cách giải quyết
4. **Danh sách thay đổi** — files đã tạo/sửa/xóa, kèm mô tả ngắn
5. **Kết quả** — trạng thái (hoàn thành, đang làm, cần review)
6. **Ghi chú** — lưu ý, hạn chế, hoặc việc cần làm tiếp (nếu có)

## Khi nào ghi báo cáo

// turbo-all
1. **Cuối mỗi phiên làm việc** — tổng hợp tất cả nội dung đã thực hiện
2. **Khi hoàn thành một tính năng/task** — ghi ngay sau khi hoàn tất
3. **Khi được user yêu cầu** — ghi báo cáo theo yêu cầu cụ thể

## Ví dụ thực hiện

```
# Bước 1: Xác định ngày và tuần hiện tại
# Ngày 2026-03-01 → Tuần 09, năm 2026

# Bước 2: Xác định mức độ quan trọng
# Thêm tính năng theme toggle → Bình thường → Tuan_09_2026/

# Bước 3: Tạo file báo cáo
# Reports/Tuan_09_2026/2026-03-01_theme-toggle.md

# Bước 4: Ghi nội dung theo template trên
```
