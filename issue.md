# Phase 7: UI Polish (Shadcn Alignment) & Bug Fixes

## Overview
Meskipun komponen Shadcn UI telah diinstal dan diintegrasikan pada *Phase 6*, tampilan aplikasi web masih belum memancarkan desain premium ala dokumentasi resmi Shadcn (kurangnya aksen *border*, bayangan, atau tipografi yang tepat). Selain itu, terdapat *bug* fungsional pada form "Generate CV", di mana elemen *Select* untuk memilih *Base CV* tidak dapat diklik atau nilainya tidak tersimpan dengan benar.

Fase ini bertujuan untuk merapikan seluruh desain antarmuka agar benar-benar identik dengan standar Shadcn UI dan memperbaiki fungsi form yang patah.

## Masalah yang Ditemukan
1. **Shadcn UI Mismatch**: Tampilan komponen (seperti `Card`, `Button`, `Input`) belum terlihat seperti aslinya. Kemungkinan ada kesalahan dalam pemetaan variabel CSS (`globals.css`), konfigurasi Tailwind (`tailwind.config.ts`), atau integrasi font standar Shadcn (Inter).
2. **Defect pada Fitur Select CV**: Komponen `<Select>` dari Shadcn membutuhkan struktur hirarki khusus (`SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`) dan *event handler* `onValueChange` pengganti `onChange` bawaan HTML asli. Saat ini *state* `selectedResumeId` gagal terbarui sehingga CV tidak bisa di-*generate*.

## High-Level Tasks (Langkah-Langkah)

- [ ] **Audit & Fix Konfigurasi Tailwind & CSS**
  - Pastikan file `tailwind.config.ts` menunjuk ke path yang tepat (`./src/**/*.{js,ts,jsx,tsx,mdx}`).
  - Sinkronkan kembali file `globals.css` dengan sekumpulan variabel root HSL resmi dari sistem Shadcn (tema Slate/Dark).
  - Pastikan font inter (`next/font/google`) terpasang secara *global* di dalam komponen `body`.

- [ ] **Penyempurnaan Tampilan Komponen (UI Polish)**
  - Pastikan setiap form (Login, Register, Generate) terbungkus rapi di dalam `<Card>` dengan *padding* dan *border radius* yang sesuai dengan pakem Shadcn (contoh: `<CardHeader>`, `<CardTitle>`, `<CardContent>`).
  - Hapus kelas-kelas kustom Tailwind yang bentrok (konflik) dengan gaya asli buatan Shadcn.

- [ ] **Fix Bug `<Select>` pada Halaman Generate**
  - Refaktor ulang implementasi komponen `Select` di `web/src/app/generate/page.tsx`.
  - Pastikan *prop* `onValueChange={(value) => setSelectedResumeId(value)}` terpasang alih-alih `onChange`.
  - Konversi semua tipe data ID dari *integer* `id` backend menjadi *string* saat dimasukkan ke dalam atribut `value` pad `<SelectItem>`.
  - Verifikasi pengguna bisa memilih list CV sebelum menekan tombol Generate.

**Kriteria Penerimaan (Acceptance Criteria):**
- Nuansa desain aplikasi (`globals.css` + Tailwind) harus selaras 100% dengan estetika minimalis web shadcn/ui.
- Pengguna dapat memilih daftar *Base CV* dari *dropdown list* dengan lancar, *state* tersimpan, dan tombol memicu request ke *backend* tanpa *error validation*.
