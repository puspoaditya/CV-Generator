"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
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
  TrendingUp,
  Clock,
  Briefcase,
  ChevronRight,
  Database,
  Search
} from "lucide-react";

interface Stats {
  resumesCount: number;
  masterCount: number;
  optimizedCount: number;
  credits: number;
  isPro: boolean;
}

interface Resume {
  id: string;
  title: string;
  type: "master" | "optimized";
  updatedAt: string;
  status?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, statsRes, resumesRes] = await Promise.all([
          apiFetch("/auth/me"),
          apiFetch("/dashboard/stats"),
          apiFetch("/resumes?limit=3")
        ]);
        
        if (userRes.ok && statsRes.ok) {
          setUser(await userRes.json());
          setStats(await statsRes.json());
          if (resumesRes.ok) {
             const resumesData = await resumesRes.json();
             setResumes(resumesData.resumes || []);
          }
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
            <Button 
                onClick={handleLogout}
                variant="ghost" 
                className="flex gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/5 font-bold text-xs uppercase tracking-widest transition-colors"
            >
               <LogOut className="w-4 h-4" /> Keluar
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
               <div className="px-3 py-1 bg-brand-accent/10 border border-brand-accent/20 rounded-full text-[10px] font-bold text-brand-accent uppercase tracking-widest">
                  {stats?.isPro ? "Executive Access" : "Basic Protocol"}
               </div>
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-clay-500 uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
               </div>
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-clay-900">
              {getTimeGreeting()}, <br />
              <span className="italic font-light text-brand-accent">{user?.name?.split(' ')[0] || "User"}</span>
            </h1>
          </motion.div>

          <div className="flex gap-3">
             <Link href="/resumes/create">
                <Button className="h-16 px-8 bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold rounded-2xl shadow-xl shadow-brand-accent/20 flex gap-3 transition-all active:scale-95">
                   <Zap className="w-5 h-5 fill-current" /> Optimasi AI Baru
                </Button>
             </Link>
             <Link href="/resumes/master">
                <Button variant="outline" className="h-16 px-8 border-black/5 bg-white/50 hover:bg-white text-clay-900 font-bold rounded-2xl shadow-sm flex gap-3 transition-all active:scale-95">
                   <Database className="w-5 h-5" /> Master CV
                </Button>
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-surface p-8 rounded-[32px] border border-black/5 relative overflow-hidden group hover:border-brand-accent/20 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Zap className="w-20 h-20 text-brand-accent" />
            </div>
            <p className="text-[10px] font-bold text-clay-500 uppercase tracking-[0.2em] mb-4">Neural Credits</p>
            <p className="text-4xl font-serif font-bold text-clay-900 mb-2">{stats?.credits || 0}</p>
            <p className="text-xs text-clay-500 font-medium">Tersedia untuk analisa AI</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-brand-surface p-8 rounded-[32px] border border-black/5 relative overflow-hidden group hover:border-brand-accent/20 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Database className="w-20 h-20 text-brand-accent" />
            </div>
            <p className="text-[10px] font-bold text-clay-500 uppercase tracking-[0.2em] mb-4">Master Blueprint</p>
            <p className="text-4xl font-serif font-bold text-clay-900 mb-2">{stats?.masterCount || 0}</p>
            <p className="text-xs text-clay-500 font-medium">Basis data karir utama</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-brand-surface p-8 rounded-[32px] border border-black/5 relative overflow-hidden group hover:border-brand-accent/20 transition-colors"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
               <Sparkles className="w-20 h-20 text-brand-accent" />
            </div>
            <p className="text-[10px] font-bold text-clay-500 uppercase tracking-[0.2em] mb-4">Optimized CVs</p>
            <p className="text-4xl font-serif font-bold text-clay-900 mb-2">{stats?.optimizedCount || 0}</p>
            <p className="text-xs text-clay-500 font-medium">CV siap melamar kerja</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-brand-accent p-8 rounded-[32px] shadow-2xl shadow-brand-accent/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-20">
               <TrendingUp className="w-20 h-20 text-brand-white" />
            </div>
            <p className="text-[10px] font-bold text-brand-white/60 uppercase tracking-[0.2em] mb-4">Success Rate</p>
            <p className="text-4xl font-serif font-bold text-brand-white mb-2">92%</p>
            <p className="text-xs text-brand-white/60 font-medium">Peningkatan invite interview</p>
          </motion.div>
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="font-serif text-2xl font-bold text-clay-900">Aktifitas Terakhir</h3>
                 <Link href="/resumes" className="text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline">Lihat Semua</Link>
              </div>
              
              {resumes.length > 0 ? (
                 <div className="space-y-4">
                    {resumes.map((resume, i) => (
                       <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={resume.id} 
                          className="bg-brand-surface rounded-2xl border border-black/5 p-6 flex items-center justify-between group hover:border-brand-accent/20 transition-all hover:bg-white"
                       >
                          <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${resume.type === 'master' ? 'bg-brand-accent/10' : 'bg-brand-accentLight/10'}`}>
                                {resume.type === 'master' ? <Database className="w-6 h-6 text-brand-accent" /> : <Sparkles className="w-6 h-6 text-brand-accentLight" />}
                             </div>
                             <div>
                                <h4 className="font-bold text-clay-900 group-hover:text-brand-accent transition-colors">{resume.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-clay-400">{resume.type === 'master' ? 'Blueprint Project' : 'AI Optimization'}</span>
                                   <div className="w-1 h-1 rounded-full bg-clay-200" />
                                   <span className="text-[10px] font-bold uppercase tracking-widest text-clay-400">{new Date(resume.updatedAt).toLocaleDateString()}</span>
                                </div>
                             </div>
                          </div>
                          <Link href={resume.type === 'master' ? `/resumes/master/${resume.id}` : `/resumes/edit/${resume.id}`}>
                             <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-accent/10 text-clay-400 hover:text-brand-accent transition-all">
                                <ChevronRight className="w-5 h-5" />
                             </Button>
                          </Link>
                       </motion.div>
                    ))}
                 </div>
              ) : (
                <div className="bg-brand-surface rounded-[40px] border border-black/5 p-12 text-center space-y-6">
                   <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-clay-400" />
                   </div>
                   <div>
                      <h4 className="font-serif text-xl font-bold text-clay-900 mb-2">Belum Ada Dokumen</h4>
                      <p className="text-clay-500 font-light max-w-sm mx-auto">Mulai perjalanan karir Anda hari ini dengan membuat Master CV pertama Anda.</p>
                   </div>
                   <Link href="/resumes/create">
                      <Button variant="outline" className="border-brand-accent/20 text-brand-accent hover:bg-brand-accent/5 font-bold rounded-2xl h-12 px-8">Buat Sekarang</Button>
                   </Link>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-clay-900 px-2">Neural Link Pro</h3>
              <div className="bg-clay-900 p-8 rounded-[40px] text-brand-white space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent blur-[80px] opacity-30" />
                 <div className="relative z-10">
                    <Sparkles className="w-10 h-10 text-brand-accent mb-6" />
                    <h4 className="text-2xl font-serif font-bold mb-4 leading-tight">Buka Potensi Penuh Karir Anda</h4>
                    <ul className="space-y-4 mb-8">
                       {[
                         "Analisa ATS Tanpa Batas",
                         "Smart Cover Letter Generator",
                         "Optimasi Gaji Berbasis AI"
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-sm text-brand-white/70 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                            {item}
                         </li>
                       ))}
                    </ul>
                    <Link href="/pricing" className="block">
                       <Button className="w-full h-14 bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold rounded-2xl transition-all active:scale-95 shadow-xl shadow-brand-accent/20">Upgrade Sekarang</Button>
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
