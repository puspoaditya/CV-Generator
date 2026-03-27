"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
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
  PlusCircle, 
  FileText, 
  ArrowLeft, 
  Loader2, 
  Upload, 
  Sparkles, 
  Trash2, 
  ArrowUpRight,
  Database,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Search,
  AlertTriangle
} from "lucide-react";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/resumes");
      if (res.ok) setResumes(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await apiFetch(`/resumes/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchResumes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    try {
      if (file.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await apiFetch("/resumes/extract", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setForm(prev => ({ ...prev, content: data.text, title: prev.title || file.name.replace(".pdf", "") }));
        } else {
          const errorData = await res.json();
          setErrorMsg(errorData.error || "Gagal mengekstrak PDF.");
        }
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setForm(prev => ({ ...prev, content: text, title: prev.title || file.name }));
      } else {
        setErrorMsg("Silakan unggah file PDF atau TXT.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Kesalahan jaringan.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await apiFetch("/resumes", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsAdding(false);
        setForm({ title: "", content: "" });
        fetchResumes();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan CV");
      }
    } catch (err) {
      setErrorMsg("Kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 bg-mesh selection:bg-primary/30">
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-xl bg-black/40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-black text-xs uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
             <div className="p-1 px-3 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                Storage: {resumes.length} Profil Aktif
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <header className="mb-14">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                 <h1 className="text-5xl font-black text-white tracking-tighter">Kelola <span className="text-primary italic">Resume Utama.</span></h1>
                 <p className="text-slate-500 mt-4 text-lg font-medium max-w-xl">Daftar profil dasar yang menjadi fondasi untuk setiap optimasi AI Anda.</p>
              </motion.div>

              <div className="flex items-center gap-4">
                 <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                       <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                       <ListIcon className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <Dialog open={isAdding} onOpenChange={setIsAdding}>
                   <DialogTrigger asChild>
                     <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-md shadow-xl shadow-primary/20 group uppercase tracking-widest">
                       <PlusCircle className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform" /> Profil Baru
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[750px] bg-slate-900 border-white/10 text-slate-200 rounded-[2.5rem] overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-cyan-500" />
                      <DialogHeader className="pt-6">
                        <DialogTitle className="text-white text-3xl font-black tracking-tight">Impor Data Profil</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Tambahkan fondasi data baru untuk optimasi karir Anda.</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-8 py-8">
                         <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                               <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Identitas Resume</Label>
                                  <Input required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary px-6 font-bold" placeholder="Contoh: Resume Master 2026" />
                               </div>
                               <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Ekstraksi Modul</Label>
                                  <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 bg-white/[0.02] hover:bg-white/5 transition-all relative group cursor-pointer">
                                     <Upload className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                                     <span className="text-[10px] font-black text-slate-500 tracking-widest">UNGGAH PDF / TXT</span>
                                     <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                  </div>
                                  {uploading && (
                                   <div className="flex items-center gap-3 justify-center py-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                      <p className="text-[10px] text-primary uppercase font-black tracking-widest">Dekripsi Node...</p>
                                   </div>
                                 )}
                               </div>
                            </div>
                            <div className="space-y-3">
                               <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Konten Mentah</Label>
                               <Textarea required className="min-h-[300px] bg-black/40 border-white/5 rounded-2xl p-6 text-[10px] font-mono leading-relaxed" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} placeholder="Tempel atau ekstrak konten di sini..." />
                            </div>
                         </div>
                         {errorMsg && <p className="text-red-500 text-xs font-black uppercase tracking-widest text-center">{errorMsg}</p>}
                         <DialogFooter>
                            <Button type="submit" disabled={submitting || uploading} className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20">
                               {submitting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Database className="w-6 h-6 mr-3" />}
                               SIMPAN KE HUB
                            </Button>
                         </DialogFooter>
                      </form>
                   </DialogContent>
                 </Dialog>
              </div>
           </div>
        </header>

        {loading ? (
          <div className="py-40 flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
             <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px]">Sinkronisasi Data...</p>
          </div>
        ) : resumes.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-dark rounded-[3rem] py-40 border-white/5 border-2 border-dashed flex flex-col items-center text-center px-10">
             <Database className="w-20 h-20 text-slate-800 mb-8" />
             <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">Hub Kosong</h3>
             <p className="text-slate-500 max-w-sm text-lg font-medium leading-relaxed">Anda belum memiliki profil utama. Tambahkan satu untuk mulai mengoptimasi karir Anda dengan AI.</p>
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {resumes.map((resume, idx) => (
                <motion.div 
                  key={resume.id} 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group glass-dark rounded-[2.5rem] p-8 border border-white/5 hover:border-primary/30 transition-all duration-500 relative flex flex-col justify-between"
                >
                   <div className="absolute top-8 right-8 z-20">
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-2xl" onClick={() => setDeleteId(resume.id)}>
                         <Trash2 className="w-5 h-5" />
                      </Button>
                   </div>

                   <div>
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center mb-10 group-hover:bg-primary/20 transition-all group-hover:scale-110 duration-500">
                         <FileText className="w-8 h-8 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-primary transition-colors line-clamp-1">{resume.title}</h3>
                      <div className="flex items-center gap-3 mb-8">
                         <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Foundation Core</span>
                         <div className="w-1 h-1 rounded-full bg-slate-700" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sync Active</span>
                      </div>
                      <div className="p-6 bg-black/40 rounded-3xl border border-white/5 mb-10 group/content relative">
                         <p className="text-[10px] font-mono text-slate-500 leading-relaxed line-clamp-4">
                            {resume.content}
                         </p>
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-3xl" />
                      </div>
                   </div>

                   <Link href={`/generate`}>
                      <Button className="w-full h-14 bg-white/5 hover:bg-primary text-slate-400 hover:text-white border border-white/10 hover:border-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all group/btn">
                         Eksekusi Optimasi <ArrowUpRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                      </Button>
                   </Link>
                </motion.div>
             ))}
             <button onClick={() => setIsAdding(true)} className="group border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center hover:border-primary/20 hover:bg-white/[0.01] transition-all min-h-[400px]">
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                   <PlusCircle className="w-7 h-7 text-slate-700 group-hover:text-white" />
                </div>
                <h4 className="text-lg font-black text-slate-700 group-hover:text-slate-400 uppercase tracking-widest">Inisialisasi Data Baru</h4>
             </button>
          </div>
        ) : (
          <div className="space-y-4">
             {resumes.map((resume, idx) => (
                <motion.div 
                   key={resume.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="glass-dark rounded-[1.5rem] p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all"
                >
                   <div className="flex items-center gap-6 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                         <FileText className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors">{resume.title}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">Foundation AI Core // Pulse ID: {resume.id}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <Link href={`/generate`}>
                         <Button variant="ghost" className="h-12 px-6 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
                            Optimasi
                         </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-12 w-12 text-slate-700 hover:text-red-500" onClick={() => setDeleteId(resume.id)}>
                         <Trash2 className="w-5 h-5" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-slate-800" />
                   </div>
                </motion.div>
             ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
           <DialogContent className="bg-slate-950 border-white/10 text-slate-200 rounded-[2rem] sm:max-w-md">
              <DialogHeader className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                 </div>
                 <DialogTitle className="text-2xl font-black text-white tracking-tight uppercase">Konfirmasi Hapus</DialogTitle>
                 <DialogDescription className="text-slate-500 font-medium pt-2">
                    Tindakan ini tidak dapat dibatalkan. Profil resume Anda akan dihapus secara permanen dari hub memori AI.
                 </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-4 pt-6">
                 <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-xs" onClick={() => setDeleteId(null)}>Batal</Button>
                 <Button className="flex-1 h-14 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20" onClick={handleDelete}>Hapus Sekarang</Button>
              </DialogFooter>
           </DialogContent>
        </Dialog>
      </main>

      <footer className="py-20 border-t border-white/5 text-center px-6">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">HireReady Intelligence Storage AC-7/Alpha</p>
      </footer>
    </div>
  );
}
