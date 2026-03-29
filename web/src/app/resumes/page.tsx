"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  PlusCircle, 
  ArrowLeft, 
  Trash2, 
  ArrowUpRight,
  Database,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  AlertTriangle,
  Download,
  Calendar,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

function ResumesList() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") === "optimized" ? "optimized" : "master";
  
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/resumes?type=${typeParam}`);
      if (res.ok) setResumes(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [typeParam]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiFetch(`/resumes/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchResumes();
        toast.success("Dokumen berhasil dihapus.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const handleDownloadPDF = async (content: string, title: string) => {
    toast.info(`Menyiapkan PDF Premium untuk "${title}"...`);
    setLoading(true);
    try {
      const res = await apiFetch("/generate/export-pdf", {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Gagal mengunduh PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CVCraft_${title.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF Berhasil diunduh!");
    } catch (err) {
      toast.error("Gagal mengunduh PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-clay-900 font-sans selection:bg-brand-accent/20 cursor-default">
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 backdrop-blur-xl bg-white/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group text-clay-500 hover:text-clay-900 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
             <div className="p-1 px-4 rounded-full bg-brand-accent/5 border border-brand-accent/10 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-accent">
                Vault Status: {resumes.length} {typeParam.toUpperCase()}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-14">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <h1 className="font-serif text-5xl font-bold text-clay-900 tracking-tight leading-tight">
                    {typeParam === "master" ? "Hub " : "Koleksi "} 
                    <br /><span className="italic font-light text-brand-accent">{typeParam === "master" ? "CV Master" : "CV Optimize"}</span>
                 </h1>
                 <p className="text-clay-600 mt-4 text-lg font-light max-w-xl">
                    {typeParam === "master" 
                      ? "Pusat data profil utama untuk fondasi rekayasa karir Anda." 
                      : "Daftar CV hasil racikan AI yang spesifik untuk target pekerjaan tertentu."}
                 </p>
              </motion.div>

              <div className="flex flex-col items-end gap-6">
                 <div className="flex items-center gap-4">
                    <div className="flex p-1 bg-white/40 rounded-2xl border border-black/5">
                       <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-brand-accent shadow-md' : 'text-clay-400 hover:text-clay-900'}`}>
                          <LayoutGrid className="w-5 h-5" />
                       </button>
                       <button onClick={() => setViewMode("list")} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-brand-accent shadow-md' : 'text-clay-400 hover:text-clay-900'}`}>
                          <ListIcon className="w-5 h-5" />
                       </button>
                    </div>
                    
                    {typeParam === "master" && (
                      <Link href="/resumes/create">
                        <Button className="h-14 px-8 rounded-2xl bg-brand-accent hover:bg-brand-accent2 text-brand-white font-bold text-md shadow-xl shadow-brand-accent/20 group transition-all">
                          <PlusCircle className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> CV Master Baru
                        </Button>
                      </Link>
                    )}
                 </div>
              </div>
           </div>
        </header>

        {loading ? (
          <div className="py-40 flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin mb-6" />
             <p className="text-clay-400 font-bold uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Vault...</p>
          </div>
        ) : resumes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/40 backdrop-blur-md rounded-[3rem] py-40 border-black/5 border-2 border-dashed flex flex-col items-center text-center px-10 shadow-sm">
             <div className="w-20 h-20 rounded-[2rem] bg-clay-100/50 flex items-center justify-center mb-8"><Database className="w-10 h-10 text-clay-200" /></div>
             <h3 className="font-serif text-3xl font-bold text-clay-900 mb-4 tracking-tight uppercase">Belum Ada {typeParam === 'master' ? 'CV Master' : 'CV Optimize'}</h3>
             <p className="text-clay-500 max-w-sm text-lg font-light leading-relaxed">
                {typeParam === 'master' 
                   ? "Tambahkan CV Master Anda hari ini untuk membuka kekuatan enkripsi karir AI." 
                   : "Hasil optimasi CV Anda untuk beragam lamaran kerja akan muncul di sini."}
             </p>
             {typeParam === 'master' && (
               <Link href="/resumes/create">
                  <Button className="mt-8 bg-brand-accent hover:bg-brand-accent2 text-white font-bold h-12 px-8 rounded-xl uppercase tracking-widest text-[10px] transition-all">Mulai Buat Master CV</Button>
               </Link>
             )}
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {resumes.map((resume, idx) => (
                <motion.div 
                   key={resume.id} 
                   initial={{ opacity: 0, scale: 0.9 }} 
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: idx * 0.05 }}
                   className="group bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-black/5 hover:bg-white/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative flex flex-col justify-between"
                >
                   <div className="absolute top-8 right-8 z-20">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-clay-300 hover:text-red-500 hover:bg-red-500/10 rounded-2xl" onClick={() => setDeleteId(resume.id)}>
                         <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>

                   <div>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-brand-accent/5 border border-brand-accent/5 flex items-center justify-center mb-10 group-hover:bg-brand-accent group-hover:shadow-glow transition-all duration-500">
                         {resume.type === 'master' ? <Database className="w-8 h-8 text-brand-accent group-hover:text-brand-white transition-colors" /> : <Sparkles className="w-8 h-8 text-brand-accent group-hover:text-brand-white transition-colors" />}
                      </div>
                       <h3 className="font-serif text-2xl font-bold text-clay-900 mb-2 tracking-tight group-hover:text-brand-accent transition-colors line-clamp-1">{resume.title}</h3>
                       <div className="flex items-center gap-3 mb-8">
                          <span className={`text-[10px] font-bold uppercase tracking-widest italic ${resume.type === 'master' ? 'text-brand-accent' : 'text-emerald-600'}`}>
                             {resume.type === 'master' ? "MASTER CORE" : "AI OPTIMIZED"}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-clay-200" />
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-clay-400">
                             <Calendar className="w-3 h-3" /> {formatDate(resume.createdAt)}
                          </div>
                       </div>
                       
                       {resume.type === 'optimized' && (resume.targetRole || resume.targetCompany) && (
                         <div className="mb-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-1">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/60">Target Jabatan / Perusahaan</p>
                            <p className="text-xs font-bold text-emerald-900 truncate">{resume.targetRole || '-'} {resume.targetCompany ? `@ ${resume.targetCompany}` : ''}</p>
                         </div>
                       )}

                      <div className="p-6 bg-white/60 rounded-3xl border border-black/5 mb-10 group/content relative shadow-inner overflow-hidden">
                         <p className="text-[11px] font-mono text-clay-500 leading-relaxed line-clamp-4">
                            {resume.content}
                         </p>
                         <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent pointer-events-none rounded-3xl" />
                      </div>
                   </div>

                    {resume.type === 'master' ? (
                      <Link href={`/generate`}>
                        <Button className="w-full h-14 bg-brand-accent/5 hover:bg-brand-accent text-brand-accent hover:text-brand-white border border-brand-accent/10 hover:border-brand-accent rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all group/btn shadow-sm">
                            Gunakan sebagai Sumber <ArrowUpRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Button onClick={() => handleDownloadPDF(resume.content, resume.title)} className="w-full h-14 bg-emerald-500/5 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/10 hover:border-emerald-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all group/btn shadow-sm">
                          Download PDF Premium <Download className="ml-2 w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </Button>
                    )}
                </motion.div>
             ))}
             {typeParam === 'master' && (
               <Link href="/resumes/create" className="group border-2 border-dashed border-black/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:border-brand-accent/20 hover:bg-white/40 transition-all min-h-[400px] shadow-sm">
                  <div className="w-14 h-14 rounded-full border border-black/5 flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:border-brand-accent transition-all duration-500 shadow-soft">
                     <PlusCircle className="w-7 h-7 text-clay-300 group-hover:text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-clay-400 group-hover:text-clay-600 uppercase tracking-widest">Inisialisasi Master Baru</h4>
               </Link>
             )}
          </div>
        ) : (
          <div className="space-y-4">
             {resumes.map((resume, idx) => (
                <motion.div 
                   key={resume.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="bg-white/40 backdrop-blur-md rounded-[1.5rem] p-6 border border-black/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-white/60 hover:shadow-md transition-all"
                >
                   <div className="flex items-center gap-6 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${resume.type === 'master' ? 'bg-brand-accent/10 border-brand-accent/5' : 'bg-emerald-500/10 border-emerald-500/5'}`}>
                         {resume.type === 'master' ? <Database className="w-5 h-5 text-brand-accent" /> : <Sparkles className="w-5 h-5 text-emerald-600" />}
                      </div>
                       <div>
                          <h3 className="font-serif text-xl font-bold text-clay-900 group-hover:text-brand-accent transition-colors">{resume.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-clay-400">ID: {resume.id}</span>
                             <div className="w-1 h-1 rounded-full bg-clay-200" />
                             {resume.targetRole && (
                               <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[150px]">{resume.targetRole} {resume.targetCompany ? `@ ${resume.targetCompany}` : ''}</span>
                             )}
                             <span className="text-[10px] font-bold uppercase tracking-widest text-clay-400 border-l border-black/10 pl-3 flex items-center gap-1.5">
                                <Calendar className="w-3 h-3" /> {formatDate(resume.createdAt)}
                             </span>
                          </div>
                       </div>
                   </div>
                   <div className="flex items-center gap-4">
                       {resume.type === 'master' ? (
                         <Link href={`/generate`}>
                            <Button variant="ghost" className="h-12 px-6 rounded-xl text-clay-500 hover:text-brand-accent hover:bg-brand-accent/5 font-bold uppercase tracking-widest text-[10px] transition-colors">
                                Gunakan
                            </Button>
                         </Link>
                       ) : (
                         <Button onClick={() => handleDownloadPDF(resume.content, resume.title)} variant="ghost" className="h-12 px-6 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold uppercase tracking-widest text-[10px] transition-colors">
                             <Download className="w-4 h-4 mr-2" /> PDF
                         </Button>
                       )}
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-clay-300 hover:text-red-500" onClick={() => setDeleteId(resume.id)}>
                         <Trash2 className="w-5 h-5" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-clay-200" />
                   </div>
                </motion.div>
             ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
           <DialogContent className="bg-brand-bg/95 backdrop-blur-xl border-black/5 text-clay-900 rounded-[3rem] sm:max-w-md shadow-2xl p-0 overflow-hidden">
              <div className="p-10 flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                 </div>
                 <DialogTitle className="font-serif text-2xl font-bold text-clay-900 tracking-tight uppercase">Konfirmasi Hapus</DialogTitle>
                 <DialogDescription className="text-clay-500 font-light pt-2 leading-relaxed">
                    Tindakan ini tidak dapat dibatalkan. Profil resume Anda akan dihapus secara permanen dari hub memori AI.
                 </DialogDescription>
                 <div className="flex gap-4 pt-10 w-full">
                    <Button variant="ghost" className="flex-1 h-16 rounded-2xl font-bold uppercase tracking-widest text-xs border border-black/5 hover:bg-black/5 transition-colors" onClick={() => setDeleteId(null)}>Batal</Button>
                    <Button className="flex-1 h-16 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 active:scale-95 transition-all" onClick={handleDelete}>Hapus Sekarang</Button>
                 </div>
              </div>
           </DialogContent>
        </Dialog>
      </main>

      <footer className="py-20 border-t border-black/5 text-center px-6">
         <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-clay-400 italic">CVCraft Intelligence Storage Vault</p>
      </footer>
    </div>
  );
}

export default function ResumesPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-brand-bg flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-brand-accent/20 border-t-brand-accent rounded-full animate-spin" />
       </div>
    }>
      <ResumesList />
    </Suspense>
  );
}
