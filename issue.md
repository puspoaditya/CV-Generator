# Phase 5: Interview Preparation & Dashboard History API

## Overview
Setelah berhasil membangun fitur pembuatan CV dan Surat Lamaran secara otomatis via AI, fase kelima ini berfokus untuk menyempurnakan fungsi utama aplikasi. Fitur yang akan dibangun adalah **Interview Preparation** (Simulasi latihan wawancara) dan layanan **Dashboard History** untuk menampilkan riwayat aktivitas _generation_ pengguna.

## Target & Fitur
1. **Interview Preparation (AI)**: Menghasilkan daftar prediksi pertanyaan wawancara (HR & Teknis) lengkap dengan saran atau kerangka jawabannya. *Prompt* akan disesuaikan secara khusus dengan data _Base CV_ dan _Job Requirements_ milik user.
2. **Dashboard History**: Endpoint API terpadu yang menyajikan seluruh riwayat generasi (CV, Cover Letter, Interview Prep) untuk ditampilkan di _dashboard_ *front-end* pengguna.
3. **Statistik Pengguna**: Data ringkas (seperti jumlah CV yang dibuat atau sisa kuota *free tier*).

## High-Level Tasks (Langkah-Langkah)

- [ ] **Fungsi AI Interview Prep (`src/services/ai_service.ts`)**
  - Tambahkan method baru untuk *prompting* AI (misalnya `generateInterviewQuestions`).
  - Rancang _prompt_ agar AI bertindak sebagai _Hiring Manager_ dan merumuskan ~5 pertanyaan spesifik berdasarkan celah/kecocokan antara pengalaman di CV dengan syarat lowongan. Minta AI mereturn respons berupa format terstruktur (JSON array disarankan).

- [ ] **Endpoint Interview Prep (`src/controllers/generation_controller.ts`)**
  - Tambahkan fungsi handler `POST /interview-prep` di _controller_ generasi.
  - Ambil `baseResumeId` dan `jobDescription` dari request, validasi hak milik atas CV.
  - Simpan respons AI ke dalam tabel `generation_history` (dengan `type: 'interview_prep'`).
  - Daftarkan endpoint ini ke `src/routes/generation_routes.ts`.

- [ ] **Pembuatan Dashboard Controller (`src/controllers/dashboard_controller.ts`)**
  - Buat handler (misalnya `getGenerationHistory`) yang melakukan query (Gunakan `drizzle-orm`) ke tabel `generation_history` dan memfilternya spesifik untuk `userId` dari JWT.
  - Tambahkan fitur _sorting_ terbaru ke terlama (`ORDER BY createdAt DESC`) dan opsional limitasi jumlah data/halaman (_pagination_).

- [ ] **Registrasi Dashboard Routes (`src/routes/dashboard_routes.ts`)**
  - Buat file _router_ baru untuk endpoint yang berkaitan dengan data _dashboard_ (contoh: `GET /api/dashboard/history` dan `GET /api/dashboard/stats`).
  - Integrasikan _router_ ini di _entry point_ `src/index.ts` dan pastikan kesemuanya terlindungi oleh proteksi JWT.

**Catatan Tambahan untuk Implementator:**
- Respons AI pada fitur wawancara berpotensi sangat panjang. Pertimbangkan penggunaan format JSON terstruktur (OpenAI JSON Mode) agar data mudah di-_render_ oleh _frontend_.
- Struktur awal tabel `generation_history` sudah men-support kolom `outputData` berformat JSON/Teks panjang. Pastikan penanganan *parsing string* JSON aman (tidak menyebabkan *error 500* jika AI meleset dari format).
