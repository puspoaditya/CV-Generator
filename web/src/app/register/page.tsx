"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Sparkles, UserPlus, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Pendaftaran gagal");
      }
    } catch {
      setError("Kesalahan jaringan. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-mesh relative p-20 flex-col justify-between items-start overflow-hidden border-r border-white/5">
         <div className="absolute bottom-0 right-0 w-full h-full bg-primary/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
         
         <Link href="/" className="flex items-center gap-2 group relative z-10">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">HireReady<span className="text-primary">.ai</span></span>
         </Link>

         <div className="relative z-10 max-w-lg">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-6xl font-black text-white leading-tight tracking-tighter mb-8"
            >
              Bergabung Dengan <br /> 
              <span className="text-gradient-primary">Elite Karir Global.</span>
            </motion.h2>
            <div className="space-y-6 mt-12">
               {[
                 "Pembuatan CV Otomatis 10x Lebih Cepat",
                 "Optimasi Kata Kunci ATS Real-time",
                 "Akses ke Ribuan Insight Wawancara AI"
               ].map((text, i) => (
                 <div key={i} className="flex items-center gap-3 text-slate-400 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span>{text}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 p-8 glass-dark rounded-3xl border border-white/5 max-w-sm">
            <p className="text-slate-300 font-bold italic mb-4">"HireReady membantu saya mendapatkan tawaran dari 3 perusahaan top dalam satu bulan."</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/10">JD</div>
               <div>
                  <p className="text-sm font-black text-white">James Doe</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sr. Backend Engineer</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative bg-black/40">
        <div className="absolute inset-0 bg-mesh opacity-50 md:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-left mb-10">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 md:hidden">
               <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Buat Akun Baru</h1>
            <p className="text-slate-500 font-bold">Mulai kembangkan potensi karir Anda hari ini.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-xs font-black text-red-500 text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="John Doe"
                required
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-slate-200 px-6 font-medium"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Profesional</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@perusahaan.com"
                required
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-slate-200 px-6 font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Kunci Akses</Label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Minimal 8 karakter"
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-slate-200 px-6 font-medium"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex gap-1 mt-2">
                 {[1,2,3,4].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${form.password.length > i*2 ? 'bg-primary' : 'bg-white/10'}`} />)}
              </div>
            </div>

            <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 group transition-all active:scale-95 mt-4" disabled={loading}>
              {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />}
              Daftar Sekarang
            </Button>

            <div className="pt-6 text-center border-t border-white/5 text-sm text-slate-500 font-bold">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 ml-1 font-black uppercase tracking-tighter transition-colors">
                Masuk Disini
              </Link>
            </div>
          </form>
        </motion.div>
      </div>

      <footer className="absolute bottom-6 left-6 right-6 md:left-auto md:right-20 pointer-events-none md:pointer-events-auto">
         <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] text-center md:text-right">HireReady.ai v2.4 Pulse Engine</p>
      </footer>
    </main>
  );
}
