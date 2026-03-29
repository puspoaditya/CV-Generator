# Issue: High-Fidelity PDF Resume Generation using Playwright/Puppeteer

## Latar Belakang
Saat ini, ekspor PDF mungkin masih menggunakan pendekatan berbasis *client-side* (seperti `html2pdf.js` atau re-render ke `window.print()`), yang seringkali menghasilkan format, margin, resolusi, dan layout yang kurang konsisten. Pengguna menginginkan hasil PDF yang sangat terpoles (*highly polished*), persis seperti desain template visual yang elegan terlampir.

## Tujuan
Memindahkan proses *rendering* PDF ke sisi server (*backend*) menggunakan **Puppeteer** atau **Playwright** untuk merender template HTML/CSS khusus (yang mengesankan gaya *glassmorphism*, tata letak presisi, dan elemen visual yang kaya) menjadi sebuah PDF yang siap diunduh oleh *end-user*.

## Kebutuhan Fitur (Sesuai Referensi Visual)
1. **Header Profil**:
   - Area untuk foto profil (*avatar*) di kiri atas.
   - Nama lengkap dan peran (jabatan) di sebelah kanan foto.
   - Garis pemisah (*divider*) yang elegan.
2. **Summary**:
   - Teks ringkasan profesional.
   - Tag keahlian (*skills tags*) yang menonjol dan berwarna (misal: "SEO" [hijau], "Data Analysis" [biru muda], "Campaign Management" [biru tua/navy]).
3. **Work Experience**:
   - Format *bullet points* dengan indikator titik (dot).
   - Penyorotan tebal (*bold*) pada nama perusahaan, metrik pencapaian (misal: **45%**, **50%**), dan tahun.
4. **Skills**:
   - Daftar keahlian komprehensif di bagian bawah.
5. **Desain Keseluruhan**:
   - Efek kartu (*glassmorphism/clean card*) dengan *soft shadow* dan latar belakang minimalis yang mewah.
   - Tipografi yang sangat rapi dan konsisten (menggunakan font premium yang sudah ada di sistem, seperti Fraunces/Outfit atau sejenisnya).

## Spesifikasi Teknis yang Diusulkan
- **Backend (Elysia / Node Service)**:
  - Membuat *endpoint* POST `/api/generate-pdf`.
  - Menerima payload berupa struktur data resume (JSON) hasil *parsing* AI.
  - Menggunakan `playwright-core` atau `puppeteer-core` dengan *headless browser*.
  - Men-generate HTML dinamis (bisa menggunakan *template engine* ringan atau React *Render-to-String*) lalu diubah menjadi PDF via metode `page.pdf()`.
  - Mengembalikan *buffer* PDF siap *download*.
- **Frontend**:
  - Tombol "PDF PREMIUM" menembak *endpoint* backend dengan data CV yang telah direkayasa.
  - Menampilkan status *loading* / transmisi yang elegan selama proses *render* di server.

## Langkah Implementasi (*To-Do*)
1. Siapkan infrastruktur Chromium (*Puppeteer* / *Playwright*) di *backend* (di dalam *environment* Bun/Elysia).
2. Rancang template HTML statis murni + Tailwind CSS injeksi (tanpa interaktivitas) untuk template rendering PDF.
3. Buat implementasi API PDF generator endpoint.
4. Sambungkan respon payload JSON dari LLM (OpenRouter) langsung dialirkan ke proses rendering HTML-ke-PDF.
5. Integrasikan tombol *download* di halaman `/generate` frontend.

---
*Catatan: Dokumen ini adalah rancangan arsitektur awal (issue/proposal). Harap ditinjau sebelum memulai instalasi package UI dan Playwright.*
