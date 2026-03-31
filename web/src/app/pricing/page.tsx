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
import { initializePaddle, Paddle } from "@paddle/paddle-js";

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-black/5 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-clay-900 group-hover:text-brand-accent transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-brand-accent" /> : <ChevronDown className="w-5 h-5 text-clay-400" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-clay-600 leading-relaxed font-light">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Pricing() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [paddle, setPaddle] = useState<Paddle>();
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');

  useEffect(() => {
    initializePaddle({ 
      environment: "sandbox", 
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
    }).then((paddleInstance) => {
      if (paddleInstance) setPaddle(paddleInstance);
    });

    const token = localStorage.getItem("token");
    if (token) {
      apiFetch("/auth/me").then(res => res.json()).then(data => setUser(data));
    }
  }, []);

  const priceCredits = process.env.NEXT_PUBLIC_PRICE_IDR_CREDITS_10 || "75000";
  const pricePro = process.env.NEXT_PUBLIC_PRICE_IDR_PRO || "250000";

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    
    if (currency === 'USD') {
      if (!paddle) return;
      
      const priceId = plan === 'pro' 
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ELITE_PRO 
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_DAYA_GEDOR;

      paddle.Checkout.open({
        settings: { displayMode: "overlay", theme: "light", locale: "en" },
        items: [{ priceId: priceId || "", quantity: 1 }],
        customData: { userId: user?.id?.toString() }
      });
      setLoading(null);
    } else {
      // IDR via Midtrans
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
    }
  };

  const plans = [
    {
      id: "free",
      name: currency === 'IDR' ? "Starter" : "Starter",
      description: currency === 'IDR' ? "Untuk eksplorasi awal karir kamu." : "For early career exploration.",
      price: "0",
      features: currency === 'IDR' 
        ? ["1 Base CV", "3 AI Generations", "Ekspor PDF Standard", "Tema Dasar Premium"]
        : ["1 Base CV", "3 AI Generations", "Standard PDF Export", "Premium Base Themes"],
      button: currency === 'IDR' ? "Sudah Aktif" : "Already Active",
      disabled: true,
      popular: false
    },
    {
      id: "credits_10",
      name: currency === 'IDR' ? "Daya Gedor" : "Striking Impact",
      description: currency === 'IDR' ? "Amunisi tambahan untuk lamaran aktif." : "Extra ammunition for active job search.",
      price: priceCredits,
      features: currency === 'IDR' 
        ? ["10 AI Generations", "ATS-Friendly PDFs", "Logika Surat Lamaran", "Email Support 24h"]
        : ["10 AI Generations", "ATS-Friendly PDFs", "Cover Letter Logic", "24h Email Support"],
      button: currency === 'IDR' ? "Beli Amunisi" : "Get Ammunition",
      disabled: false,
      popular: true
    },
    {
      id: "pro",
      name: currency === 'IDR' ? "Elite Pro" : "Elite Pro",
      description: currency === 'IDR' ? "Kuasai bursa kerja secara mutlak." : "Dominate the job market completely.",
      price: pricePro,
      period: currency === 'IDR' ? "Sekali Bayar" : "One-time Payment",
      features: currency === 'IDR' 
        ? ["Unlimited Base CVs", "AI Tanpa Batas", "Design Premium Navy", "Persiapan Wawancara AI", "Lifetime Access"]
        : ["Unlimited Base CVs", "Unlimited AI", "Premium Navy Design", "AI Interview Prep", "Lifetime Access"],
      button: currency === 'IDR' ? "Aktivasi Akses" : "Activate Access",
      disabled: false,
      popular: false
    }
  ];

  const faqs = currency === 'IDR' ? [
    { question: "Bagaimana sistem kredit bekerja?", answer: "Satu kredit digunakan untuk satu kali pembuatan (generation) CV, Surat Lamaran, atau Persiapan Wawancara. Kredit tidak akan kadaluwarsa selama akun Anda aktif." },
    { question: "Metode pembayaran apa saja yang tersedia?", answer: "Kami mendukung QRIS (OVO, GoPay, ShopeePay), Transfer Bank (Virtual Account), dan Kartu Kredit melalui gateway Midtrans yang aman." },
    { question: "Apakah ada biaya bulanan?", answer: "Tidak. CVCraft menggunakan sistem sekali bayar atau top-up kredit. Tidak ada biaya berlangganan tersembunyi." },
    { question: "Bisa saya refund jika tidak puas?", answer: "Tentu. Kami memberikan garansi uang kembali 100% dalam 7 hari jika Anda belum menggunakan lebih dari 2 kredit dan merasa layanan kami tidak membantu." }
  ] : [
    { question: "How does the credit system work?", answer: "One credit is used for one AI generation of a CV, Cover Letter, or Interview Prep. Credits do not expire as long as your account is active." },
    { question: "What payment methods are available?", answer: "We support Credit Cards, PayPal, and local transfers through Paddle (Global) and Midtrans (Indonesia)." },
    { question: "Is there a monthly fee?", answer: "No. CVCraft uses a one-time payment or credit top-up system. There are no hidden subscription fees." },
    { question: "Can I get a refund?", answer: "Yes. We offer a 100% money-back guarantee within 7 days if you've used fewer than 2 credits and find our service unhelpful." }
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 font-sans selection:bg-brand-accent/20">
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 backdrop-blur-xl bg-white/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group text-clay-500 hover:text-clay-900 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="font-serif font-bold text-2xl tracking-tight text-clay-900">
            CV<span className="italic font-light text-brand-accent">Craft</span>
          </div>
          <div className="w-20 md:w-40" />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32">
        <header className="text-center mb-16 relative">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-brand-accent text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Pricing Strategy</h2>
              <h1 className="font-serif text-6xl md:text-7xl font-bold text-clay-900 tracking-tight mb-8">
                {currency === 'IDR' ? 'Investasi Karir' : 'Unlimited Career'} <br /> <span className="italic font-light text-brand-accent">{currency === 'IDR' ? 'Tanpa Batas.' : 'Investment.'}</span>
              </h1>
              <p className="text-clay-600 text-xl font-light max-w-2xl mx-auto leading-relaxed mb-10">
                {currency === 'IDR' 
                  ? 'Tingkatkan efisiensi pencarian kerja Anda dengan bantuan kecerdasan buatan tingkat tinggi.'
                  : 'Boost your job application efficiency with state-of-the-art artificial intelligence.'
                }
              </p>
              
              <div className="flex justify-center mb-16">
                 <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-black/5 flex gap-1 shadow-sm">
                    <button 
                       onClick={() => setCurrency('IDR')}
                       className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currency === 'IDR' ? 'bg-brand-accent text-brand-white shadow-lg' : 'text-clay-500 hover:text-clay-900'}`}
                    >
                       Lokalan (IDR)
                    </button>
                    <button 
                       onClick={() => setCurrency('USD')}
                       className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${currency === 'USD' ? 'bg-brand-accent text-brand-white shadow-lg' : 'text-clay-500 hover:text-clay-900'}`}
                    >
                       Global (USD)
                    </button>
                 </div>
              </div>
           </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
           {plans.map((p, idx) => {
             const isElite = p.id === 'pro';
             const isAmmo = p.id === 'credits_10';
             return (
               <motion.div 
                 key={p.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: idx * 0.1 }}
                 className={`rounded-[2.5rem] p-10 border border-black/5 flex flex-col relative group overflow-hidden transition-all duration-300 shadow-sm ${
                   isElite ? 'bg-clay-900 text-brand-white border-t-4 border-t-brand-gold' : 
                   isAmmo ? 'bg-white/60 border-t-4 border-t-brand-accent shadow-xl scale-105 z-10' : 
                   'bg-white/40 border-t-4 border-t-brand-surface2'
                 }`}
               >
                  {p.popular && (
                    <div className="absolute top-8 right-8 bg-brand-accent text-brand-white text-[9px] font-bold uppercase px-3 py-1.5 rounded-full tracking-widest shadow-lg">
                       Pilihan Utama
                    </div>
                  )}
  
                  <div className="mb-10">
                     <h3 className={`font-serif text-2xl font-bold uppercase tracking-tight mb-2 ${isElite ? 'text-brand-gold' : 'text-clay-900'}`}>{p.name}</h3>
                     <p className={`font-light text-sm tracking-tight ${isElite ? 'text-brand-white/60' : 'text-clay-500'}`}>{p.description}</p>
                  </div>
  
                  <div className="mb-12">
                     <div className="flex items-baseline gap-2">
                        <span className={`text-[1rem] font-bold uppercase tracking-widest ${isElite ? 'text-brand-white/40' : 'text-clay-400'}`}>{currency}</span>
                        <span className={`text-6xl font-bold font-serif tracking-tighter ${isElite ? 'text-brand-white' : 'text-clay-900'}`}>
                          {currency === 'IDR' 
                            ? Number(p.price).toLocaleString('id-ID')
                            : p.id === 'free' ? '0' : (p.id === 'pro' ? (process.env.NEXT_PUBLIC_PRICE_USD_PRO || '19') : (process.env.NEXT_PUBLIC_PRICE_USD_CREDITS_10 || '5'))
                          }
                        </span>
                     </div>
                     {p.period && <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isElite ? 'text-brand-gold' : 'text-brand-accent'}`}>{p.period}</p>}
                  </div>
  
                  <div className="space-y-5 flex-1 mb-12 border-t border-black/5 pt-8">
                     {p.features.map((f, i) => (
                       <div key={i} className={`flex items-center gap-4 text-sm font-medium ${isElite ? 'text-brand-white/80' : 'text-clay-700'}`}>
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                            isElite ? 'bg-brand-gold/10 border-brand-gold/20' : 'bg-brand-accent/10 border-brand-accent/10'
                          }`}>
                             <Check className={`w-3.5 h-3.5 ${isElite ? 'text-brand-gold' : 'text-brand-accent'}`} />
                          </div>
                          {f}
                       </div>
                     ))}
                  </div>
  
                  <Button 
                     onClick={() => handleCheckout(p.id)}
                     disabled={p.disabled || loading !== null}
                     className={`h-16 rounded-2xl font-bold text-lg transition-all shadow-md active:scale-95 ${
                       isElite ? 'bg-brand-gold hover:bg-white text-clay-900' : 
                       isAmmo ? 'bg-brand-accent hover:bg-brand-accent2 text-white shadow-brand-accent/20' : 
                       'bg-white/80 hover:bg-white text-clay-900 border border-black/5'
                     }`}
                  >
                     {loading === p.id ? <Loader2 className="w-6 h-6 animate-spin" /> : p.button}
                  </Button>
               </motion.div>
             );
           })}
        </div>

        <section className="mb-40">
           <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-bold text-clay-900 tracking-tight uppercase">Detil Perbandingan</h2>
           </div>
           <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-black/5 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                   <thead>
                      <tr className="border-b border-black/5 bg-white/20">
                         <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-clay-500">{currency === 'IDR' ? 'Fitur & Layanan' : 'Features & Services'}</th>
                         <th className="p-8 text-center text-sm font-bold text-clay-900 italic">Starter</th>
                         <th className="p-8 text-center text-sm font-bold text-brand-accent">{currency === 'IDR' ? 'Amunisi' : 'Impact'}</th>
                         <th className="p-8 text-center text-sm font-bold text-brand-gold uppercase italic">Elite Pro</th>
                      </tr>
                   </thead>
                   <tbody className="text-clay-600 font-medium text-sm">
                      {[
                        { name: "Kredit AI", starter: "3", ammo: "10", pro: "Unlimited" },
                        { name: "Base CV", starter: "1", ammo: "Unlimited", pro: "Unlimited" },
                        { name: "Persiapan Interview", starter: "✘", ammo: "✘", pro: "✔" },
                        { name: "Cover Letter Engine", starter: "✔", ammo: "✔", pro: "✔" },
                        { name: "Prioritas Support", starter: "Low", ammo: "High", pro: "Elite" },
                        { name: "Akses Lifetime", starter: "✘", ammo: "✘", pro: "✔" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-black/5 hover:bg-white/20 transition-colors">
                           <td className="p-8 font-bold text-clay-900 uppercase tracking-tight text-xs">{row.name}</td>
                           <td className="p-8 text-center">{row.starter}</td>
                           <td className="p-8 text-center text-brand-accent font-bold">{row.ammo}</td>
                           <td className="p-8 text-center text-brand-gold font-bold">{row.pro}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-20 items-start mb-40">
           <div className="space-y-10">
              <h2 className="font-serif text-5xl font-bold text-clay-900 tracking-tight leading-none">Pertanyaan <br /> <span className="italic font-light text-brand-accent">Sering Diajukan.</span></h2>
              <div className="flex flex-col gap-2">
                 {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
              </div>
           </div>
           
           <div className="space-y-8">
              <div className="bg-brand-accent rounded-[2.5rem] p-12 border border-black/5 relative overflow-hidden group shadow-2xl">
                 <div className="relative z-10">
                    <Award className="w-14 h-14 text-white/40 mb-8" />
                    <h3 className="font-serif text-2xl font-bold text-white mb-4 tracking-tight uppercase">Jaminan Kepuasan 100%</h3>
                    <p className="text-white/70 font-light leading-relaxed mb-8 text-lg">Kami percaya pada kualitas engine AI kami. Jika Anda tidak puas dengan hasilnya dalam 7 hari pertama, kami kembalikan dana Anda sepenuhnya tanpa banyak tanya.</p>
                    <div className="flex items-center gap-4 text-white font-bold uppercase tracking-widest text-xs">
                       <RefreshCcw className="w-4 h-4" /> Garansi Uang Kembali
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="bg-white/40 rounded-[2rem] p-8 border border-black/5 flex flex-col items-center text-center shadow-sm">
                    <Lock className="w-8 h-8 text-clay-400 mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-clay-500 leading-tight">SSL SECURE SERVER</span>
                 </div>
                 <div className="bg-white/40 rounded-[2rem] p-8 border border-black/5 flex flex-col items-center text-center shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-clay-500 leading-tight">MIDTRANS PROTECTED</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           {["QRIS", "GOPAY", "OVO", "SHOPEEPAY", "VISA", "MASTERCARD"].map(brand => (
             <span key={brand} className="text-lg font-bold tracking-widest text-clay-900 italic">{brand}</span>
           ))}
        </div>
      </main>

      <footer className="py-20 border-t border-black/5 text-center px-6">
         <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-clay-400">CVCraft Pulse Core v2.4 Engine</p>
         <div className="mt-8 flex justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-clay-500">
            <a href="#" className="hover:text-clay-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-clay-900 transition-colors">Terms of Action</a>
            <a href="#" className="hover:text-clay-900 transition-colors">Neural Hub Support</a>
         </div>
      </footer>
    </div>
  );
}
