"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Check, 
  Zap, 
  Globe, 
  MapPin, 
  CreditCard, 
  ArrowLeft,
  ShieldCheck,
  Rocket,
  Minus,
  Plus,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
  RefreshCcw,
  Sparkles,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-white group-hover:text-primary transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-slate-400 leading-relaxed font-medium">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Pricing() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const priceCredits = process.env.NEXT_PUBLIC_PRICE_IDR_CREDITS_10 || "75000";
  const pricePro = process.env.NEXT_PUBLIC_PRICE_IDR_PRO || "250000";

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await apiFetch("/payments/checkout/midtrans", {
        method: "POST",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.token) {
        const isProd = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
        const snapUrl = isProd 
          ? "https://app.midtrans.com/snap/snap.js" 
          : "https://app.sandbox.midtrans.com/snap/snap.js";

        const startPayment = () => {
          (window as any).snap.pay(data.token, {
            onSuccess: (result: any) => { router.push("/dashboard?status=success"); },
            onPending: (result: any) => { alert("Pembayaran tertunda..."); },
            onError: (result: any) => { alert("Pembayaran gagal!"); },
            onClose: () => { setLoading(null); }
          });
        };

        if (!(window as any).snap) {
          const script = document.createElement("script");
          script.src = snapUrl;
          script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "");
          script.onload = startPayment;
          document.body.appendChild(script);
        } else {
          startPayment();
        }
      } else {
        alert(data.error || "Checkout gagal");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Silakan coba lagi.");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Starter",
      description: "Untuk eksplorasi awal",
      price: "0",
      features: ["1 Base CV", "3 AI Generations", "Ekspor PDF Standard", "Tema Gelap Premium"],
      button: "Sudah Aktif",
      disabled: true,
      popular: false,
      color: "border-white/10"
    },
    {
      id: "credits_10",
      name: "Daya Gedor",
      description: "Amunisi tambahan lamaran",
      price: priceCredits,
      features: ["10 AI Generations", "ATS-Friendly PDFs", "Logika Surat Lamaran", "Email Support 24h"],
      button: "Beli Amunisi",
      disabled: false,
      popular: false,
      color: "border-indigo-500/20"
    },
    {
      id: "pro",
      name: "Elite Pro",
      description: "Kuasai bursa kerja mutlak",
      price: pricePro,
      period: "Sekali Bayar",
      features: ["Unlimited Base CVs", "AI Tanpa Batas", "Design Premium Navy", "Persiapan Wawancara AI", "Lifetime Access"],
      button: "Aktivasi Akses",
      disabled: false,
      popular: true,
      color: "border-primary/40 shadow-[0_40px_80px_-20px_rgba(139,92,246,0.3)]"
    }
  ];

  const faqs = [
    { question: "Bagaimana sistem kredit bekerja?", answer: "Satu kredit digunakan untuk satu kali pembuatan (generation) CV, Surat Lamaran, atau Persiapan Wawancara. Kredit tidak akan kadaluwarsa selama akun Anda aktif." },
    { question: "Metode pembayaran apa saja yang tersedia?", answer: "Kami mendukung QRIS (OVO, GoPay, ShopeePay), Transfer Bank (Virtual Account), dan Kartu Kredit melalui gateway Midtrans yang aman." },
    { question: "Apakah ada biaya bulanan?", answer: "Tidak. HireReady menggunakan sistem sekali bayar atau top-up kredit. Tidak ada biaya berlangganan tersembunyi." },
    { question: "Bisa saya refund jika tidak puas?", answer: "Tentu. Kami memberikan garansi uang kembali 100% dalam 7 hari jika Anda belum menggunakan lebih dari 2 kredit dan merasa layanan kami tidak membantu." }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 bg-mesh selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-black text-xs uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white hidden md:block">HireReady<span className="text-primary">.ai</span></span>
          </div>
          <div className="w-20 md:w-40" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <header className="text-center mb-24 relative">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">Pricing Strategy</h2>
              <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 italic">Investasi Karir <br /> <span className="text-gradient-primary">Tanpa Batas.</span></h1>
              <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Tingkatkan efisiensi pencarian kerja Anda dengan bantuan kecerdasan buatan tingkat tinggi.</p>
           </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
           {plans.map((p, idx) => (
             <motion.div 
               key={p.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className={`glass-dark rounded-[3rem] p-10 border-2 ${p.color} flex flex-col relative group overflow-hidden`}
             >
                {p.popular && (
                  <div className="absolute top-8 right-8 bg-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                     Pilihan Utama
                  </div>
                )}

                <div className="mb-10">
                   <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{p.name}</h3>
                   <p className="text-slate-500 font-bold text-sm tracking-tight">{p.description}</p>
                </div>

                <div className="mb-12">
                   <div className="flex items-baseline gap-2">
                      <span className="text-slate-400 text-lg font-black tracking-widest uppercase">IDR</span>
                      <span className="text-6xl font-black text-white tracking-tighter">{Number(p.price).toLocaleString('id-ID')}</span>
                   </div>
                   {p.period && <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2">{p.period}</p>}
                </div>

                <div className="space-y-5 flex-1 mb-12">
                   {p.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-4 text-sm font-bold text-slate-300">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                           <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        {f}
                     </div>
                   ))}
                </div>

                <Button 
                   onClick={() => handleCheckout(p.id)}
                   disabled={p.disabled || loading !== null}
                   className={`h-16 rounded-[1.5rem] font-black text-lg transition-all ${p.popular ? 'bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
                >
                   {loading === p.id ? <Loader2 className="w-6 h-6 animate-spin" /> : p.button}
                </Button>

                {!p.disabled && process.env.NODE_ENV === "development" && (
                   <button 
                     onClick={async () => {
                       setLoading(p.id);
                       try {
                         const res = await apiFetch("/payments/checkout/midtrans", {
                           method: "POST",
                           body: JSON.stringify({ plan: p.id }),
                         });
                         const data = await res.json();
                         if (data.token) {
                           await apiFetch("/payments/bypass-success", {
                               method: "POST",
                               body: JSON.stringify({ orderId: data.orderId }),
                           });
                           router.push("/dashboard?status=success");
                         }
                       } catch (e) { console.error(e); }
                       finally { setLoading(null); }
                     }}
                     className="mt-4 text-[9px] font-black text-primary/30 hover:text-primary transition-colors uppercase tracking-[0.3em]"
                   >
                     Test Mode: Bypass Payment
                   </button>
                )}
             </motion.div>
           ))}
        </div>

        {/* Feature Comparison Table */}
        <section className="mb-40">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase tracking-[0.1em]">Detil Perbandingan</h2>
           </div>
           <div className="glass-dark rounded-[3rem] border border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                       <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Fitur & Layanan</th>
                       <th className="p-8 text-center text-sm font-black text-white italic">Starter</th>
                       <th className="p-8 text-center text-sm font-black text-indigo-400">Amunisi</th>
                       <th className="p-8 text-center text-sm font-black text-primary uppercase italic">Elite Pro</th>
                    </tr>
                 </thead>
                 <tbody className="text-slate-400 font-bold text-sm">
                    {[
                      { name: "Kredit AI", starter: "3", ammo: "10", pro: "Unlimited" },
                      { name: "Base CV", starter: "1", ammo: "Unlimited", pro: "Unlimited" },
                      { name: "Persiapan Interview", starter: "✘", ammo: "✘", pro: "✔" },
                      { name: "Cover Letter Engine", starter: "✔", ammo: "✔", pro: "✔" },
                      { name: "Prioritas Support", starter: "Low", ammo: "High", pro: "Elite" },
                      { name: "Akses Lifetime", starter: "✘", ammo: "✘", pro: "✔" },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                         <td className="p-8 font-black text-white uppercase tracking-tighter text-xs">{row.name}</td>
                         <td className="p-8 text-center">{row.starter}</td>
                         <td className="p-8 text-center text-indigo-200">{row.ammo}</td>
                         <td className="p-8 text-center text-primary font-black">{row.pro}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        {/* FAQ & Support */}
        <div className="grid lg:grid-cols-2 gap-20 items-start mb-40">
           <div className="space-y-10">
              <h2 className="text-5xl font-black text-white tracking-tighter">Pertanyaan <br /> <span className="text-primary italic">Sering Diajukan.</span></h2>
              <div className="flex flex-col gap-2">
                 {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="glass-accent rounded-[3rem] p-12 border border-primary/20 relative overflow-hidden group">
                 <div className="relative z-10">
                    <Award className="w-14 h-14 text-primary mb-8" />
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase">Jaminan Kepuasan 100%</h3>
                    <p className="text-indigo-200/60 font-medium leading-relaxed mb-8">Kami percaya pada kualitas engine AI kami. Jika Anda tidak puas dengan hasilnya dalam 7 hari pertama, kami kembalikan dana Anda sepenuhnya tanpa banyak tanya.</p>
                    <div className="flex items-center gap-4 text-primary font-black uppercase tracking-widest text-xs">
                       <RefreshCcw className="w-4 h-4" /> Garansi Uang Kembali
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center text-center">
                    <Lock className="w-8 h-8 text-slate-500 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 leading-tight">SSL SECURE SERVER</span>
                 </div>
                 <div className="glass-dark rounded-[2.5rem] p-8 border border-white/5 flex flex-col items-center text-center">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 leading-tight">MIDTRANS PROTECTED</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Local payment footer */}
        <div className="flex flex-wrap justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {["QRIS", "GOPAY", "OVO", "SHOPEEPAY", "VISA", "MASTERCARD"].map(brand => (
             <span key={brand} className="text-lg font-black tracking-widest text-white italic">{brand}</span>
           ))}
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center px-6">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">HireReady Impulse Core v2.4 Pulsar Engine</p>
         <div className="mt-8 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Action</a>
            <a href="#" className="hover:text-white">Neural Hub Support</a>
         </div>
      </footer>
    </div>
  );
}
