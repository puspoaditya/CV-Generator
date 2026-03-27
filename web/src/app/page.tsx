"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Star,
  Users,
  Award,
  ChevronRight,
  Menu,
  X,
  ArrowUp
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const words = [
  "Bikin CV Kerjaan Impian",
  "Lolos Interview Gampang",
  "Raih Karir Idaman Kamu",
  "Libas Semua Kompetisi"
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[index % words.length];
      const speed = isDeleting ? 50 : 150;

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayText === "") {
        setIsDeleting(false);
        setIndex((prev) => prev + 1);
      } else {
        setDisplayText(
          isDeleting
            ? currentWord.substring(0, displayText.length - 1)
            : currentWord.substring(0, displayText.length + 1)
        );
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? 50 : 150);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index]);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">HireReady<span className="text-primary">.ai</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors tracking-wide">CARA KERJA</a>
            <a href="#features" className="hover:text-white transition-colors tracking-wide">FITUR</a>
            <a href="#testimonials" className="hover:text-white transition-colors tracking-wide">TESTIMONI</a>
            <a href="/pricing" className="hover:text-white transition-colors tracking-wide">HARGA</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 font-bold hover:text-white hover:bg-white/5">Masuk</Button>
            </Link>
            <Link href="/generate">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]">Mulai Sekarang</Button>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6 font-bold">
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)}>Cara Kerja</a>
                <a href="#features" onClick={() => setIsMenuOpen(false)}>Fitur</a>
                <a href="#testimonials" onClick={() => setIsMenuOpen(false)}>Testimoni</a>
                <a href="/pricing" onClick={() => setIsMenuOpen(false)}>Harga</a>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>Masuk</Link>
                <Link href="/generate" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary font-bold">Mulai Sekarang</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-56 md:pb-40 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-black text-primary mb-10 backdrop-blur-sm tracking-widest uppercase"
          >
            <Zap className="w-3.5 h-3.5 fill-primary" />
            Next-Gen AI Career Lab
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[0.95]">
            <span className="block mb-2">Kerja Impian? Serahin ke AI</span>
            <span className="text-gradient-primary h-[1.2em] inline-block min-w-[300px]">
              {displayText}<span className="animate-pulse text-white">|</span>
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
          >
            Gak perlu pusing nulis berjam-jam. Pake AI HireReady, CV dan cover letter kamu bakalan otomatis 'nge-glow up' dan lolos ATS dalam sekejap. Yuk, jemput karir impianmu!
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Link href="/generate">
              <Button size="lg" className="h-16 px-12 text-lg font-black bg-primary hover:bg-primary/90 text-white group shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)] transition-all hover:scale-105 active:scale-95">
                Gas, Bikin CV Sekarang <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="ghost" size="lg" className="h-16 px-10 text-lg font-bold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 rounded-2xl">
              Lihat Demo
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-8 md:gap-14 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
          >
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">Aman & Terenkripsi</span>
            </div>
            <div className="flex items-center gap-2">
               <Award className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">Kualitas Ekspor Premium</span>
            </div>
            <div className="flex items-center gap-2">
               <Star className="w-5 h-5 fill-current" />
               <span className="text-xs font-black uppercase tracking-widest">Rating 4.9/5</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-24 max-w-6xl mx-auto relative px-4"
        >
          <div className="absolute inset-x-0 -top-20 h-[400px] bg-primary/20 blur-[160px] rounded-full opacity-30 pointer-events-none" />
          
          <div className="relative glass-dark rounded-[3rem] border border-white/10 p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] group overflow-visible">
             <div className="relative rounded-[2.5rem] overflow-hidden bg-[#020617] shadow-inner aspect-[16/10] md:aspect-[16/9]">
                {/* Browser-style Header */}
                <div className="absolute top-0 w-full h-11 bg-white/5 backdrop-blur-md flex items-center px-6 gap-2 z-10 border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                   </div>
                   <div className="mx-auto h-5 w-1/3 bg-white/5 rounded-full border border-white/5 flex items-center justify-center">
                      <div className="text-[9px] text-slate-500 font-bold tracking-widest flex items-center gap-2 uppercase">
                         <ShieldCheck className="w-3 h-3" /> Secure AI Neural Link
                      </div>
                   </div>
                </div>

                {/* Main Content: User Custom Image */}
                <div className="h-full pt-11 relative">
                   <img 
                     src="/custom_dashboard_preview.png" 
                     alt="HireReady.ai Transformation Preview" 
                     className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.01] transition-transform duration-1000 pointer-events-none"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 via-transparent to-transparent opacity-30" />
                </div>
             </div>

             {/* Floating AI Score Badge - Positioned to pop out even more */}
             <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-12 -right-12 glass-accent p-8 rounded-[3rem] shadow-[0_20px_60px_-10px_rgba(139,92,246,0.5)] z-20 hidden md:block border border-primary/20 backdrop-blur-2xl"
              >
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center shadow-inner">
                       <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Neural Match</p>
                       <p className="text-4xl font-black text-white tracking-tighter">98.4<span className="text-primary">%</span></p>
                    </div>
                 </div>
              </motion.div>

              {/* Success Notification Floating */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, delay: 1 }}
                className="absolute -bottom-12 -left-12 glass-dark p-6 rounded-[2.5rem] shadow-2xl z-20 hidden lg:flex items-center gap-4 border border-white/10"
              >
                 <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Alert</p>
                    <p className="text-sm font-black text-white">ATS Optimization Complete</p>
                 </div>
              </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-black/20">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-20 text-center">
               {[
                 { label: "Pengguna Aktif", value: "50,000+" },
                 { label: "Resume Dibuat", value: "120,000+" },
                 { label: "Peningkatan Panggilan", value: "3x" },
                 { label: "Negara", value: "15+" }
               ].map((stat, i) => (
                 <div key={i}>
                    <p className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</p>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      <section className="py-16 border-b border-white/5 bg-black/40">
         <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <p className="text-center text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-12 opacity-70">Satu langkah lebih dekat ke perusahaan impian Anda</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
               {[
                 { name: "Google", src: "/logo-google.png", scale: "scale-[2.8]" },
                 { name: "Gojek", src: "/logo-gojek.png", scale: "scale-[0.8]" },
                 { name: "Tokopedia", src: "/logo-tokopedia.png", scale: "scale-[1.2]" },
                 { name: "Shopee", src: "/logo-shopee.png", scale: "scale-[1.3]" },
                 { name: "Traveloka", src: "/logo-traveloka.png", scale: "scale-[1.2]" }
               ].map((logo, i) => (
                  <div key={i} className="flex items-center justify-center w-24 md:w-40 h-16">
                    <motion.img 
                      src={logo.src} 
                      alt={logo.name} 
                      className={`max-h-full max-w-full w-auto opacity-50 hover:opacity-100 transition-all duration-500 grayscale hover:grayscale-0 ${logo.scale}`}
                      style={{ 
                        filter: "brightness(0) invert(1) drop-shadow(0 0 10px rgba(255,255,255,0.2))" 
                      }}
                      whileHover={{ scale: 1.1 }}
                    />
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 px-6 bg-black/20">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">3 Langkah Menuju <span className="text-primary italic">Pekerjaan Impian</span></h2>
               <p className="text-slate-400 font-medium max-w-xl mx-auto">Kami menyederhanakan proses melamar kerja yang rumit menjadi sangat mudah dan cepat.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-12 relative">
               <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10" />
               
               {[
                 { step: "01", title: "Drop CV Kamu", desc: "Gak usah ribet, tinggal upload CV lama atau profil LinkedIn kamu. AI kami beresin sisanya." },
               { step: "02", title: "Biar AI Beraksi", desc: "Pilih kerjaan yang kamu mau, AI langsung 'sulap' CV kamu biar pas banget sama apa yang HRD cari." },
               { step: "03", title: "Cus, Lamar!", desc: "Download PDF-nya, langsung sebar lamaran. Siap-siap kebanjiran panggilan interview ya!" }
               ].map((item, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                     <div className="w-24 h-24 rounded-full glass-dark border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(139,92,246,0.15)] group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                        <span className="text-3xl font-black text-white">{item.step}</span>
                     </div>
                     <h3 className="text-xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                     <p className="text-slate-400 font-medium leading-relaxed max-w-sm">{item.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative border-t border-white/5">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
               <motion.h2 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter"
               >
                 Inovasi Karir dengan <span className="text-primary italic">Presisi AI</span>
               </motion.h2>
               <p className="text-slate-400 font-medium max-w-xl mx-auto">Dirancang untuk mengungguli sistem seleksi ATS paling ketat sekalipun.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 {
                   title: "Optimasi Kilat",
                   desc: "AI kami pinter banget cari kata kunci yang dibutuhin HRD. CV kamu langsung jadi favorit di sistem ATS!",
                   icon: FileText,
                   color: "bg-blue-500/10 text-blue-400"
                 },
                 {
                   title: "Surat Lamaran Anti-Gagal",
                   desc: "Bikin surat lamaran persuasif tanpa perlu mikir keras. Gak pake drama salah ketik atau kaku.",
                   icon: MessageSquare,
                   color: "bg-purple-500/10 text-purple-400"
                 },
                 {
                   title: "Latihan Interview Santai",
                   desc: "Latihan jawab pertanyaan jebakan interview bareng AI. Makin percaya diri pas hari H!",
                   icon: Award,
                   color: "bg-emerald-500/10 text-emerald-400"
                 }
               ].map((feature, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -10 }}
                   className="group p-10 rounded-[2.5rem] glass-dark border-white/5 hover:border-primary/50 transition-all duration-500"
                 >
                   <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
                     <feature.icon className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
                   <p className="text-slate-400 leading-relaxed font-medium text-sm">
                     {feature.desc}
                   </p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-primary/5">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
               <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6">Cerita Sukses Pengguna Kami</h2>
                  <p className="text-slate-400 font-medium leading-relaxed">Mereka yang telah beralih ke cara cerdas untuk mendapatkan pekerjaan impian.</p>
               </div>
               <div className="flex items-center gap-3">
                  <Users className="text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest">Bergabung dengan 50rb+ profesional</span>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 {
                   name: "Adi Nugraha",
                   role: "Software Engineer",
                   text: "Gokil banget! Dulu dari 20 lamaran cuma 1 yang manggil, pas pake HireReady naik drastis jadi 8 panggilan interview!",
                   avatar: "AN"
                 },
                 {
                   name: "Sarah Wijaya",
                   role: "Product Manager",
                   text: "AI Cover Letter-nya ngebantu parah. Gak perlu lagi begadang berjam-jam cuma buat bikin satu surat lamaran.",
                   avatar: "SW"
                 },
                 {
                   name: "Dimas Pratama",
                   role: "Marketing Head",
                   text: "Template-nya stylish dan beneran lolos ATS. Akhirnya bisa masuk startup impian berkat bantuan AI Score-nya.",
                   avatar: "DP"
                 }
               ].map((testimonial, i) => (
                 <div key={i} className="p-10 rounded-[2.5rem] glass-dark border-white/5 relative">
                    <div className="flex gap-1 mb-8">
                       {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-amber-500 fill-current" />)}
                    </div>
                    <p className="text-slate-200 font-bold leading-relaxed mb-8 italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/20">{testimonial.avatar}</div>
                       <div>
                          <p className="font-black text-white text-sm tracking-tight">{testimonial.name}</p>
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{testimonial.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6 overflow-hidden relative">
         <div className="max-w-5xl mx-auto glass-accent rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
               <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">Siap Gaspol Karir Kamu?</h2>
               <p className="text-primary-foreground/80 text-lg font-bold max-w-2xl mx-auto mb-14 leading-relaxed">
                  Gabung sekarang dan biarin AI kami beresin PR karir kamu. Gratis, gak pake ribet, gak pake kartu kredit.
               </p>
               <Link href="/generate">
                 <Button size="lg" className="h-20 px-16 text-2xl font-black bg-white text-primary hover:bg-white/90 rounded-[2rem] shadow-2xl transition-all hover:scale-105">
                    Gass, Bikin Sekarang <ArrowRight className="ml-4 w-6 h-6" />
                 </Button>
               </Link>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
              <div className="col-span-2">
                 <div className="flex items-center gap-2 mb-8">
                   <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                     <Sparkles className="w-4 h-4 text-white" />
                   </div>
                   <span className="font-black text-xl tracking-tight text-white">HireReady<span className="text-primary">.ai</span></span>
                 </div>
                 <p className="text-slate-500 max-w-xs font-medium leading-relaxed">Platform kecerdasan buatan untuk akselerasi karir masa depan. Direkayasa untuk membawa Anda ke puncak.</p>
              </div>
              <div>
                 <h4 className="font-black text-white uppercase text-xs tracking-[0.2em] mb-8">Platform</h4>
                 <ul className="space-y-4 text-slate-500 text-sm font-bold">
                    <li><a href="#" className="hover:text-primary transition-colors">Fitur</a></li>
                    <li><a href="/pricing" className="hover:text-primary transition-colors">Harga</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Integrasi</a></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-black text-white uppercase text-xs tracking-[0.2em] mb-8">Dukungan</h4>
                 <ul className="space-y-4 text-slate-500 text-sm font-bold">
                    <li><a href="#" className="hover:text-primary transition-colors">Bantuan</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Edukasi AI</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Kontak</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                 </ul>
              </div>
              <div>
                 <h4 className="font-black text-white uppercase text-xs tracking-[0.2em] mb-8">Legal</h4>
                 <ul className="space-y-4 text-slate-500 text-sm font-bold">
                    <li><a href="#" className="hover:text-primary transition-colors">Privasi</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Ketentuan</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Cookie</a></li>
                 </ul>
              </div>
           </div>
           
           <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
              <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">© 2026 HireReady Labs (PT HireReady Internasional). All rights reserved.</p>
              <div className="flex gap-8">
                 <Globe className="w-4 h-4 text-slate-600" />
                 <div className="flex gap-6">
                    <a href="#" className="text-slate-600 hover:text-white transition-colors"><MessageSquare className="w-4 h-4" /></a>
                    <a href="#" className="text-slate-600 hover:text-white transition-colors"><Users className="w-4 h-4" /></a>
                    <a href="#" className="text-slate-600 hover:text-white transition-colors"><Award className="w-4 h-4" /></a>
                 </div>
              </div>
           </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-10 right-10 z-[60]"
          >
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_10px_30px_rgba(139,92,246,0.3)] flex items-center justify-center group"
            >
              <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
