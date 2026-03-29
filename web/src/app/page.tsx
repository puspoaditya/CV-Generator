"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring, useTransform, useInView } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Star,
  Users,
  Award,
  CheckCircle2,
  FileText,
  Mail,
  Mic2,
  Clock,
  Target,
  FileCheck,
  ChevronRight,
  Menu,
  X,
  Plus
} from "lucide-react";

// --- CUSTOM CURSOR COMPONENT ---
const CustomCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const ringPos = { x: useSpring(0, { damping: 20, stiffness: 100 }), y: useSpring(0, { damping: 20, stiffness: 100 }) };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      ringPos.x.set(e.clientX);
      ringPos.y.set(e.clientY);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('a, button, [role="button"]'));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleHover);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleHover);
    };
  }, [ringPos.x, ringPos.y]);

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-brand-accent rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        style={{ left: mousePos.x, top: mousePos.y }}
      />
      <motion.div 
        className="fixed top-0 left-0 w-9 h-9 border border-brand-accent/40 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block"
        animate={{ 
          width: isHovering ? 52 : 36, 
          height: isHovering ? 52 : 36,
          backgroundColor: isHovering ? "rgba(28,58,90,0.08)" : "rgba(0,0,0,0)",
          borderColor: isHovering ? "#1C3A5A" : "rgba(28,58,90,0.45)"
        }}
        style={{ left: ringPos.x, top: ringPos.y }}
      />
    </>
  );
};

// --- COUNTER COMPONENT ---
const Counter = ({ value, suffix = "", duration = 2 }: { value: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const totalMiliseconds = duration * 1000;
      const incrementTime = totalMiliseconds / end;

      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime > 1 ? incrementTime : 1);

      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{Number.isInteger(value) ? count : count.toFixed(1)}{suffix}</span>;
}

// --- TYPEWRITER COMPONENT ---
const Typewriter = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[index % words.length];
      const speed = isDeleting ? 45 : 80;

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 1800);
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

    const timer = setTimeout(handleTyping, isDeleting ? 45 : 80);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, words]);

  return (
    <span className="font-serif text-brand-accent font-bold relative inline-block min-w-[2ch]">
      {displayText}
      <span className="inline-block w-[2px] h-[0.9em] bg-brand-accentLight ml-1 animate-pulse align-middle" />
    </span>
  );
};

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 50], ["20px 56px", "14px 56px"]);
  const navBackground = useTransform(scrollY, [0, 50], ["rgba(184, 191, 200, 0)", "rgba(184, 191, 200, 0.85)"]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 selection:bg-brand-accent/20 cursor-none">
      <CustomCursor />

      {/* --- NAVIGATION --- */}
      <motion.nav 
        style={{ padding: navPadding, backgroundColor: navBackground }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between backdrop-blur-md border-b border-black/5"
      >
        <div className="font-serif font-bold text-2xl tracking-tight text-clay-900">
          CV<span className="italic font-light text-brand-accent">Craft</span>
        </div>

        <div className="hidden md:flex items-center gap-9">
          <ul className="flex gap-9 list-none text-[0.83rem] font-medium text-clay-700">
            {["Fitur", "Cara Kerja", "Harga", "Testimoni"].map((item) => (
              <li key={item}>
                <a 
                  href={`#${item.toLowerCase().replace(" ", "")}`} 
                  className="relative group transition-colors hover:text-clay-900 tracking-wide"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-clay-900 transition-all group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className="bg-brand-accent text-brand-white px-[22px] py-[9px] rounded-lg font-semibold text-[0.8rem] transition-all hover:bg-brand-accent2 hover:-translate-y-0.5 shadow-lg shadow-brand-accent/20 uppercase tracking-widest">
            {isLoggedIn ? "Dashboard" : "Mulai Gratis"}
          </Link>
        </div>

        <button className="md:hidden p-2 text-clay-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-brand-bg border-b border-black/5 flex flex-col p-6 gap-6 md:hidden shadow-xl"
            >
              {["Fitur", "Cara Kerja", "Harga", "Testimoni"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "")}`} className="font-bold text-sm" onClick={() => setIsMenuOpen(false)}>{item}</a>
              ))}
              <Link href={isLoggedIn ? "/dashboard" : "/login"} className="bg-brand-accent text-brand-white p-4 rounded-xl text-center font-bold" onClick={() => setIsMenuOpen(false)}>
                {isLoggedIn ? "Dashboard Saya" : "Mulai Sekarang"}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 pt-[140px] pb-20 text-center overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,25,35,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(15,25,35,0.07)_1px,transparent_1px)] bg-[length:52px_52px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_50%,black_30%,transparent_100%)] pointer-events-none" />
        
        {/* Animated Blobs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-100px] left-[-140px] w-[520px] h-[520px] bg-[#4A6880] rounded-full blur-[80px] opacity-[0.16] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: -4 }}
          className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] bg-brand-accent rounded-full blur-[80px] opacity-[0.16] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, 20, 0], y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: -8 }}
          className="absolute top-[40%] left-[60%] w-[280px] h-[280px] bg-[#6A8AA0] rounded-full blur-[80px] opacity-[0.16] pointer-events-none" 
        />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/35 border border-black/10 rounded-full backdrop-blur-md text-[0.73rem] font-medium text-clay-700 mb-8"
          >
            <div className="w-5 h-5 bg-brand-accent rounded-full flex items-center justify-center text-[0.6rem] text-brand-white">✦</div>
            Didukung AI · Tanpa berbohong, cukup pilih diksi yang tepat
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-[clamp(2.8rem,6vw,5.2rem)] font-bold leading-[1.05] tracking-tight text-clay-900 max-w-[860px]"
          >
            Satu CV jadi banyak versi,<br />
            <em className="italic font-light text-clay-600">tanpa kerja</em>{" "}
            <div className="mt-2 min-h-[1.15em] overflow-visible">
              <Typewriter words={['berulang.', 'manual.', 'dari nol.', 'lagi.']} />
            </div>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-7 text-base md:text-lg text-clay-700 max-w-[540px] font-light leading-relaxed"
          >
            Tempel lowongan kerja, CVCraft langsung menyesuaikan bahasa, urutan, dan diksi CV kamu agar lebih relevan — tanpa mengarang fakta. Hemat jam kerja, tingkatkan peluang dipanggil.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-[42px] flex flex-wrap justify-center items-center gap-[14px]"
          >
            <Link href={isLoggedIn ? "/dashboard" : "/generate"} className="bg-brand-accent text-brand-white px-8 py-3.5 rounded-xl font-bold text-[0.88rem] tracking-wide shadow-xl shadow-brand-accent/28 transition-all hover:bg-brand-accent2 hover:-translate-y-0.5 hover:shadow-2xl flex items-center">
              {isLoggedIn ? "Kembali ke Dashboard" : "Optimalkan CV Sekarang"} <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <button className="bg-white/35 text-clay-800 border border-black/10 px-8 py-3.5 rounded-xl font-medium text-[0.88rem] backdrop-blur-md transition-all hover:bg-white/55 hover:-translate-y-0.5">
              Lihat Demo
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mt-16 pt-10 border-t border-black/10 flex flex-wrap justify-center gap-12"
          >
            <div className="flex flex-col items-center">
              <div className="font-serif text-[2.2rem] font-bold text-clay-900"><Counter value={24} suffix="K+" /></div>
              <div className="text-[0.7rem] font-normal text-clay-600 uppercase tracking-wider mt-px">CV Dioptimalkan</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-serif text-[2.2rem] font-bold text-clay-900"><Counter value={8} suffix="K+" /></div>
              <div className="text-[0.7rem] font-normal text-clay-600 uppercase tracking-wider mt-px">Pengguna Aktif</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-serif text-[2.2rem] font-bold text-clay-900"><Counter value={3.2} suffix="x" /></div>
              <div className="text-[0.7rem] font-normal text-clay-600 uppercase tracking-wider mt-px">Peluang Panggilan</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="font-serif text-[2.2rem] font-bold text-clay-900"><Counter value={10} suffix="x" /></div>
              <div className="text-[0.7rem] font-normal text-clay-600 uppercase tracking-wider mt-px">Lebih Cepat</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PAIN SECTION --- */}
      <section id="pain" className="bg-clay-800 py-[100px] px-8 text-brand-white">
        <div className="max-w-[900px] mx-auto flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.14em] text-clay-300 mb-4"
          >
            <div className="w-6 h-[1px] bg-current" /> Masalah yang Kamu Hadapi
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-bold max-w-[700px] leading-[1.12] tracking-tight"
          >
            Kirim CV ke 20 tempat, tapi <em className="italic font-light text-clay-400">isinya sama semua?</em>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-[18px] mt-[52px]">
            {[
              { icon: "📋", title: "Syarat lowongan berbeda-beda", desc: "Satu posisi minta \"komunikasi\", yang lain minta \"negosiasi\". Padahal kamu punya keduanya — tinggal cara penyebutannya yang harus disesuaikan." },
              { icon: "⏳", title: "Edit manual = buang waktu", desc: "Menyesuaikan CV satu per satu butuh berjam-jam dan tetap ada risiko lupa menyesuaikan bagian tertentu. Hasilnya: CV yang masih terasa generik.", delay: 0.1 },
              { icon: "🎯", title: "ATS sering tidak lolos", desc: "Banyak perusahaan pakai sistem ATS yang menyaring keyword. CV kamu bisa gugur di tahap pertama bukan karena tidak kompeten, tapi karena kata-katanya tidak nyambung.", delay: 0.2 }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: card.delay }}
                className="bg-white/5 border border-white/10 p-7 rounded-2xl text-left"
              >
                <div className="text-2xl mb-3.5">{card.icon}</div>
                <h4 className="font-serif text-[1rem] font-bold text-clay-100 mb-2">{card.title}</h4>
                <p className="text-[0.8rem] text-clay-400 leading-relaxed font-light">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section id="fitur" className="bg-brand-surface py-[100px] px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.14em] text-clay-600 mb-4">
              <div className="w-6 h-[1px] bg-current" /> Fitur
            </div>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-clay-900">
              Tiga alat, <em className="italic font-light text-clay-600">satu tujuan:</em> kamu dipanggil
            </h2>
            <p className="mt-3 text-base font-light text-clay-700 max-w-lg">Dari CV hingga simulasi wawancara, semua disesuaikan dengan lowongan yang kamu tuju.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 w-full">
            {[
              { icon: <FileText className="w-4 h-4 text-brand-white" />, title: "CV / Resume Optimizer", desc: "Paste CV kamu dan paste syarat lowongan. AI kami akan menyesuaikan diksi, urutan poin, dan penekanan pengalaman agar lebih relevan — tanpa menambah fakta baru.", tag: "Gratis", tagType: "free" },
              { icon: <Mail className="w-4 h-4 text-brand-white" />, title: "Cover Letter Generator", desc: "Cover letter profesional yang ditulis spesifik untuk lowongan yang kamu tuju. Bukan template basi — tapi surat yang menyebut keahlian relevan dan terasa personal.", tag: "Pro", tagType: "pro", delay: 0.1 },
              { icon: <Mic2 className="w-4 h-4 text-brand-white" />, title: "Interview Simulation Q&A", desc: "Berlatih wawancara sebelum hari H. AI menghasilkan prediksi pertanyaan berdasarkan job description dan CV kamu, lengkap dengan panduan jawaban ideal STAR.", tag: "Elite", tagType: "elite", delay: 0.2 }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -6 }}
                className="relative bg-brand-bg border border-black/5 p-8 rounded-[20px] transition-all duration-300 group overflow-hidden hover:bg-brand-white hover:shadow-2xl"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-11 h-11 bg-brand-accent rounded-xl flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-[1.15rem] font-bold text-clay-900 mb-2.5 tracking-tight">{feature.title}</h3>
                <p className="text-[0.82rem] text-clay-700 leading-[1.75] font-light">{feature.desc}</p>
                <span className={`inline-block mt-4 px-2.5 py-0.5 rounded-full text-[0.62rem] font-bold uppercase tracking-widest ${
                  feature.tagType === 'free' ? 'bg-brand-accent/10 text-brand-accent' : 
                  feature.tagType === 'pro' ? 'bg-brand-accent/15 text-brand-accent2' : 
                  'bg-clay-800/10 text-clay-800'
                }`}>
                  {feature.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS SECTION --- */}
      <section id="carakerja" className="bg-brand-bg py-[100px] px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.14em] text-clay-600 mb-4">
              <div className="w-6 h-[1px] bg-current" /> Cara Kerja
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold leading-tight text-clay-900">
              Tiga langkah,<br /><em className="italic font-light text-clay-600">hasil yang berbeda</em>
            </h2>
            <p className="mt-3 text-base font-light text-clay-700 max-w-sm mb-10">Proses yang dirancang agar kamu tidak perlu berpikir keras. Cukup paste, review, dan kirim.</p>
            
            <div className="flex flex-col">
              {[
                { num: "01", title: "Paste CV & Syarat Lowongan", desc: "Masukkan CV kamu (teks atau PDF) dan tempel job description lowongan target. Tidak perlu format khusus." },
                { num: "02", title: "AI Menganalisis & Menyesuaikan", desc: "Sistem membaca keyword penting dari JD, lalu menyesuaikan diksi dan penekanan di CV kamu agar lebih tepat sasaran." },
                { num: "03", title: "Review & Unduh", desc: "Kamu tetap pemegang kendali. Review hasil, edit jika perlu, lalu unduh versi PDF yang sudah dioptimalkan." },
                { num: "04", title: "Latihan Interview (Elite)", desc: "Gunakan modul simulasi untuk berlatih menjawab pertanyaan yang muncul berdasarkan posisi dan CV kamu." }
              ].map((step, i) => (
                <div key={i} className="flex gap-5 py-7 border-b border-black/5 last:border-0 group transition-all duration-300 hover:pl-[8px] cursor-default">
                  <span className="font-serif text-4xl font-bold text-clay-300 transition-colors group-hover:text-brand-accent">{step.num}</span>
                  <div>
                    <h4 className="font-serif text-[1.05rem] font-bold text-clay-900 mb-1.5">{step.title}</h4>
                    <p className="text-[0.8rem] text-clay-600 font-light leading-relaxed max-w-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-surface rounded-[24px] border border-white/50 shadow-2xl p-0 overflow-hidden"
          >
            <div className="bg-brand-surface2 px-5 py-3.5 flex items-center gap-2.5 border-b border-black/10">
              <div className="w-2.5 h-2.5 rounded-full bg-[#d9534f]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#f0ad4e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#5cb85c]" />
              <span className="ml-2 text-[0.72rem] font-medium text-clay-600">CVCraft · Optimasi CV</span>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest text-brand-accent mb-2">Keyword dari Job Description</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Manajemen Proyek", "Komunikasi", "Kepemimpinan", "Data Analisis", "Agile", "Presentasi"].map((tag, i) => (
                    <span key={i} className={`text-[0.62rem] font-semibold px-2.5 py-0.5 rounded-full border ${[0,1,3,5].includes(i) ? 'bg-brand-accent text-brand-white border-transparent' : 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest text-brand-accent mb-2 mt-4">CV Kamu (Sebelum)</div>
                <div className="h-2 w-full bg-clay-300/40 rounded-full mb-1.5" />
                <div className="h-2 w-[82%] bg-clay-300/40 rounded-full mb-1.5" />
                <div className="h-2 w-[60%] bg-clay-300/40 rounded-full" />
              </div>

              <div>
                <div className="text-[0.6rem] font-bold uppercase tracking-widest text-brand-accent mb-2 mt-4">Versi Dioptimalkan ✦</div>
                <div className="h-2 w-full bg-brand-accent/40 rounded-full mb-1.5 animate-pulse" />
                <div className="h-2 w-[82%] bg-brand-accent/40 rounded-full mb-1.5 animate-pulse" />
                <div className="h-2 w-full bg-clay-300/50 rounded-full mb-1.5" />
                <div className="h-2 w-[40%] bg-clay-300/50 rounded-full" />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <div className="w-7 h-7 bg-brand-accent rounded-full flex items-center justify-center text-[0.58rem] font-bold text-brand-white">AI</div>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-clay-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-clay-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-clay-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span className="text-[0.68rem] text-clay-600">Menyesuaikan diksi pengalaman kerja...</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="harga" className="bg-brand-surface py-[100px] px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.14em] text-clay-600 mb-4">
              <div className="w-6 h-[1px] bg-current" /> Harga
            </div>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-clay-900 leading-tight">
              Mulai gratis, <em className="italic font-light text-clay-600">upgrade sesuai kebutuhan</em>
            </h2>
            <p className="mt-3 text-base text-clay-700 font-light max-w-lg">Tidak perlu kartu kredit untuk memulai. Bayar hanya ketika kamu butuh lebih.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-[18px] max-w-[960px] w-full">
            {[
              { 
                type: "free", 
                plan: "Starter", 
                amount: "0", 
                desc: "Untuk eksplorasi awal karir kamu.", 
                perks: ["1 Base CV", "3 AI Generations", "Ekspor PDF Standard", "Tema Dasar Premium"], 
                btn: "Mulai Gratis",
                colorClass: "border-t-brand-surface2",
                accentColor: "bg-brand-surface2"
              },
              { 
                type: "credits_10", 
                plan: "Daya Gedor", 
                amount: "75K", 
                desc: "Amunisi tambahan untuk lamaran aktif.", 
                perks: ["10 AI Generations", "ATS-Friendly PDFs", "Logika Surat Lamaran", "Email Support 24h"], 
                btn: "Beli Amunisi", 
                featured: true, 
                delay: 0.1,
                colorClass: "border-t-brand-accentLight",
                accentColor: "bg-brand-accentLight"
              },
              { 
                type: "pro", 
                plan: "Elite Pro", 
                amount: "250K", 
                desc: "Kuasai bursa kerja secara mutlak.", 
                perks: ["Unlimited Base CVs", "AI Tanpa Batas", "Design Premium Navy", "Persiapan Wawancara AI", "Lifetime Access"], 
                btn: "Aktivasi Akses", 
                delay: 0.2,
                colorClass: "border-t-brand-accent",
                accentColor: "bg-brand-gold",
                isElite: true
              }
            ].map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: p.delay }}
                whileHover={{ y: -6 }}
                className={`relative bg-brand-bg rounded-[20px] p-[28px] md:p-[36px] flex flex-col border-[1px] border-black/5 transition-all w-full border-t-[3px] shadow-sm ${p.colorClass} ${
                  p.featured ? 'scale-105 z-10 shadow-2xl bg-white/40' : ''
                } ${p.isElite ? 'bg-clay-900 text-brand-white border-t-brand-gold' : ''}`}
              >
                {p.featured && (
                  <div className="absolute top-[-13px] left-1/2 -translate-x-1/2 bg-brand-accent text-brand-white text-[0.62rem] font-bold uppercase px-3.5 py-1 rounded-full tracking-widest shadow-lg">
                    Pilihan Utama
                  </div>
                )}
                
                <div className={`text-[0.75rem] font-bold uppercase tracking-widest mb-4 ${p.isElite ? 'text-brand-gold' : 'text-clay-600'}`}>
                  {p.plan}
                </div>
                
                <div className={`font-serif text-[3rem] font-bold leading-none tracking-tight ${p.isElite ? 'text-brand-white' : 'text-clay-900'}`}>
                  <sup className="text-[1.1rem] align-top top-[0.4em] mr-0.5 font-sans font-normal">Rp</sup>
                  {p.amount}
                  {p.type === 'pro' && <sub className="text-[0.7rem] font-sans font-bold uppercase tracking-widest ml-1 opacity-60">Lifetime</sub>}
                </div>
                
                <p className={`mt-[10px] mb-6 text-[0.78rem] leading-[1.6] font-light ${p.isElite ? 'text-brand-white/60' : 'text-clay-600'}`}>
                  {p.desc}
                </p>
                
                <div className="space-y-3 mb-8 flex-grow">
                  {p.perks.map((perk, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[0.78rem]">
                      <div className={`mt-0.5 w-[18px] h-[18px] flex items-center justify-center rounded-full text-[0.65rem] shrink-0 ${
                        p.isElite ? 'bg-brand-gold/20 text-brand-gold' : 'bg-brand-accent/10 text-brand-accent'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <span className={p.isElite ? 'text-brand-white/80' : 'text-clay-700'}>{perk}</span>
                    </div>
                  ))}
                </div>
                
                <button className={`w-full py-4 rounded-xl font-bold text-[0.82rem] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md ${
                  p.isElite 
                    ? 'bg-brand-gold text-clay-900 hover:bg-white' 
                    : p.featured 
                      ? 'bg-brand-accent text-brand-white hover:bg-brand-accent2 shadow-brand-accent/20' 
                      : 'bg-white/50 text-clay-900 border border-black/5 hover:bg-white'
                }`}>
                  {p.btn}
                </button>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section id="testimoni" className="bg-brand-bg py-[100px] px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="flex items-center gap-2 text-[0.67rem] font-bold uppercase tracking-[0.14em] text-clay-600 mb-4">
              <div className="w-6 h-[1px] bg-current" /> Testimoni
            </div>
            <h2 className="font-serif text-[clamp(2rem,3.5vw,3rem)] font-bold tracking-tight text-clay-900 leading-tight">
              Mereka sudah <em className="italic font-light text-clay-600">dapat panggilan lebih banyak</em>
            </h2>
            <p className="mt-3 text-base text-clay-700 font-light max-w-[480px]">Dari fresh graduate hingga profesional yang sedang career switch, CVCraft membantu mereka tampil lebih relevan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 w-full">
            {[
              { av: "RS", name: "Rafi Santoso", role: "Marketing Executive · Startup", quote: "\"Dulu saya kirim CV yang sama ke 15 tempat dan tidak ada yang merespons. Setelah pakai CVCraft, minggu pertama langsung dapat 3 panggilan interview. Perbedaannya terasa sekali.\"" },
              { av: "NP", name: "Nadya Pratiwi", role: "Data Analyst · Fresh Graduate UI", quote: "\"Fitur simulasi interview-nya luar biasa. Pertanyaan yang muncul di interview beneran hampir 70% sama dengan prediksi dari CVCraft. Saya jadi jauh lebih percaya diri.\"", delay: 0.1 },
              { av: "AW", name: "Andhika Wibowo", role: "Product Manager · Ex-Engineer", quote: "\"Saya pakai ini untuk career switch. Cover letter yang dihasilkan terasa sangat personal dan langsung ke inti — HRD bilang surat saya menonjol dibanding kandidat lain.\"", delay: 0.2 }
            ].map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: t.delay }}
                whileHover={{ y: -5 }}
                className="bg-brand-surface border border-black/5 p-8 rounded-[20px] shadow-sm flex flex-col transition-all"
              >
                <div className="text-brand-gold text-[0.85rem] mb-3.5 tracking-[2px] opacity-80">★★★★★</div>
                <p className="text-[0.84rem] text-clay-700 italic leading-[1.8] font-light mb-6 flex-grow">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-accent flex items-center justify-center rounded-full text-[0.7rem] font-bold text-brand-white shrink-0">{t.av}</div>
                  <div>
                    <div className="text-[0.82rem] font-bold text-clay-900">{t.name}</div>
                    <div className="text-[0.72rem] text-clay-600 mt-0.5">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section id="cta" className="bg-brand-accent py-[100px] px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(216,232,245,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(216,232,245,0.05)_1px,transparent_1px)] bg-[length:52px_52px] pointer-events-none" />
        <div className="max-w-[600px] mx-auto relative z-10 flex flex-col items-center">
          <motion.h2 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-[clamp(2.1rem,4vw,3.2rem)] font-bold text-brand-white leading-[1.1] tracking-tight"
          >
            CV kamu sudah bagus.<br /><em className="italic font-light text-brand-white/60">Tinggal disesuaikan.</em>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-5 text-brand-white/70 text-[0.95rem] font-light leading-relaxed"
          >
            Mulai gratis hari ini. Tidak perlu kartu kredit. Hasil pertama dalam 3 menit.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 flex flex-wrap gap-3.5 justify-center"
          >
            <button className="bg-brand-white text-brand-accent px-8 py-3.5 rounded-xl font-bold text-[0.88rem] transition-all hover:scale-105 active:scale-95">
              Optimalkan CV Sekarang →
            </button>
            <button className="bg-transparent text-brand-white border border-white/35 px-8 py-3.5 rounded-xl font-medium text-[0.88rem] transition-all hover:bg-white/10 hover:-translate-y-0.5">
              Lihat Contoh Hasil
            </button>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-clay-900 py-16 px-8 text-clay-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-[48px] mb-[48px] pb-[48px] border-b border-white/10">
            <div className="flex flex-col gap-4">
              <div className="font-serif font-bold text-2xl text-brand-white">CV<span className="italic font-light text-clay-400">Craft</span></div>
              <p className="text-[0.8rem] text-clay-500 font-light leading-[1.7] max-w-sm">Platform AI yang membantu job seeker Indonesia tampil lebih relevan di setiap lowongan — tanpa berbohong, tanpa kerja manual berulang.</p>
            </div>
            {[
              { h: "Produk", links: ["CV Optimizer", "Cover Letter", "Interview Sim", "Harga"] },
              { h: "Perusahaan", links: ["Tentang Kami", "Blog", "Karir", "Press Kit"] },
              { h: "Dukungan", links: ["FAQ", "Panduan", "Komunitas", "Kontak"] }
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-clay-400 mb-6">{col.h}</h5>
                <ul className="space-y-3">
                  {col.links.map((link, idx) => (
                    <li key={idx}><a href="#" className="text-[0.8rem] text-clay-500 hover:text-clay-200 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between text-[0.75rem] text-clay-600">
            <span>© 2026 CVCraft. Hak cipta dilindungi.</span>
            <Link href="/terms" className="mt-4 md:mt-0 hover:text-brand-white transition-colors cursor-pointer">
              Privasi · Syarat · Ketentuan
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
