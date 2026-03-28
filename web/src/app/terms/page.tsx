"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Lock, ChevronRight } from "lucide-react";

export default function TermsAndPolicies() {
  const sections = [
    {
      id: "terms",
      title: "Syarat & Ketentuan",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p>Selamat datang di CVCraft. Dengan menggunakan layanan kami, Anda menyetujui ketentuan berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Layanan:</strong> CVCraft menyediakan alat berbasis AI untuk membantu pembuatan CV dan surat lamaran. Hasil akhir tetap menjadi tanggung jawab pengguna.</li>
            <li><strong>Akun:</strong> Anda bertanggung jawab menjaga kerahasiaan akun dan password Anda. Setiap aktivitas di bawah akun Anda adalah tanggung jawab Anda.</li>
            <li><strong>Penyalahgunaan:</strong> Dilarang menggunakan layanan untuk membuat konten yang melanggar hukum, menipu, atau merugikan pihak lain.</li>
            <li><strong>Batasan Tanggung Jawab:</strong> CVCraft tidak menjamin kelulusan seleksi kerja. Kami menyediakan alat bantu, bukan jaminan pekerjaan.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "privacy",
      title: "Kebijakan Privasi",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p>Kami menghargai privasi Anda. Data Anda dikelola dengan standar keamanan tinggi:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Data yang Dikumpulkan:</strong> Kami menyimpan email Anda untuk akun, serta data yang Anda masukkan dalam formulir CV untuk keperluan generasi dokumen.</li>
            <li><strong>Penggunaan AI:</strong> Data CV Anda dikirimkan ke penyedia layanan AI (seperti OpenAI atau Google Gemini) secara terenkripsi untuk diproses menjadi teks profesional.</li>
            <li><strong>Penyimpanan Data:</strong> Kami tidak menjual data Anda kepada pihak ketiga. Data disimpan secara aman di database terenkripsi.</li>
            <li><strong>Cookies:</strong> Kami menggunakan cookies untuk menjaga sesi login Anda tetap aktif.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "refund",
      title: "Kebijakan Pengembalian Dana (Refund)",
      icon: <RefreshCw className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <p>Kebijakan transaksi di CVCraft adalah sebagai berikut:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Sifat Layanan:</strong> Karena CVCraft menyediakan produk digital (Credits atau Akses Pro) yang dapat langsung digunakan setelah pembelian, semua penjualan dianggap final.</li>
            <li><strong>Tidak Ada Refund:</strong> Kami tidak memberikan pengembalian dana untuk sisa credits yang tidak terpakai atau pembatalan langganan di tengah periode.</li>
            <li><strong>Pengecualian:</strong> Refund hanya akan dipertimbangkan jika terjadi kesalahan teknis dari sistem kami (misalnya: saldo terpotong tapi produk tidak diterima) yang tidak dapat diperbaiki dalam waktu 3x24 jam.</li>
            <li><strong>Proses Klaim:</strong> Hubungi tim support kami dengan melampirkan bukti transaksi jika terjadi kendala teknis.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-brand-bg font-sans selection:bg-brand-accent/20">
      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-accent flex items-center justify-center transition-transform group-hover:-translate-x-1">
              <ArrowLeft className="w-4 h-4 text-brand-white" />
            </div>
            <span className="font-serif font-bold text-lg text-clay-900">Kembali</span>
          </Link>
          <div className="font-serif font-bold text-xl tracking-tight text-clay-900">
            CV<span className="italic font-light text-brand-accent">Craft</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="px-4 py-2 bg-brand-accent/10 rounded-full border border-brand-accent/10">
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> Transparansi & Keamanan
               </span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl font-bold text-clay-900 mb-6 leading-tight tracking-tight"
          >
            Syarat, Ketentuan <br />
            <span className="italic font-light text-brand-accent">& Kebijakan Kami</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-clay-600 text-lg font-light max-w-xl mx-auto"
          >
            Kami percaya pada transparansi total. Halaman ini menjelaskan bagaimana kami mengoperasikan layanan dan menjaga privasi Anda.
          </motion.p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="bg-white/40 backdrop-blur-sm border border-black/5 rounded-[2.5rem] p-8 md:p-12 transition-all hover:bg-white/60 hover:shadow-xl hover:shadow-brand-accent/5">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-brand-accent text-brand-white flex items-center justify-center shadow-lg shadow-brand-accent/20">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-serif text-2xl font-bold text-clay-900 mb-6 flex items-center gap-3">
                      {section.title}
                      <ChevronRight className="w-5 h-5 text-brand-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                    <div className="text-clay-700 font-light leading-relaxed text-base italic-serif-fix">
                      {section.content}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-brand-surface py-20 px-6 border-t border-black/5">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-serif text-3xl font-bold text-clay-900 mb-4 italic">Punya Pertanyaan?</h3>
          <p className="text-clay-600 mb-10 font-light">
            Jika ada bagian yang kurang jelas, tim support kami siap membantu Anda memahami lebih lanjut.
          </p>
          <Link 
            href="mailto:support@cvcraft.id"
            className="inline-flex items-center gap-3 px-8 py-4 bg-brand-accent text-brand-white font-bold rounded-2xl shadow-xl shadow-brand-accent/20 hover:bg-brand-accent2 transition-all active:scale-95 text-sm uppercase tracking-widest"
          >
            Hubungi Tim Support
          </Link>
        </div>
        <div className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.5em]">
            &copy; {new Date().getFullYear()} CVCraft Pulse Engine. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
