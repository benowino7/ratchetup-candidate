import { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle, AlertCircle, Loader2, X, ChevronUp } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

const LeadCaptureBox = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', hasVisa: false, hasWorkPermit: false });
  const [cvFile, setCvFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [minimized, setMinimized] = useState(false);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!allowed.includes(file.type) && !['pdf', 'doc', 'docx'].includes(ext)) {
        setResult({ type: 'error', message: 'Only PDF, DOC, and DOCX files are allowed' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setResult({ type: 'error', message: 'File size must be under 10MB' });
        return;
      }
      setCvFile(file);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setResult({ type: 'error', message: 'Name and email are required' });
      return;
    }
    if (!cvFile) {
      setResult({ type: 'error', message: 'Please upload your CV' });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('fullName', formData.fullName.trim());
      fd.append('email', formData.email.trim());
      fd.append('phone', formData.phone.trim());
      fd.append('hasVisa', formData.hasVisa);
      fd.append('hasWorkPermit', formData.hasWorkPermit);
      fd.append('cv', cvFile);

      const res = await fetch(`${BASE_URL}/public/lead-capture`, {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();

      if (data.error) {
        setResult({ type: 'error', message: data.message || 'Something went wrong' });
      } else {
        sessionStorage.setItem('leadInfo', JSON.stringify({
          id: data.result.id,
          email: data.result.email || formData.email.trim().toLowerCase(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
        }));
        window.location.href = `/joblisting?leadId=${data.result.id}`;
        return;
      }
    } catch {
      setResult({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Minimized — subtle fixed tab at bottom-right
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-theme_color hover:bg-teal-600 text-white pl-4 pr-3 py-2.5 rounded-full shadow-lg transition-all hover:shadow-xl"
      >
        <Sparkles size={15} />
        <span className="text-xs font-semibold">AI Job Match</span>
        <ChevronUp size={14} />
      </button>
    );
  }

  // Expanded — compact fixed card at bottom-right
  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[320px] max-w-[calc(100vw-48px)]">
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 overflow-hidden">
        {/* Header bar */}
        <div className="bg-gray-900/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-theme_color" />
            <span className="text-white text-xs font-semibold">AI Job Match</span>
          </div>
          <button
            onClick={() => setMinimized(true)}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition"
            title="Minimize"
          >
            <X size={12} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Form */}
        <div className="p-3.5">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-white/40 bg-white/60 rounded-md focus:border-theme_color focus:ring-1 focus:ring-theme_color/20 outline-none transition text-xs text-gray-700 placeholder:text-gray-400"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-white/40 bg-white/60 rounded-md focus:border-theme_color focus:ring-1 focus:ring-theme_color/20 outline-none transition text-xs text-gray-700 placeholder:text-gray-400"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-1.5 border border-white/40 bg-white/60 rounded-md focus:border-theme_color focus:ring-1 focus:ring-theme_color/20 outline-none transition text-xs text-gray-700 placeholder:text-gray-400"
            />

            {/* Visa & Work Permit checkboxes */}
            <div className="flex items-center gap-4 py-1">
              <label className="flex items-center gap-1.5 text-[11px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.hasVisa}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hasVisa: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded border-gray-400 text-teal-500 focus:ring-teal-500 accent-teal-500"
                />
                I have a Visa
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.hasWorkPermit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hasWorkPermit: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded border-gray-400 text-teal-500 focus:ring-teal-500 accent-teal-500"
                />
                Work Permit
              </label>
            </div>

            {/* File upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-white/40 bg-white/40 hover:border-theme_color rounded-md py-2.5 text-center cursor-pointer transition group"
            >
              <input ref={fileRef} type="file" onChange={handleFileChange} className="hidden" />
              {cvFile ? (
                <p className="text-[11px] text-gray-700 font-medium px-2 truncate">{cvFile.name}</p>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <Upload size={13} className="text-gray-400 group-hover:text-theme_color transition" />
                  <span className="text-[11px] text-gray-500 group-hover:text-gray-700 transition">Upload CV — PDF, DOC, DOCX</span>
                </div>
              )}
            </div>

            {result && (
              <div className={`flex items-start gap-1.5 p-2 rounded text-[10px] ${result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.type === 'success' ? <CheckCircle size={11} className="shrink-0 mt-px" /> : <AlertCircle size={11} className="shrink-0 mt-px" />}
                <span>{result.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-theme_color hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold rounded-md transition text-xs flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <><Loader2 size={13} className="animate-spin" /> Analysing...</>
              ) : (
                <><Sparkles size={13} /> Get AI Job Matches</>
              )}
            </button>
          </form>
          <p className="text-[8px] text-gray-400 mt-1.5 text-center">
            By uploading, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureBox;
