import { useState, useEffect, useRef } from 'react';
import { MapPin, Briefcase, ArrowRight, Building2, Sparkles, ChevronDown, FileText, Brain, Target, BarChart3, Upload, Loader2, CheckCircle, AlertCircle, ChevronUp, X } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import PlacesAutocomplete from './PlacesAutocomplete';

const Hero = () => {
  const [jobKeyword, setJobKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [industries, setIndustries] = useState([]);
  const [industryOpen, setIndustryOpen] = useState(false);
  const industryRef = useRef(null);

  // Lead capture state
  const [leadForm, setLeadForm] = useState({ fullName: '', email: '', phone: '', hasVisa: false, hasWorkPermit: false });
  const [cvFile, setCvFile] = useState(null);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadResult, setLeadResult] = useState(null);
  const [leadMinimized, setLeadMinimized] = useState(false);
  const cvInputRef = useRef(null);
  const cvInputRefInline = useRef(null);

  const handleLeadChange = (e) => setLeadForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'doc', 'docx'].includes(ext)) { setLeadResult({ type: 'error', message: 'Only PDF, DOC, DOCX allowed' }); return; }
      if (file.size > 10 * 1024 * 1024) { setLeadResult({ type: 'error', message: 'Max 10MB' }); return; }
      setCvFile(file);
      setLeadResult(null);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.fullName.trim() || !leadForm.email.trim()) { setLeadResult({ type: 'error', message: 'Name and email required' }); return; }
    if (!cvFile) { setLeadResult({ type: 'error', message: 'Please upload your CV' }); return; }
    setLeadSubmitting(true); setLeadResult(null);
    try {
      const fd = new FormData();
      fd.append('fullName', leadForm.fullName.trim());
      fd.append('email', leadForm.email.trim());
      fd.append('phone', leadForm.phone.trim());
      fd.append('hasVisa', leadForm.hasVisa);
      fd.append('hasWorkPermit', leadForm.hasWorkPermit);
      fd.append('cv', cvFile);
      const res = await fetch(`${BASE_URL}/public/lead-capture`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) { setLeadResult({ type: 'error', message: data.message || 'Something went wrong' }); }
      else {
        sessionStorage.setItem('leadInfo', JSON.stringify({ id: data.result.id, email: data.result.email || leadForm.email.trim().toLowerCase(), fullName: leadForm.fullName.trim(), phone: leadForm.phone.trim() }));
        window.location.href = `/joblisting?leadId=${data.result.id}`;
        return;
      }
    } catch { setLeadResult({ type: 'error', message: 'Network error' }); }
    finally { setLeadSubmitting(false); }
  };

  const popularSearches = ['Software Engineer', 'Marketing Manager', 'Sales Executive', 'Accountant', 'Banking', 'Finance', 'Remote Developer'];

  // Fetch real industries from taxonomy API
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/industries/taxonomy`);
        const data = await res.json();
        if (!data.error && data.result) {
          const allIndustries = [];
          for (const group of data.result) {
            for (const ind of group.industries || []) {
              allIndustries.push(ind.name);
            }
          }
          allIndustries.sort((a, b) => a.localeCompare(b));
          setIndustries(allIndustries);
        }
      } catch {
        setIndustries(['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Hospitality', 'Construction', 'Real Estate']);
      }
    };
    fetchIndustries();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    const searchTerm = jobKeyword.trim();
    if (searchTerm) params.set("q", searchTerm);
    if (industry) params.set("category", industry);
    if (location) params.set("location", location);
    window.location.href = `/joblisting?${params.toString()}`;
  };

  // Close industry dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (industryRef.current && !industryRef.current.contains(e.target)) setIndustryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center justify-center overflow-hidden bg-[#FAFBFC] dark:bg-gray-950">

      {/* AI Job Match -- pinned top-right corner on xl, inline on smaller */}
      <div className="absolute top-3 right-[3%] z-20 w-[280px] hidden xl:block animate-fade-in-up delay-300">
        {leadMinimized ? (
          <button
            onClick={() => setLeadMinimized(false)}
            className="ml-auto flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl"
          >
            <Sparkles size={15} />
            <span className="text-xs font-semibold">AI Job Match</span>
            <ChevronUp size={14} />
          </button>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <Sparkles size={13} className="text-orange-600" />
                <span className="text-slate-800 dark:text-white text-[11px] font-semibold">AI Job Match</span>
              </div>
              <button onClick={() => setLeadMinimized(true)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <X size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" />
              </button>
            </div>
            <div className="p-3">
              <form onSubmit={handleLeadSubmit} className="space-y-1.5">
                <input type="text" name="fullName" placeholder="Full Name *" value={leadForm.fullName} onChange={handleLeadChange}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" required />
                <input type="email" name="email" placeholder="Email *" value={leadForm.email} onChange={handleLeadChange}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" required />
                <input type="tel" name="phone" placeholder="Phone (optional)" value={leadForm.phone} onChange={handleLeadChange}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" />
                <div className="flex items-center gap-4 py-0.5">
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={leadForm.hasVisa} onChange={(e) => setLeadForm((p) => ({ ...p, hasVisa: e.target.checked }))}
                      className="w-3 h-3 rounded border-slate-300 accent-orange-600" />
                    I have a Visa
                  </label>
                  <label className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                    <input type="checkbox" checked={leadForm.hasWorkPermit} onChange={(e) => setLeadForm((p) => ({ ...p, hasWorkPermit: e.target.checked }))}
                      className="w-3 h-3 rounded border-slate-300 accent-orange-600" />
                    Work Permit
                  </label>
                </div>
                <div onClick={() => cvInputRef.current?.click()}
                  className="border border-dashed border-slate-300 dark:border-slate-500 hover:border-orange-500 rounded-md py-2 text-center cursor-pointer transition group">
                  <input ref={cvInputRef} type="file" onChange={handleCvChange} className="hidden" accept=".pdf,.doc,.docx" />
                  {cvFile ? (
                    <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium px-2 truncate">{cvFile.name}</p>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <Upload size={11} className="text-slate-400 group-hover:text-orange-600 transition" />
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition">Upload CV - PDF, DOC, DOCX</span>
                    </div>
                  )}
                </div>
                {leadResult && (
                  <div className={`flex items-start gap-1 p-1.5 rounded text-[10px] ${leadResult.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {leadResult.type === 'success' ? <CheckCircle size={10} className="shrink-0 mt-px" /> : <AlertCircle size={10} className="shrink-0 mt-px" />}
                    <span>{leadResult.message}</span>
                  </div>
                )}
                <button type="submit" disabled={leadSubmitting}
                  className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold rounded-md transition text-[11px] flex items-center justify-center gap-1.5">
                  {leadSubmitting ? (<><Loader2 size={12} className="animate-spin" /> Analysing...</>) : (<><Sparkles size={12} /> Get AI Job Matches</>)}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Main Content -- centered vertically & horizontally */}
      <div className="relative z-10 max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-4 w-full flex flex-col items-center justify-center">
        <div className="text-center w-full mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-full mb-6 sm:mb-8 animate-fade-in">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-orange-700 dark:text-orange-400 font-medium text-xs sm:text-sm md:text-base">AI-Powered Career Platform</span>
          </div>

          {/* Intro text -- centered, symmetric padding on xl keeps text centered while clearing the box */}
          <div className="mb-6 sm:mb-8 xl:px-[320px]">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 sm:mb-6 text-slate-800 dark:text-white animate-fade-in-up">
              Your AI Career Partner{' '}
              <br className="hidden sm:block" />
              <span className="text-orange-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
                Matching You to the Perfect Job
              </span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 animate-fade-in-up delay-200">
              Upload your CV and let our AI extract your skills, match you to thousands of jobs, and score your fit -- so you apply where you'll shine.
            </p>
          </div>

          {/* AI Job Match -- inline for smaller screens (xl uses the absolute version above) */}
          <div className="xl:hidden mb-6 max-w-md mx-auto animate-fade-in-up delay-300">
            {leadMinimized ? (
              <button
                onClick={() => setLeadMinimized(false)}
                className="mx-auto flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl"
              >
                <Sparkles size={15} />
                <span className="text-xs font-semibold">AI Job Match</span>
                <ChevronUp size={14} />
              </button>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-orange-600" />
                    <span className="text-slate-800 dark:text-white text-[11px] font-semibold">AI Job Match</span>
                  </div>
                  <button onClick={() => setLeadMinimized(true)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <X size={11} className="text-slate-400 hover:text-slate-600 dark:hover:text-white" />
                  </button>
                </div>
                <div className="p-3">
                  <form onSubmit={handleLeadSubmit} className="space-y-1.5">
                    <input type="text" name="fullName" placeholder="Full Name *" value={leadForm.fullName} onChange={handleLeadChange}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" required />
                    <input type="email" name="email" placeholder="Email *" value={leadForm.email} onChange={handleLeadChange}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" required />
                    <input type="tel" name="phone" placeholder="Phone (optional)" value={leadForm.phone} onChange={handleLeadChange}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-500 transition" />
                    <div className="flex items-center gap-4 py-0.5">
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                        <input type="checkbox" checked={leadForm.hasVisa} onChange={(e) => setLeadForm((p) => ({ ...p, hasVisa: e.target.checked }))}
                          className="w-3 h-3 rounded border-slate-300 accent-orange-600" />
                        I have a Visa
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                        <input type="checkbox" checked={leadForm.hasWorkPermit} onChange={(e) => setLeadForm((p) => ({ ...p, hasWorkPermit: e.target.checked }))}
                          className="w-3 h-3 rounded border-slate-300 accent-orange-600" />
                        Work Permit
                      </label>
                    </div>
                    <div onClick={() => cvInputRef.current?.click()}
                      className="border border-dashed border-slate-300 dark:border-slate-500 hover:border-orange-500 rounded-md py-2 text-center cursor-pointer transition group">
                      <input ref={cvInputRef} type="file" onChange={handleCvChange} className="hidden" accept=".pdf,.doc,.docx" />
                      {cvFile ? (
                        <p className="text-[10px] text-slate-700 dark:text-slate-200 font-medium px-2 truncate">{cvFile.name}</p>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5">
                          <Upload size={11} className="text-slate-400 group-hover:text-orange-600 transition" />
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition">Upload CV - PDF, DOC, DOCX</span>
                        </div>
                      )}
                    </div>
                    {leadResult && (
                      <div className={`flex items-start gap-1 p-1.5 rounded text-[10px] ${leadResult.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                        {leadResult.type === 'success' ? <CheckCircle size={10} className="shrink-0 mt-px" /> : <AlertCircle size={10} className="shrink-0 mt-px" />}
                        <span>{leadResult.message}</span>
                      </div>
                    )}
                    <button type="submit" disabled={leadSubmitting}
                      className="w-full py-1.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold rounded-md transition text-[11px] flex items-center justify-center gap-1.5">
                      {leadSubmitting ? (<><Loader2 size={12} className="animate-spin" /> Analysing...</>) : (<><Sparkles size={12} /> Get AI Job Matches</>)}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl shadow-lg p-2 sm:p-3 md:p-4 mb-6 sm:mb-8 animate-fade-in-up delay-300 max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">

              {/* Job Title Input */}
              <div className="flex-1 relative">
                <Sparkles className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-orange-600" size={18} />
                <input
                  type="text"
                  placeholder="Try: banking, remote react, finance..."
                  value={jobKeyword}
                  onChange={(e) => setJobKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 rounded-xl outline-none transition-all text-slate-800 dark:text-white placeholder:text-slate-400 text-sm sm:text-base"
                />
              </div>

              <div className="flex-1 relative" ref={industryRef}>
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" size={22} />
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none transition-transform ${industryOpen ? 'rotate-180' : ''}`} size={18} />
                <button
                  type="button"
                  onClick={() => setIndustryOpen(!industryOpen)}
                  className={`w-full pl-12 pr-10 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border ${industryOpen ? 'border-orange-500 ring-1 ring-orange-500/20' : 'border-slate-200 dark:border-slate-600'} rounded-xl outline-none transition-all text-left cursor-pointer text-sm sm:text-base ${industry ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}
                >
                  {industry || 'Industry'}
                </button>
                {industryOpen && (
                  <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto py-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => { setIndustry(''); setIndustryOpen(false); }}
                          className={`w-full text-left px-5 py-3 text-sm transition-colors ${!industry ? 'bg-orange-50 text-orange-700 font-semibold dark:bg-orange-900/20 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                          All Industries
                        </button>
                      </li>
                      {industries.map((ind) => (
                        <li key={ind}>
                          <button
                            type="button"
                            onClick={() => { setIndustry(ind); setIndustryOpen(false); }}
                            className={`w-full text-left px-5 py-3 text-sm transition-colors ${industry === ind ? 'bg-orange-50 text-orange-700 font-semibold dark:bg-orange-900/20 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {ind}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <PlacesAutocomplete
                  value={location}
                  onChange={setLocation}
                  placeholder="Search location..."
                  icon={<MapPin className="text-slate-400" size={22} />}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 rounded-xl outline-none transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 group text-sm sm:text-base"
              >
                <Sparkles size={18} />
                AI Search
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>

            <div className="mt-3 sm:mt-5 flex flex-wrap justify-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm">
              <span className="text-slate-400 font-medium self-center">Popular:</span>
              {popularSearches.map((search) => (
                <button
                  key={search}
                  onClick={() => {
                    window.location.href = `/joblisting?q=${encodeURIComponent(search)}&aiSearch=true`;
                  }}
                  className="px-2.5 sm:px-4 py-1 sm:py-1.5 border border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-full transition font-medium"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center animate-fade-in-up delay-500">
            <a
              href="/joblisting"
              className="group px-6 sm:px-10 py-3.5 sm:py-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 sm:gap-3 shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              <Briefcase size={18} />
              Looking for Work
              <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
            </a>

            <a
              href="https://recruiter.ratchetup.ai/register"
              target="_blank"
              rel="noopener noreferrer"
              className="group px-6 sm:px-10 py-3.5 sm:py-5 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-orange-500 hover:text-orange-700 dark:hover:text-orange-400 rounded-xl font-semibold transition flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              <Building2 size={18} />
              I'm Hiring
            </a>
          </div>

          {/* AI Capabilities Stats */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <FileText className="text-orange-600" size={22} />
              <p className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">AI CV Extraction</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">Auto-parse your resume</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Brain className="text-orange-600" size={22} />
              <p className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">AI Job Matching</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">Smart skill-to-job fit</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <BarChart3 className="text-orange-600" size={22} />
              <p className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">% Match Scoring</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">Know your fit instantly</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
              <Sparkles className="text-orange-600" size={22} />
              <p className="text-slate-800 dark:text-white font-bold text-xs sm:text-sm">AI CV Builder</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs">30+ premium templates</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in    { animation: fade-in 1s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
        .delay-200          { animation-delay: 0.2s; }
        .delay-300          { animation-delay: 0.3s; }
        .delay-500          { animation-delay: 0.5s; }
      `}</style>
    </section>
  );
};

export default Hero;
