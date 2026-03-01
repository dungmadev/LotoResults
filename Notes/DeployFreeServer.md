Dưới đây là cách **deploy “server free” + tự có SSL (HTTPS)** từ repo GitHub, theo 2 kịch bản phổ biến:

* **Frontend React (static)** → deploy lên **Cloudflare Pages** hoặc **Vercel** (đều tự có HTTPS, thêm domain là có SSL luôn).
* **Backend/API (nếu app bạn có crawler/API)** → deploy lên **Render** (dễ) hoặc **Fly.io** (kỹ thuật hơn).

> Nếu bạn **không có domain riêng**: các nền tảng này vẫn cấp cho bạn 1 subdomain và **HTTPS hoạt động sẵn**. SSL “đúng nghĩa” cho domain của bạn là khi bạn **gắn custom domain**.

---

## A) Deploy Frontend React lên Cloudflare Pages (free + SSL tự động)

### 1) Tạo project từ GitHub

1. Vào Cloudflare Pages → **Create a project** → chọn **Connect to Git** → chọn repo.
2. Cấu hình build:

   * **Build command**: `npm ci && npm run build`
   * **Build output**:

     * CRA: `build`
     * Vite: `dist`

### 2) Gắn domain + SSL

1. Vào project → **Custom domains** → Add domain.
2. Cloudflare sẽ hướng dẫn bạn thêm DNS record (thường là CNAME hoặc đổi nameserver).
3. Sau khi DNS đúng, Cloudflare Pages sẽ cấp **SSL miễn phí** và phục vụ qua HTTPS. ([pages.cloudflare.com][1])

**Ưu điểm:** free, nhanh, SSL “auto”.

---

## B) Deploy Frontend React lên Vercel (free + SSL tự động)

### 1) Import repo

1. Vào Vercel → **Add New Project** → Import GitHub repo.
2. Vercel tự detect framework (CRA/Vite/Next…). Nếu cần, set:

   * Build command: `npm run build`
   * Output: `build` (CRA) / `dist` (Vite)

### 2) Gắn domain + SSL

1. Project → **Settings → Domains → Add** domain.
2. Làm theo hướng dẫn DNS (A/CNAME tuỳ trường hợp).
3. Vercel phục vụ **HTTPS mặc định**, SSL cấp tự động cho deployments & domain. ([Vercel][2])

---

## C) Nếu app bạn có Backend/API: Deploy lên Render (dễ + SSL tự động)

### 1) Tạo Web Service

1. Render → New → **Web Service** → connect GitHub repo.
2. Cấu hình:

   * Build: `npm ci` (hoặc `npm ci && npm run build` nếu TS)
   * Start: `npm start` / `node server.js` / `npm run start`
3. Thêm Environment Variables (DB_URL, API keys…)

### 2) Gắn domain + SSL

1. Service → **Custom Domains** → Add domain.
2. Trỏ DNS theo hướng dẫn Render.
3. Render sẽ **tự tạo và gia hạn TLS/SSL**, và tự redirect HTTP→HTTPS. ([Render][3])

> Lưu ý: “free tier” của Render có thể thay đổi theo thời gian. Nếu bạn thấy không còn free web service thì dùng Cloudflare Pages/Vercel cho frontend và cân nhắc Fly.io cho backend.

---

## D) Backend/API lên Fly.io (có “free allowance” + SSL Let’s Encrypt; cert đầu miễn phí theo quota)

Fly.io cấp cert qua Let’s Encrypt và có lệnh quản lý cert.

* Tài liệu custom domain & cert: ([Fly][4])
* Pricing cho managed SSL: mỗi org **10 cert hostname đầu free**, sau đó tính phí nhỏ. ([Fly][5])

**Các bước high-level:**

1. Cài `flyctl`, login.
2. `fly launch` trong folder backend.
3. `fly deploy`
4. Add domain theo docs Fly + xác thực DNS → Fly issue cert Let’s Encrypt.

---

## E) Điểm hay bị vướng (để bạn khỏi mất thời gian)

1. **CORS**: Frontend (Pages/Vercel) gọi API (Render/Fly) khác domain ⇒ bật CORS trong backend cho domain frontend.
2. **ENV cho API URL**:

   * Frontend nên đọc `VITE_API_BASE_URL` (Vite) hoặc `REACT_APP_API_BASE_URL` (CRA).
3. **SPA routing 404**:

   * Cloudflare Pages/Vercel thường OK, nhưng nếu bạn dùng Router dạng history, đảm bảo có cấu hình rewrite fallback về `index.html` (Pages có setting cho SPA).

---

## Gợi ý chọn nhanh (ít đau đầu nhất)

* **Chỉ có React frontend**: Cloudflare Pages (free + SSL auto) hoặc Vercel (free + SSL auto).
* **Full-stack (React + API)**:

  * Frontend: Cloudflare Pages / Vercel
  * Backend: Render (dễ) hoặc Fly.io (linh hoạt, kỹ thuật hơn)

Nếu bạn gửi mình **stack của app** (CRA hay Vite? có backend Node không? output folder là `build` hay `dist`?), mình sẽ viết đúng 1 checklist deploy “chuẩn” cho repo của bạn (kèm các lệnh/setting chính xác).

[1]: https://pages.cloudflare.com/?utm_source=chatgpt.com "Cloudflare Pages"
[2]: https://vercel.com/docs/domains/working-with-domains/add-a-domain?utm_source=chatgpt.com "Adding & Configuring a Custom Domain - vercel.com"
[3]: https://render.com/docs/custom-domains?utm_source=chatgpt.com "Custom Domains on Render – Render Docs"
[4]: https://fly.io/docs/networking/custom-domain/?utm_source=chatgpt.com "Custom domains · Fly Docs"
[5]: https://fly.io/docs/about/pricing/?utm_source=chatgpt.com "Fly.io Resource Pricing · Fly Docs"
