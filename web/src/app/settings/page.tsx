"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, User, Mail, ShieldCheck, Zap, LogOut, Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/auth/me");
        if (res.ok) setUser(await res.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 font-sans p-6 md:p-12">
      <Link href="/dashboard">
        <Button variant="ghost" className="mb-12 font-bold uppercase tracking-widest text-xs text-clay-500 hover:text-clay-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </Button>
      </Link>

      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <h1 className="font-serif text-5xl font-bold tracking-tight mb-4">Pengaturan <span className="italic font-light text-brand-accent">Sistem.</span></h1>
          <p className="text-clay-600 font-light text-lg italic">Hub konfigurasi identitas dan otorisasi Anda.</p>
        </header>

        <div className="space-y-6">
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-black/5 shadow-sm">
             <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-3xl bg-brand-accent flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-brand-accent/20">
                  {user?.name?.[0].toUpperCase()}
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-clay-900 mb-1">{user?.name}</h2>
                   <p className="text-clay-500 font-medium flex items-center gap-2">
                     {user?.isPro ? <span className="text-brand-accent flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Professional Tier</span> : <span className="text-clay-400">Regular Member</span>}
                   </p>
                </div>
             </div>

             <div className="grid gap-6 border-t border-black/5 pt-10">
                <div className="flex items-center justify-between p-6 bg-white/40 rounded-2xl border border-black/5 transition-all hover:bg-white/60">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-clay-100 flex items-center justify-center text-clay-500"><Mail className="w-5 h-5" /></div>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Alamat Email</p>
                         <p className="font-bold text-clay-900">{user?.email}</p>
                      </div>
                   </div>
                   <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Ubah</Button>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/40 rounded-2xl border border-black/5 transition-all hover:bg-white/60">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-clay-100 flex items-center justify-center text-brand-accent"><Zap className="w-5 h-5" /></div>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Status Kredit</p>
                         <p className="font-bold text-clay-900">{user?.credits} Token Tersisa</p>
                      </div>
                   </div>
                   <Link href="/pricing">
                      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Top Up</Button>
                   </Link>
                </div>
             </div>
          </div>

          <Button onClick={handleLogout} className="w-full h-16 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all flex gap-3">
             <LogOut className="w-5 h-5" /> Keluar dari Sesi
          </Button>
        </div>
        
        <footer className="mt-20 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.5em] text-clay-400">
           CVCraft Secure Node // Version 2.4-Alpha
        </footer>
      </div>
    </div>
  );
}
