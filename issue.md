# Phase 3: Base CV & Job Requirements Management API

## Overview
Melanjutkan tahapan autentikasi, fokus pada fase ketiga ini adalah membangun fitur pengelolaan data utama, yaitu: **Base CV** (Resume asli/dasar dari pengguna) dan input **Job Requirements** (Syarat/deskripsi lowongan kerja). Data-data ini akan menjadi _context_ penting bagi AI di fase selanjutnya (Fase 4).

## Target & Fitur
1. **Upload / Manual Input Base CV**: Menyediakan endpoint bagi user untuk mengirimkan (dalam bentuk teks/JSON terstruktur) _Base CV_ mereka ke dalam sistem.
2. **Retrieve Base CV**: User dapat melihat/mengakses kembali _Base CV_ yang telah mereka simpan.
3. **Job Requirements Submission**: Mempersiapkan endpoint untuk menerima input deskripsi pekerjaan (Job Description) yang akan menjadi target lamaran.
4. **Implementasi Limitasi Tier (Monetisasi Dasar)**: User dengan tier `free` memiliki batasan jumlah _Base CV_ yang bisa disimpan, sementara tier `pro` memiliki akses unlimited.

## High-Level Tasks (Langkah-Langkah)

- [ ] **Pembuatan Resume/CV Controller (`src/controllers/resume_controller.ts`)**
  - Buat endpoint untuk **Create/Update**: Menerima input data CV dari user dan menyimpannya ke tabel `resumes` (skema sudah ada; set `isBase: 1` untuk base CV).
  - Buat endpoint untuk **Get/List**: Menampilkan detail _Base CV_ milik user yang merequest.
  
- [ ] **Persiapan Data Job Requirements**
  - Buat endpoint atau alur untuk menyimpan _temporary_ atau logging input **Job Requirements**. (Data ini nantinya digabung bersama _Base CV_ untuk dikirim ke promt AI).

- [ ] **Integrasi Route & Auth Middleware (`src/routes/resume_routes.ts`)**
  - Lindungi rute endpoint CV menggunakan JWT authentication (seperti yang dibuat di Phase 2).
  - Ekstrak nilai `user_id` dari JWT token payload untuk memastikan user hanya bisa memodifikasi CV milik mereka sendiri.

- [ ] **Logika Monetisasi Dasar (Free Tier Restriction)**
  - Pada saat user (tier `free`) mencoba menambahkan _Base CV_, cek di database apakah user tersebut sudah mencapai batas maksimal (misalnya maksimal punya 1 atau 2 _Base CV_).
  - Jika batas tercapai, kembalikan response error/limitasi (HTTP 403 Forbidden).

**Catatan Tambahan untuk Implementator:**
- Cek `src/db/schema.ts` untuk melihat struktur tabel `resumes`.
- Gunakan _typing_ validasi bawaan ElysiaJS (TypeBox `t.Object` / `t.String`) untuk memvalidasi _body request_.
- Tidak wajib menangani file berformat PDF/Word pada _initial scope_; fokus utama adalah input berbasis _raw text/JSON_ terlebih dahulu agar mempermudah integrasi dengan AI.
