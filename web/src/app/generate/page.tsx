"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
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
  ShieldAlert
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Generate() {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);
  const [baseResumes, setBaseResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [guestResumeContent, setGuestResumeContent] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [activeTab, setActiveTab] = useState("resume");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Add CV Modal state
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsGuest(false);
      fetchResumes();
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    try {
      if (file.type === "application/pdf" || file.type === "text/plain") {
        const formData = new FormData();
        formData.append("file", file);
        
        // Use extraction endpoint
        const res = await apiFetch("/resumes/extract", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (isGuest) {
            setGuestResumeContent(data.text);
          } else {
            setForm(prev => ({ ...prev, content: data.text, title: prev.title || file.name.replace(".pdf", "") }));
          }
        } else {
          const errorData = await res.json();
          setErrorMessage(errorData.error || "Gagal mengekstrak PDF.");
        }
      } else {
        setErrorMessage("Silakan unggah file PDF atau TXT.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Kesalahan jaringan saat memproses file.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddCV = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      const res = await apiFetch("/resumes", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAdding(false);
        setForm({ title: "", content: "" });
        await fetchResumes();
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Gagal menyimpan CV");
      }
    } catch (err) {
      setErrorMessage("Kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (isGuest && !guestResumeContent) {
      setErrorMessage("Silakan masukkan konten resume Anda terlebih dahulu.");
      return;
    }
    if (!isGuest && !selectedResumeId) {
      setErrorMessage("Silakan pilih CV Utama terlebih dahulu.");
      return;
    }
    if (!jobDescription) {
      setErrorMessage("Silakan masukkan Deskripsi Pekerjaan.");
      return;
    }

    setLoading(true);
    setResult("");
    setErrorMessage("");
    try {
      let res;
      if (isGuest) {
        res = await apiFetch("/generate/guest", {
          method: "POST",
          body: JSON.stringify({
            resumeContent: guestResumeContent,
            jobDescription,
          }),
        });
      } else {
        res = await apiFetch(`/generate/${activeTab}`, {
          method: "POST",
          body: JSON.stringify({
            baseResumeId: parseInt(selectedResumeId),
            jobDescription,
          }),
        });
      }

      const data = await res.json();
      if (res.ok) {
        setResult(data.resume?.content || data.content || JSON.stringify(data, null, 2));
      } else if (res.status === 403) {
        setErrorMessage("Kredit tidak mencukupi.");
        setTimeout(() => router.push("/pricing"), 2000);
      } else {
        setErrorMessage(data.error || "Generasi gagal");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Kesalahan Klien: " + (err.message || "Error tidak diketahui"));
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (isGuest) {
       setErrorMessage("Silakan daftar untuk mengunduh hasil dalam format PDF.");
       return;
    }
    if (!result) return;
    const doc = new jsPDF();
    // (Existing PDF Logic preserved...)
    const margin = 20;
    const pageHeight = 280;
    const pageWidth = 170;
    let cursorY = 25;
    const navyColor = [0, 80, 157];
    const blackColor = [0, 0, 0];
    const grayColor = [100, 116, 139];
    const rawLines = result.split("\n").map(l => l.trim()).filter(l => l !== "");
    if (activeTab === "resume") {
      let name = ""; let jobTitle = ""; let contactInfo = ""; let startIdx = 0;
      if (rawLines.length > 0) {
        name = rawLines[0].replace(/[*#]/g, "").trim().toUpperCase();
        startIdx = 1;
        if (startIdx < rawLines.length && !rawLines[startIdx].includes("@") && !rawLines[startIdx].includes("+") && !rawLines[startIdx].includes("linkedin.com") && rawLines[startIdx].length < 60) {
          jobTitle = rawLines[startIdx].replace(/[*#]/g, "").trim().toUpperCase();
          startIdx++;
        }
        while (startIdx < rawLines.length && (rawLines[startIdx].includes("@") || rawLines[startIdx].includes("+") || rawLines[startIdx].includes("|") || rawLines[startIdx].includes("linkedin") || rawLines[startIdx].length < 100)) {
          if (!rawLines[startIdx].startsWith("#") && !rawLines[startIdx].startsWith("*")) {
            const cleanContact = rawLines[startIdx].replace(/[*#]/g, "").trim();
            contactInfo += (contactInfo ? " | " : "") + cleanContact;
            startIdx++;
          } else { break; }
        }
      }
      doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(name || "NAMA KANDIDAT", margin, cursorY);
      cursorY += 10;
      if (jobTitle) {
        doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
        doc.setFontSize(16);
        doc.text(jobTitle, margin, cursorY);
        cursorY += 8;
      }
      if (contactInfo) {
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(contactInfo, margin, cursorY);
        cursorY += 12;
      }
      let currentSection = "";
      let skillsList: string[] = [];
      const flushSkills = () => {
        if (skillsList.length === 0) return;
        doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
        doc.setFontSize(10);
        const colWidth = pageWidth / 3;
        for (let i = 0; i < skillsList.length; i++) {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const skillY = cursorY + (row * 6);
          if (skillY > pageHeight - 10) { doc.addPage(); cursorY = 20; }
          doc.text("• " + skillsList[i], margin + (col * colWidth), skillY);
          if (col === 2 || i === skillsList.length - 1) { if (i === skillsList.length - 1) cursorY = skillY + 8; }
        }
        skillsList = [];
      };
      const sectionKeywords = ["SUMMARY", "EXPERIENCE", "EDUCATION", "SKILLS", "ADDITIONAL", "PROJECTS", "CERTIFICATIONS"];
      for (let i = startIdx; i < rawLines.length; i++) {
        let line = rawLines[i].trim();
        let nextLine = (i + 1 < rawLines.length) ? rawLines[i+1].trim() : "";
        let isHeader = line.startsWith("#");
        if (!isHeader && line.length < 30 && sectionKeywords.some(kw => line.toUpperCase().includes(kw))) { isHeader = true; }
        if (isHeader) {
          if (currentSection === "SKILLS") flushSkills();
          currentSection = line.toUpperCase().replace(/#/g, "").trim();
          cursorY += 5;
          if (cursorY > pageHeight - 20) { doc.addPage(); cursorY = 20; }
          doc.setTextColor(navyColor[0], navyColor[1], navyColor[2]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.text(currentSection, margin, cursorY);
          cursorY += 2;
          doc.setDrawColor(navyColor[0], navyColor[1], navyColor[2]);
          doc.setLineWidth(0.5);
          doc.line(margin, cursorY, margin + pageWidth, cursorY);
          cursorY += 8;
          continue;
        }
        if (currentSection.includes("SKILLS") && (line.startsWith("*") || line.startsWith("-") || line.includes("•"))) {
          skillsList.push(line.replace(/[*•-]/g, "").trim());
          continue;
        } else if (currentSection.includes("SKILLS") && skillsList.length > 0 && line.length > 0) { flushSkills(); }
        const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|20\d\d).*?(?:Present|20\d\d|Current)/i;
        if (nextLine.match(dateRegex) && !line.startsWith("*") && !line.startsWith("-") && line.length < 100) {
          doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.text(line.replace(/[*#]/g, "").trim(), margin, cursorY);
          doc.text(nextLine.replace(/[*#]/g, "").trim(), margin + pageWidth, cursorY, { align: "right" });
          cursorY += 6; i++; continue;
        }
        doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
        let cleanLine = line.replace(/\*\*/g, "");
        if (cleanLine.startsWith("* ") || cleanLine.startsWith("- ")) {
          doc.setFont("helvetica", "normal");
          cleanLine = "•   " + cleanLine.substring(2);
        } else { doc.setFont("helvetica", "normal"); }
        cleanLine = cleanLine.replace(/[*#]/g, "");
        const wrappedLines = doc.splitTextToSize(cleanLine, pageWidth);
        wrappedLines.forEach((wLine: string) => {
          if (cursorY > pageHeight - 10) { doc.addPage(); cursorY = 20; }
          doc.text(wLine, margin, cursorY);
          cursorY += 5;
        });
        cursorY += 1;
      }
      if (currentSection.includes("SKILLS")) flushSkills();
    } else {
      doc.setTextColor(blackColor[0], blackColor[1], blackColor[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (let i = 0; i < rawLines.length; i++) {
        let line = rawLines[i].trim();
        if (!line) { cursorY += 5; continue; }
        if (line.startsWith("#") || line.startsWith("**")) {
          doc.setFont("helvetica", "bold"); doc.setFontSize(13);
          line = line.replace(/[#*]/g, "").trim(); cursorY += 4;
        } else { doc.setFont("helvetica", "normal"); doc.setFontSize(11); }
        const wrappedLines = doc.splitTextToSize(line, pageWidth);
        wrappedLines.forEach((wLine: string) => {
          if (cursorY > pageHeight - 10) { doc.addPage(); cursorY = 20; }
          doc.text(wLine, margin, cursorY); cursorY += 6;
        });
        cursorY += 2;
      }
    }
    doc.save(`hasil_optimasi_${activeTab}.pdf`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-mesh opacity-50" />

      <nav className="border-b border-white/5 backdrop-blur-md bg-black/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-black text-xs uppercase tracking-widest">Beranda</span>
          </Link>
          <div className="flex items-center gap-6">
             {isGuest ? (
               <div className="flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="ghost" className="text-slate-400 hover:text-white font-bold text-xs">MASUK</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl h-9 px-4">DAFTAR</Button>
                  </Link>
               </div>
             ) : (
               <Link href="/dashboard">
                  <Button variant="ghost" className="h-10 text-slate-400 hover:text-white hover:bg-white/5 font-bold uppercase tracking-widest text-xs">
                    <Layout className="w-4 h-4 mr-2" /> Dashboard
                  </Button>
               </Link>
             )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-14">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter flex items-center gap-4">
                 AI Workspace {isGuest && <span className="p-1 px-3 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Guest Mode</span>}
              </h1>
              <p className="text-slate-500 mt-4 text-lg font-medium">
                {isGuest ? "Coba kekuatan AI kami sekarang juga, tanpa registrasi di awal." : "Rekayasa dokumen karir Anda dengan presisi algoritma masa depan."}
              </p>
           </motion.div>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-12 xl:col-span-5 space-y-8">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-dark rounded-[2.5rem] p-10 border border-white/5 space-y-10 relative overflow-hidden"
            >
               <div className="flex gap-2 mb-10">
                  <div className={`h-1.5 flex-1 rounded-full ${(isGuest ? guestResumeContent : selectedResumeId) ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${jobDescription ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`h-1.5 flex-1 rounded-full ${result ? 'bg-primary' : 'bg-white/10'}`} />
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                           <FileText className="w-5 h-5" />
                        </div>
                        <Label className="text-xl font-black text-white tracking-tight uppercase tracking-[0.05em]">
                           {isGuest ? "Konten Resume Anda" : "Pilih CV Utama"}
                        </Label>
                     </div>

                     {!isGuest && (
                       <Dialog open={isAdding} onOpenChange={setIsAdding}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-10 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px] px-4 border border-primary/20">
                              <PlusCircle className="w-4 h-4 mr-2" /> CV Baru
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] bg-slate-900 border-white/10 text-slate-200 rounded-[2.5rem]">
                            <DialogHeader>
                              <DialogTitle className="text-white text-3xl font-black tracking-tight">Impor Resume Utama</DialogTitle>
                              <DialogDescription className="text-slate-500 font-medium">Unggah file PDF atau masukkan teks mentah CV Anda.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddCV} className="space-y-8 py-8">
                               <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Judul CV</Label>
                                  <Input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary px-6" placeholder="Misal: CV Senior Dev 2026" />
                               </div>
                               <div className="grid md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ekstraksi Cepat</Label>
                                     <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 bg-white/[0.02] hover:bg-white/5 transition-all relative group border-spacing-4">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                           <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">DROP PDF/TXT</span>
                                        <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                     </div>
                                  </div>
                                  <div className="space-y-3">
                                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Konten Mentah</Label>
                                     <Textarea required className="min-h-[250px] bg-white/5 border-white/10 rounded-2xl p-6 text-[10px] font-mono leading-relaxed" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} placeholder="Hasil ekstraksi teks akan muncul di sini..." />
                                  </div>
                               </div>
                               <DialogFooter>
                                  <Button type="submit" disabled={submitting || uploading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20">
                                    {submitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Zap className="mr-3 h-6 w-6 fill-current" />}
                                    Simpan ke Basis Data
                                  </Button>
                               </DialogFooter>
                            </form>
                          </DialogContent>
                       </Dialog>
                     )}
                  </div>

                  {isGuest ? (
                    <div className="space-y-4">
                       <Textarea 
                          placeholder="Tempel teks CV Anda atau unggah file di bawah..."
                          className="min-h-[200px] bg-white/5 border-white/10 rounded-2xl p-6 text-sm font-medium focus:ring-primary"
                          value={guestResumeContent}
                          onChange={(e) => setGuestResumeContent(e.target.value)}
                       />
                       <div className="flex items-center gap-4 p-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] hover:bg-white/5 transition-all relative">
                          <Upload className="w-5 h-5 text-primary" />
                          <span className="text-xs font-bold text-slate-400">Atau Unggah PDF/TXT</span>
                          <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </div>
                       {uploading && <div className="flex items-center gap-2 justify-center"><Loader2 className="w-3 h-3 animate-spin" /><span className="text-[9px] font-black uppercase tracking-widest text-primary">Mengekstrak...</span></div>}
                    </div>
                  ) : (
                    <Select onValueChange={setSelectedResumeId} value={selectedResumeId}>
                      <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl focus:ring-primary px-6 text-slate-300 font-bold">
                        <SelectValue placeholder="Pilih resume Anda..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-slate-200">
                        {baseResumes.length === 0 ? (
                          <SelectItem value="none" disabled>Belum ada CV yang tersimpan.</SelectItem>
                        ) : (
                          baseResumes.map((r) => (
                            <SelectItem key={r.id} value={String(r.id)} className="focus:bg-primary/20 py-3 px-4 font-bold border-b border-white/5 last:border-0 cursor-pointer">
                              {r.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                        <Zap className="w-5 h-5 fill-current" />
                     </div>
                     <Label className="text-xl font-black text-white tracking-tight uppercase tracking-[0.05em]">Mode Kerja AI</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/5 rounded-[2rem] border border-white/5">
                     {[
                       { id: "resume", label: "RESUME", icon: Layout },
                       { id: "cover-letter", label: "SURAT", icon: MessageSquare },
                       { id: "interview-prep", label: "PREP", icon: Search },
                     ].map(tab => (
                       <button
                         key={tab.id}
                         onClick={() => setActiveTab(tab.id)}
                         className={`flex flex-col items-center gap-2 py-4 rounded-[1.5rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 z-10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                       >
                          <tab.icon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 text-primary">
                        <Terminal className="w-5 h-5" />
                     </div>
                     <Label className="text-xl font-black text-white tracking-tight uppercase tracking-[0.05em]">Target & Persyaratan</Label>
                  </div>
                  <Textarea
                    placeholder="Tempel deskripsi pekerjaan di sini..."
                    className="relative min-h-[250px] bg-[#0F172A] border-white/5 rounded-[2rem] p-8 text-sm leading-relaxed resize-none focus:ring-0 focus:border-primary/40 text-slate-300 font-medium"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
               </div>

               <AnimatePresence>
                  {errorMessage && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-2xl bg-red-500/10 border border-red-500/20 p-5 flex items-center gap-4 text-red-500">
                       <AlertCircle className="w-6 h-6 shrink-0" />
                       <p className="text-xs font-black uppercase tracking-widest">{errorMessage}</p>
                    </motion.div>
                  )}
               </AnimatePresence>

               <Button onClick={handleGenerate} disabled={loading} className="w-full h-20 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-3xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                 {loading ? <><Loader2 className="mr-4 h-7 w-7 animate-spin" /> MENGHUBUNGKAN...</> : <><Zap className="mr-4 h-7 w-7 fill-current" /> EKSEKUSI OPTIMASI</>}
               </Button>
            </motion.div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7 relative">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-dark rounded-[2.5rem] h-full min-h-[700px] flex flex-col items-center justify-center p-12 text-center">
                  <div className="relative mb-10"><div className="w-32 h-32 rounded-full border-[6px] border-primary/20 border-t-primary animate-spin" /><Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" /></div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Menjalankan Engine AI...</h3>
                  <div className="mt-16 w-full max-w-md bg-black/60 rounded-[2rem] p-8 font-mono text-[10px] text-slate-500 text-left space-y-2 border border-white/5 italic">
                     <p>[OK] GUEST_MODE_OVERRIDE_ACTIVE</p>
                     <p>[OK] PARSING_SEMANTIC_MATCH</p>
                     <p className="animate-pulse">[RUNNING] TAILORING_EXPERIENCE...</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-dark rounded-[2.5rem] h-full min-h-[800px] flex flex-col border border-white/5 overflow-hidden">
                  <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><Terminal className="w-7 h-7 text-primary" /></div>
                       <div><h3 className="text-lg font-black text-white uppercase tracking-widest italic">{activeTab} SIAP</h3><p className="text-[10px] text-emerald-400 font-black flex items-center gap-2 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Selesai</p></div>
                    </div>
                    <div className="flex gap-4">
                      <Button size="lg" onClick={downloadPDF} className={`h-14 px-8 rounded-2xl ${isGuest ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500 text-white'} font-black uppercase tracking-widest text-[10px]`}>
                        <Download className="w-5 h-5 mr-3" /> Unduh PDF
                      </Button>
                      <Button variant="ghost" size="lg" onClick={copyToClipboard} className="h-14 px-6 rounded-2xl text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]">
                        {copied ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <Copy className="w-5 h-5 mr-3" />} {copied ? "SALIN!" : "SALIN"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-12 overflow-y-auto bg-black/40 custom-scrollbar relative">
                    <div className="max-w-3xl mx-auto whitespace-pre-wrap text-base leading-[1.8] text-slate-300 font-medium">
                       {result}
                    </div>
                    
                    {isGuest && (
                      <div className="absolute bottom-0 left-0 w-full p-10 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-32 flex flex-col items-center">
                         <div className="glass-accent p-10 rounded-[3rem] border border-primary/30 max-w-xl w-full text-center shadow-[0_0_100px_rgba(139,92,246,0.2)]">
                            <ShieldAlert className="w-12 h-12 text-primary mx-auto mb-6" />
                            <h4 className="text-2xl font-black text-white mb-4 tracking-tight uppercase italic">Simpan Hasil Ini Sekarang?</h4>
                            <p className="text-indigo-200/60 font-medium text-sm mb-8 leading-relaxed">
                              Sebagai tamu, hasil ini tidak akan tersimpan secara permanen. Daftar sekarang untuk mengunduh PDF premium, menyimpan riwayat, dan mendapatkan 3 kredit gratis tambahan!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                               <Link href="/register" className="flex-1">
                                  <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
                                     <UserPlus className="w-4 h-4 mr-2" /> Daftar Gratis
                                  </Button>
                               </Link>
                               <Link href="/login" className="flex-1">
                                  <Button variant="outline" className="w-full h-14 border-white/10 hover:bg-white/5 text-white font-black text-xs uppercase tracking-widest rounded-2xl">
                                     <LogIn className="w-4 h-4 mr-2" /> Masuk
                                  </Button>
                               </Link>
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-dark rounded-[2.5rem] h-full min-h-[700px] flex flex-col items-center justify-center p-12 text-center">
                   <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-10 border border-white/5"><Terminal className="w-12 h-12 text-slate-700" /></div>
                   <h3 className="text-3xl font-black text-white mb-4 tracking-tighter italic uppercase">Engine Siap</h3>
                   <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">Masukkan data pada panel kiri dan biarkan AI HireReady mengoptimasi karir Anda secara instan.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
