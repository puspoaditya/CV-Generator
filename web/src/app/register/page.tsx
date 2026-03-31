"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Loader2, Sparkles, UserPlus, ShieldCheck, Zap, CheckCircle2, ArrowRight } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <main className="min-h-screen bg-brand-bg flex flex-col md:flex-row overflow-hidden font-sans selection:bg-brand-accent/20">
      {/* Left Side: Branding */}
      <div className="hidden md:flex md:w-1/2 bg-brand-surface relative p-20 flex-col justify-between items-start overflow-hidden border-r border-black/5">
         <div className="absolute bottom-0 right-0 w-full h-full bg-brand-accent/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
         
         <Link href="/" className="flex items-center gap-2 group relative z-10">
            <div className="font-serif font-bold text-2xl tracking-tight text-clay-900">
               CV<span className="italic font-light text-brand-accent">Craft</span>
            </div>
         </Link>

         <div className="relative z-10 max-w-lg">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-serif text-6xl font-bold text-clay-900 leading-tight tracking-tight mb-8"
            >
               Bergabung Dengan <br /> 
               <span className="italic font-light text-brand-accent">Elite Karir Global.</span>
            </motion.h2>
            <div className="space-y-6 mt-12">
               {[
                 "Pembuatan CV Otomatis 10x Lebih Cepat",
                 "Optimasi Kata Kunci ATS Real-time",
                 "Akses ke Ribuan Insight Wawancara AI"
               ].map((text, i) => (
                 <div key={i} className="flex items-center gap-3 text-clay-600 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-brand-accent" />
                    <span>{text}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="relative z-10 p-8 bg-white/40 backdrop-blur-md rounded-3xl border border-black/5 max-w-sm">
            <p className="text-clay-700 font-medium italic mb-4">"CVCraft membantu saya mendapatkan tawaran dari 3 perusahaan top dalam satu bulan."</p>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center font-bold text-brand-white">JD</div>
               <div>
                  <p className="text-sm font-bold text-clay-900">James Doe</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-clay-500">Sr. Backend Engineer</p>
               </div>
            </div>
         </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-20 relative">
        <div className="absolute inset-0 bg-brand-bg md:hidden" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-left mb-10">
            <div className="w-12 h-12 bg-brand-accent rounded-2xl flex items-center justify-center mb-6 md:hidden">
               <Sparkles className="w-6 h-6 text-brand-white" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-clay-900 tracking-tight mb-3">Identitas Baru</h1>
            <p className="text-clay-600 font-light">Mulai babak baru perjalanan profesional Anda.</p>
          </div>

          <div className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-xs font-bold text-red-500 text-center uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-clay-500 ml-1">Nama Lengkap</Label>
              <Input
                id="name"
                placeholder="Identitas Anda"
                className="h-14 bg-white/40 border-black/5 rounded-2xl focus:ring-brand-accent text-clay-900 px-6 font-medium backdrop-blur-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-clay-500 ml-1">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@provider.com"
                className="h-14 bg-white/40 border-black/5 rounded-2xl focus:ring-brand-accent text-clay-900 px-6 font-medium backdrop-blur-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Protocol Password" className="text-[10px] font-bold uppercase tracking-widest text-clay-500 ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                className="h-14 bg-white/40 border-black/5 rounded-2xl focus:ring-brand-accent text-clay-900 px-6 font-medium backdrop-blur-sm"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } }}
              />
            </div>

            <Button 
               onClick={() => handleSubmit()}
               className="w-full h-16 bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold text-lg rounded-2xl shadow-xl shadow-brand-accent/20 group transition-all active:scale-95 mt-4" 
               disabled={loading}
            >
              {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <UserPlus className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />}
              Daftar Sekarang
            </Button>

            <div className="flex items-center gap-4 py-2">
               <div className="h-px bg-black/5 flex-1" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Atau Manfaatkan</span>
               <div className="h-px bg-black/5 flex-1" />
            </div>

            <Button 
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full h-16 bg-white border border-black/5 hover:bg-clay-50 text-clay-700 font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Daftar dengan Google
            </Button>

            <div className="pt-6 text-center border-t border-black/5">
              <p className="text-sm text-clay-500 font-medium">
                Sudah punya akses?{" "}
                <Link href="/login" className="text-brand-accent hover:text-brand-accent2 ml-1 font-bold">
                  Kembali Masuk
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="absolute bottom-6 left-6 right-6 md:left-auto md:right-20 pointer-events-none md:pointer-events-auto">
         <p className="text-[10px] text-clay-400 font-bold uppercase tracking-[0.3em] text-center md:text-right">CVCraft Pulse Engine</p>
      </footer>
    </main>
  );
}
