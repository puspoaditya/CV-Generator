"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
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
  LogIn,
  UserPlus,
  ShieldAlert,
  Link as LinkIcon,
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
  
  // Resume State
  const [resumeSource, setResumeSource] = useState<"text" | "linkedin" | "database">("text");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [guestResumeContent, setGuestResumeContent] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsGuest(false);
      fetchResumes();
      setResumeSource("database");
    }
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await apiFetch("/resumes");
      if (res.ok) {
        const data = await res.json();
        setBaseResumes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkedInExtract = async () => {
    if (!linkedinUrl) {
      toast.error("Masukkan URL profil LinkedIn Anda.");
      return;
    }
    setUploading(true);
    try {
      const res = await apiFetch("/generate/extract-linkedin", {
        method: "POST",
        body: JSON.stringify({ url: linkedinUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuestResumeContent(data.content);
        setResumeSource("text");
        toast.success("Data profil LinkedIn berhasil ditarik!");
      } else {
        toast.error("Gagal menarik data LinkedIn. Gunakan metode manual.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    try {
      if (file.type === "application/pdf" || file.type === "text/plain") {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await apiFetch("/resumes/extract", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setGuestResumeContent(data.text);
          setResumeSource("text");
        } else {
          const errorData = await res.json();
          setErrorMessage(errorData.error || "Gagal mengekstrak PDF.");
        }
      } else {
        setErrorMessage("Silakan unggah file PDF atau TXT.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
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
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAdding(false);
        setForm({ title: "", content: "" });
        await fetchResumes();
        toast.success("Resume berhasil disimpan.");
      } else {
        toast.error("Gagal menyimpan resume.");
      }
    } catch (err) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (resumeSource === "text" && !guestResumeContent) {
      setErrorMessage("Silakan masukkan konten resume Anda.");
      return;
    }
    if (resumeSource === "database" && !selectedResumeId) {
      setErrorMessage("Silakan pilih CV Utama dari database.");
      return;
    }
    if (!jobPosition || !jobDesc) {
      setErrorMessage("Posisi dan Deskripsi Pekerjaan wajib diisi.");
      return;
    }

    setLoading(true);
    setResult("");
    setErrorMessage("");

    const combinedJobDetails = `
      POSITION: ${jobPosition}
      COMPANY: ${companyName}
      DESCRIPTION: ${jobDesc}
      QUALIFICATIONS: ${jobQuals}
    `.trim();

    try {
      let res;
      if (isGuest || resumeSource === "text" || resumeSource === "linkedin") {
        res = await apiFetch("/generate/guest", {
          method: "POST",
          body: JSON.stringify({
            resumeContent: guestResumeContent,
            jobDescription: combinedJobDetails,
          }),
        });
      } else {
        res = await apiFetch(`/generate/${activeAIAction}`, {
          method: "POST",
          body: JSON.stringify({
            baseResumeId: parseInt(selectedResumeId),
            jobDescription: combinedJobDetails,
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setResult(data.resume?.content || data.content || JSON.stringify(data, null, 2));
        setTimeout(() => {
          document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else if (res.status === 403) {
        setErrorMessage("Kredit tidak mencukupi.");
        setTimeout(() => router.push("/pricing"), 2000);
      } else {
        setErrorMessage(data.error || "Generasi gagal");
      }
    } catch (err: any) {
      setErrorMessage("Kesalahan Klien: " + (err.message || "Error tidak diketahui"));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (isGuest) {
       setErrorMessage("Silakan daftar untuk mengunduh hasil dalam format PDF premium.");
       return;
    }
    if (!result) return;
    
    setUploading(true);
    toast.info("Sedang merekayasa PDF Premium...");

    try {
      const res = await apiFetch("/generate/export-pdf", {
        method: "POST",
        body: JSON.stringify({ content: result }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh PDF dari server.");
      }

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
      setUploading(false);
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
          <Link href="/" className="flex items-center gap-2 group text-clay-500 hover:text-clay-900 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-xs uppercase tracking-widest">Beranda</span>
          </Link>
          <div className="flex items-center gap-6">
             {isGuest ? (
               <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="ghost" className="text-clay-500 hover:text-clay-900 font-bold text-xs tracking-widest uppercase">MASUK</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold text-xs rounded-xl h-10 px-6 shadow-soft tracking-widest uppercase">DAFTAR</Button>
                  </Link>
               </div>
             ) : (
               <Link href="/dashboard">
                  <Button variant="ghost" className="h-10 text-clay-500 hover:text-clay-900 hover:bg-black/5 font-bold uppercase tracking-widest text-xs transition-colors">
                    <Layout className="w-4 h-4 mr-2" /> Dashboard
                  </Button>
               </Link>
             )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-24 space-y-10">
        <header className="text-center">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-white/40 rounded-full border border-black/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-accent">WORKSPACE AI TRANSMISSION</span>
              </div>
              <h1 className="font-serif text-6xl md:text-7xl font-bold text-clay-900 tracking-tight leading-tight mb-8">
                 Rekayasa <span className="italic font-light text-brand-accent underline decoration-brand-gold/30">Masa Depan</span>
              </h1>
              <p className="text-clay-600 text-xl font-light max-w-2xl mx-auto leading-relaxed">
                Transformasi resume statis Anda menjadi dokumen penakluk HR dengan algoritma prediktif sektor industri global.
              </p>
           </motion.div>
        </header>

        {/* SECTION 1: RESUME DATA SOURCE */}
        <section className="space-y-8">
           <div className="flex items-center justify-center gap-4">
              <div className="h-px bg-black/5 flex-1" />
              <div className="flex items-center gap-3 px-6 py-2 bg-brand-accent/5 rounded-full border border-brand-accent/5">
                 <FileText className="w-4 h-4 text-brand-accent" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">01. DATA SUMBER RESUME</span>
              </div>
              <div className="h-px bg-black/5 flex-1" />
           </div>

           <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-3 border border-black/5 shadow-sm max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
                 <button onClick={() => setResumeSource("text")} className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.8rem] transition-all ${resumeSource === "text" ? 'bg-brand-accent text-white shadow-xl' : 'text-clay-500 hover:bg-black/5'}`}>
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest">Unggah / Teks</span>
                 </button>
                 <button onClick={() => setResumeSource("linkedin")} className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.8rem] transition-all ${resumeSource === "linkedin" ? 'bg-brand-accent text-white shadow-xl' : 'text-clay-500 hover:bg-black/5'}`}>
                    <LinkIcon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest">Profil LinkedIn</span>
                 </button>
                 <button onClick={() => setResumeSource("database")} className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.8rem] transition-all ${resumeSource === "database" ? 'bg-brand-accent text-white shadow-xl' : 'text-clay-500 hover:bg-black/5'}`}>
                    <Database className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest">Database Saya</span>
                 </button>
              </div>

              <div className="p-6 md:p-8">
                 <AnimatePresence mode="wait">
                    {resumeSource === "text" && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                          <div className="relative group">
                             <Textarea 
                                placeholder="Tempel teks CV Anda atau unggah file di bawah..."
                                className="min-h-[240px] bg-white/60 border-black/5 rounded-[1.8rem] p-8 text-base font-medium focus:ring-brand-accent placeholder:text-clay-300 shadow-inner"
                                value={guestResumeContent}
                                onChange={(e) => setGuestResumeContent(e.target.value)}
                             />
                             <div className="absolute top-6 right-8 text-xs font-bold text-clay-300 uppercase tracking-widest">Kandungan Teks</div>
                          </div>
                          <div className="flex items-center gap-4 p-6 border-2 border-dashed border-black/10 rounded-[1.8rem] bg-white/40 hover:bg-white/60 transition-all relative group shadow-sm">
                             <Upload className="w-6 h-6 text-brand-accent" />
                             <span className="text-xs font-bold text-clay-500 uppercase tracking-widest">Klik atau Tarik File PDF / TXT ke sini</span>
                             <span className="text-xs font-bold uppercase tracking-widest">Klik atau Tarik File PDF / TXT ke sini</span>
                             <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                       </motion.div>
                    )}

                    {resumeSource === "linkedin" && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 py-2">
                          <div className="text-center space-y-3 max-w-sm mx-auto">
                             <div className="w-14 h-14 rounded-2xl bg-[#0077B5]/10 flex items-center justify-center mx-auto mb-4"><LinkIcon className="w-6 h-6 text-[#0077B5]" /></div>
                             <h4 className="font-serif text-2xl font-bold text-clay-900">Impor Otomatis LinkedIn</h4>
                             <p className="text-clay-500 text-sm font-light">Masukkan URL profil publik LinkedIn Anda untuk menarik data profil secara instan.</p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                             <Input 
                                placeholder="linkedin.com/in/username" 
                                className="h-14 bg-white/60 border-black/5 rounded-xl px-6 focus:ring-brand-accent font-medium shadow-soft flex-1"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                             />
                             <Button onClick={handleLinkedInExtract} disabled={uploading} className="h-14 px-8 bg-brand-accent hover:bg-brand-accent2 text-white font-bold rounded-xl shadow-xl shadow-brand-accent/20 transition-all group">
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                <span className="ml-2 uppercase tracking-widest text-[10px]">Tarik Data</span>
                             </Button>
                          </div>
                          <div className="max-w-lg mx-auto p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/10 flex gap-3 items-start">
                             <AlertCircle className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                             <p className="text-xs text-clay-500 leading-relaxed">
                                <span className="font-bold text-brand-accent block mb-0.5 uppercase tracking-widest text-[10px]">Tips Automasi:</span>
                                Jika profil Anda terhalang login-wall, Anda dapat mengunduh PDF profil di LinkedIn dan masukan ke tab <b>Unggah / Teks</b>.
                             </p>
                          </div>
                       </motion.div>
                    )}

                    {resumeSource === "database" && (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 py-2">
                           <div className="flex items-center justify-between mb-1">
                              <Label className="text-xs font-bold uppercase tracking-widest text-clay-400 ml-1">Koleksi Base Resume</Label>
                              {!isGuest && (
                                 <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="text-brand-accent font-bold uppercase tracking-widest text-xs h-auto py-1">
                                    <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Tambah Manual
                                 </Button>
                              )}
                           </div>
                           <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                             <SelectTrigger className="h-14 bg-white/60 border-black/5 rounded-[1.2rem] focus:ring-brand-accent px-6 text-clay-600 font-bold shadow-soft">
                               <SelectValue placeholder="Pilih resume master dari database..." />
                             </SelectTrigger>
                             <SelectContent className="bg-brand-bg/95 backdrop-blur-xl border-black/5 rounded-[1.2rem] shadow-xl">
                               {baseResumes.length === 0 ? (
                                 <SelectItem value="none" disabled className="py-3 px-5 text-clay-400 italic">Database kosong. Mohon unggah resume pertama Anda.</SelectItem>
                               ) : (
                                 baseResumes.map((r) => (
                                   <SelectItem key={r.id} value={String(r.id)} className="focus:bg-brand-accent focus:text-white py-3 px-5 font-bold border-b border-black/5 last:border-0 cursor-pointer text-sm">
                                     {r.title}
                                   </SelectItem>
                                 ))
                               )}
                             </SelectContent>
                           </Select>
                        </motion.div>
                    )}
                 </AnimatePresence>
              </div>
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

           <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 shadow-sm max-w-4xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Posisi Jabatan</Label>
                    <Input 
                       placeholder="Misal: Senior Frontend Engineer" 
                       className="h-14 bg-white/60 border-black/5 rounded-xl px-6 focus:ring-brand-accent font-medium shadow-inner text-base"
                       value={jobPosition}
                       onChange={(e) => setJobPosition(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2"><Building className="w-4 h-4" /> Nama Perusahaan</Label>
                    <Input 
                       placeholder="Misal: TechFlow Global Corp" 
                       className="h-14 bg-white/60 border-black/5 rounded-xl px-6 focus:ring-brand-accent font-medium shadow-inner text-base"
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2"><Layout className="w-4 h-4" /> Deskripsi Utama Pekerjaan</Label>
                    <Textarea 
                       placeholder="Jelaskan peran ini secara umum..." 
                       className="min-h-[180px] bg-white/60 border-black/5 rounded-[1.5rem] p-8 text-base focus:ring-brand-accent placeholder:text-clay-300 shadow-inner"
                       value={jobDesc}
                       onChange={(e) => setJobDesc(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-clay-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Kualifikasi & Persyaratan</Label>
                    <Textarea 
                       placeholder="Misal: React, Node.js, 5+ tahun pengalaman..." 
                       className="min-h-[180px] bg-white/60 border-black/5 rounded-[1.5rem] p-8 text-base focus:ring-brand-accent placeholder:text-clay-300 shadow-inner"
                       value={jobQuals}
                       onChange={(e) => setJobQuals(e.target.value)}
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* AI ACTION SWITCHER & GENERATE */}
        <section className="space-y-10">
           <div className="flex flex-col items-center gap-6">
              <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/60 rounded-[2rem] border border-black/5 shadow-inner max-w-lg w-full">
                 {[
                   { id: "resume", label: "OPTIMIZE CV", icon: Layout },
                   { id: "cover-letter", label: "COVER LETTER", icon: MessageSquare },
                   { id: "interview-prep", label: "INTERVIEW PREP", icon: Search },
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveAIAction(tab.id)}
                     className={`flex flex-col items-center gap-3 py-6 rounded-[2rem] transition-all duration-300 relative group ${activeAIAction === tab.id ? 'bg-brand-accent text-brand-white shadow-xl scale-[1.03] z-10' : 'text-clay-400 hover:text-clay-900 hover:bg-black/5'}`}
                   >
                      <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeAIAction === tab.id ? 'text-brand-white' : 'text-clay-300'}`} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{tab.label}</span>
                      {activeAIAction === tab.id && <motion.div layoutId="active-ai" className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-gold shadow-glow" />}
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

               <Button onClick={handleGenerate} disabled={loading} className="max-w-xl w-full h-24 text-2xl font-bold bg-brand-accent hover:bg-brand-accent2 text-brand-white rounded-[2rem] shadow-2xl shadow-brand-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
                  <div className="relative z-10 flex items-center justify-center gap-6">
                     {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Zap className="h-8 w-8 fill-brand-gold text-brand-gold" />}
                     <span className="tracking-tight text-xl md:text-2xl uppercase tracking-widest">{loading ? " TRANSMITTING..." : `REKAYASA ${activeAIAction.toUpperCase()}`}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               </Button>
           </div>
        </section>

        {/* RESULT SECTION */}
        <section id="result-section" className="pt-20">
           <AnimatePresence mode="wait">
              {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center border border-black/5 shadow-sm min-h-[400px] max-w-4xl mx-auto">
                     <div className="relative mb-8 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-[2px] border-brand-accent/5 border-t-brand-accent animate-spin" />
                        <Sparkles className="absolute w-8 h-8 text-brand-accent animate-pulse" />
                     </div>
                     <h3 className="font-serif text-2xl font-bold text-clay-900 mb-4 tracking-tight italic">Optimasi Neural Sedang Berlangsung...</h3>
                     <div className="mt-8 w-full max-w-sm bg-black/5 rounded-2xl p-6 font-mono text-[9px] text-clay-400 text-left space-y-2 border border-black/5 italic shadow-inner">
                        <div className="flex gap-3"><span className="text-emerald-500 font-bold">[OK]</span> <span>DATA_NODE_SECURED</span></div>
                        <div className="flex gap-3"><span className="text-emerald-500 font-bold">[OK]</span> <span>MAPPING_JOB_ATTRIBUTES</span></div>
                        <div className="flex gap-3"><span className="text-brand-accent font-bold animate-pulse">[RUNNING]</span> <span>RECONSTRUCTING_PROFESSIONAL_GRAPH...</span></div>
                     </div>
                  </motion.div>
               ) : result ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 backdrop-blur-lg rounded-[2.5rem] border border-black/5 overflow-hidden shadow-2xl max-w-4xl mx-auto min-h-[600px] flex flex-col">
                     <div className="px-10 py-8 border-b border-black/5 flex flex-col sm:flex-row items-center justify-between gap-8 bg-white/40">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center shadow-soft"><Terminal className="w-8 h-8 text-brand-accent" /></div>
                           <div>
                              <h3 className="font-serif text-2xl font-bold text-clay-900 uppercase tracking-tight italic">{activeAIAction.toUpperCase()} SIAP</h3>
                              <p className="text-xs text-emerald-600 font-bold flex items-center gap-2 uppercase tracking-[0.2em] mt-1"><CheckCircle2 className="w-4 h-4" /> TRANSMISI BERHASIL</p>
                           </div>
                        </div>
                        <div className="flex gap-4">
                           <Button size="lg" onClick={downloadPDF} className={`h-16 px-10 rounded-2xl ${isGuest ? 'bg-clay-200 text-clay-400' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'} font-bold uppercase tracking-widest text-[10px]`}>
                              <Download className="w-5 h-5 mr-3" /> PDF PREMIUM
                           </Button>
                           <Button variant="ghost" size="lg" onClick={copyToClipboard} className="h-16 px-8 rounded-2xl text-clay-500 hover:text-clay-900 hover:bg-black/5 font-bold uppercase tracking-widest text-[10px]">
                              {copied ? <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-500" /> : <Copy className="w-5 h-5 mr-3" />} {copied ? "SALIN!" : "COPY TEKS"}
                           </Button>
                        </div>
                     </div>
                     
                     <div className="flex-1 p-10 md:p-14 font-sans selection:bg-brand-accent/20 relative overflow-hidden bg-white/50">
                        <div className="max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="font-serif text-5xl font-bold text-clay-900 mb-8 border-b-2 border-brand-accent/20 pb-4 tracking-tighter" {...props} />,
                              h2: ({node, ...props}) => <h2 className="font-serif text-3xl font-bold text-brand-accent mt-12 mb-6 flex items-center gap-4 group" {...props}>
                                <div className="w-1.5 h-8 bg-brand-accent rounded-full transition-transform group-hover:scale-y-110" />
                                {props.children}
                              </h2>,
                              h3: ({node, ...props}) => <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-clay-500 mt-10 mb-4 bg-clay-100/50 inline-block px-4 py-1.5 rounded-lg border border-clay-200/30" {...props} />,
                              p: ({node, ...props}) => <p className="text-lg text-clay-700 font-light leading-relaxed mb-6 text-justify" {...props} />,
                              li: ({node, ...props}) => <li className="flex gap-4 mb-4 text-clay-600 font-light text-base leading-relaxed items-start group" {...props}>
                                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500/40 border border-emerald-500 shrink-0 group-hover:bg-emerald-500 transition-colors shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                <div>{props.children}</div>
                              </li>,
                              ul: ({node, ...props}) => <ul className="my-8 space-y-2" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-clay-900 px-1 py-0.5 bg-brand-gold/10 rounded-md border-b-[3px] border-brand-gold/30" {...props} />,
                              hr: () => <div className="h-px w-full bg-gradient-to-r from-transparent via-black/5 to-transparent my-16" />
                            }}
                          >
                            {result}
                          </ReactMarkdown>
                        </div>
                        
                        {isGuest && (
                          <div className="mt-20 p-12 bg-white/90 border border-brand-accent/10 rounded-[2.5rem] text-center shadow-2xl space-y-8 relative overflow-hidden group">
                             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-accent via-brand-gold to-brand-accent animate-gradient-x" />
                             <div className="w-20 h-20 rounded-[2rem] bg-brand-accent/10 flex items-center justify-center mx-auto mb-6 shadow-soft group-hover:scale-110 transition-transform duration-500">
                                <Zap className="w-10 h-10 text-brand-accent fill-brand-accent" />
                             </div>
                             <h4 className="font-serif text-4xl font-bold text-clay-900 tracking-tight leading-tight uppercase italic">Simpan <span className="text-brand-accent underline decoration-brand-gold/30">Otomasi</span> Ini</h4>
                             <p className="text-clay-500 text-base font-light max-w-sm mx-auto leading-relaxed">Jangan biarkan hasil brilian ini menghilang. Permanenkan CV Anda di database kami untuk aksesibilitas 24/7 dan fitur premium lainnya.</p>
                             <div className="flex flex-col sm:flex-row gap-5 pt-6">
                                <Link href="/register" className="flex-1 h-full">
                                   <Button className="w-full h-16 bg-brand-accent hover:bg-brand-accent2 text-white font-bold rounded-2xl shadow-xl shadow-brand-accent/20 text-xs tracking-widest uppercase transition-all hover:-translate-y-1">DAFTAR SEKARANG</Button>
                                </Link>
                                <Link href="/login" className="flex-1 h-full">
                                   <Button variant="outline" className="w-full h-16 border-black/5 hover:bg-black/5 text-clay-900 font-bold rounded-2xl text-xs tracking-widest uppercase transition-all">LOGIN</Button>
                                </Link>
                             </div>
                             <div className="absolute bottom-4 left-0 w-full flex justify-center gap-1 opacity-20">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-clay-400" />)}
                             </div>
                          </div>
                        )}
                     </div>
                  </motion.div>
              ) : (
                 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 grayscale opacity-40">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-soft"><Terminal className="w-10 h-10 text-clay-300" /></div>
                    <p className="font-serif text-2xl font-bold text-clay-400 italic">Menunggu Transmisi Data...</p>
                 </motion.div>
              )}
           </AnimatePresence>
        </section>
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
         <DialogContent className="sm:max-w-[700px] bg-brand-bg/95 backdrop-blur-xl border-black/5 text-clay-900 rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
            <div className="h-2 w-full bg-brand-accent" />
            <div className="p-10 space-y-8">
               <DialogHeader>
                  <DialogTitle className="font-serif text-3xl font-bold">Basis Resume Baru</DialogTitle>
                  <DialogDescription>Tambahkan deskripsi profil Anda sebagai template utama.</DialogDescription>
               </DialogHeader>
               <div className="space-y-6">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Judul Referensi</Label>
                     <Input 
                        value={form.title} 
                        onChange={(e) => setForm({...form, title: e.target.value})} 
                        className="h-14 bg-white/60 border-black/5 rounded-2xl px-6 font-medium focus:ring-brand-accent"
                        placeholder="Misal: Resume Senior Dev 2026" 
                     />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-bold uppercase tracking-widest text-clay-400">Konten Teks Mentah</Label>
                     <Textarea 
                        value={form.content} 
                        onChange={(e) => setForm({...form, content: e.target.value})} 
                        className="min-h-[250px] bg-white/60 border-black/5 rounded-[1.5rem] p-6 text-[10px] font-mono leading-relaxed"
                        placeholder="Tempel teks CV di sini..." 
                     />
                  </div>
               </div>
               <DialogFooter>
                  <Button onClick={handleAddCV} disabled={submitting} className="w-full h-16 bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold rounded-2xl shadow-xl shadow-brand-accent/20">
                     {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIMPAN KE DATABASE"}
                  </Button>
               </DialogFooter>
            </div>
         </DialogContent>
      </Dialog>
    </main>
  );
}
