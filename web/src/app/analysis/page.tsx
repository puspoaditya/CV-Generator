"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, FileText, Zap, Building, Target, Loader2 } from "lucide-react";
import Link from "next/link";

export default function CareerAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulating deep analysis after fake delay for premium feel
    const timer = setTimeout(() => {
      setData({
        score: 82,
        atsReview: "Sangat Baik. Struktur CV Anda memenuhi standar industri perbankan dan teknologi.",
        pros: ["Penggunaan kata kerja aksi yang kuat", "Vibransi ATS mencapai 85%", "Struktur logis yang baik"],
        cons: ["Masih kekurangan data metrik pencapaian (angka/persen)", "Beberapa bullet point terlalu panjang"],
        improvement: "Berikan angka nyata untuk setiap pencapaian kinerja.",
        isPro: false,
      });
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 font-sans p-6 md:p-12">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-12 font-bold uppercase tracking-widest text-xs text-clay-500 hover:text-clay-900 border border-black/5 bg-white/20">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Button>
      </Link>

      <div className="max-w-5xl mx-auto">
        <header className="mb-14 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
             <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-brand-accent/5 rounded-full border border-brand-accent/10 mb-6 font-bold uppercase tracking-widest text-[10px] text-brand-accent animate-pulse">
                <Sparkles className="w-4 h-4" /> Laboratorium Analisis Karir AI
             </div>
             <h1 className="font-serif text-5xl md:text-6xl font-bold text-clay-900 tracking-tight leading-tight">Masa Depan <span className="italic font-light text-brand-accent underline decoration-brand-gold/30">Terprediksi.</span></h1>
             <p className="text-clay-500 mt-6 text-lg font-light max-w-2xl mx-auto italic">Algoritma kami menganalisis jejak karir Anda dan memberikan skor kompetensi sektoral.</p>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-40 flex flex-col items-center">
               <div className="w-20 h-20 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin mb-10 shadow-glow" />
               <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-accent animate-pulse">Memindai Node Karir Alpha-7...</p>
            </motion.div>
          ) : (
            <motion.div key="analysis" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-3 gap-10">
               <div className="md:col-span-2 space-y-8">
                  <div className="bg-white/40 backdrop-blur-md rounded-[3rem] p-10 border border-black/5 shadow-sm relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-brand-accent" />
                     </div>
                     <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-clay-400 mb-10">AI ATS Scoring Hub</h3>
                     <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="w-48 h-48 rounded-full border-[10px] border-emerald-500/10 border-t-emerald-500 flex items-center justify-center relative shadow-inner">
                           <span className="font-serif text-6xl font-bold text-clay-900 tracking-tighter">{data.score}</span>
                           <span className="absolute -bottom-2 px-3 py-1 bg-emerald-500 text-white font-bold text-[8px] rounded-full uppercase tracking-widest shadow-xl">High Potential</span>
                        </div>
                        <div className="flex-1 space-y-4">
                           <h4 className="text-xl font-bold text-clay-900 leading-tight">Resume Anda memiliki daya penetrasi pasar yang sangat kuat.</h4>
                           <p className="text-clay-500 text-sm leading-relaxed italic">"{data.atsReview}"</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Kekuatan Utama</h4>
                        <ul className="space-y-4">
                           {data.pros.map((p: any, i: any) => (
                             <li key={i} className="text-xs text-clay-600 font-bold border-l-2 border-emerald-500/30 pl-4 py-1">{p}</li>
                           ))}
                        </ul>
                     </div>
                     <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 shadow-sm">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Area Perbaikan</h4>
                        <ul className="space-y-4">
                           {data.cons.map((c: any, i: any) => (
                             <li key={i} className="text-xs text-clay-600 font-bold border-l-2 border-brand-gold/30 pl-4 py-1">{c}</li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="p-10 rounded-[2.5rem] bg-brand-accent border border-black/5 text-white relative shadow-2xl group overflow-hidden">
                     <div className="relative z-10">
                        <h3 className="font-serif text-2xl font-bold mb-6 italic">Saran Neural AI</h3>
                        <p className="text-brand-white/70 text-sm leading-relaxed font-light mb-10 italic">"{data.improvement}"</p>
                        <Button className="w-full bg-white text-brand-accent hover:bg-brand-gold hover:text-clay-900 font-bold rounded-xl transition-all h-14 uppercase tracking-widest text-xs">Optimasi Sekarang</Button>
                     </div>
                     <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
                  </div>

                  <div className="p-8 rounded-[2rem] bg-clay-900 border border-brand-gold/20 text-brand-gold flex gap-6 items-center shadow-lg transition-transform hover:-translate-y-1">
                     <div className="w-12 h-12 bg-brand-gold/10 rounded-xl flex items-center justify-center border border-brand-gold/10"><Building className="w-6 h-6" /></div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold/50">Market Intelligence</p>
                        <p className="text-sm font-bold text-white tracking-widest">PERBANKAN ALPHA+</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <footer className="mt-20 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.5em] text-clay-400">
           Digital DNA Scanner // Sector: High Precision Professional Node
        </footer>
      </div>
    </div>
  );
}
