"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Zap, 
  Settings as SettingsIcon, 
  LogOut, 
  History, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight
} from "lucide-react";

interface Stats {
  resumesCount: number;
  credits: number;
  isPro: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, statsRes] = await Promise.all([
          apiFetch("/auth/me"),
          apiFetch("/dashboard/stats")
        ]);
        
        if (userRes.ok && statsRes.ok) {
          setUser(await userRes.json());
          setStats(await statsRes.json());
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
        <p className="text-clay-500 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Menghubungkan ke Neural Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 font-sans selection:bg-brand-accent/20 cursor-default">
      {/* Sidebar / Top Nav Overlay */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 backdrop-blur-xl bg-white/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="font-serif font-bold text-2xl tracking-tight text-clay-900">
              CV<span className="italic font-light text-brand-accent">Craft</span>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/pricing" className="hidden md:block">
               <Button variant="ghost" className="flex gap-2 text-clay-500 hover:text-clay-900 hover:bg-black/5 font-bold text-xs uppercase tracking-widest transition-colors">
                  <CreditCard className="w-4 h-4" /> Beli Kredit
               </Button>
            </Link>
            <div className="h-8 w-[1px] bg-black/10 hidden md:block" />
            <Button 
               variant="ghost" 
               size="icon"
               onClick={() => {
                 localStorage.removeItem("token");
                 router.push("/login");
               }}
               className="text-clay-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-brand-accentLight p-[2px] cursor-pointer hover:scale-105 transition-transform shadow-sm">
               <div className="w-full h-full rounded-full bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-accent">
                  {user?.name?.substring(0, 2).toUpperCase()}
               </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header Section */}
        <section className="mb-12">
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="flex flex-col md:flex-row md:items-end justify-between gap-6"
           >
              <div>
                 <div className="flex items-center gap-2 text-brand-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                    <Clock className="w-3 h-3" /> {getTimeGreeting()}
                 </div>
                 <h1 className="font-serif text-4xl md:text-5xl font-bold text-clay-900 tracking-tight leading-none">
                    Apa kabar, <span className="italic font-light text-brand-accent">{user?.name?.split(' ')[0]}</span>! 👋
                 </h1>
                 <p className="text-clay-600 mt-3 font-light">Panel kendali untuk karir impian Anda sudah siap.</p>
              </div>
              <Link href="/generate">
                 <Button className="h-16 px-8 rounded-2xl bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold text-lg shadow-xl shadow-brand-accent/20 group transition-all hover:-translate-y-1">
                    <Plus className="mr-2 h-6 w-6 group-hover:rotate-90 transition-transform duration-300" /> 
                    Buat CV Baru
                 </Button>
              </Link>
           </motion.div>
        </section>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Main Stat: Credits */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2 bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-black/5 relative overflow-hidden group shadow-sm transition-all hover:bg-white/60"
            >
               <div className="absolute top-0 right-0 p-8">
                  <Zap className="w-12 h-12 text-brand-accent opacity-5 group-hover:opacity-20 transition-opacity" />
               </div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-clay-500 mb-6">Kredit Tersisa</h3>
                    <div className="flex items-baseline gap-4">
                       <span className="font-serif text-7xl font-bold text-clay-900 tracking-tighter">{stats?.credits}</span>
                       <span className="text-clay-500 font-bold uppercase tracking-widest text-sm">Token</span>
                    </div>
                  </div>
                  <div className="mt-8">
                     <div className="w-full h-2.5 bg-black/5 rounded-full mb-4 overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats?.credits || 0) * 10}%` }}
                          className="h-full bg-brand-accent shadow-[0_0_10px_rgba(28,58,90,0.3)]"
                        />
                     </div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Teroptimasi untuk {stats?.credits}x pengajuan</p>
                  </div>
               </div>
            </motion.div>

            {/* Stat: Total Resumes */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-black/5 group hover:bg-white/60 transition-all shadow-sm"
            >
               <div className="w-12 h-12 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-6 group-hover:bg-brand-accent/20 transition-colors">
                  <FileText className="w-6 h-6 text-brand-accent" />
               </div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-clay-500 mb-2">Total Resume</h3>
               <p className="font-serif text-5xl font-bold text-clay-900 tracking-tight">{stats?.resumesCount}</p>
               <p className="text-clay-400 text-[10px] font-bold uppercase tracking-widest mt-6 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" /> CV Teroptimasi
               </p>
            </motion.div>

            {/* Account Status / Plan */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-8 rounded-[2.5rem] border transition-all shadow-sm ${stats?.isPro ? 'bg-clay-900 border-brand-gold/20' : 'bg-white/40 border-black/5'}`}
            >
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stats?.isPro ? 'bg-brand-gold/20' : 'bg-brand-accent/10'}`}>
                  <Sparkles className={`w-6 h-6 ${stats?.isPro ? 'text-brand-gold' : 'text-brand-accent'}`} />
               </div>
               <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 ${stats?.isPro ? 'text-brand-gold/60' : 'text-clay-500'}`}>Status Akun</h3>
               <p className={`font-serif text-2xl font-bold uppercase tracking-widest ${stats?.isPro ? 'text-brand-gold' : 'text-clay-900'}`}>
                  {stats?.isPro ? "PRO ELITE" : "Bukan PRO"}
               </p>
               {!stats?.isPro && (
                 <Link href="/pricing" className="mt-6 block text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:underline decoration-brand-accent/30 decoration-2 underline-offset-4">
                    Upgrade Sekarang →
                 </Link>
               )}
            </motion.div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Section: Quick Actions */}
           <section className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                 <h2 className="font-serif text-xl font-bold text-clay-900 tracking-tight uppercase tracking-widest">Aksi Utama</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { title: "Generate CV", icon: FileText, desc: "Buat CV teroptimasi AI", href: "/generate", color: "text-brand-accent" },
                   { title: "Analisis Karir", icon: Briefcase, desc: "Cek skor kesiapan kerja", href: "/analysis", color: "text-brand-accentLight" },
                   { title: "Riwayat", icon: History, desc: "Lihat hasil sebelumnya", href: "/resumes", color: "text-clay-600" },
                   { title: "Settings", icon: SettingsIcon, desc: "Konfigurasi akun & AI", href: "/settings", color: "text-clay-400" }
                 ].map((action, i) => (
                   <Link key={i} href={action.href}>
                      <div className="group p-6 rounded-3xl bg-white/40 border border-black/5 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm transition-all group-hover:scale-110 ${action.color}`}>
                            <action.icon className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-bold text-clay-900 text-lg tracking-tight group-hover:text-brand-accent transition-colors">{action.title}</h4>
                            <p className="text-clay-500 text-sm font-light">{action.desc}</p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-clay-300 group-hover:translate-x-1 group-hover:text-brand-accent transition-all" />
                      </div>
                   </Link>
                 ))}
              </div>
           </section>

           {/* Section: Right Sidebar Items (Announcements/Pro) */}
           <aside className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-brand-accent border border-black/5 relative overflow-hidden shadow-2xl">
                 <div className="relative z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-white/50 mb-3">Tips Hari Ini</p>
                    <h3 className="font-serif text-xl font-bold text-brand-white mb-5 leading-tight">Gunakan Kata Kunci Aksi untuk Skor ATS Lebih Tinggi.</h3>
                    <p className="text-brand-white/70 text-sm font-light leading-relaxed mb-8">AI kami menyarankan penggunaan kata kerja aktif seperti "Memimpin", "Menginisiasi", dan "Mengoptimalkan" untuk hasil terbaik.</p>
                    <Button variant="outline" className="w-full border-white/20 bg-white/10 text-brand-white hover:bg-brand-white hover:text-brand-accent font-bold rounded-xl transition-all">Pelajari Selengkapnya</Button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
              </div>

              <div className="bg-white/40 p-10 rounded-[2.5rem] border border-black/5 flex flex-col items-center text-center shadow-sm">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-soft">
                    <Briefcase className="w-7 h-7 text-brand-accent" />
                 </div>
                 <h4 className="font-serif text-lg font-bold text-clay-900 mb-2 tracking-tight">CVCraft v2.4</h4>
                 <p className="text-clay-500 text-xs font-light leading-relaxed mb-8">Engine AI terbaru lebih cepat 40% dan mendukung 15+ format resume industri.</p>
                 <div className="flex items-center gap-2 px-4 py-1.5 bg-brand-accent/5 rounded-full border border-brand-accent/10">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Neural Link Online</span>
                 </div>
              </div>
           </aside>
        </div>
      </main>

      <footer className="py-12 border-t border-black/5 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-clay-400 italic">Core AI System: High Precision Pulse Engine</p>
            <div className="flex gap-8 text-clay-400 text-[10px] font-bold uppercase tracking-widest">
               <a href="#" className="hover:text-clay-900 transition-colors">Support</a>
               <a href="#" className="hover:text-clay-900 transition-colors">Docs</a>
               <a href="#" className="hover:text-clay-900 transition-colors">API</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
