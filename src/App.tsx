/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent } from 'react';
import { 
  ExternalLink, Github, Linkedin, Mail, Monitor, Code2, 
  GraduationCap, Trophy, ArrowUpRight, Upload, 
  Sparkles, FileText, ChevronRight, Phone, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeData {
  name: string;
  role: string;
  bio: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  contact: {
    email: string;
    phone: string;
  };
  linkedIn: string;
  github: string;
  education?: {
    degree: string;
    school: string;
    institution?: string;
    startYear?: string;
    endYear?: string;
    gpa?: string;
  }[];
  projects?: {
    name: string;
    description: string;
    metrics?: string;
  }[];
  recognition?: string;
}

type Step = 1 | 2 | 3;
type Theme = 'bento' | 'light' | 'glass';

const ensureProtocol = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
}

const fallbackExtract = (text: string) => {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return {
        name: lines[0] || 'Professional Candidate',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : ''
    };
};

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [theme, setTheme] = useState<Theme>('bento');

  // Update theme attribute for CSS variables
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const uploadAndParse = async (fileToUpload: File) => {
    setFile(fileToUpload)
    setStep(2)

    const tryUrls = [import.meta.env.VITE_UPLOAD_API_URL || 'http://localhost:3000/upload']
    let resp = null
    let lastErr = null
    
    for (const url of tryUrls) {
      try {
        const fd2 = new FormData()
        fd2.append('resume', fileToUpload)
        resp = await fetch(url, { method: 'POST', body: fd2 })
        if (resp && resp.ok) break
      } catch (e) {
        lastErr = e
      }
    }

    if (!resp || !resp.ok) {
      console.error('Upload process failed', lastErr || (resp as Response)?.statusText)
      setStep(1)
      return
    }

    const data = await resp.json().catch(() => null)
    let parsedObj = data?.parsed || {}

    if (typeof parsedObj === 'string') {
      try { parsedObj = JSON.parse(parsedObj) } catch { parsedObj = { raw: parsedObj } }
    }

    const rawText = data?.rawText || ''
    const fallback = fallbackExtract(rawText)

    let experienceMapped = []
    if (Array.isArray(parsedObj.experience) && parsedObj.experience.length > 0) {
      experienceMapped = parsedObj.experience.map((exp: any) => ({
        company: exp.company || 'Unknown Company',
        role: exp.title || exp.role || 'Professional Position',
        period: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp.startDate || exp.period || 'Dates Unspecified'),
        description: exp.description || ''
      }))
    }

    const newResume: ResumeData = {
      name: parsedObj.name || fallback.name || 'Professional Candidate',
      role: parsedObj.role || parsedObj.title || (experienceMapped[0]?.role) || 'Software Professional',
      bio: parsedObj.summary || parsedObj.bio || '',
      skills: Array.isArray(parsedObj.skills) && parsedObj.skills.length > 0 ? parsedObj.skills : ['Software Engineering', 'Problem Solving'],
      experience: experienceMapped.length > 0 ? experienceMapped : [{ company: 'Independent Contractor', role: 'Professional Consultant', period: 'Active', description: '' }],
      contact: {
        email: parsedObj.email || fallback.email || '',
        phone: parsedObj.phone || fallback.phone || ''
      },
      linkedIn : parsedObj.linkedin || '',
      github : parsedObj.github || '',
      // Map education with all fields
      education: Array.isArray(parsedObj.education) ? parsedObj.education.map((edu: any) => ({
        degree: edu.degree || 'Degree',
        school: edu.institution || edu.school || 'University',
        institution: edu.institution || edu.school || 'University',
        startYear: edu.startYear || '',
        endYear: edu.endYear || '',
        gpa: edu.gpa || ''
      })) : undefined,
      projects: parsedObj.projects,
      recognition: parsedObj.recognition
    }

    setResumeData(newResume)
    setStep(3)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndParse(file);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
              <Sparkles size={16} />
              <span>AI-Powered Portfolio Builder</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build Your <span className="text-emerald-500">Portfolio</span> in Seconds
            </h1>
            <p className="text-slate-400 text-lg">
              Upload your resume and watch it transform into a personal brand website.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <label className="relative flex flex-col items-center justify-center gap-4 py-16 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:border-emerald-500/50 hover:bg-slate-900/50 transition-all group/upload shadow-2xl">
              <Upload className="text-slate-500 group-hover/upload:text-emerald-400 transition-colors" size={48} />
              <div className="space-y-1">
                <span className="text-xl font-bold text-slate-200 block">Click to upload your resume</span>
                <span className="text-sm text-slate-500">PDF, DOCX, or TXT supported</span>
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-800 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={24} className="text-emerald-500" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Magically Parsing Resume...</h2>
            <p className="text-slate-400 text-sm">Our AI is extracting your achievements and skills.</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3 && resumeData) {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 ${theme === 'light' ? 'bg-white/95 border-slate-200 shadow-xl shadow-emerald-500/10' : 'bg-slate-900/90 border-slate-800 shadow-2xl'} backdrop-blur-xl border p-1.5 rounded-full transition-all duration-300`}>
          <button 
            onClick={() => setStep(1)} 
            className={`px-5 py-2 text-xs font-black transition-colors ${theme === 'light' ? 'text-slate-600 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'}`}
          >
            RESTART
          </button>
          <div className={`w-px h-4 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
          <div className="flex gap-1">
            {(['bento', 'light', 'glass'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => updateTheme(t)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                  theme === t 
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' 
                    : (theme === 'light' ? 'text-slate-400 hover:text-slate-900' : 'text-slate-500 hover:text-white')
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={theme} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {(theme === 'bento' || theme === 'light') && <BentoTheme data={resumeData} isLight={theme === 'light'} />}
            {theme === 'glass' && <GlassTheme data={resumeData} />}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

function BentoTheme({ data, isLight }: { data: ResumeData, isLight?: boolean }) {
  const styles = {
    navBg: isLight ? 'bg-white/70 border-slate-200' : 'bg-slate-900/60 border-slate-800',
    navText: isLight ? 'text-slate-600' : 'text-slate-400',
    navTextActive: isLight ? 'text-emerald-700' : 'text-emerald-400',
    card: isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800',
    textMain: isLight ? 'text-slate-900' : 'text-white',
    textMuted: isLight ? 'text-slate-500' : 'text-slate-400',
    tag: isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'skill-tag'
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 pt-32 ${isLight ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <nav id="home" className={`flex justify-between items-center ${styles.navBg} border rounded-2xl px-6 py-4 backdrop-blur-md sticky top-24 z-40`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            {data.name.charAt(0)}
          </div>
          <span className={`font-bold text-xl tracking-tight ${isLight ? 'text-slate-900' : 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'}`}>
            {data.name.split(' ')[0]}.dev
          </span>
        </div>
        <div className={`hidden md:flex gap-8 text-sm font-medium ${styles.navText} px-6`}>
          <a href="#home" className={`${styles.navTextActive} font-semibold`}>Home</a>
          <a href="#projects" className="hover:text-emerald-500 transition-colors">Projects</a>
          <a href="#experience" className="hover:text-emerald-500 transition-colors">Experience</a>
        </div>
        <a 
          href={`mailto:${data.contact.email}`}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          Contact
        </a>
      </nav>

      <div className="grid grid-cols-12 auto-rows-min gap-4">
        {/* Profile */}
        <div className={`col-span-12 md:col-span-5 md:row-span-2 bento-card justify-center gap-4 relative overflow-hidden group ${isLight ? 'bg-white shadow-sm border-slate-200' : ''}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Monitor size={120} className={isLight ? 'text-slate-900' : 'text-white'} />
          </div>
          <div className="space-y-2 relative z-10">
            <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${styles.textMain} leading-tight`}>
              {data.name}
            </h1>
            <p className="text-emerald-500 font-mono text-sm uppercase tracking-wide font-bold">
              {data.role}
            </p>
          </div>
          <p className={`${styles.textMuted} text-sm leading-relaxed max-w-sm relative z-10`}>
            {data.bio || "Crafting digital excellence through code and design."}
          </p>
          <div className="flex items-center gap-4 pt-2 relative z-10">
            {data.linkedIn && data.linkedIn.trim() && (
              <a href={ensureProtocol(data.linkedIn)} target="_blank" rel="noopener noreferrer" className={`p-2.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'} rounded-xl border transition-colors`} title="LinkedIn">
                <Linkedin size={18} />
              </a>
            )}
            {data.github && data.github.trim() && (
              <a href={ensureProtocol(data.github)} target="_blank" rel="noopener noreferrer" className={`p-2.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'} rounded-xl border transition-colors`} title="GitHub">
                <Github size={18} />
              </a>
            )}
            <a href={`mailto:${data.contact.email}`} className={`p-2.5 ${isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'} rounded-xl border transition-colors text-sm font-medium px-4 flex items-center gap-2`}>
              <Mail size={14} /> Email
            </a>
          </div>
        </div>

        {/* Experience */}
        <div id="experience" className={`col-span-12 md:col-span-4 md:row-span-3 bento-card ${isLight ? 'bg-white shadow-sm border-slate-200' : ''}`}>
          <div className="flex items-center gap-2 mb-6">
            <div className="dot"></div>
            <h2 className={`text-xs uppercase font-bold tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Journey</h2>
          </div>
          <div className="space-y-8 relative">
            <div className={`absolute left-[7px] top-1 bottom-1 w-px ${isLight ? 'bg-slate-200' : 'bg-slate-800/50'}`}></div>
            {data.experience.map((exp, i) => (
              <div key={i} className={`relative pl-8 ${i > 1 ? 'opacity-60' : ''}`}>
                <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full ${i === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : (isLight ? 'bg-slate-300' : 'bg-slate-600')} border-4 ${isLight ? 'border-white' : 'border-slate-900'} z-10`}></div>
                <h3 className={`text-sm font-bold ${styles.textMain}`}>{exp.company}</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5">{exp.role} • {exp.period}</p>
                <p className={`text-xs ${styles.textMuted} mt-2 leading-relaxed line-clamp-3`}>
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stack */}
        <div className={`col-span-12 md:col-span-3 md:row-span-2 bento-card ${isLight ? 'bg-white shadow-sm border-slate-200' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className={`text-xs uppercase font-bold tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Tech Stack</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className={isLight ? 'px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold' : 'skill-tag'}>
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-auto pt-6 flex justify-center">
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className={`${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/40 border-slate-700/50'} border rounded-xl p-3 flex flex-col items-center`}>
                <Code2 size={24} className="text-emerald-500 mb-2" />
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'} uppercase`}>Coding</span>
              </div>
              <div className={`${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/40 border-slate-700/50'} border rounded-xl p-3 flex flex-col items-center`}>
                <Trophy size={24} className="text-emerald-500 mb-2" />
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-400' : 'text-slate-500'} uppercase`}>Expert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div id="projects" className={`col-span-12 md:col-span-5 md:row-span-2 bento-card ${isLight ? 'bg-white shadow-sm border-slate-200' : 'bg-slate-900/40 border-dashed border-slate-700'}`}>
          <div className="flex justify-between items-start h-full">
            <div className="space-y-5 h-full flex flex-col">
              <h2 className={`text-xs uppercase font-bold tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Featured Work</h2>
              <div className="space-y-4">
                {(data.projects || []).slice(0, 2).map((proj, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-base font-bold ${styles.textMain} group-hover:text-emerald-500 transition-colors uppercase tracking-tight`}>{proj.name}</h3>
                      <ArrowUpRight size={14} className="text-slate-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className={`text-xs ${styles.textMuted} mt-1 leading-snug`}>{proj.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <p className="text-xs text-emerald-500 font-medium">View all works →</p>
              </div>
            </div>
          </div>
        </div>

        {/* Education */}
        <div className={`col-span-12 md:col-span-3 md:row-span-2 rounded-[1.5rem] p-5 flex flex-col shadow-lg transition-all ${isLight ? 'bg-white border border-slate-200 shadow-slate-200/50' : 'bg-emerald-500 text-slate-950 shadow-emerald-500/10'}`}>
          <div className={`flex items-center gap-2 opacity-70 mb-3 font-bold uppercase tracking-widest text-[10px] ${isLight ? 'text-emerald-600' : 'text-slate-950'}`}>
            <GraduationCap size={16} />
            <h2>Education</h2>
          </div>
          {data.education?.[0] && (
            <div className="flex flex-col h-full gap-2">
              <p className={`text-lg md:text-xl font-bold leading-tight tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-950'}`}>
                {data.education[0].degree}
              </p>
              <p className={`text-[11px] font-bold leading-snug ${isLight ? 'text-slate-500' : 'text-slate-950/80'}`}>
                {data.education[0].institution || data.education[0].school}
              </p>
              {data.education[0].startYear && (
                <p className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-emerald-600' : 'text-slate-950/60'}`}>
                  {data.education[0].startYear} — {data.education[0].endYear || 'Present'}
                </p>
              )}
              <div className="mt-auto flex justify-between items-end">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 ${isLight ? 'border-white bg-slate-100' : 'border-emerald-500 bg-slate-950'}`}></div>
                  ))}
                </div>
                {data.education[0].gpa && (
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-black leading-none ${isLight ? 'text-slate-900' : 'text-slate-950'}`}>{data.education[0].gpa}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${isLight ? 'text-slate-400' : 'text-slate-950/60'}`}>Academic</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact/Recognition */}
        <div id="contact" className={`col-span-12 md:col-span-4 md:row-span-1 bento-card flex-row items-center justify-between min-h-[70px] ${isLight ? 'bg-white shadow-sm border-slate-200' : ''}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Recognition</span>
            {data.recognition && (
              <div className="flex items-center gap-2 mt-1">
                <Trophy size={14} className="text-emerald-500" />
                <span className={`text-xs font-bold ${styles.textMain} line-clamp-1`}>{data.recognition}</span>
              </div>
            )}
          </div>
          <a href={`mailto:${data.contact.email}`} className="p-2 bg-emerald-500 text-slate-950 rounded-full hover:scale-105 transition-transform" title="Contact Me">
            <ArrowUpRight size={20} />
          </a>
        </div>
      </div>

      <footer className="text-center py-12 border-t border-slate-900 mt-8 opacity-50">
        <p className={`${isLight ? 'text-slate-400' : 'text-slate-500'} text-[10px] uppercase tracking-[0.2em] font-semibold`}>
          AI Generated Experience • {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function GlassTheme({ data }: { data: ResumeData }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 lg:p-24 pt-32 relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/20 blur-[120px] rounded-full"></div>
      </div>
      <div className="relative z-10 max-w-6xl mx-auto space-y-24">
        <section className="max-w-3xl space-y-8">
          <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-7xl md:text-8xl font-black italic tracking-tighter leading-[0.9]">
            {data.name.split(' ').map((n, i) => (
              <span key={i} className={i % 2 === 0 ? 'text-white' : 'text-emerald-400 block'}>{n} </span>
            ))}
          </motion.h1>
          <p className="text-2xl text-slate-400 font-light leading-relaxed">{data.bio || data.role}</p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div> Stack
            </h2>
            <div className="flex flex-wrap gap-3">
              {data.skills.map(s => <span key={s} className="px-5 py-2 bg-white/5 border border-white/5 rounded-full text-sm">{s}</span>)}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-10">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400"></div> Journey
            </h2>
            <div className="space-y-6">
              {data.experience.slice(0, 3).map((exp, i) => (
                <div key={i}>
                  <h3 className="font-bold text-lg">{exp.company}</h3>
                  <p className="text-sm text-slate-400">{exp.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
