# Phase 2: User Authentication System API

## Overview
Melanjutkan tahapan inisialisasi awal, fokus pada fase dua ini adalah membangun sistem autentikasi pengguna (Register & Login) untuk backend aplikasi CV & Cover Letter Generator berbasis ElysiaJS.

## Target & Fitur
1. **Registrasi Akun Baru**: Memungkinkan pengguna mendaftar ke sistem dengan aman.
2. **Login & JWT Generation**: Mengautentikasi pengguna menggunakan email dan password, serta mengeluarkan JSON Web Token (JWT) untuk sesi.
3. **Route Protection**: Menyediakan cara/middleware untuk melindungi endpoint-endpoint aplikasi agar hanya bisa diakses oleh *user* yang valid (membawa token).

## High-Level Tasks (Langkah-Langkah)

- [ ] **Setup Keamanan Password**
  - Pastikan password **tidak** disimpan dalam bentuk plain-text.
  - Gunakan pustaka hashing bawaan Bun (`bun:password`) atau pustaka eksternal (seperti `bcryptjs`) sebelum menyimpan data ke database.

- [ ] **Buat Endpoint Registrasi (`POST /api/auth/register`)**
  - Terima input berupa `name`, `email`, dan `password`.
  - Lakukan validasi input (contoh: format email valid, password minimal karakter tertentu).
  - Cek apakah email sudah terdaftar sebelumnya. 
  - Simpan pengguna baru ke database (skema tabel `users` sudah disiapkan di `src/db/schema.ts`).

- [ ] **Buat Endpoint Login (`POST /api/auth/login`)**
  - Terima input `email` dan `password`.
  - Verifikasi kecocokan data dengan yang ada di database.
  - Jika cocok, hasilkan (generate) JWT yang menyimpan informasi dasar user (misalnya `id` pengguna).
  - Kembalikan token ini dalam respons JSON.

- [ ] **Setup Auth Middleware & Testing Route**
  - Konfigurasikan plugin/middleware JWT di ElysiaJS agar endpoint tertentu wajib menyertakan Authorization Bearer token.
  - Buat satu endpoint percobaan yang dilindungi (misal `GET /api/auth/me`) untuk membuktikan bahwa perlindungan rute berjalan dengan baik.

**Catatan untuk Implementator:**
- Database MySQL dan Drizzle ORM sudah terkonfigurasi di `src/db/index.ts`.
- Tabel `users` (id, name, email, password, tier, createdAt) sudah terdefinisi.
- Hasil dari endpoint hanya berupa respons JSON (backend only). Fokus pada kebersihan dan keamanan struktur kode API.
