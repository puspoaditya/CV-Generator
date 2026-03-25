# Phase 4: AI-Powered CV & Cover Letter Generation API

## Overview
Melanjutkan tahapan manajemen data dasar, fokus utama pada fase keempat ini adalah mengintegrasikan sistem dengan penyedia layanan **Artificial Intelligence / LLM** (seperti OpenAI GPT, Google Gemini, dll). Endpoint ini akan memproses _Base CV_ milik user beserta _Job Requirements_ (deskripsi lowongan kerja) untuk menghasilkan CV baru yang *ATS-optimized* dan Surat Lamaran Kerja secara otomatis.

## Target & Fitur
1. **AI Service Integration**: Menghubungkan Node.js (Bun/Elysia) dengan API layanan LLM.
2. **ATS-Optimized CV Generation**: Menghasilkan (*generate*) CV yang disesuaikan secara khusus untuk menargetkan kata kunci dan syarat pada _Job Requirements_ yang diberikan.
3. **Cover Letter Generation**: Menghasilkan draf Surat Lamaran Pekerjaan secara otomatis berdasarkan kecocokan kualifikasi.
4. **History Logging**: Menyimpan setiap hasil teks yang di-*generate* (atau log aktivitasnya) ke dalam sistem riwayat pengguna.

## High-Level Tasks (Langkah-Langkah)

- [ ] **Setup AI Service Client (`src/services/ai_service.ts`)**
  - Instal SDK AI yang dipilih (mis. `npm install openai` atau library sejenis).
  - Buat fungsi utilitas (helper handler) untuk mengirimkan _prompt_ dan menerima hasil dari model AI (teks/JSON).

- [ ] **Pembuatan Generation Controller (`src/controllers/generation_controller.ts`)**
  - **Endpoint Generate CV**:
    - Terima input berupa `base_cv_id` dan teks `job_description`.
    - Ambil data _Base CV_ dari tabel `resumes` berdasarkan ID pengguna (pastikan validasi kepemilikan data).
    - Susun _Prompt Engineering_: Gabungkan data _Base CV_ dan _Job Description_ ke dalam satu prompt sistem AI yang menginstruksikan LLM merekonstruksi CV agar lebih *ATS-friendly*.
    - Terima _response_, lalu simpan ke tabel `resumes` sebagai versi CV baru (dengan status `isBase: 0`).
    - Catat aktivitas ini di tabel `generation_history` (dengan `type: 'cv'`).
  - **Endpoint Generate Cover Letter**:
    - Logikanya hampir sama, tetapi _prompt_-nya diinstruksikan untuk menyusun draf badan surat lamaran profesional.

- [ ] **Integrasi Route & Auth Middleware (`src/routes/generation_routes.ts`)**
  - Buat *grouping route* (misalnya `/api/generate`) dan sertakan _endpoint_ di atas.
  - Semua rute ini mutlak harus dilindungi oleh Middleware **JWT** (hanya untuk _logged-in users_).

- [ ] **Limitasi AI / Monetisasi (Opsional tapi Penting)**
  - Karena pemanggilan API AI memakan biaya, pastikan melakukan validasi _tier user_: Pengguna _free tier_ dibatasi jumlah batas generasinya per hari/akun, sedangkan fitur tanpa batas ada pada _pro tier_.

**Catatan Tambahan untuk Implementator:**
- Kunci utama fase ini ada pada **Prompt Engineering**. Siapkan kerangka prompt yang dinamis.
- Siapkan konfigurasi `.env` baru untuk API Key (misal: `OPENAI_API_KEY` atau `GEMINI_API_KEY`).
- Pemanggilan API pihak ketiga bersifat *asynchronous* dan mungkin sedikit memakan waktu. Pertimbangkan menangani _fallback/error handling_ (misalnya ketika layanan AI _timeout_).
