import React, { useState } from 'react'
import {
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  Globe,
  Layout,
  Palette,
  ChevronRight,
  ArrowLeft,
  Github,
  Linkedin,
  Mail
} from 'lucide-react'

const App = () => {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Track active color theme
  const [themeColor, setThemeColor] = useState('indigo')

  const [resumeData, setResumeData] = useState({
    name: 'Alex Rivera',
    role: 'Senior Product Designer',
    bio: 'Passionate about building human-centered digital experiences with over 8 years of experience in SaaS and E-commerce.',
    skills: ['React', 'Next.js', 'Tailwind CSS', 'Figma', 'Node.js'],
    experience: [
      { company: 'TechCorp', role: 'Lead Designer', period: '2021 - Present' },
      { company: 'CreativeFlow', role: 'UI Architect', period: '2018 - 2021' }
    ],
    contact: {
      email: 'alex@riveradesign.com',
      phone: '+1 (555) 019-2834'
    }
  })

  // Theme map optimized for Tailwind v4 tokens
  const themes = {
    indigo: { primary: 'text-indigo-600', bg: 'bg-indigo-600', bgLight: 'bg-indigo-50', border: 'border-indigo-100', accent: 'shadow-indigo-200', btnRing: 'ring-indigo-500' }
  }

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0]
    if (!uploadedFile) return
    uploadAndParse(uploadedFile)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return
    uploadAndParse(droppedFile)
  }

  const fallbackExtract = (text) => {
    const out = {}
    if (!text) return out
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    if (emailMatch) out.email = emailMatch[0]
    
    const phoneMatch = text.match(/(\+?\d[\d\s()-]{6,}\d)/)
    if (phoneMatch) out.phone = phoneMatch[0]
    
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean)
    if (lines.length) {
      const possible = lines.find(l => !l.includes('@') && !/\d/.test(l) && l.split(' ').length <= 4)
      if (possible) out.name = possible
    }
    return out
  }

  const uploadAndParse = async (fileToUpload) => {
    setFile(fileToUpload)
    setStep(2)

    const tryUrls = ['http://localhost:3000/upload']
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
      console.error('Upload process failed', lastErr || resp?.statusText)
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
      experienceMapped = parsedObj.experience.map(exp => ({
        company: exp.company || 'Unknown Company',
        role: exp.title || exp.role || 'Professional Position',
        period: exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp.startDate || exp.period || 'Dates Unspecified'),
        description: exp.description || ''
      }))
    }

    const newResume = {
      name: parsedObj.name || fallback.name || 'Professional Candidate',
      role: parsedObj.role || parsedObj.title || (experienceMapped[0]?.role) || 'Software Professional',
      bio: parsedObj.summary || parsedObj.bio || '',
      skills: Array.isArray(parsedObj.skills) && parsedObj.skills.length > 0 ? parsedObj.skills : ['Software Engineering', 'Problem Solving'],
      experience: experienceMapped.length > 0 ? experienceMapped : [{ company: 'Independent Contractor', role: 'Professional Consultant', period: 'Active' }],
      contact: {
        email: parsedObj.email || fallback.email || '',
        phone: parsedObj.phone || fallback.phone || ''
      },
      linkedIn : parsedObj.linkedin || '',
      github : parsedObj.github || ''
    }

    setResumeData(newResume)
    setStep(3)
  }

  const activeTheme = themes[themeColor]

  // Helper function to ensure URLs have proper protocol
  const ensureProtocol = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Globe size={18} />
            </div>
            <span>SiteGen<span className="text-indigo-600">.ai</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ${
                step >= num ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {step > num ? <CheckCircle size={20} /> : num}
              </div>
              {num < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > num ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Upload View */}
        {step === 1 && (
          <div className="text-center custom-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Turn your resume into a <br />
              <span className="text-indigo-600">stunning website</span> in seconds.
            </h1>
            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
              Upload your PDF document. Our AI parses your career landmarks and dynamically generates an interactive digital portfolio layout.
            </p>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative group max-w-xl mx-auto border-2 border-dashed rounded-3xl p-12 transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragging ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                  isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Upload size={32} />
                </div>
                <p className="text-xl font-semibold mb-2">Click or drag your resume here</p>
                <p className="text-sm text-slate-400">PDF documents up to 10MB</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Parser Processing View */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-8">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText size={20} className="text-indigo-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing your career path...</h2>
            <div className="w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-indigo-600 animate-progress origin-left"></div>
            </div>
            <div className="mt-8 space-y-2">
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" /> Extracted personal details
              </p>
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Generating sections for Experience
              </p>
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" /> Mapping functional layouts
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Customizer Interface View */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 custom-zoom-in">
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft size={18} />
                  </button>
                  <h3 className="font-bold text-lg">Customize Portfolio</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Theme Color</label>
                    <div className="flex gap-3">
                      {Object.keys(themes).map((colorKey) => {
                        const targetBg = colorKey === 'indigo' ? 'bg-indigo-600' :
                                         colorKey === 'rose' ? 'bg-rose-500' :
                                         colorKey === 'emerald' ? 'bg-emerald-600' :
                                         colorKey === 'amber' ? 'bg-amber-500' : 'bg-slate-900';
                        return (
                          <button 
                            key={colorKey} 
                            onClick={() => setThemeColor(colorKey)}
                            className={`w-8 h-8 rounded-full ${targetBg} ring-offset-2 transition-all ${
                              themeColor === colorKey ? 'ring-2 ' + activeTheme.btnRing : 'hover:ring-2 ring-slate-300'
                            }`} 
                          />
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Layout Style</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center gap-2 p-3 border-2 border-indigo-600 bg-indigo-50/50 rounded-xl text-sm font-medium">
                        <Layout size={16} /> Minimalist
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <button className={`w-full ${activeTheme.bg} text-white font-bold py-4 rounded-xl shadow-lg ${activeTheme.accent} hover:opacity-90 transition-all flex items-center justify-center gap-2`}>
                      Launch My Site <ChevronRight size={18} />
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4 italic">
                      Live site destination: <strong>{resumeData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.sitegen.ai</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

           {/* Live Document Preview Container */}
            <div className="lg:col-span-8">
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-[6px] border-slate-800">
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="mx-auto bg-slate-700/50 rounded-md px-3 py-1 text-[10px] text-slate-400 font-mono w-1/2 text-center truncate">
                    https://{resumeData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.sitegen.ai
                  </div>
                </div>

                {/* THE UPDATED PREVIEW AREA */}
                <div className="h-[600px] bg-[#0f172a] overflow-y-auto preview-scrollbar text-slate-300">
                  <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-12 gap-10">
                    
                    {/* Left Column: Personal Brand & Skills */}
                    <div className="md:col-span-4 space-y-10 border-r border-slate-800/50 pr-4">
                      <div className="space-y-4">
                        <div className={`w-16 h-16 rounded-2xl ${activeTheme.bg} flex items-center justify-center text-[#0f172a] font-black text-2xl italic shadow-xl`}>
                          {resumeData.name.charAt(0)}
                        </div>
                        <h1 className="text-2xl font-black text-white leading-tight tracking-tighter uppercase italic">
                          {resumeData.name}
                        </h1>
                        <p className={`${activeTheme.primary} text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed`}>
                          {resumeData.role}
                        </p>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Technical Stack</h4>
                        
                        {/* Dynamic Skills Handling: Handles both Arrays and Objects */}
                        {Array.isArray(resumeData.skills) ? (
                          <div className="flex flex-wrap gap-2">
                            {resumeData.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                                {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          Object.entries(resumeData.skills).map(([category, items]) => (
                            <div key={category} className="space-y-2">
                              <p className="text-[8px] font-bold text-slate-600 uppercase">{category}</p>
                              <div className="flex flex-wrap gap-2">
                                {items.map((s, i) => (
                                  <span key={i} className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right Column: Bio & Experience */}
                    <div className="md:col-span-8 space-y-12">
                      {resumeData.bio && (
                        <section>
                          <p className="text-md text-slate-400 leading-relaxed font-medium italic">
                            "{resumeData.bio}"
                          </p>
                        </section>
                      )}

                      <section className="space-y-8">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          Experience Journey
                        </h4>
                        <div className="space-y-6">
                          {resumeData.experience.map((exp, i) => (
                            <div key={i} className="group relative pl-4 border-l border-slate-800 hover:border-teal-500 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <h3 className="text-white font-black uppercase text-sm tracking-tight">{exp.role}</h3>
                                <span className="text-[8px] font-mono text-slate-600 uppercase italic">{exp.period}</span>
                              </div>
                              <p className={`${activeTheme.primary} text-[11px] font-bold mb-2`}>{exp.company}</p>
                              {exp.description && (
                                <p className="text-xs text-slate-500 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>

                      <div className="pt-6 flex gap-4 border-t border-slate-800/50">
                        {resumeData.contact.email && (
                          <a href={`mailto:${resumeData.contact.email}`} className="text-slate-600 hover:text-white transition-colors" title="Email">
                            <Mail size={16} />
                          </a>
                        )}
                        {resumeData.linkedIn && resumeData.linkedIn.trim() && (
                          <a href={ensureProtocol(resumeData.linkedIn)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors" title="LinkedIn">
                            <Linkedin size={16} />
                          </a>
                        )}
                        {resumeData.github && resumeData.github.trim() && (
                          <a href={ensureProtocol(resumeData.github)} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-white transition-colors" title="GitHub">
                            <Github size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <footer className="p-8 border-t border-slate-900 text-center bg-slate-900/20">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      © {new Date().getFullYear()} {resumeData.name} — System Generated
                    </p>
                  </footer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(0.95); }
        }
        @keyframes customFadeIn {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes customZoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-progress {
          animation: progress 3s ease-out forwards;
        }
        .custom-fade-in {
          animation: customFadeIn 0.7s ease-out forwards;
        }
        .custom-zoom-in {
          animation: customZoomIn 0.5s ease-out forwards;
        }
        .preview-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .preview-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .preview-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  )
}

export default App