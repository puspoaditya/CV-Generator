"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";

// --- DYNAMIC SSR STABILITY FIX ---
const Button = dynamic(() => import("@/components/ui/button").then(mod => mod.Button), { ssr: false });
const Input = dynamic(() => import("@/components/ui/input").then(mod => mod.Input), { ssr: false });
const Label = dynamic(() => import("@/components/ui/label").then(mod => mod.Label), { ssr: false });
const Textarea = dynamic(() => import("@/components/ui/textarea").then(mod => mod.Textarea), { ssr: false });
const Tabs = dynamic(() => import("@/components/ui/tabs").then(mod => mod.Tabs), { ssr: false });
const TabsList = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsList), { ssr: false });
const TabsTrigger = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsTrigger), { ssr: false });
const TabsContent = dynamic(() => import("@/components/ui/tabs").then(mod => mod.TabsContent), { ssr: false });

// --- TYPES ---
interface Experience { title: string; company: string; period: string; description: string[]; }
interface Education { school: string; degree: string; year: string; }
interface Certification { name: string; issuer: string; year: string; }
interface Project { name: string; link: string; description: string; }

interface MasterCVData {
  name: string; role: string; email: string; phone: string; location: string;
  summary: string; skills: string[];
  experience: Experience[]; education: Education[];
  certifications: Certification[]; projects: Project[];
  linkedinUrl: string;
}

// --- DUMMY DATA ---
const dummyData: MasterCVData = {
  name: "ADITYA DWI PUSPO",
  role: "Distinguished Principal Enterprise Architect",
  email: "aditya.puspo@cvcraft.my.id",
  phone: "+62 812-3456-7890",
  location: "Jakarta, Indonesia",
  summary: "Visionary Software Architect with over 20 years of experience driving large-scale digital transformations across global financial institutions and tech giants. Specialized in hyper-scaling, distributed neural architectures, and mission-critical enterprise systems that handle billions of daily transactions.",
  skills: ["Global Enterprise Architecture", "Distributed Cloud Systems", "Neural Node Ingestion", "AI Integration Architecture", "Strategic Infrastructure Optimization", "Security & SOC Compliance", "Cross-Functional Leadership", "Financial Tech Strategy", "Blockchain Infrastructure", "High-Density Microservices"],
  experience: Array.from({ length: 25 }, (_, i) => ({
    title: i % 2 === 0 ? "Executive Solutions Architect" : "Enterprise System Consultant",
    company: i % 2 === 0 ? "HyperTech Global Corp" : "Strategic Digital Group",
    period: `20${25 - i} - 20${26 - i}`,
    description: [
      "Orchestrated the architectural blueprint for a regional payments gateway handling 500M transactions per quarter.",
      "Spearheaded the integration of a multi-cloud strategy saving $12M annually in operational infrastructure costs.",
      "Led a diverse team of 150+ engineers in a full-scale legacy migration covering 45 microservices in record time.",
      "Implemented a neural-net based security layer that reduced intrusion attempts by 98.4% across all data points.",
      "Architected an event-driven data streaming platform using Kafka and Go for real-time customer analytics.",
    ],
  })),
  education: [
    { school: "Stanford University", degree: "Executive Leadership in Technology", year: "2018" },
    { school: "University of Tech Excellence", degree: "Master of Computer Science", year: "2005" },
  ],
  certifications: Array.from({ length: 8 }, (_, i) => ({
    name: i % 2 === 0 ? `AWS Distinguished Architect v${i + 1}` : `GCP Professional Cloud Dev v${i + 1}`,
    issuer: i % 2 === 0 ? "Amazon Web Services" : "Google Cloud",
    year: `20${24 - i}`,
  })),
  projects: Array.from({ length: 12 }, (_, i) => ({
    name: `Project Matrix-X ${i + 1}`,
    link: `github.com/aditya/matrix-x-${i + 1}`,
    description: "A comprehensive open-source implementation of a high-density neural ingestion pipeline capable of processing 1PB of unstructured data per day with near-zero latency and high auditability.",
  })),
  linkedinUrl: "linkedin.com/in/adityapuspo",
};

type ContentEl = { type: string; data: any };

// --- PAGE MAX CONTENT HEIGHT (with safe 40px bottom margin) ---
const PAGE_CONTENT_H = 860; // 1100 - 2*py-12(96px) - 40px extra margin
const SUMMARY_H_APPROX = 140; // approximate for page 0

// Invisible offscreen measurer
function MeasureBox({ el, onMeasured }: { el: ContentEl; onMeasured: (h: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      onMeasured(ref.current.getBoundingClientRect().height);
    }
  }, [el]);

  return (
    <div ref={ref} style={{ position: "absolute", visibility: "hidden", width: 550, left: -9999, top: 0 }}>
      {el.type === "experience" && (
        <div className="mb-4">
          <span className="text-[10px] text-[#999] uppercase tracking-[0.25em] font-bold block mb-1.5 border-l-2 border-[#2B3A4F]/20 pl-4">{el.data.period}</span>
          <h4 className="font-extrabold text-[18px] text-[#2B3A4F] tracking-tight mb-0.5 leading-tight">{el.data.title}</h4>
          <p className="text-[#4F5969] font-bold text-[12px] uppercase opacity-80 italic leading-none">{el.data.company}</p>
          <ul className="space-y-1 mt-3 ml-1 pl-4 border-l border-black/5 opacity-80">
            {el.data.description.map((d: string, di: number) => d && (<li key={di} className="text-[13px] text-[#4F5969] leading-tight font-light text-justify">{d}</li>))}
          </ul>
        </div>
      )}
      {el.type === "education" && (
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1">
            <h4 className="font-extrabold text-[16px] text-[#2B3A4F] tracking-tight">{el.data.school}</h4>
            <span className="text-[10px] font-bold uppercase">{el.data.year}</span>
          </div>
          <p className="text-[#4F5969] text-[13px] font-medium opacity-80 italic">{el.data.degree}</p>
        </div>
      )}
      {el.type === "certification" && (
        <div className="mb-4 flex gap-6 items-start">
          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
          <div className="flex-1">
            <h5 className="font-bold text-[14px] uppercase tracking-tight leading-tight mb-1">{el.data.name}</h5>
            <p className="text-[11px] font-bold tracking-[0.2em]">{el.data.issuer}</p>
          </div>
        </div>
      )}
      {el.type === "project" && (
        <div className="mb-6">
          <h4 className="font-extrabold text-[16px] leading-tight mb-2 uppercase tracking-tight">{el.data.name}</h4>
          {el.data.link && <span className="text-[11px] block mb-1.5 italic break-all">{el.data.link}</span>}
          <p className="text-[13px] leading-tight font-light text-justify">{el.data.description}</p>
        </div>
      )}
    </div>
  );
}

export default function CreateMasterResume() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [cvData, setCvData] = useState<MasterCVData>({
    name: "", role: "", email: "", phone: "", location: "",
    summary: "", skills: [], experience: [], education: [],
    certifications: [], projects: [], linkedinUrl: "",
  });

  const displayData: MasterCVData = {
    name: cvData.name || dummyData.name,
    role: cvData.role || dummyData.role,
    email: cvData.email || dummyData.email,
    phone: cvData.phone || dummyData.phone,
    location: cvData.location || dummyData.location,
    summary: cvData.summary || dummyData.summary,
    skills: cvData.skills.length > 0 ? cvData.skills : dummyData.skills,
    experience: cvData.experience.length > 0 ? cvData.experience : dummyData.experience,
    education: cvData.education.length > 0 ? cvData.education : dummyData.education,
    certifications: cvData.certifications.length > 0 ? cvData.certifications : dummyData.certifications,
    projects: cvData.projects.length > 0 ? cvData.projects : dummyData.projects,
    linkedinUrl: cvData.linkedinUrl || dummyData.linkedinUrl,
  };

  // -- All flat content elements --
  const allElements: ContentEl[] = [
    ...displayData.experience.map(d => ({ type: "experience", data: d })),
    ...displayData.education.map(d => ({ type: "education", data: d })),
    ...displayData.certifications.map(d => ({ type: "certification", data: d })),
    ...displayData.projects.map(d => ({ type: "project", data: d })),
  ];

  // -- Measured heights (null = not measured yet) --
  const [measuredHeights, setMeasuredHeights] = useState<(number | null)[]>([]);

  // Reset measurements when data changes
  useEffect(() => {
    setMeasuredHeights(new Array(allElements.length).fill(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(allElements)]);

  const handleMeasured = (idx: number, h: number) => {
    setMeasuredHeights(prev => {
      if (prev[idx] === h) return prev;
      const next = [...prev];
      next[idx] = h;
      return next;
    });
  };

  // -- Fragment based on measured heights --
  const allMeasured = measuredHeights.length === allElements.length && measuredHeights.every(h => h !== null);

  const contentPages: ContentEl[][] = (() => {
    if (!allMeasured) return [[]];
    const pages: ContentEl[][] = [];
    let currentPage: ContentEl[] = [];
    let currentH = 0;

    // Page 0 has summary taking up space
    let page0offset = SUMMARY_H_APPROX;

    allElements.forEach((el, i) => {
      const elH = (measuredHeights[i] as number) + 24; // +24 for space-y-6 gap
      const maxH = pages.length === 0 ? PAGE_CONTENT_H - page0offset : PAGE_CONTENT_H;

      if (currentH + elH > maxH) {
        pages.push(currentPage);
        currentPage = [el];
        currentH = elH;
      } else {
        currentPage.push(el);
        currentH += elH;
      }
    });
    if (currentPage.length > 0) pages.push(currentPage);
    return pages.length > 0 ? pages : [[]];
  })();

  const handleIngest = async (endpoint: string, body: any) => {
    setLoading(true);
    try {
      const resp = await apiFetch(endpoint, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) });
      const { text, content } = await resp.json();
      const raw = text || content;
      const parse = await apiFetch("/resumes/parse", { method: "POST", body: JSON.stringify({ content: raw }) });
      setCvData({ ...cvData, ...await parse.json() });
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!cvData.name) return alert("Nama wajib diisi.");
    setLoading(true);
    try {
      const res = await apiFetch("/resumes", {
        method: "POST",
        body: JSON.stringify({ title: title || "Master CV", content: JSON.stringify(cvData), source: "architect_sync" }),
      });
      if (res.ok) router.push("/resumes?type=master");
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  const updateList = (key: keyof MasterCVData, index: number, field: string, value: string) => {
    const list = [...(cvData[key] as any[])];
    if (field === "description" && key === "experience") list[index][field] = value.split("\n");
    else list[index][field] = value;
    setCvData({ ...cvData, [key]: list });
  };

  const removeEntry = (key: keyof MasterCVData, index: number) => {
    const list = [...(cvData[key] as any[])];
    list.splice(index, 1);
    setCvData({ ...cvData, [key]: list });
  };

  const CVPageModel = ({ children }: { children: React.ReactNode }) => (
    <div className="w-[850px] h-[1100px] bg-white shadow-2xl relative mb-12 flex overflow-hidden shrink-0 border border-black/5">
      {children}
    </div>
  );

  const renderContentEl = (el: ContentEl, elIdx: number, pageIdx: number) => {
    const isFirstOfTypeInDoc =
      contentPages.flat().findIndex(item => item.type === el.type) ===
      contentPages.slice(0, pageIdx).flat().length + elIdx;

    return (
      <div key={elIdx} className="shadow-none border-none">
        {el.type === "experience" && (
          <div className="mb-4">
            {isFirstOfTypeInDoc && (
              <h3 className="text-[14px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.25em] mb-6 border-b border-black/10 pb-3 font-sans">Experience</h3>
            )}
            <span className="text-[10px] text-[#999] uppercase tracking-[0.25em] font-bold block mb-1.5 border-l-2 border-[#2B3A4F]/20 pl-4">{el.data.period}</span>
            <h4 className="font-extrabold text-[18px] text-[#2B3A4F] tracking-tight mb-0.5 leading-tight">{el.data.title}</h4>
            <p className="text-[#4F5969] font-bold text-[12px] uppercase opacity-80 italic leading-none">{el.data.company}</p>
            <ul className="space-y-1 mt-3 ml-1 pl-4 border-l border-black/5 opacity-80">
              {el.data.description.map((d: string, di: number) => d && (
                <li key={di} className="text-[13px] text-[#4F5969] leading-tight font-light text-justify">{d}</li>
              ))}
            </ul>
          </div>
        )}
        {el.type === "education" && (
          <div className="mb-4">
            {isFirstOfTypeInDoc && (
              <h3 className="text-[14px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.25em] mb-6 border-b border-black/10 pb-3 font-sans">Education</h3>
            )}
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-extrabold text-[16px] text-[#2B3A4F] tracking-tight">{el.data.school}</h4>
              <span className="text-[10px] text-clay-400 font-bold uppercase">{el.data.year}</span>
            </div>
            <p className="text-[#4F5969] text-[13px] font-medium opacity-80 italic">{el.data.degree}</p>
          </div>
        )}
        {el.type === "certification" && (
          <div className="mb-4">
            {isFirstOfTypeInDoc && (
              <h3 className="text-[14px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.25em] mb-6 border-b border-black/10 pb-3 font-sans">License & Certification</h3>
            )}
            <div className="flex gap-6 items-start">
              <div className="w-2 h-2 rounded-full bg-brand-accent/20 mt-2 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="font-bold text-[14px] text-[#2B3A4F] uppercase tracking-tight leading-tight mb-1">{el.data.name}</h5>
                <p className="text-[11px] text-brand-accent font-bold tracking-[0.2em]">{el.data.issuer}</p>
              </div>
            </div>
          </div>
        )}
        {el.type === "project" && (
          <div className="mb-6">
            {isFirstOfTypeInDoc && (
              <h3 className="text-[14px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.25em] mb-6 border-b border-black/10 pb-3 font-sans">Project & Portfolio</h3>
            )}
            <h4 className="font-extrabold text-[16px] text-[#2B3A4F] leading-tight mb-2 uppercase tracking-tight">{el.data.name}</h4>
            {el.data.link && <a href="#" className="text-[11px] text-brand-accent font-medium tracking-[0.1em] block mb-1.5 italic break-all opacity-80">{el.data.link}</a>}
            <p className="text-[13px] text-[#4F5969] leading-tight font-light text-justify">{el.data.description}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-brand-bg flex flex-col font-sans overflow-hidden text-slate-900 border-t border-black/5">
      {/* Offscreen measurers — invisible, no layout impact */}
      <div style={{ position: "fixed", top: 0, left: -99999, visibility: "hidden", pointerEvents: "none", zIndex: -1 }}>
        {allElements.map((el, idx) => (
          <MeasureBox key={`${el.type}-${idx}`} el={el} onMeasured={(h) => handleMeasured(idx, h)} />
        ))}
      </div>

      <nav className="h-14 border-b border-black/10 bg-white/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/resumes?type=master" className="text-clay-400 hover:text-black transition-colors px-2">←</Link>
          <div className="font-serif font-bold text-lg text-clay-900 tracking-tight">CVCraft <span className="italic font-light text-brand-accent text-sm">Architect</span></div>
        </div>
        <div className="flex items-center gap-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Master Identifier..." className="h-9 w-44 text-[10px] bg-white/50 border-black/5 uppercase font-bold tracking-widest rounded-lg font-sans shadow-none border-none" />
          <Button onClick={handleSave} disabled={loading} className="bg-brand-accent h-9 px-6 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-brand-accent/20 font-sans shadow-none">
            {loading ? "..." : "Save Master"}
          </Button>
        </div>
      </nav>

      <main className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-[420px] border-r border-black/10 bg-brand-surface/40 flex flex-col h-full overflow-hidden shrink-0">
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-6 mb-4 h-11 bg-clay-200/50 rounded-xl p-1 shrink-0 border border-black/5 font-bold uppercase tracking-widest text-[9px] shadow-none">
              <TabsTrigger value="source" className="rounded-lg data-[state=active]:bg-white">⚡ Source</TabsTrigger>
              <TabsTrigger value="editor" className="rounded-lg data-[state=active]:bg-white">✍️ Editor</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto px-6 pb-40 custom-scrollbar scroll-smooth border-t border-black/[0.03]">
              <TabsContent value="source" className="space-y-4 pt-2">
                <div className="p-8 bg-white/50 border border-black/5 rounded-[2.5rem] hover:bg-white transition-all shadow-sm">
                  <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent mb-6 block">PDF Neural Ingestion</Label>
                  <div className="relative border-2 border-dashed border-black/5 rounded-3xl h-28 flex items-center justify-center hover:border-brand-accent/20 transition-all cursor-pointer">
                    <span className="text-[10px] font-bold text-clay-400 uppercase tracking-widest">{loading ? "Scanning..." : "Drag PDF"}</span>
                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => { const f = e.target.files?.[0]; if (f) { const fd = new FormData(); fd.append("file", f); handleIngest("/resumes/extract", fd); } }} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="editor" className="space-y-10 pt-2 animate-in fade-in duration-300">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.4em] border-b border-black/5 pb-2 font-sans">Identity & Contact</h3>
                  <Input value={cvData.name} onChange={e => setCvData({ ...cvData, name: e.target.value })} placeholder="FULL IDENTITY NAME" className="h-12 bg-white/80 border-black/5 font-bold rounded-xl shadow-none" />
                  <Input value={cvData.role} onChange={e => setCvData({ ...cvData, role: e.target.value })} placeholder="Professional Title..." className="h-11 bg-white/40 border-black/5 rounded-xl italic text-sm shadow-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={cvData.email} onChange={e => setCvData({ ...cvData, email: e.target.value })} placeholder="Email" className="h-10 bg-white/40 border-black/5 rounded-xl text-xs shadow-none border-none" />
                    <Input value={cvData.phone} onChange={e => setCvData({ ...cvData, phone: e.target.value })} placeholder="Phone" className="h-10 bg-white/40 border-black/5 rounded-xl text-xs shadow-none border-none" />
                  </div>
                  <Input value={cvData.location} onChange={e => setCvData({ ...cvData, location: e.target.value })} placeholder="Location" className="h-10 bg-white/40 border-black/5 rounded-xl text-xs shadow-none border-none" />
                  <Input value={cvData.linkedinUrl} onChange={e => setCvData({ ...cvData, linkedinUrl: e.target.value })} placeholder="LinkedIn URL" className="h-10 bg-white/30 border-black/5 text-xs text-brand-accent shadow-none border-none" />
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.4em] border-b border-black/5 pb-2 font-sans">Summary Matrix</h3>
                  <Textarea value={cvData.summary} onChange={e => setCvData({ ...cvData, summary: e.target.value })} placeholder="Summary professional background..." className="min-h-[140px] bg-white border-black/5 rounded-3xl p-6 text-sm leading-relaxed shadow-none font-sans" />
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.4em] border-b border-black/5 pb-2 font-sans">Skills Matrix (Comma Separated)</h3>
                  <Textarea value={cvData.skills.join(", ")} onChange={e => setCvData({ ...cvData, skills: e.target.value.split(",").map(s => s.trim()) })} placeholder="Logic Core, Matrix Architect..." className="min-h-[100px] bg-white border-black/5 rounded-3xl p-6 text-sm leading-relaxed shadow-none font-sans" />
                </section>

                <section className="space-y-8">
                  <div className="flex justify-between items-center border-b border-black/5 pb-3">
                    <h3 className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.4em]">Experience Set</h3>
                    <button onClick={() => setCvData({ ...cvData, experience: [...cvData.experience, { title: "", company: "", period: "", description: [] }] })} className="text-brand-accent text-[9px] font-bold uppercase tracking-widest">+ Add</button>
                  </div>
                  {cvData.experience.map((exp, i) => (
                    <div key={i} className="p-6 bg-white border border-black/5 rounded-3xl relative shadow-sm">
                      <button onClick={() => removeEntry("experience", i)} className="absolute top-4 right-6 text-gray-200 text-[10px]">🗑️</button>
                      <input value={exp.title} onChange={e => updateList("experience", i, "title", e.target.value)} placeholder="Role title" className="w-full bg-transparent border-none font-bold text-base mb-1 focus:outline-none font-sans" />
                      <div className="flex items-center gap-4 mb-4 pb-2 border-b border-black/[0.03]">
                        <input value={exp.company} onChange={e => updateList("experience", i, "company", e.target.value)} placeholder="Organization" className="text-[10px] text-brand-accent font-bold bg-transparent focus:outline-none uppercase tracking-widest font-sans" />
                        <input value={exp.period} onChange={e => updateList("experience", i, "period", e.target.value)} placeholder="Period" className="text-[10px] text-clay-400 bg-transparent focus:outline-none tracking-widest font-sans" />
                      </div>
                      <Textarea value={exp.description.join("\n")} onChange={e => updateList("experience", i, "description", e.target.value)} placeholder="Bullet fragments..." className="min-h-[100px] bg-clay-50/10 border-none rounded-2xl p-4 text-[11px] leading-relaxed shadow-none font-sans" />
                    </div>
                  ))}
                </section>

                <section className="space-y-4 pb-44">
                  <h3 className="text-[10px] font-bold text-clay-400 uppercase tracking-[0.4em] border-b border-black/5 pb-2 font-sans">Additional Matrix</h3>
                  <div className="flex gap-4">
                    <button onClick={() => setCvData({ ...cvData, education: [...cvData.education, { school: "", degree: "", year: "" }] })} className="text-brand-accent text-[9px] font-bold uppercase tracking-widest">+ Edu</button>
                    <button onClick={() => setCvData({ ...cvData, certifications: [...cvData.certifications, { name: "", issuer: "", year: "" }] })} className="text-brand-accent text-[9px] font-bold uppercase tracking-widest">+ Cert</button>
                    <button onClick={() => setCvData({ ...cvData, projects: [...cvData.projects, { name: "", link: "", description: "" }] })} className="text-brand-accent text-[9px] font-bold uppercase tracking-widest">+ Proj</button>
                  </div>
                </section>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* RIGHT: DOM-MEASURED INFINITE A4 PREVIEW */}
        <div className="flex-1 bg-brand-surface2 overflow-y-auto pt-1 pb-40 flex flex-col items-center custom-scrollbar scroll-smooth">
          {!allMeasured ? (
            <div className="flex-1 flex items-center justify-center opacity-30 uppercase text-[10px] font-bold tracking-[0.4em] italic">Calibrating Layout...</div>
          ) : (
            contentPages.map((pageElements, pageIdx) => (
              <div key={pageIdx} className="w-[850px] h-[1100px] bg-white shadow-2xl relative mb-12 flex overflow-hidden shrink-0 border border-black/5">
                {/* SIDEBAR */}
                <div className="w-[300px] bg-[#EEF0F2] h-full flex flex-col p-8 font-sans shrink-0 border-r border-black/5">
                  {pageIdx === 0 ? (
                    <>
                      <header className="mb-14 pt-6 px-1">
                        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-[#2B3A4F] leading-[1.05]">{displayData.name.toUpperCase()}</h1>
                        <p className="text-[#2B3A4F] font-bold text-[13px] uppercase tracking-[0.3em] mt-5 opacity-70 leading-tight italic">{displayData.role}</p>
                        <div className="w-12 h-1 bg-[#2B3A4F] mt-8 opacity-30" />
                      </header>
                      <div className="space-y-12 shrink-0">
                        <section>
                          <h3 className="text-[13px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.2em] mb-4 border-b border-black/10 pb-2 ml-px">Details</h3>
                          <div className="space-y-4 text-[12px] text-[#4F5969]">
                            {displayData.email && <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-[#2B3A4F] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-bold">✉</div><span className="truncate break-all font-sans">{displayData.email}</span></div>}
                            {displayData.phone && <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-[#2B3A4F] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-bold">☏</div><span>{displayData.phone}</span></div>}
                            {displayData.location && <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-[#2B3A4F] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-bold">⌖</div><span className="leading-tight text-[11px]">{displayData.location}</span></div>}
                            {displayData.linkedinUrl && <div className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-[#2B3A4F] text-white flex items-center justify-center text-[10px] flex-shrink-0 font-bold">in</div><span className="truncate break-all text-[11px] italic underline">{displayData.linkedinUrl}</span></div>}
                          </div>
                        </section>
                        <section>
                          <h3 className="text-[13px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.2em] mb-4 border-b border-black/10 pb-2 ml-px">Skills</h3>
                          <div className="space-y-2 text-[13px] text-[#4F5969] pl-1 font-medium italic">
                            {displayData.skills.map((s, i) => (
                              <div key={i} className="flex items-center gap-3 leading-tight"><div className="w-1 h-1 bg-black/10" /><span>{s}</span></div>
                            ))}
                          </div>
                        </section>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 bg-white h-full p-10 py-12 flex flex-col font-sans overflow-hidden">
                  {pageIdx === 0 && (
                    <section className="mb-10 shrink-0">
                      <h3 className="text-[14px] font-extrabold text-[#2B3A4F] uppercase tracking-[0.25em] mb-4 border-b border-black/10 pb-3 font-sans">Summary Profile</h3>
                      <p className="text-[14px] text-[#4F5969] leading-relaxed font-light text-justify italic">{displayData.summary}</p>
                    </section>
                  )}
                  <div className="space-y-6">
                    {pageElements.map((el, elIdx) => renderContentEl(el, elIdx, pageIdx))}
                  </div>
                </div>
              </div>
            ))
          )}
          <div className="h-40 opacity-20 flex items-center py-40 uppercase text-[8px] font-bold tracking-[1.5em] italic font-sans">Architect End Projection</div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
      `}</style>
    </div>
  );
}
