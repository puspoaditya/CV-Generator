# Issue: Redesign "Generate Journey" - CV Master & CV Optimize

## Latar Belakang
Alur kerja (journey) saat ini dalam membuat atau meng-generate CV terasa kurang terstruktur dan menghasilkan nama CV atau format yang terlalu seragam (contoh: hanya "Optimized"). Pengguna membutuhkan logika manajemen CV yang membedakan antara "Data Mentah/Utama" (CV Master) dan "Data Hasil Revisi AI" (CV Optimize) yang disesuaikan per lamaran/pekerjaan.

## Konsep Baru: 2 Kategori CV

### 1. CV Master
Ini adalah _single source of truth_ atau fondasi profil pengguna.
- **Definisi**: CV utama yang dibuat pertama kali.
- **Metode Pengisian**:
  - Input form manual oleh pengguna.
  - Ekstraksi (import) otomatis dari profil LinkedIn.
  - Upload dan ekstraksi teks dari PDF CV yang sudah ada.
- **Aturan**: Pengguna harus memiliki minimal 1 CV Master sebelum bisa menggunakan fitur AI Generation (CV Optimize).

### 2. CV Optimize (Tailored CV)
Ini adalah CV khusus lamaran kerja yang diracik oleh AI.
- **Definisi**: CV yang dihasilkan (generated) oleh AI berdasarkan gabungan antara data **CV Master** dan spesifikasi **Pekerjaan Tujuan** (Job Description / Target Role).
- **Penamaan Dinamis**: Nama CV tidak lagi sekadar "CV Optimized", melainkan nama spesifik yang mencerminkan targetnya, contoh: 
  - `Frontend Developer - Tokopedia`
  - `Marketing Manager - Gojek`
- **Konsep Penggunaan**: Saat ingin menggunakan AI, pengguna hanya perlu memilih "CV Master", memasukkan job desc/perusahaan tujuan, dan AI akan meracik profilnya menjadi CV Optimize.

## Perubahan Alur Kerja (User Flow)
1. **User Baru / Kosong**: Saat masuk ke halaman Generate, sistem akan mengecek apakah pengguna sudah memiliki CV Master. Jika belum, pengguna akan diarahkan ke halaman "Buat CV Master" (Manual / PDF / LinkedIn).
2. **User Lama**: Pengguna memilih CV Master yang sudah ada.
3. **Target Job**: Pengguna memasukkan Posisi Pekerjaan dan Nama Perusahaan tujuan.
4. **Generate**: AI mengeksekusi optimasi.
5. **Simpan**: Hasilnya disimpan ke database dengan label "CV Optimize" dan nama file yang dinamis menyesuaikan posisi + perusahaan.

## Langkah Implementasi (*To-Do*)
1. Tambahkan kolom status/kategori (`type`: 'master' | 'optimized') di tabel resume pada database.
2. Tambahkan kolom `target_position` dan `target_company` pada database resume.
3. Buat UI baru untuk _onboarding_ pembuatan CV Master (opsi: Manual, LinkedIn, Upload PDF).
4. Ubah tampilan dan logika di halaman `/generate` agar pengguna memilih CV Master sebagai sumber input, bukan mengisi formulir dari nol lagi.
5. Sesuaikan prompt AI di backend (`generation_controller.ts`) agar bisa menerima parameter Target Job & Company, serta menghasilkan nama CV yang dinamis.
