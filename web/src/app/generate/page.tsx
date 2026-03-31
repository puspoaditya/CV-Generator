"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  ArrowLeft, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  Upload, 
  Download,
  Zap,
  Layout,
  MessageSquare,
  Search,
  ChevronRight,
  Terminal,
  AlertCircle,
  Building,
  Briefcase,
  Database,
  ArrowDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Generate() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);
  const [baseResumes, setBaseResumes] = useState<any[]>([]);
  
  // Selection State
  const [selectedResumeId, setSelectedResumeId] = useState("");
  
  // Job Criteria State
  const [jobPosition, setJobPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobQuals, setJobQuals] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [activeAIAction, setActiveAIAction] = useState("resume");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsGuest(false);
      fetchResumes();
    } else {
      // If guest, redirect back to home or show limited message?
      // User requested that generation is specifically for optimized CV from master CV.
      // So guests cannot use this page as they have no master CV.
      toast.error("Silakan masuk untuk akses fitur rekayasa CV.");
      router.push("/login?redirect=/generate");
    }
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await apiFetch("/resumes?type=master");
      if (res.ok) {
        const data = await res.json();
        setBaseResumes(data);
        if (data.length > 0) setSelectedResumeId(String(data[0].id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCV = async () => {
    if (!form.title || !form.content) {
      toast.error("Judul dan Konten wajib diisi.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch("/resumes", {
        method: "POST",
        body: JSON.stringify({ ...form, source: "manual" }),
      });
      if (res.ok) {
        setIsAdding(false);
        setForm({ title: "", content: "" });
        await fetchResumes();
        toast.success("Master CV berhasil disimpan.");
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Gagal menyimpan resume.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId) {
      setErrorMessage("Silakan pilih CV Master dari database.");
      return;
    }
    if (!jobPosition) {
      setErrorMessage("Posisi Pekerjaan wajib diisi.");
      return;
    }

    setLoading(true);
    setResult("");
    setErrorMessage("");

    try {
      const res = await apiFetch(`/generate/${activeAIAction}`, {
        method: "POST",
        body: JSON.stringify({
          masterResumeId: parseInt(selectedResumeId),
          targetRole: jobPosition,
          targetCompany: companyName,
          jobDescription: `${jobDesc}\n\nQualifications: ${jobQuals}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.content || JSON.stringify(data, null, 2));
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setErrorMessage(data.error || "Generasi gagal");
        if (res.status === 403) {
           setTimeout(() => router.push("/pricing"), 2000);
        }
      }
    } catch (err: any) {
      setErrorMessage("Kesalahan Klien: " + (err.message || "Error tidak diketahui"));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!result) return;
    
    setLoading(true);
    toast.info("Sedang merekayasa PDF Premium...");

    try {
      const res = await apiFetch("/generate/export-pdf", {
        method: "POST",
        body: JSON.stringify({ content: result }),
      });

      if (!res.ok) throw new Error("Gagal mengunduh PDF.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CVCraft_${activeAIAction}_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("PDF Premium berhasil diunduh!");
    } catch (err: any) {
      toast.error(err.message || "Ekspor PDF Gagal.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-brand-bg text-clay-900 font-sans selection:bg-brand-accent/20 cursor-default pb-20">
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 backdrop-blur-xl bg-white/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 group text-clay-500 hover:text-clay-900 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-6">
             <div className="p-1 px-4 rounded-full bg-brand-accent/5 border border-brand-accent/10 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                Vault Status: {baseResumes.length} Master Profil
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-32 space-y-10">
        <header className="text-center relative">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white/40 rounded-full border border-black/5">
                 <Sparkles className="w-3 h-3 text-brand-accent animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">AI Optimazion Engine v2.0</span>
              </div>
              <h1 className="font-serif text-5xl md:text-7xl font-bold text-clay-900 tracking-tight leading-tight mb-6">
                 Rekayasa <span className="italic font-light text-brand-accent underline decoration-brand-gold/30">CV Optimize</span>
              </h1>
              <p className="text-clay-600 text-lg font-light max-w-xl mx-auto leading-relaxed">
                Asisten AI akan membedah CV Master pilihan Anda dan menyusun ulang strateginya agar 100% relevan dengan kriteria pekerjaan target.
              </p>
           </motion.div>
        </header>

        {/* SECTION 1: MASTER CV SELECTION */}
        <section className="space-y-8">
           <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-black/5 flex-1" />
              <div className="flex items-center gap-3 px-6 py-2 bg-brand-accent/5 rounded-full border border-brand-accent/5">
                 <Database className="w-4 h-4 text-brand-accent" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">01. PILIH SUMBER MASTER</span>
              </div>
              <div className="h-px bg-black/5 flex-1" />
           </div>

           <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 shadow-sm max-w-2xl mx-auto space-y-4">
              {baseResumes.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                   <p className="text-clay-500 font-light italic">Belum ada CV Master yang tersedia di hub memori Anda.</p>
                   <Link href="/resumes?type=master">
                      <Button className="bg-brand-accent hover:bg-brand-accent2 text-white font-bold h-10 px-6 rounded-xl text-[10px] uppercase tracking-widest">Manajemen Master CV</Button>
                   </Link>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="flex items-center justify-between px-1">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Pilih Core Profil</Label>
                   </div>
                   <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                     <SelectTrigger className="h-16 bg-white border-black/5 rounded-2xl focus:ring-brand-accent px-8 text-clay-900 font-bold shadow-soft text-base">
                       <SelectValue placeholder="Pilih resume master..." />
                     </SelectTrigger>
                     <SelectContent className="bg-white/95 backdrop-blur-xl border-black/5 rounded-2xl shadow-xl overflow-hidden">
                        {baseResumes.map((r) => (
                           <SelectItem key={r.id} value={String(r.id)} className="focus:bg-brand-accent focus:text-white py-4 px-6 font-bold cursor-pointer transition-colors border-b border-black/5 last:border-0">
                               {r.title}
                           </SelectItem>
                        ))}
                     </SelectContent>
                   </Select>
                </div>
              )}
           </div>
        </section>

         <div className="flex justify-center flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-black/5 to-black/20" />
            <div className="w-7 h-7 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent animate-bounce"><ArrowDown className="w-3 h-3" /></div>
         </div>

        {/* SECTION 2: JOB CRITERIA */}
        <section className="space-y-8">
           <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-black/5 flex-1" />
              <div className="flex items-center gap-3 px-6 py-2 bg-brand-accent/5 rounded-full border border-brand-accent/5">
                 <Terminal className="w-4 h-4 text-brand-accent" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">02. KRITERIA PEKERJAAN TARGET</span>
              </div>
              <div className="h-px bg-black/5 flex-1" />
           </div>

           <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 shadow-sm max-w-4xl mx-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2 px-1"><Briefcase className="w-3.5 h-3.5" /> Posisi Jabatan</Label>
                    <Input 
                       placeholder="Misal: Lead Product Designer" 
                       className="h-16 bg-white/80 border-black/5 rounded-2xl px-6 focus:ring-brand-accent font-medium shadow-inner text-base placeholder:text-clay-300"
                       value={jobPosition}
                       onChange={(e) => setJobPosition(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2 px-1"><Building className="w-3.5 h-3.5" /> Nama Perusahaan</Label>
                    <Input 
                       placeholder="Misal: SpaceSync Innovation" 
                       className="h-16 bg-white/80 border-black/5 rounded-2xl px-6 focus:ring-brand-accent font-medium shadow-inner text-base placeholder:text-clay-300"
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2 px-1"><Layout className="w-3.5 h-3.5" /> Deskripsi Peran</Label>
                    <Textarea 
                       placeholder="Ringkasan tugas utama..." 
                       className="min-h-[220px] bg-white/80 border-black/5 rounded-2xl p-6 text-sm focus:ring-brand-accent placeholder:text-clay-300 shadow-inner leading-relaxed"
                       value={jobDesc}
                       onChange={(e) => setJobDesc(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2 px-1"><CheckCircle2 className="w-3.5 h-3.5" /> Kualifikasi Utama</Label>
                    <Textarea 
                       placeholder="Persyaratan teknis & pengalaman..." 
                       className="min-h-[220px] bg-white/80 border-black/5 rounded-2xl p-6 text-sm focus:ring-brand-accent placeholder:text-clay-300 shadow-inner leading-relaxed"
                       value={jobQuals}
                       onChange={(e) => setJobQuals(e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* ACTION SELECTOR */}
        <section className="flex flex-col items-center gap-10">
           <div className="flex p-1.5 bg-white shadow-inner rounded-[2.5rem] border border-black/5 w-full max-w-xl">
              {[
                { id: "resume", label: "OPTIMIZE CV", icon: Layout },
                { id: "cover-letter", label: "COVER LETTER", icon: MessageSquare },
                { id: "interview-prep", label: "INTERVIEW PREP", icon: Search },
              ].map(tab => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveAIAction(tab.id)}
                   className={`flex-1 flex flex-col items-center gap-2 py-6 rounded-[2rem] transition-all relative ${activeAIAction === tab.id ? 'bg-brand-accent text-white shadow-2xl scale-[1.02]' : 'text-clay-400 hover:text-clay-600'}`}
                 >
                    <tab.icon className={`w-5 h-5 ${activeAIAction === tab.id ? 'text-white' : 'text-clay-200'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
                 </button>
              ))}
           </div>

           <AnimatePresence>
              {errorMessage && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-red-50 border border-red-100 p-6 flex items-center gap-4 text-red-600 shadow-sm max-w-xl w-full">
                   <AlertCircle className="w-6 h-6 shrink-0" />
                   <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">{errorMessage}</p>
                </motion.div>
              )}
           </AnimatePresence>

           <Button onClick={handleGenerate} disabled={loading} className="w-full max-w-xl h-24 bg-brand-accent hover:bg-brand-accent2 text-white rounded-[2rem] shadow-2xl shadow-brand-accent/20 transition-all active:scale-95 group overflow-hidden">
              <div className="flex items-center gap-6 relative z-10">
                 {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Zap className="w-8 h-8 fill-brand-gold text-brand-gold" />}
                 <span className="text-2xl font-bold uppercase tracking-widest">
                    {loading ? " TRANSMITTING..." : `EKSEKUSI REKAYASA`}
                 </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
           </Button>
        </section>

        {/* RESULTS */}
        <section id="result-section" className="pt-20">
           {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/40 backdrop-blur-md rounded-[3rem] p-16 flex flex-col items-center justify-center text-center border border-black/5 shadow-sm min-h-[500px] max-w-4xl mx-auto">
                 <div className="relative mb-8 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-[3px] border-brand-accent/5 border-t-brand-accent animate-spin" />
                    <Sparkles className="absolute w-10 h-10 text-brand-accent animate-pulse" />
                 </div>
                 <h3 className="font-serif text-3xl font-bold text-clay-900 mb-6 italic tracking-tight">Menyusun Ulang Strategi Profesional...</h3>
                 <p className="text-clay-500 max-w-sm mx-auto font-light leading-relaxed">Algoritma kami sedang memetakan pengalaman Anda dengan kriteria pekerjaan target untuk menghasilkan dokumen yang paling relevan.</p>
              </motion.div>
           ) : result && (
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-xl rounded-[3rem] border border-black/5 overflow-hidden shadow-2xl max-w-4xl mx-auto flex flex-col min-h-[800px]">
                 <div className="px-10 py-10 border-b border-black/5 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/40">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[1.5rem] bg-brand-accent/10 flex items-center justify-center shadow-soft"><Terminal className="w-8 h-8 text-brand-accent" /></div>
                       <div>
                          <h3 className="font-serif text-2xl font-bold text-clay-900 uppercase tracking-tight italic">TRANSMISI SELESAI</h3>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.3em] mt-1 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> KUALITAS OPTIMUM TERVERIFIKASI</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <Button size="lg" onClick={downloadPDF} className="h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 font-bold uppercase tracking-widest text-xs transition-all active:scale-95">
                          <Download className="w-5 h-5 mr-3" /> PDF PREMIUM
                       </Button>
                       <Button variant="ghost" size="lg" onClick={copyToClipboard} className="h-16 px-8 rounded-2xl text-clay-400 hover:text-clay-900 hover:bg-black/5 font-bold uppercase tracking-widest text-xs transition-colors">
                          {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                       </Button>
                    </div>
                 </div>

                 <div className="flex-1 p-10 md:p-16 bg-white/40">
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="font-serif text-5xl font-bold text-clay-900 mb-10 border-b-2 border-brand-accent/20 pb-6 tracking-tight" {...props} />,
                          h2: ({node, ...props}) => <h2 className="font-serif text-3xl font-bold text-clay-900 mt-14 mb-8 flex items-center gap-4 group" {...props}>
                            <div className="w-1.5 h-8 bg-brand-accent rounded-full transition-transform group-hover:scale-y-110" />
                            {props.children}
                          </h2>,
                          h3: ({node, ...props}) => <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500 mt-10 mb-4 bg-clay-50 inline-block px-4 py-2 rounded-xl border border-clay-200/50" {...props} />,
                          p: ({node, ...props}) => <p className="text-lg text-clay-700 font-light leading-relaxed mb-8" {...props} />,
                          li: ({node, ...props}) => <li className="flex gap-4 mb-5 text-clay-600 font-light text-base leading-relaxed items-start group" {...props}>
                            <div className="w-2 h-2 mt-2.5 rounded-full bg-emerald-500/40 border border-emerald-500 shrink-0 group-hover:bg-emerald-500 transition-colors shadow-glow" />
                            <div>{props.children}</div>
                          </li>,
                          ul: ({node, ...props}) => <ul className="my-8 space-y-2" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-clay-900 bg-brand-gold/5 px-2 py-0.5 rounded-lg border-b-2 border-brand-gold/20" {...props} />,
                          hr: () => <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent my-16" />
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                 </div>
              </motion.div>
           )}
        </section>
      </div>

    </main>
  );
}
