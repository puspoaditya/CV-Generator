"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || "Email atau password salah");
      }
    } catch {
      setError("Kesalahan jaringan. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-mesh relative p-20 flex-col justify-between items-start overflow-hidden border-r border-white/5">
         <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
         
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
              Langkah Kecil Untuk <br /> 
              <span className="text-gradient-primary">Karir Raksasa Anda.</span>
            </motion.h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
               Gunakan kekuatan AI untuk mengoptimalkan setiap langkah aplikasi kerja Anda. Presisi tinggi, hasil instan.
            </p>
         </div>

         <div className="relative z-10 flex gap-8">
            <div className="flex items-center gap-2">
               <ShieldCheck className="w-5 h-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aman & Terenkripsi</span>
            </div>
            <div className="flex items-center gap-2">
               <Zap className="w-5 h-5 text-amber-500 fill-current" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">100% Berbasis AI</span>
            </div>
         </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative bg-black/40">
        <div className="absolute inset-0 bg-mesh opacity-50 md:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-left mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 md:hidden">
               <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Selamat Datang</h1>
            <p className="text-slate-500 font-bold">Masuk ke pusat komando karir Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-xs font-black text-red-500 text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Protocol Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-slate-200 px-6 placeholder:text-slate-600 font-medium"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-1">
                 <Label htmlFor="password" title="Password" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kunci Akses</Label>
                 <a href="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Lupa Kunci?</a>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-slate-200 px-6 font-medium"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 group transition-all active:scale-95" disabled={loading}>
              {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 fill-current group-hover:scale-110 transition-transform" />}
              Inisialisasi Sesi
            </Button>

            <div className="pt-6 text-center border-t border-white/5">
              <p className="text-sm text-slate-500 font-bold">
                Belum terdaftar di platform?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 ml-1 font-black uppercase tracking-tighter">
                  Buat Identitas Baru
                </Link>
              </p>
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
