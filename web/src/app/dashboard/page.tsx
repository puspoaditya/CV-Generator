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
  Settings, 
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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Menghubungkan ke Neural Link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 bg-mesh selection:bg-primary/30">
      {/* Sidebar / Top Nav Overlay */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">HireReady<span className="text-primary">.ai</span></span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/pricing" className="hidden md:block">
               <Button variant="ghost" className="flex gap-2 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest">
                  <CreditCard className="w-4 h-4" /> Beli Kredit
               </Button>
            </Link>
            <div className="h-8 w-[1px] bg-white/10 hidden md:block" />
            <Button 
               variant="ghost" 
               size="icon"
               onClick={() => {
                 localStorage.removeItem("token");
                 router.push("/login");
               }}
               className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 p-[2px] cursor-pointer hover:scale-105 transition-transform">
               <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center text-xs font-black">
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
                 <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                    <Clock className="w-3 h-3" /> {getTimeGreeting()}
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                    Apa kabar, <span className="text-primary">{user?.name?.split(' ')[0]}</span>! 👋
                 </h1>
                 <p className="text-slate-500 mt-2 font-medium">Panel kendali untuk karir impian Anda sudah siap.</p>
              </div>
              <Link href="/generate">
                 <Button className="h-16 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)] group">
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
              className="md:col-span-2 glass-dark p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 p-8">
                  <Zap className="w-12 h-12 text-primary opacity-20 group-hover:opacity-100 transition-opacity" />
               </div>
               <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Kredit Tersisa</h3>
                    <div className="flex items-baseline gap-4">
                       <span className="text-6xl font-black text-white tracking-tighter">{stats?.credits}</span>
                       <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Token</span>
                    </div>
                  </div>
                  <div className="mt-8">
                     <div className="w-full h-2 bg-white/5 rounded-full mb-4 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stats?.credits || 0) * 10}%` }}
                          className="h-full bg-gradient-to-r from-primary via-indigo-400 to-cyan-400"
                        />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Teroptimasi untuk {stats?.credits}x pengajuan</p>
                  </div>
               </div>
            </motion.div>

            {/* Stat: Total Resumes */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-dark p-8 rounded-[2.5rem] border-white/5 group hover:border-primary/20 transition-all"
            >
               <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Total Resume</h3>
               <p className="text-4xl font-black text-white tracking-tight">{stats?.resumesCount}</p>
               <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-4 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> CV Teroptimasi
               </p>
            </motion.div>

            {/* Account Status / Plan */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`p-8 rounded-[2.5rem] border transition-all ${stats?.isPro ? 'glass-accent border-primary/20' : 'glass-dark border-white/5'}`}
            >
               <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
               </div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Status Akun</h3>
               <p className="text-2xl font-black text-white uppercase tracking-[0.1em]">
                  {stats?.isPro ? "PRO ELITE" : "Bukan PRO"}
               </p>
               {!stats?.isPro && (
                 <Link href="/pricing" className="mt-4 block text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                    Upgrade Sekarang →
                 </Link>
               )}
            </motion.div>
        </div>

        {/* Quick Actions & Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Section: Quick Actions */}
           <section className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-[0.1em]">Aksi Cepat</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {[
                   { title: "Generate CV", icon: FileText, desc: "Buat CV teroptimasi AI", href: "/generate", color: "text-blue-400" },
                   { title: "Analisis Karir", icon: Briefcase, desc: "Cek skor kesiapan kerja", href: "#", color: "text-emerald-400" },
                   { title: "Riwayat", icon: History, desc: "Lihat hasil sebelumnya", href: "/resumes", color: "text-purple-400" },
                   { title: "Settings", icon: Settings, desc: "Konfigurasi akun & AI", href: "#", color: "text-slate-400" }
                 ].map((action, i) => (
                   <Link key={i} href={action.href}>
                      <div className="group p-6 rounded-3xl glass-dark border-white/5 hover:border-white/10 hover:bg-white/5 transition-all flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${action.color}`}>
                            <action.icon className="w-6 h-6" />
                         </div>
                         <div className="flex-1">
                            <h4 className="font-black text-white text-lg tracking-tight group-hover:text-primary transition-colors">{action.title}</h4>
                            <p className="text-slate-500 text-sm font-medium">{action.desc}</p>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-700 group-hover:translate-x-1 group-hover:text-white transition-all" />
                      </div>
                   </Link>
                 ))}
              </div>
           </section>

           {/* Section: Right Sidebar Items (Announcements/Pro) */}
           <aside className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 to-primary/20 border border-primary/20 relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Tips Hari Ini</p>
                    <h3 className="text-xl font-black text-white mb-4 leading-tight">Gunakan Kata Kunci Aksi untuk Skor ATS Lebih Tinggi.</h3>
                    <p className="text-indigo-200/60 text-sm font-medium leading-relaxed mb-6">AI kami menyarankan penggunaan kata kerja aktif seperti "Memimpin", "Menginisiasi", dan "Mengoptimalkan" untuk hasil terbaik.</p>
                    <Button variant="outline" className="w-full border-primary/20 bg-primary/10 text-primary hover:bg-primary font-bold">Pelajari Selengkapnya</Button>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />
              </div>

              <div className="glass-dark p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-slate-600" />
                 </div>
                 <h4 className="font-black text-white mb-2">HireReady v2.4</h4>
                 <p className="text-slate-500 text-xs font-bold leading-relaxed mb-6">Engine AI terbaru lebih cepat 40% dan mendukung 15+ format resume industri.</p>
                 <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Neural Link Online</span>
                 </div>
              </div>
           </aside>
        </div>
      </main>

      <footer className="py-12 border-t border-white/5 px-6">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">Core AI System: High Precision Pulse Engine</p>
            <div className="flex gap-6 text-slate-600 text-[10px] font-black uppercase tracking-widest">
               <a href="#" className="hover:text-white transition-colors">Support</a>
               <a href="#" className="hover:text-white transition-colors">Docs</a>
               <a href="#" className="hover:text-white transition-colors">API</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
