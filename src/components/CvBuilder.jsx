import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { BASE_URL } from "../BaseUrl";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const getToken = () => {
  try { return JSON.parse(sessionStorage.getItem("accessToken") || '{}'); }
  catch { return ""; }
};
const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ═══════════════════════════════════════════════════════════════════
// FONTS & DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════

const FONTS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Serif+Display:ital@0;1&family=Josefin+Sans:wght@300;400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
`;

const T = {
  bg:          "#0a0a0a",
  surface:     "#141414",
  card:        "#1a1a1c",
  border:      "#262626",
  accent:      "#f59e0b",
  accentDeep:  "#92400e",
  accentGlow:  "rgba(245,158,11,0.14)",
  text:        "#f0ede8",
  muted:       "#636363",
  subtle:      "#333",
  success:     "#10b981",
  danger:      "#ef4444",
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontBody:    "'Outfit', system-ui, sans-serif",
};

const IS = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${T.border}`, fontSize: 13,
  fontFamily: T.fontBody, color: T.text, background: T.surface,
  outline: "none", boxSizing: "border-box", resize: "vertical",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

// ═══════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════

const EMPTY_CV = {
  name:"", email:"", phone:"", location:"", linkedin:"", website:"",
  title:"", summary:"", photo:"", photoZoom:100, photoX:50, photoY:50,
  experience:[], education:[], skills:[], certifications:[],
  languages:[], awards:[], publications:[], volunteer:[], interests:[],
};

// ═══════════════════════════════════════════════════════════════════
// QUILL CONFIG
// ═══════════════════════════════════════════════════════════════════

const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ font: [] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "bold", "italic", "underline", "strike",
  "list", "bullet",
  "size", "font", "color", "background", "align",
];

// ═══════════════════════════════════════════════════════════════════
// PHOTO UPLOAD + EDITOR
// ═══════════════════════════════════════════════════════════════════

function PhotoUpload({ photo, zoom, posX, posY, onChange }) {
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB"); return; }
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ photo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleRemove = () => onChange({ photo: "", photoZoom: 100, photoX: 50, photoY: 50 });

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Profile Photo</label>
        <span style={{ fontSize: 10, color: T.muted, fontStyle: "italic" }}>Max 3MB</span>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Photo preview */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 90, height: 90, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
            border: `2px dashed ${photo ? T.accent : T.border}`,
            background: photo ? "none" : T.surface,
            overflow: "hidden", position: "relative",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt="Profile"
              style={{
                width: `${zoom || 100}%`, height: `${zoom || 100}%`,
                objectFit: "cover",
                objectPosition: `${posX || 50}% ${posY || 50}%`,
                minWidth: "100%", minHeight: "100%",
              }}
            />
          ) : (
            <div style={{ textAlign: "center" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p style={{ fontSize: 7, color: T.muted, margin: "2px 0 0" }}>Upload</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />

        {/* Photo controls */}
        {photo && (
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 9, color: T.muted, display: "block", marginBottom: 3 }}>Zoom: {zoom || 100}%</label>
              <input type="range" min="100" max="250" value={zoom || 100} onChange={e => onChange({ photoZoom: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: T.accent }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 9, color: T.muted, display: "block", marginBottom: 3 }}>Horizontal: {posX || 50}%</label>
              <input type="range" min="0" max="100" value={posX || 50} onChange={e => onChange({ photoX: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: T.accent }} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 9, color: T.muted, display: "block", marginBottom: 3 }}>Vertical: {posY || 50}%</label>
              <input type="range" min="0" max="100" value={posY || 50} onChange={e => onChange({ photoY: parseInt(e.target.value) })}
                style={{ width: "100%", accentColor: T.accent }} />
            </div>
            <button onClick={handleRemove} style={{ fontSize: 10, color: T.danger, background: "none", border: `1px solid ${T.danger}40`, borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>
              Remove Photo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rich Text Field ─────────────────────────────────────────────

function RichTextField({ label, value, onChange, placeholder, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>
          {hint && <span style={{ fontSize: 10, color: T.muted, fontStyle: "italic" }}>{hint}</span>}
        </div>
      )}
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        placeholder={placeholder}
      />
    </div>
  );
}

// Helper to strip HTML tags for plain text rendering in templates
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

// Helper to render rich text safely in templates
function RichText({ html, style }) {
  if (!html) return null;
  const baseStyle = { overflowWrap:"break-word", wordBreak:"break-word", overflow:"hidden", ...style };
  // If it's plain text (no HTML tags), render directly
  if (!/<[a-z][\s\S]*>/i.test(html)) return <span style={baseStyle}>{html}</span>;
  return <div style={baseStyle} dangerouslySetInnerHTML={{ __html: html }} />;
}

const COLOR_PRESETS = [
  "#c9952a","#2563eb","#0891b2","#059669","#16a34a",
  "#7c3aed","#c026d3","#dc2626","#ea580c","#ca8a04",
  "#334155","#0f172a","#881337","#1e3a5f","#4338ca",
];

// ═══════════════════════════════════════════════════════════════════
// AFFINDA PARSER
// ═══════════════════════════════════════════════════════════════════

const safe = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (v.raw) return v.raw;
  if (v.formatted) return v.formatted;
  return String(v);
};

async function parseWithAffinda(apiKey, file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("wait", "true");
  const res = await fetch("https://api.affinda.com/v3/documents", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: fd,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.detail || e?.message || `Affinda error ${res.status}`);
  }
  return mapAffinda(await res.json());
}

function mapAffinda(data) {
  const d = data?.data || data;
  const nameObj = d?.name || {};
  const fullName = safe(nameObj.raw || nameObj.formatted ||
    (nameObj.first ? `${nameObj.first} ${nameObj.last || ""}`.trim() : ""));
  return {
    name: fullName,
    email: safe(d?.emails?.[0]),
    phone: safe(d?.phoneNumbers?.[0]),
    location: safe(d?.location?.formatted || d?.location),
    linkedin: d?.linkedin || "",
    website: d?.websites?.[0] || "",
    title: safe(d?.profession || d?.jobTitle),
    summary: safe(d?.summary),
    experience: (d?.workExperience || []).map(e => ({
      role: safe(e.jobTitle), company: safe(e.organization),
      location: safe(e.location?.formatted || e.location),
      start_date: safe(e.dates?.startDate),
      end_date: e.dates?.isCurrent ? "Present" : safe(e.dates?.endDate),
      description: (e.jobDescription || "").trim(),
    })),
    education: (d?.education || []).map(e => ({
      degree: safe(e.qualification || e.accreditation?.education),
      institution: safe(e.organization),
      location: safe(e.location?.formatted || e.location),
      start_date: safe(e.dates?.startDate),
      end_date: e.dates?.isCurrent ? "Present" : safe(e.dates?.endDate),
      grade: safe(e.grade?.raw || e.grade), description: "",
    })),
    skills: (d?.skills || []).map(s => safe(s.name || s)),
    certifications: (d?.certifications || []).map(c =>
      typeof c === "string" ? c : safe(c.name || c.certification)),
    languages: (d?.languages || []).map(l =>
      typeof l === "string" ? l : safe(l.name || l.language)),
    awards: (d?.awards || []).map(a => safe(a.title || a)),
    publications: (d?.publications || []).map(p => safe(p.title || p)),
    volunteer: (d?.volunteer || []).map(v => ({
      role: safe(v.jobTitle || v.role), organization: safe(v.organization),
      description: safe(v.description),
    })),
    _meta: {
      hasPublications: !!d?.publications?.length,
      hasAwards: !!d?.awards?.length,
      hasVolunteer: !!d?.volunteer?.length,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════
// BACKEND CV PARSER (primary method - no external key needed)
// ═══════════════════════════════════════════════════════════════════

async function ensureProfile() {
  try {
    const res = await fetch(`${BASE_URL}/job-seeker/profile`, { headers: authHeaders() });
    if (res.ok) return;
    // Profile doesn't exist, create it
    await fetch(`${BASE_URL}/job-seeker/profile`, {
      method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  } catch { /* ignore */ }
}

async function parseWithBackend(file) {
  // Ensure job seeker profile exists (prevents 404/500 on fresh accounts)
  await ensureProfile();

  // Step 1: Upload the CV to the backend
  const fd = new FormData();
  fd.append("file", file);
  const uploadRes = await fetch(`${BASE_URL}/job-seeker/cv`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: fd,
  });
  if (!uploadRes.ok) {
    const e = await uploadRes.json().catch(() => ({}));
    throw new Error(e?.message || `Upload failed (${uploadRes.status})`);
  }
  const uploadData = await uploadRes.json();
  const cvId = uploadData?.result?.id || uploadData?.data?.id || uploadData?.cv?.id || uploadData?.id;
  if (!cvId) throw new Error("CV uploaded but no ID returned");

  // Step 2: Extract structured data from the uploaded CV
  const extractRes = await fetch(`${BASE_URL}/job-seeker/cv/${cvId}/extract`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
  });
  if (!extractRes.ok) {
    const e = await extractRes.json().catch(() => ({}));
    throw new Error(e?.message || `Extraction failed (${extractRes.status})`);
  }
  const extractData = await extractRes.json();
  const d = extractData?.data?.extracted || extractData?.result?.data || extractData?.data || {};

  return {
    _platformCvId: cvId,
    name: d.name || "",
    email: d.email || "",
    phone: d.phone || "",
    location: d.location || "",
    linkedin: "",
    website: "",
    title: d.title || d.headline || d.profession || "",
    summary: d.summary || "",
    experience: (d.experience || []).map(e => ({
      role: e.title || e.role || "",
      company: e.company || "",
      location: e.location || "",
      start_date: e.startYear ? String(e.startYear) : (e.start_date || ""),
      end_date: e.isCurrent ? "Present" : (e.endYear ? String(e.endYear) : (e.end_date || "")),
      description: e.description || "",
    })),
    education: (d.education || []).map(e => ({
      degree: e.degree || "",
      institution: e.institution || "",
      location: "",
      start_date: "",
      end_date: e.year ? String(e.year) : "",
      grade: "", description: "",
    })),
    skills: (d.skills || []).map(s => typeof s === "string" ? s : s.name || String(s)),
    certifications: (d.certifications || []).map(c => typeof c === "string" ? c : c.name || String(c)),
    languages: (d.languages || []).map(l => typeof l === "string" ? l : l.name || String(l)),
    awards: (d.awards || []).map(a => typeof a === "string" ? a : a.title || a.name || String(a)),
    interests: (d.interests || []).map(i => typeof i === "string" ? i : i.name || String(i)),
    publications: [],
    volunteer: [],
  };
}

async function saveToProfile(cv) {
  // Ensure profile exists first
  await ensureProfile();

  const body = {};
  if (cv.name) {
    const parts = cv.name.split(" ");
    body.firstName = parts[0] || "";
    body.lastName = parts.slice(1).join(" ") || "";
  }
  if (cv.phone) {
    const digits = cv.phone.replace(/[^\d+]/g, "");
    body.phoneNumber = digits.replace(/^\+\d{1,4}/, "") || digits;
  }

  // Include summary, languages, awards, interests
  if (cv.summary) body.summary = cv.summary;
  if (cv.languages?.length) body.languages = cv.languages.map(l => typeof l === "string" ? { name: l, proficiency: "Conversational" } : l);
  if (cv.awards?.length) body.awards = cv.awards.map(a => typeof a === "string" ? { title: a } : a);
  if (cv.interests?.length) body.interests = cv.interests.map(i => typeof i === "string" ? i : i.name || i);

  // Update basic profile
  const profileRes = await fetch(`${BASE_URL}/job-seeker/profile`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!profileRes.ok) {
    const e = await profileRes.json().catch(() => ({}));
    throw new Error(e?.message || "Failed to update profile");
  }

  // Add skills
  const skillPromises = (cv.skills || []).map(skill =>
    fetch(`${BASE_URL}/job-seeker/skill`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ name: skill, proficiency: "INTERMEDIATE" }),
    }).catch(() => null)
  );

  // Add work experience
  const expPromises = (cv.experience || []).map(exp =>
    fetch(`${BASE_URL}/job-seeker/profile/experience`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: exp.role || exp.title || "Untitled",
        companyName: exp.company || "Unknown",
        startDate: exp.start_date || new Date().toISOString().slice(0, 10),
        endDate: exp.end_date || undefined,
        isCurrent: !exp.end_date,
        location: exp.location || undefined,
        description: exp.description || undefined,
      }),
    }).catch(() => null)
  );

  // Add education
  const eduPromises = (cv.education || []).map(edu =>
    fetch(`${BASE_URL}/job-seeker/profile/education`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        institution: edu.institution || "Unknown",
        degree: edu.degree || "Degree",
        startDate: edu.start_date || new Date().toISOString().slice(0, 10),
        endDate: edu.end_date || undefined,
        isCurrent: !edu.end_date,
        fieldOfStudy: edu.field || undefined,
        description: edu.description || undefined,
      }),
    }).catch(() => null)
  );

  // Add certifications
  const certPromises = (cv.certifications || []).map(cert =>
    fetch(`${BASE_URL}/job-seeker/profile/certifications`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: typeof cert === "string" ? cert : cert.name || "Certification",
        issuingOrganization: typeof cert === "string" ? "N/A" : cert.organization || "N/A",
      }),
    }).catch(() => null)
  );

  await Promise.allSettled([...skillPromises, ...expPromises, ...eduPromises, ...certPromises]);

  return true;
}

function buildSuggestions(cv) {
  const s = [];
  if (!cv.linkedin) s.push({ key:"linkedin", label:"LinkedIn Profile", reason:"Boosts recruiter visibility" });
  if (!cv.website) s.push({ key:"website", label:"Portfolio / Website", reason:"Showcase your work online" });
  if (!cv.location) s.push({ key:"location", label:"Location", reason:"Helps local job matching" });
  if (cv._meta?.hasPublications && !cv.publications?.length)
    s.push({ key:"publications", label:"Publications", reason:"Detected in your CV" });
  if (cv._meta?.hasAwards && !cv.awards?.length)
    s.push({ key:"awards", label:"Awards & Honours", reason:"Detected in your CV" });
  if (cv._meta?.hasVolunteer && !cv.volunteer?.length)
    s.push({ key:"volunteer", label:"Volunteer Experience", reason:"Detected in your CV" });
  if (!cv.certifications?.length)
    s.push({ key:"certifications", label:"Certifications", reason:"Stand out with credentials" });
  if (cv._meta?.hasInterests && !cv.interests?.length)
    s.push({ key:"interests", label:"Interests", reason:"Detected in your CV" });
  if (!cv.interests?.length && !cv._meta?.hasInterests)
    s.push({ key:"interests", label:"Interests", reason:"Add personal interests" });
  return s;
}

// ═══════════════════════════════════════════════════════════════════
// PDF.JS HOOK
// ═══════════════════════════════════════════════════════════════════

function usePDFExtractor() {
  const [pdfjsReady, setPdfjsReady] = useState(false);
  useEffect(() => {
    if (window.pdfjsLib) { setPdfjsReady(true); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    s.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setPdfjsReady(true);
    };
    document.head.appendChild(s);
  }, []);
  const extractText = useCallback(async (file) => {
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const c = await pg.getTextContent();
      text += c.items.map(x => x.str).join(" ") + "\n";
    }
    return text;
  }, []);
  return { pdfjsReady, extractText };
}

// ═══════════════════════════════════════════════════════════════════
// SHARED UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

function Spinner({ size = 16, color = T.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "cvSpin 0.8s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0110 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Btn({ children, onClick, variant = "ghost", style: sx, disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer",
    border: "none", fontFamily: T.fontBody, fontWeight: 700, transition: "all 0.15s",
    opacity: disabled ? 0.5 : 1,
  };
  const variants = {
    primary: { background: "#0097A7", color: "#fff", padding: "11px 22px", borderRadius: 10, fontSize: 13, letterSpacing: "0.04em" },
    success: { background: "#059669", color: "#fff", padding: "11px 22px", borderRadius: 10, fontSize: 13 },
    ghost: { background: "transparent", color: T.muted, padding: "8px 14px", borderRadius: 8, fontSize: 12, border: `1px solid ${T.border}` },
    danger: { background: "transparent", color: T.danger, padding: "5px 8px", borderRadius: 6, fontSize: 13 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function Field({ label, value, onChange, multiline, rows = 3, placeholder, type = "text", hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</label>
          {hint && <span style={{ fontSize: 10, color: T.muted, fontStyle: "italic" }}>{hint}</span>}
        </div>
      )}
      {multiline
        ? <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={IS}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}`; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
        : <input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={IS}
            onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accentGlow}`; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }} />
      }
    </div>
  );
}

function SH({ title, onAdd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 0 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 3, height: 16, background: T.accent, borderRadius: 2 }} />
        <h3 style={{ margin: 0, fontSize: 11, fontWeight: 800, color: T.accent, textTransform: "uppercase", letterSpacing: "0.14em" }}>{title}</h3>
      </div>
      {onAdd && <Btn onClick={onAdd}>+ Add</Btn>}
    </div>
  );
}

function TagEditor({ items, onChange, placeholder, color = T.accent }) {
  const [input, setInput] = useState("");
  const add = () => { if (!input.trim()) return; onChange([...(items||[]), input.trim()]); setInput(""); };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, minHeight: 24 }}>
        {(items||[]).map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: `${color}20`, color, borderRadius: 999, padding: "3px 10px 3px 12px", fontSize: 12, fontWeight: 600, border: `1px solid ${color}40` }}>
            {item}
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color, padding: "0 0 0 2px", lineHeight: 1, fontSize: 15, opacity: 0.7 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder={placeholder} style={{ ...IS, flex: 1 }}
          onFocus={e => { e.target.style.borderColor = T.accent; }} onBlur={e => { e.target.style.borderColor = T.border; }} />
        <Btn onClick={add} sx={{ flexShrink: 0 }}>+ Add</Btn>
      </div>
    </div>
  );
}

function ExpCard({ exp, index, onChange, onDelete }) {
  const u = (k, v) => onChange(index, { ...exp, [k]: v });
  return (
    <div style={{ background: T.surface, borderRadius: 12, padding: 16, marginBottom: 10, border: `1px solid ${T.border}`, position: "relative" }}>
      <button onClick={() => onDelete(index)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 18, opacity: 0.7, lineHeight: 1 }}>×</button>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[["role","Job Title"],["company","Company"],["start_date","Start"],["end_date","End / Present"]].map(([k,ph]) => (
          <input key={k} placeholder={ph} value={exp[k]||""} onChange={e => u(k, e.target.value)} style={IS}
            onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.border} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[["location","Location (optional)"],["company_url","Company URL (optional)"]].map(([k,ph]) => (
          <input key={k} placeholder={ph} value={exp[k]||""} onChange={e => u(k, e.target.value)} style={IS}
            onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.border} />
        ))}
      </div>
      <RichTextField value={exp.description} onChange={v => u("description", v)} placeholder="Key achievements and responsibilities…" />
    </div>
  );
}

function EduCard({ edu, index, onChange, onDelete }) {
  const u = (k, v) => onChange(index, { ...edu, [k]: v });
  return (
    <div style={{ background: T.surface, borderRadius: 12, padding: 16, marginBottom: 10, border: `1px solid ${T.border}`, position: "relative" }}>
      <button onClick={() => onDelete(index)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 18, opacity: 0.7, lineHeight: 1 }}>×</button>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[["degree","Degree / Qualification"],["institution","Institution"],["start_date","Start"],["end_date","End"]].map(([k,ph]) => (
          <input key={k} placeholder={ph} value={edu[k]||""} onChange={e => u(k, e.target.value)} style={IS}
            onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.border} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[["location","Location"],["grade","Grade / GPA (optional)"]].map(([k,ph]) => (
          <input key={k} placeholder={ph} value={edu[k]||""} onChange={e => u(k, e.target.value)} style={IS}
            onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.border} />
        ))}
      </div>
      <textarea placeholder="Notable coursework, achievements…" value={edu.description||""} onChange={e => u("description", e.target.value)} rows={2} style={IS}
        onFocus={e => { e.target.style.borderColor=T.accent; e.target.style.boxShadow=`0 0 0 3px ${T.accentGlow}`; }}
        onBlur={e => { e.target.style.borderColor=T.border; e.target.style.boxShadow="none"; }} />
    </div>
  );
}

function VolCard({ vol, index, onChange, onDelete }) {
  const u = (k, v) => onChange(index, { ...vol, [k]: v });
  return (
    <div style={{ background: T.surface, borderRadius: 12, padding: 14, marginBottom: 8, border: `1px solid ${T.border}`, position: "relative" }}>
      <button onClick={() => onDelete(index)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", color: T.danger, cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[["role","Role"],["organization","Organization"]].map(([k,ph]) => (
          <input key={k} placeholder={ph} value={vol[k]||""} onChange={e => u(k, e.target.value)} style={IS}
            onFocus={e => e.target.style.borderColor=T.accent} onBlur={e => e.target.style.borderColor=T.border} />
        ))}
      </div>
      <textarea placeholder="Description…" value={vol.description||""} onChange={e => u("description", e.target.value)} rows={2} style={IS} />
    </div>
  );
}

// ─── Suggestion Banner ────────────────────────────────────────────

function SuggestionBanner({ suggestions, enabled, onEnable, onDismiss }) {
  const visible = (suggestions||[]).filter(s => !enabled.includes(s.key));
  if (!visible.length) return null;
  return (
    <div style={{ background: T.accentGlow, border: `1px solid ${T.accent}40`, borderRadius: 14, padding: 16, marginBottom: 24 }}>
      <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>
        ✦ Recommended sections based on your CV
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {visible.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 12px" }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s.label}</span>
              <span style={{ fontSize: 11, color: T.muted, marginLeft: 6 }}>— {s.reason}</span>
            </div>
            <button onClick={() => onEnable(s.key)} style={{ marginLeft: 4, padding: "2px 10px", borderRadius: 5, background: T.accent, color: "#000", fontSize: 11, fontWeight: 800, border: "none", cursor: "pointer" }}>Add</button>
            <button onClick={() => onDismiss(s.key)} style={{ background: "none", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full CV Editor ───────────────────────────────────────────────

function CVEditor({ cv, onChange, enabledSections }) {
  const set = (k, v) => onChange({ ...cv, [k]: v });
  const setMulti = (obj) => onChange({ ...cv, ...obj });
  const updList = (key, idx, val) => { const a=[...cv[key]]; a[idx]=val; set(key, a); };
  const delItem = (key, idx) => set(key, cv[key].filter((_,i)=>i!==idx));
  return (
    <div style={{ fontFamily: T.fontBody }}>
      <SH title="Personal Information" />
      <PhotoUpload photo={cv.photo} zoom={cv.photoZoom} posX={cv.photoX} posY={cv.photoY} onChange={setMulti} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Full Name" value={cv.name} onChange={v=>set("name",v)} placeholder="e.g. Sarah Al Mansoori" />
        <Field label="Professional Title" value={cv.title} onChange={v=>set("title",v)} placeholder="e.g. Senior Product Manager" />
        <Field label="Email" value={cv.email} onChange={v=>set("email",v)} type="email" />
        <Field label="Phone" value={cv.phone} onChange={v=>set("phone",v)} />
        <Field label="Location" value={cv.location} onChange={v=>set("location",v)} placeholder="e.g. Dubai, UAE" />
        {(enabledSections.includes("linkedin") || cv.linkedin) && <Field label="LinkedIn" value={cv.linkedin} onChange={v=>set("linkedin",v)} placeholder="linkedin.com/in/…" />}
        {(enabledSections.includes("website") || cv.website) && <Field label="Portfolio / Website" value={cv.website} onChange={v=>set("website",v)} placeholder="https://…" />}
      </div>

      <SH title="Professional Summary" />
      <RichTextField value={cv.summary} onChange={v=>set("summary",v)} placeholder="Compelling 3–4 sentence professional summary with key achievements…" hint="Use toolbar to format" />

      <SH title="Work Experience" onAdd={() => set("experience",[...cv.experience,{role:"",company:"",location:"",start_date:"",end_date:"",description:""}])} />
      {cv.experience.length === 0 && <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>No experience added yet</p>}
      {cv.experience.map((exp,i) => <ExpCard key={i} exp={exp} index={i} onChange={(idx,v)=>updList("experience",idx,v)} onDelete={idx=>delItem("experience",idx)} />)}

      <SH title="Education" onAdd={() => set("education",[...cv.education,{degree:"",institution:"",location:"",start_date:"",end_date:"",grade:"",description:""}])} />
      {cv.education.length === 0 && <p style={{ color:T.muted, fontSize:13, textAlign:"center", padding:16 }}>No education added yet</p>}
      {cv.education.map((edu,i) => <EduCard key={i} edu={edu} index={i} onChange={(idx,v)=>updList("education",idx,v)} onDelete={idx=>delItem("education",idx)} />)}

      <SH title="Skills" />
      <TagEditor items={cv.skills||[]} onChange={v=>set("skills",v)} placeholder="Type a skill, press Enter" color={T.accent} />

      <SH title="Languages" />
      <TagEditor items={cv.languages||[]} onChange={v=>set("languages",v)} placeholder="e.g. Arabic (Native)" color="#3b82f6" />

      {(enabledSections.includes("certifications") || (cv.certifications||[]).length>0) && (
        <><SH title="Certifications" />
        <TagEditor items={cv.certifications||[]} onChange={v=>set("certifications",v)} placeholder="e.g. PMP, AWS Solutions Architect" color="#10b981" /></>
      )}

      {enabledSections.includes("awards") && (
        <><SH title="Awards & Honours" />
        <TagEditor items={cv.awards||[]} onChange={v=>set("awards",v)} placeholder="e.g. Best Employee 2023" color="#f472b6" /></>
      )}

      {enabledSections.includes("publications") && (
        <><SH title="Publications" />
        <TagEditor items={cv.publications||[]} onChange={v=>set("publications",v)} placeholder="Author, Title, Year" color="#a78bfa" /></>
      )}

      {enabledSections.includes("volunteer") && (
        <><SH title="Volunteer Experience" onAdd={()=>set("volunteer",[...(cv.volunteer||[]),{role:"",organization:"",description:""}])} />
        {(cv.volunteer||[]).map((v,i)=><VolCard key={i} vol={v} index={i} onChange={(idx,val)=>updList("volunteer",idx,val)} onDelete={idx=>delItem("volunteer",idx)} />)}</>
      )}

      {(enabledSections.includes("interests") || (cv.interests||[]).length>0) && (
        <><SH title="Interests & Hobbies" />
        <TagEditor items={cv.interests||[]} onChange={v=>set("interests",v)} placeholder="e.g. Open Source, Travel, Chess" color="#f97316" /></>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// UPLOAD PANEL
// ═══════════════════════════════════════════════════════════════════

function UploadPanel({ affindaKey, onParsed }) {
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState("idle");
  const [msg, setMsg] = useState("");
  const inputRef = useRef();
  const [existingCvs, setExistingCvs] = useState([]);
  const [cvsLoading, setCvsLoading] = useState(true);
  const [settingPrimary, setSettingPrimary] = useState(null);

  // Fetch existing CVs on mount
  useEffect(() => {
    const fetchCvs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/cvs`, { headers: authHeaders() });
        if (res.ok) {
          const json = await res.json();
          setExistingCvs(json.data || []);
        }
      } catch { /* ignore */ }
      finally { setCvsLoading(false); }
    };
    fetchCvs();
  }, []);

  const handleSetPrimary = async (cvId) => {
    setSettingPrimary(cvId);
    try {
      const form = new FormData();
      form.append("makePrimary", "true");
      const res = await fetch(`${BASE_URL}/job-seeker/cvs/${cvId}`, {
        method: "PATCH", headers: authHeaders(), body: form,
      });
      if (res.ok) {
        setExistingCvs(prev => prev.map(c => ({ ...c, isPrimary: c.id === cvId })));
      }
    } catch { /* ignore */ }
    finally { setSettingPrimary(null); }
  };

  const handleLoadCv = async (cvId) => {
    setStatus("parsing"); setMsg("Loading CV from platform & extracting data…");
    try {
      // First set as primary
      await handleSetPrimary(cvId);
      // Then extract via backend
      const res = await fetch(`${BASE_URL}/job-seeker/cv/${cvId}/extract`, {
        method: "POST", headers: { ...authHeaders(), "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to extract CV data");
      const json = await res.json();
      const d = json.data?.extracted || json.result?.data || json.data || {};
      const parsed = {
        name: d.name || "", email: d.email || "", phone: d.phone || "",
        location: d.location || "", linkedin: d.linkedin || "", website: d.website || "",
        title: d.title || d.headline || "", summary: d.summary || "",
        experience: (d.experience || []).map(e => ({
          role: e.role || e.jobTitle || "", company: e.company || e.companyName || "",
          start_date: e.start_date || e.startDate || "", end_date: e.end_date || e.endDate || "",
          location: e.location || "", description: e.description || "",
        })),
        education: (d.education || []).map(e => ({
          degree: e.degree || "", institution: e.institution || "",
          start_date: e.start_date || e.startDate || "", end_date: e.end_date || e.endDate || "",
        })),
        skills: (d.skills || []).map(s => typeof s === "string" ? s : s.name || String(s)),
        certifications: (d.certifications || []).map(c => typeof c === "string" ? c : c.name || String(c)),
        languages: (d.languages || []).map(l => typeof l === "string" ? l : l.name || String(l)),
        awards: (d.awards || []).map(a => typeof a === "string" ? a : a.title || a.name || String(a)),
        publications: (d.publications || []).map(p => typeof p === "string" ? p : p.title || p.name || String(p)),
        volunteer: (d.volunteer || []).map(v => typeof v === "object" ? { role: v.role || v.jobTitle || "", organization: v.organization || "", description: v.description || "" } : { role: String(v), organization: "", description: "" }),
        interests: (d.interests || []).map(i => typeof i === "string" ? i : i.name || String(i)),
        _platformCvId: cvId,
      };
      const suggestions = buildSuggestions(parsed);
      onParsed(parsed, suggestions);
      setStatus("done"); setMsg("CV loaded! Data has been extracted into the editor. Click 'Save to Profile' to auto-fill your profile.");
    } catch (e) {
      setStatus("error"); setMsg(`Error loading CV: ${e.message}`);
    }
  };

  const process = async (file) => {
    if (!file) return;
    if (!file.name?.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setStatus("error"); setMsg("Please upload a PDF file."); return;
    }
    try {
      setStatus("parsing"); setMsg("Uploading & extracting via platform AI…");
      let parsed;
      try {
        parsed = await parseWithBackend(file);
      } catch (backendErr) {
        if (affindaKey?.trim()) {
          setMsg("Backend extraction failed, trying Affinda AI…");
          parsed = await parseWithAffinda(affindaKey, file);
        } else {
          throw backendErr;
        }
      }
      const suggestions = buildSuggestions(parsed);
      onParsed(parsed, suggestions);
      setStatus("done"); setMsg("CV parsed successfully! Your data has been loaded into the editor.");
      // Refresh CV list
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/cvs`, { headers: authHeaders() });
        if (res.ok) { const json = await res.json(); setExistingCvs(json.data || []); }
      } catch { /* ignore */ }
    } catch (e) {
      setStatus("error"); setMsg(`Error: ${e.message}`);
    }
  };

  const bgColor = { idle: T.surface, parsing: `${T.accent}08`, done: "#052e16", error: "#2d0b0b" }[status] || T.surface;
  const bdColor = { idle: T.border, parsing: `${T.accent}60`, done: "#10b981", error: "#ef4444" }[status] || T.border;

  return (
    <div>
      <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files[0]);}}
        onClick={()=>inputRef.current?.click()}
        style={{ border:`2px dashed ${drag?T.accent:bdColor}`, borderRadius:16, padding:"40px 36px", textAlign:"center", cursor:"pointer", background:drag?T.accentGlow:bgColor, transition:"all 0.2s" }}>
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{display:"none"}} onChange={e=>process(e.target.files[0])} />
        <div style={{ width:56, height:56, borderRadius:"50%", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
          {status==="parsing" ? <Spinner size={24} color="#000" /> : (
            <svg viewBox="0 0 24 24" fill="white" style={{width:24,height:24}}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z"/>
              <path d="M8 13h8v1H8zm0 3h8v1H8zm0-6h5v1H8z" fillOpacity="0.8"/>
            </svg>
          )}
        </div>
        <p style={{ fontSize:20, fontWeight:800, color:T.text, margin:"0 0 4px", fontFamily:T.fontDisplay }}>Drop your CV PDF here</p>
        <p style={{ fontSize:13, color:T.muted, margin:0 }}>or click to browse · PDF only · Parsed by platform AI</p>
      </div>

      {msg && (
        <div style={{ marginTop:12, padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:500,
          background: status==="done"?"#052e16":status==="error"?"#2d0b0b":`${T.accent}15`,
          color: status==="done"?"#4ade80":status==="error"?"#f87171":T.accent,
          border:`1px solid ${status==="done"?"#10b981":status==="error"?"#ef4444":T.accent}60` }}>
          {msg}
        </div>
      )}

      {/* Existing CVs section */}
      {!cvsLoading && existingCvs.length > 0 && (
        <div style={{ marginTop:20 }}>
          <p style={{ fontSize:10, fontWeight:800, color:T.accent, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>
            Your Uploaded CVs ({existingCvs.length}) — Select one to load into editor
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {existingCvs.map(cv => (
              <div key={cv.id} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
                background: cv.isPrimary ? `${T.accent}15` : T.surface,
                border: `1.5px solid ${cv.isPrimary ? T.accent : T.border}`,
                borderRadius:10, transition:"all 0.15s",
              }}>
                {/* Primary star */}
                <button onClick={(e)=>{e.stopPropagation();handleSetPrimary(cv.id);}}
                  title={cv.isPrimary ? "Primary CV" : "Set as primary"}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:0, fontSize:18,
                    color: cv.isPrimary ? T.accent : T.muted, opacity: settingPrimary===cv.id ? 0.5 : 1 }}>
                  {cv.isPrimary ? "★" : "☆"}
                </button>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {cv.fileName || "Untitled CV"}
                  </p>
                  <p style={{ margin:0, fontSize:10, color:T.muted }}>
                    {cv.isPrimary && <span style={{ color:T.accent, fontWeight:700, marginRight:6 }}>PRIMARY</span>}
                    {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : ""}
                    {cv.industry?.name ? ` · ${cv.industry.name}` : ""}
                  </p>
                </div>
                <button onClick={()=>handleLoadCv(cv.id)}
                  disabled={status==="parsing"}
                  style={{ padding:"5px 14px", borderRadius:8, border:`1px solid ${T.accent}`, background:"transparent",
                    color:T.accent, fontSize:10, fontWeight:700, cursor: status==="parsing" ? "wait" : "pointer",
                    textTransform:"uppercase", letterSpacing:"0.06em", flexShrink:0, transition:"all 0.15s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=T.accent; e.currentTarget.style.color="#000"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.accent; }}>
                  Load & Fill
                </button>
              </div>
            ))}
          </div>
          <p style={{ marginTop:8, fontSize:10, color:T.muted, fontStyle:"italic" }}>
            ★ = Primary CV (used for job applications & profile auto-fill)
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// 10 CV TEMPLATES
// ═══════════════════════════════════════════════════════════════════

const dr = (s,e) => [s,e].filter(Boolean).join(" – ") || "";
const esc = s => (s||"").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// ── T1: Dubai Gold ────────────────────────────────────────────────
function TplDubaiGold({ cv, color, partitionColor }) {
  const g=color||"#c9952a"; const sb=partitionColor||"#111";
  return (
    <div style={{ display:"flex", fontFamily:"'Outfit',sans-serif", maxWidth:780, margin:"0 auto", minHeight:1123, background:"#0d0d0d", color:"#fff", fontSize:12 }}>
      <div style={{ width:220, background:sb, borderRight:`2px solid ${g}40`, padding:"36px 20px", flexShrink:0 }}>
        {cv.photo ? (
          <div style={{ width:80,height:80,borderRadius:"50%",overflow:"hidden",margin:"0 auto 14px",border:`3px solid ${g}` }}>
            <img src={cv.photo} alt="" style={{ width:`${cv.photoZoom||100}%`,height:`${cv.photoZoom||100}%`,objectFit:"cover",objectPosition:`${cv.photoX||50}% ${cv.photoY||50}%`,minWidth:"100%",minHeight:"100%" }} />
          </div>
        ) : (
          <div style={{ width:68,height:68,borderRadius:"50%",background:`linear-gradient(135deg,${g},#6b4400)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:26,fontWeight:900,color:"#fff",fontFamily:"'Cormorant Garamond',serif" }}>{(cv.name||"?")[0]}</div>
        )}
        <h1 style={{ margin:"0 0 2px",fontSize:17,fontWeight:700,textAlign:"center",color:g,fontFamily:"'Cormorant Garamond',serif" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 16px",fontSize:9,textAlign:"center",color:"#888",textTransform:"uppercase",letterSpacing:"0.1em" }}>{cv.title}</p>}
        <div style={{ borderTop:`1px solid ${g}30`,paddingTop:12,marginBottom:14 }}>
          {[[cv.email,"✉"],[cv.phone,"☎"],[cv.location,"◎"],[cv.linkedin,"in"],[cv.website,"🔗"]].filter(([v])=>v).map(([v,i],idx)=>(
            <p key={idx} style={{ margin:"0 0 5px",fontSize:9,color:"#bbb",display:"flex",alignItems:"flex-start",gap:6,wordBreak:"break-all" }}><span style={{color:g,flexShrink:0}}>{i}</span>{v}</p>
          ))}
        </div>
        {cv.skills?.length>0&&<><p style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:g,margin:"0 0 7px",fontFamily:"'Josefin Sans',sans-serif" }}>Skills</p>{cv.skills.map((s,i)=><div key={i} style={{ background:"#1a1a1a",borderLeft:`2px solid ${g}`,borderRadius:3,padding:"2px 8px",fontSize:10,marginBottom:3,color:"#ddd" }}>{s}</div>)}<br/></>}
        {cv.languages?.length>0&&<><p style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:g,margin:"0 0 6px" }}>Languages</p>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#bbb",margin:"0 0 2px" }}>{l}</p>)}<br/></>}
        {cv.certifications?.length>0&&<><p style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:g,margin:"0 0 6px" }}>Certifications</p>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#bbb",margin:"0 0 2px" }}>• {c}</p>)}</>}
      </div>
      <div style={{ flex:1,padding:"36px 28px" }}>
        {cv.summary&&<div style={{ marginBottom:20,borderBottom:"1px solid #222",paddingBottom:16 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:g,margin:"0 0 7px",fontFamily:"'Josefin Sans',sans-serif" }}>Profile</h2><RichText html={cv.summary} style={{ margin:0,lineHeight:1.8,color:"#ccc",fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",fontSize:14 }} /></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:g,margin:"0 0 12px",fontFamily:"'Josefin Sans',sans-serif" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:15,paddingLeft:12,borderLeft:`2px solid ${g}40` }}><div style={{ display:"flex",justifyContent:"space-between",flexWrap:"wrap" }}><strong style={{ fontSize:13,fontFamily:"'Cormorant Garamond',serif",color:"#fff" }}>{e.role}</strong><span style={{ fontSize:10,color:g }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 4px",fontSize:11,color:g,fontStyle:"italic" }}>{e.company}{e.location?` · ${e.location}`:""}</p><RichText html={e.description} style={{ margin:0,lineHeight:1.7,color:"#aaa",fontSize:11 }} /></div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:g,margin:"0 0 12px",fontFamily:"'Josefin Sans',sans-serif" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12,paddingLeft:12,borderLeft:`2px solid ${g}40` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontFamily:"'Cormorant Garamond',serif",color:"#fff" }}>{e.degree}</strong><span style={{ fontSize:10,color:g }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:g }}>{e.institution}{e.location?` · ${e.location}`:""}</p></div>)}</div>}
        {cv.awards?.length>0&&<><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:g,margin:"0 0 8px" }}>Awards</h2>{cv.awards.map((a,i)=><p key={i} style={{ fontSize:11,color:"#bbb",margin:"0 0 3px" }}>🏆 {a}</p>)}</>}
      </div>
    </div>
  );
}

// ── T2: Executive Classic ─────────────────────────────────────────
function TplExecutive({ cv, color, partitionColor }) {
  const navy=partitionColor||"#1a2744"; const g=color||"#b8973d";
  return (
    <div style={{ fontFamily:"'Crimson Pro','Georgia',serif",maxWidth:780,margin:"0 auto",background:"#fefdf7",minHeight:1123,fontSize:12,color:"#2d2d2d" }}>
      <div style={{ background:navy,padding:"36px 40px 26px",color:"#fff",display:"flex",alignItems:"center",gap:24 }}>
        {cv.photo && (
          <div style={{ width:80,height:80,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:`3px solid ${g}` }}>
            <img src={cv.photo} alt="" style={{ width:`${cv.photoZoom||100}%`,height:`${cv.photoZoom||100}%`,objectFit:"cover",objectPosition:`${cv.photoX||50}% ${cv.photoY||50}%`,minWidth:"100%",minHeight:"100%" }} />
          </div>
        )}
        <div>
          <h1 style={{ margin:"0 0 4px",fontSize:36,fontWeight:600,letterSpacing:"-0.02em",color:"#fff" }}>{cv.name||"Your Name"}</h1>
          {cv.title&&<p style={{ margin:"0 0 12px",fontSize:12,color:g,fontFamily:"'Josefin Sans',sans-serif",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.14em" }}>{cv.title}</p>}
          <div style={{ display:"flex",flexWrap:"wrap",gap:"0 20px" }}>
            {[cv.email,cv.phone,cv.location,cv.linkedin].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:11,color:"#b0bac4" }}>{v}</span>)}
          </div>
        </div>
      </div>
      <div style={{ padding:"28px 40px" }}>
        {cv.summary&&<div style={{ marginBottom:20,paddingBottom:16,borderBottom:"1px solid #ddd" }}><RichText html={cv.summary} style={{ margin:0,lineHeight:1.9,fontSize:13,color:"#444",fontStyle:"italic" }} /></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.2em",color:navy,margin:"0 0 14px",fontFamily:"'Josefin Sans',sans-serif",borderBottom:`2px solid ${navy}`,paddingBottom:5 }}>Professional Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ display:"flex",gap:20,marginBottom:16 }}><div style={{ width:86,flexShrink:0,textAlign:"right",color:"#999",fontSize:9,paddingTop:2,fontFamily:"'Josefin Sans',sans-serif" }}>{e.start_date}<br/>{e.end_date}</div><div style={{ flex:1 }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ color:g,fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,fontSize:10,marginLeft:8 }}>{e.company}</span>{e.location&&<span style={{ color:"#aaa",fontSize:9,marginLeft:6 }}>· {e.location}</span>}{e.description&&<RichText html={e.description} style={{ margin:"4px 0 0",lineHeight:1.8,color:"#555",fontSize:11 }} />}</div></div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.2em",color:navy,margin:"0 0 14px",fontFamily:"'Josefin Sans',sans-serif",borderBottom:`2px solid ${navy}`,paddingBottom:5 }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ display:"flex",gap:20,marginBottom:12 }}><div style={{ width:86,flexShrink:0,textAlign:"right",color:"#999",fontSize:9,fontFamily:"'Josefin Sans',sans-serif" }}>{e.start_date}<br/>{e.end_date}</div><div><strong>{e.degree}</strong><span style={{ color:g,fontFamily:"'Josefin Sans',sans-serif",fontWeight:700,fontSize:10,marginLeft:8 }}>{e.institution}</span>{e.grade&&<span style={{ fontSize:9,color:"#aaa",marginLeft:6 }}>({e.grade})</span>}</div></div>)}</div>}
        <div style={{ display:"flex",gap:30,flexWrap:"wrap" }}>
          {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:navy,margin:"0 0 8px",fontFamily:"'Josefin Sans',sans-serif" }}>Skills</h2><p style={{ margin:0,color:"#444",lineHeight:2 }}>{cv.skills.join("  ·  ")}</p></div>}
          {cv.languages?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:navy,margin:"0 0 8px",fontFamily:"'Josefin Sans',sans-serif" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ margin:"0 0 2px",fontSize:11 }}>{l}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T3: Tech Minimal ──────────────────────────────────────────────
function TplTechMinimal({ cv, color, partitionColor }) {
  const ac=color||"#2563eb";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",padding:"40px 48px",background:"#fff",minHeight:1123,fontSize:12,color:"#1a1a1a" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,paddingBottom:18,borderBottom:"2px solid #f0f0f0" }}>
        <div style={{ display:"flex",alignItems:"center",gap:18 }}>
          {cv.photo && (
            <div style={{ width:64,height:64,borderRadius:"50%",overflow:"hidden",flexShrink:0,border:`2px solid ${ac}` }}>
              <img src={cv.photo} alt="" style={{ width:`${cv.photoZoom||100}%`,height:`${cv.photoZoom||100}%`,objectFit:"cover",objectPosition:`${cv.photoX||50}% ${cv.photoY||50}%`,minWidth:"100%",minHeight:"100%" }} />
            </div>
          )}
          <div><h1 style={{ margin:"0 0 4px",fontSize:40,fontWeight:900,letterSpacing:"-0.04em" }}>{cv.name||"Your Name"}</h1>{cv.title&&<p style={{ margin:0,fontSize:12,color:ac,fontWeight:700,letterSpacing:"0.04em" }}>{cv.title}</p>}</div>
        </div>
        <div style={{ textAlign:"right",fontSize:10,color:"#888",lineHeight:2 }}>
          {cv.email&&<p style={{ margin:0 }}>{cv.email}</p>}{cv.phone&&<p style={{ margin:0 }}>{cv.phone}</p>}{cv.location&&<p style={{ margin:0 }}>{cv.location}</p>}
        </div>
      </div>
      {cv.summary&&<RichText html={cv.summary} style={{ margin:"0 0 24px",lineHeight:1.8,color:"#555" }} />}
      {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ display:"flex",alignItems:"center",gap:8,fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.22em",color:ac,margin:"0 0 16px" }}><span style={{ width:8,height:8,borderRadius:"50%",background:ac,display:"inline-block" }}/>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16 }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"baseline" }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ fontSize:10,color:"#aaa",fontFamily:"'Courier New',monospace" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 5px",fontSize:11,color:ac,fontWeight:600 }}>{e.company}{e.location?` — ${e.location}`:""}</p>{e.description&&<RichText html={e.description} style={{ margin:0,lineHeight:1.7,color:"#555" }} />}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ display:"flex",alignItems:"center",gap:8,fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.22em",color:ac,margin:"0 0 16px" }}><span style={{ width:8,height:8,borderRadius:"50%",background:ac,display:"inline-block" }}/>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><div><strong>{e.degree}</strong><p style={{ margin:"1px 0 0",fontSize:11,color:ac,fontWeight:600 }}>{e.institution}</p></div><span style={{ fontSize:10,color:"#aaa",fontFamily:"'Courier New',monospace" }}>{dr(e.start_date,e.end_date)}</span></div>)}</div>}
      {cv.skills?.length>0&&<div><h2 style={{ display:"flex",alignItems:"center",gap:8,fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.22em",color:ac,margin:"0 0 12px" }}><span style={{ width:8,height:8,borderRadius:"50%",background:ac,display:"inline-block" }}/>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 12px",borderRadius:999,background:"#eff6ff",color:ac,fontSize:11,fontWeight:600,border:"1px solid #bfdbfe" }}>{s}</span>)}</div></div>}
    </div>
  );
}

// ── T4: Architect ─────────────────────────────────────────────────
function TplArchitect({ cv, color, partitionColor }) {
  const re=color||"#dc2626"; const hd=partitionColor||"#111";
  return (
    <div style={{ fontFamily:"'Josefin Sans',sans-serif",maxWidth:780,margin:"0 auto",background:"#fafafa",minHeight:1123,fontSize:12,color:"#1a1a1a" }}>
      <div style={{ background:hd,padding:"44px 40px 28px",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-30,right:-30,width:200,height:200,borderRadius:"50%",border:`2px solid ${re}30` }}/>
        <div style={{ position:"absolute",top:20,right:50,width:110,height:110,borderRadius:"50%",border:`1px solid ${re}20` }}/>
        <h1 style={{ margin:"0 0 5px",fontSize:50,fontWeight:700,color:"#fff",letterSpacing:"-0.04em",lineHeight:0.95,textTransform:"uppercase",position:"relative" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"8px 0 0",fontSize:11,color:re,textTransform:"uppercase",letterSpacing:"0.3em",fontWeight:600,position:"relative" }}>{cv.title}</p>}
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ width:180,background:"#f0f0f0",padding:"22px 14px",flexShrink:0,borderRight:"2px solid #e0e0e0" }}>
          <div style={{ marginBottom:18 }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><p key={i} style={{ margin:"0 0 5px",fontSize:8,color:"#666",wordBreak:"break-all",textTransform:"uppercase",letterSpacing:"0.05em" }}>{v}</p>)}</div>
          {cv.skills?.length>0&&<><p style={{ fontSize:8,fontWeight:700,color:re,textTransform:"uppercase",letterSpacing:"0.15em",margin:"0 0 7px" }}>Skills</p>{cv.skills.map((s,i)=><p key={i} style={{ fontSize:8,color:"#555",margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.04em" }}>— {s}</p>)}<br/></>}
          {cv.certifications?.length>0&&<><p style={{ fontSize:8,fontWeight:700,color:re,textTransform:"uppercase",letterSpacing:"0.15em",margin:"0 0 7px" }}>Certifications</p>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:8,color:"#555",margin:"0 0 3px" }}>• {c}</p>)}</>}
        </div>
        <div style={{ flex:1,padding:"22px 26px" }}>
          {cv.summary&&<p style={{ margin:"0 0 18px",lineHeight:1.8,color:"#444",fontSize:12 }}><RichText html={cv.summary} /></p>}
          {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><div style={{ width:22,height:2,background:re }}></div><h2 style={{ margin:0,fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.26em",color:re }}>Experience</h2></div>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12,textTransform:"uppercase",letterSpacing:"0.02em" }}>{e.role}</strong><span style={{ fontSize:8,color:"#999",fontFamily:"'Courier New',monospace" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 4px",fontSize:9,color:re,textTransform:"uppercase",letterSpacing:"0.08em" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}><div style={{ width:22,height:2,background:re }}></div><h2 style={{ margin:0,fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.26em",color:re }}>Education</h2></div>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ textTransform:"uppercase",fontSize:10,letterSpacing:"0.04em" }}>{e.degree}</strong><span style={{ fontSize:8,color:"#999" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:9,color:re,textTransform:"uppercase",letterSpacing:"0.07em" }}>{e.institution}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T5: Emerald Pro ───────────────────────────────────────────────
function TplEmerald({ cv, color, partitionColor }) {
  const em=partitionColor||"#065f46"; const ac=color||"#10b981";
  return (
    <div style={{ display:"flex",fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",minHeight:1123,fontSize:12 }}>
      <div style={{ width:200,background:em,color:"#fff",padding:"30px 16px",flexShrink:0 }}>
        <div style={{ width:62,height:62,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,fontWeight:800,color:em }}>{(cv.name||"?")[0]}</div>
        <h1 style={{ margin:"0 0 2px",fontSize:14,fontWeight:800,textAlign:"center" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 14px",fontSize:8,textAlign:"center",color:"#a7f3d0",textTransform:"uppercase",letterSpacing:"0.1em" }}>{cv.title}</p>}
        {[[cv.email,"✉"],[cv.phone,"☎"],[cv.location,"◎"]].filter(([v])=>v).map(([v,i],idx)=><p key={idx} style={{ margin:"0 0 4px",fontSize:8,color:"#a7f3d0",display:"flex",gap:5 }}><span>{i}</span><span style={{ wordBreak:"break-all" }}>{v}</span></p>)}
        {cv.skills?.length>0&&<div style={{ marginTop:16 }}><p style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:ac,margin:"0 0 7px" }}>Skills</p>{cv.skills.map((s,i)=><div key={i} style={{ background:"rgba(255,255,255,0.1)",borderRadius:3,padding:"2px 7px",fontSize:9,marginBottom:3,color:"#d1fae5" }}>{s}</div>)}</div>}
        {cv.certifications?.length>0&&<div style={{ marginTop:12 }}><p style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:ac,margin:"0 0 5px" }}>Certifications</p>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:8,color:"#a7f3d0",margin:"0 0 2px" }}>• {c}</p>)}</div>}
        {cv.languages?.length>0&&<div style={{ marginTop:12 }}><p style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:ac,margin:"0 0 5px" }}>Languages</p>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#a7f3d0",margin:"0 0 2px" }}>{l}</p>)}</div>}
      </div>
      <div style={{ flex:1,padding:"30px 26px",background:"#fff",color:"#1a1a1a" }}>
        {cv.summary&&<p style={{ margin:"0 0 18px",lineHeight:1.8,color:"#555",borderBottom:"2px solid #d1fae5",paddingBottom:14 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:em,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:13,paddingLeft:10,borderLeft:`3px solid #d1fae5` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:"#999" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}{e.location?` · ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:em,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:10,borderLeft:`3px solid #d1fae5` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:"#999" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:10,color:ac,fontWeight:600 }}>{e.institution}</p></div>)}</div>}
      </div>
    </div>
  );
}

// ── T6: Midnight Blue ─────────────────────────────────────────────
function TplMidnight({ cv, color, partitionColor }) {
  const tl=color||"#06b6d4"; const hd=partitionColor||"#1e3a5f";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#0f172a",minHeight:1123,color:"#e2e8f0",fontSize:12 }}>
      <div style={{ background:`linear-gradient(135deg,${hd} 0%,${hd}cc 60%,${hd}88 100%)`,padding:"38px 40px 30px",borderBottom:`2px solid ${tl}40` }}>
        <h1 style={{ margin:"0 0 4px",fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.03em" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 14px",fontSize:11,color:tl,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.14em" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 20px" }}>{[cv.email,cv.phone,cv.location,cv.linkedin].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#94a3b8" }}>{v}</span>)}</div>
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ flex:2,padding:"26px 30px" }}>
          {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.8,color:"#94a3b8",borderBottom:"1px solid #1e293b",paddingBottom:16,fontSize:13 }}><RichText html={cv.summary} /></p>}
          {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.22em",color:tl,margin:"0 0 14px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16,paddingLeft:12,borderLeft:`2px solid ${tl}40` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ color:"#e2e8f0",fontSize:13 }}>{e.role}</strong><span style={{ fontSize:10,color:tl }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 4px",fontSize:10,color:tl,fontWeight:600 }}>{e.company}{e.location?` · ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#94a3b8",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.22em",color:tl,margin:"0 0 14px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12,paddingLeft:12,borderLeft:`2px solid ${tl}40` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ color:"#e2e8f0" }}>{e.degree}</strong><span style={{ fontSize:10,color:tl }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:10,color:tl }}>{e.institution}</p></div>)}</div>}
        </div>
        <div style={{ width:175,background:"#0d1520",borderLeft:"1px solid #1e293b",padding:"26px 14px",flexShrink:0 }}>
          {cv.skills?.length>0&&<div style={{ marginBottom:18 }}><h3 style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.18em",color:tl,margin:"0 0 9px" }}>Skills</h3>{cv.skills.map((s,i)=><div key={i} style={{ background:"#1e293b",borderRadius:4,padding:"3px 8px",fontSize:9,marginBottom:3,color:"#cbd5e1" }}>{s}</div>)}</div>}
          {cv.languages?.length>0&&<div style={{ marginBottom:16 }}><h3 style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.18em",color:tl,margin:"0 0 7px" }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#94a3b8",margin:"0 0 3px" }}>{l}</p>)}</div>}
          {cv.certifications?.length>0&&<div><h3 style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.18em",color:tl,margin:"0 0 7px" }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#94a3b8",margin:"0 0 4px" }}>• {c}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T7: Rose Editorial ────────────────────────────────────────────
function TplRose({ cv, color, partitionColor }) {
  const ro=color||"#e11d48";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fffbfb",minHeight:1123,fontSize:12,color:"#2d2d2d" }}>
      <div style={{ padding:"38px 40px 0" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",borderBottom:`4px solid ${ro}`,paddingBottom:18,marginBottom:22 }}>
          <div><h1 style={{ margin:"0 0 4px",fontSize:44,fontWeight:900,color:"#111",fontFamily:"'Playfair Display','Georgia',serif",lineHeight:0.9,letterSpacing:"-0.02em" }}>{(cv.name||"Your Name").toUpperCase()}</h1>{cv.title&&<p style={{ margin:"8px 0 0",fontSize:10,color:ro,textTransform:"uppercase",letterSpacing:"0.22em",fontWeight:700 }}>{cv.title}</p>}</div>
          <div style={{ textAlign:"right",fontSize:9,color:"#888",lineHeight:2 }}>{cv.email&&<p style={{ margin:0 }}>{cv.email}</p>}{cv.phone&&<p style={{ margin:0 }}>{cv.phone}</p>}{cv.location&&<p style={{ margin:0 }}>{cv.location}</p>}</div>
        </div>
        {cv.summary&&<div style={{ display:"flex",gap:18,marginBottom:26 }}><div style={{ width:3,background:ro,borderRadius:2,flexShrink:0 }}></div><p style={{ margin:0,lineHeight:1.9,color:"#555",fontStyle:"italic",fontFamily:"'Playfair Display',serif",fontSize:14 }}><RichText html={cv.summary} /></p></div>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 190px" }}>
        <div style={{ padding:"0 40px 40px" }}>
          {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ display:"flex",alignItems:"center",gap:10,fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.22em",color:"#111",margin:"0 0 14px" }}><span style={{ display:"block",width:18,height:3,background:ro }}></span>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13,fontFamily:"'Playfair Display',serif" }}>{e.role}</strong><span style={{ fontSize:9,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 4px",fontSize:10,color:ro,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555" }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ display:"flex",alignItems:"center",gap:10,fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.22em",color:"#111",margin:"0 0 14px" }}><span style={{ display:"block",width:18,height:3,background:ro }}></span>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontFamily:"'Playfair Display',serif" }}>{e.degree}</strong><span style={{ fontSize:9,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:10,color:ro,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em" }}>{e.institution}</p></div>)}</div>}
        </div>
        <div style={{ background:partitionColor||"#fff0f3",padding:"22px 14px",borderLeft:`1px solid ${ro}20` }}>
          {cv.skills?.length>0&&<div style={{ marginBottom:16 }}><h3 style={{ fontSize:7,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:ro,margin:"0 0 9px" }}>Skills</h3>{cv.skills.map((s,i)=><div key={i} style={{ padding:"3px 0",fontSize:9,color:"#555",borderBottom:"1px solid #ffe4ea" }}>{s}</div>)}</div>}
          {cv.languages?.length>0&&<div style={{ marginBottom:14 }}><h3 style={{ fontSize:7,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:ro,margin:"0 0 7px" }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#555",margin:"0 0 3px" }}>{l}</p>)}</div>}
          {cv.certifications?.length>0&&<div><h3 style={{ fontSize:7,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:ro,margin:"0 0 7px" }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#555",margin:"0 0 3px" }}>• {c}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T8: Corporate Slate ───────────────────────────────────────────
function TplSlate({ cv, color, partitionColor }) {
  const bl=color||"#1e40af"; const hd=partitionColor||"#1e293b";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#f8fafc",minHeight:1123,fontSize:12,color:"#1e293b" }}>
      <div style={{ background:hd,color:"#fff",padding:"26px 34px" }}>
        <h1 style={{ margin:"0 0 3px",fontSize:28,fontWeight:800,letterSpacing:"-0.02em" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.12em" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 16px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:9,color:"#64748b" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"22px 34px" }}>
        {cv.summary&&<div style={{ marginBottom:18,background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px 14px" }}><p style={{ margin:0,lineHeight:1.8,color:"#475569" }}><RichText html={cv.summary} /></p></div>}
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:22 }}>
          <div>
            {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><div style={{ width:3,height:13,background:bl,borderRadius:2 }}></div><h2 style={{ margin:0,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:bl }}>Experience</h2></div>{cv.experience.map((e,i)=><div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"11px 13px",marginBottom:7 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12 }}>{e.role}</strong><span style={{ fontSize:9,color:"#94a3b8" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:bl,fontWeight:600 }}>{e.company}{e.location?` · ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#64748b",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
            {cv.education?.length>0&&<div><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}><div style={{ width:3,height:13,background:bl,borderRadius:2 }}></div><h2 style={{ margin:0,fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:bl }}>Education</h2></div>{cv.education.map((e,i)=><div key={i} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"11px 13px",marginBottom:7 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:"#94a3b8" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:10,color:bl,fontWeight:600 }}>{e.institution}</p></div>)}</div>}
          </div>
          <div>
            {cv.skills?.length>0&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px",marginBottom:8 }}><h3 style={{ margin:"0 0 9px",fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:bl }}>Skills</h3><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"2px 8px",borderRadius:4,background:"#eff6ff",color:bl,fontSize:9,fontWeight:500 }}>{s}</span>)}</div></div>}
            {cv.certifications?.length>0&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px",marginBottom:8 }}><h3 style={{ margin:"0 0 7px",fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:bl }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#475569",margin:"0 0 3px" }}>✓ {c}</p>)}</div>}
            {cv.languages?.length>0&&<div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:8,padding:"12px" }}><h3 style={{ margin:"0 0 7px",fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:bl }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#475569",margin:"0 0 3px" }}>{l}</p>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── T9: Vivid Creative ────────────────────────────────────────────
function TplVivid({ cv, color, partitionColor }) {
  const pal=[color||"#f59e0b","#ec4899","#8b5cf6","#06b6d4","#10b981","#f97316"];
  const gc = i => pal[i%pal.length]; const hd=partitionColor||"#111";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#111" }}>
      <div style={{ background:hd,padding:"34px 34px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-end" }}>
        <div><h1 style={{ margin:"0 0 4px",fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.03em" }}>{cv.name||"Your Name"}</h1>{cv.title&&<p style={{ margin:0,fontSize:11,color:pal[0],fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>{cv.title}</p>}</div>
        <div style={{ textAlign:"right",fontSize:9,color:"#888",lineHeight:2 }}>{cv.email&&<p style={{ margin:0,color:"#ccc" }}>{cv.email}</p>}{cv.phone&&<p style={{ margin:0,color:"#ccc" }}>{cv.phone}</p>}{cv.location&&<p style={{ margin:0,color:"#ccc" }}>{cv.location}</p>}</div>
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ flex:1,padding:"22px 26px" }}>
          {cv.summary&&<p style={{ margin:"0 0 18px",lineHeight:1.8,color:"#555" }}><RichText html={cv.summary} /></p>}
          {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><h2 style={{ fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",color:"#111",margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,paddingLeft:12,borderLeft:`3px solid ${gc(i)}` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12 }}>{e.role}</strong><span style={{ fontSize:9,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:gc(i),fontWeight:700 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#666",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.2em",color:"#111",margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:12,borderLeft:`3px solid ${gc(i+2)}` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:10,color:gc(i+2),fontWeight:700 }}>{e.institution}</p></div>)}</div>}
        </div>
        <div style={{ width:172,borderLeft:"2px solid #f5f5f5",padding:"22px 13px" }}>
          {cv.skills?.length>0&&<div style={{ marginBottom:16 }}><h3 style={{ fontSize:8,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:"#111",margin:"0 0 9px" }}>Skills</h3>{cv.skills.map((s,i)=><div key={i} style={{ marginBottom:5 }}><p style={{ margin:"0 0 2px",fontSize:9,fontWeight:600,color:"#333" }}>{s}</p><div style={{ height:4,background:"#f0f0f0",borderRadius:2 }}><div style={{ height:"100%",width:`${65+((i*17)%30)}%`,background:gc(i),borderRadius:2 }}></div></div></div>)}</div>}
          {cv.languages?.length>0&&<div style={{ marginBottom:12 }}><h3 style={{ fontSize:8,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:"#111",margin:"0 0 7px" }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#555",margin:"0 0 3px" }}>{l}</p>)}</div>}
          {cv.certifications?.length>0&&<div><h3 style={{ fontSize:8,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.18em",color:"#111",margin:"0 0 7px" }}>Certs</h3>{cv.certifications.map((c,i)=><div key={i} style={{ fontSize:8,color:"#555",marginBottom:3,padding:"2px 6px",background:gc(i)+"20",borderRadius:3 }}>{c}</div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T10: Monochrome Ink ───────────────────────────────────────────
function TplInk({ cv, color, partitionColor }) {
  const ac=color||"#000000";
  return (
    <div style={{ fontFamily:"'Josefin Sans',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:11,color:"#000" }}>
      <div style={{ borderBottom:`3px solid ${ac}`,padding:"38px 38px 26px" }}>
        <h1 style={{ margin:"0 0 4px",fontSize:54,fontWeight:700,letterSpacing:"-0.05em",lineHeight:0.9,textTransform:"uppercase" }}>{cv.name||"YOUR NAME"}</h1>
        {cv.title&&<p style={{ margin:"9px 0 0",fontSize:9,textTransform:"uppercase",letterSpacing:"0.45em",color:"#555" }}>{cv.title}</p>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",borderBottom:"1px solid #ddd" }}>
        {[cv.email,cv.phone,cv.location,cv.linkedin].filter(Boolean).map((v,i)=><div key={i} style={{ padding:"7px 38px",borderRight:i%2===0?"1px solid #ddd":undefined,fontSize:9,color:"#666",textTransform:"uppercase",letterSpacing:"0.07em" }}>{v}</div>)}
      </div>
      <div style={{ padding:"26px 38px" }}>
        {cv.summary&&<div style={{ marginBottom:22,borderBottom:"1px solid #ddd",paddingBottom:18 }}><p style={{ margin:0,lineHeight:1.9,color:"#333" }}><RichText html={cv.summary} /></p></div>}
        <div style={{ display:"grid",gridTemplateColumns:"2fr 1fr",gap:30 }}>
          <div>
            {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.4em",color:"#000",margin:"0 0 14px",borderBottom:"1px solid #000",paddingBottom:5 }}>Work</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:11,textTransform:"uppercase",letterSpacing:"0.04em" }}>{e.role}</strong><span style={{ fontSize:8,color:"#aaa",fontFamily:"'Courier New',monospace" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 4px",fontSize:8,textTransform:"uppercase",letterSpacing:"0.1em",color:"#888" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
            {cv.education?.length>0&&<div><h2 style={{ fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.4em",color:"#000",margin:"0 0 14px",borderBottom:"1px solid #000",paddingBottom:5 }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ textTransform:"uppercase",letterSpacing:"0.04em" }}>{e.degree}</strong><span style={{ fontSize:8,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:8,textTransform:"uppercase",letterSpacing:"0.08em",color:"#888" }}>{e.institution}</p></div>)}</div>}
          </div>
          <div>
            {cv.skills?.length>0&&<div style={{ marginBottom:14 }}><h3 style={{ fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.32em",margin:"0 0 9px",borderBottom:"1px solid #000",paddingBottom:4 }}>Skills</h3>{cv.skills.map((s,i)=><p key={i} style={{ fontSize:9,margin:"0 0 3px",textTransform:"uppercase",letterSpacing:"0.06em" }}>— {s}</p>)}</div>}
            {cv.languages?.length>0&&<div style={{ marginBottom:12 }}><h3 style={{ fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.32em",margin:"0 0 7px",borderBottom:"1px solid #000",paddingBottom:4 }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,margin:"0 0 3px" }}>{l}</p>)}</div>}
            {cv.certifications?.length>0&&<div><h3 style={{ fontSize:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.32em",margin:"0 0 7px",borderBottom:"1px solid #000",paddingBottom:4 }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,margin:"0 0 3px" }}>✓ {c}</p>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── T11: Sunrise Warm ──────────────────────────────────────────────
function TplSunrise({ cv, color, partitionColor }) {
  const ac=color||"#ea580c"; const hd=partitionColor||"#ea580c";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fffaf5",minHeight:1123,fontSize:12,color:"#1a1a1a" }}>
      <div style={{ background:`linear-gradient(135deg,${hd},${hd}cc)`,padding:"34px 40px 28px",color:"#fff" }}>
        <h1 style={{ margin:"0 0 4px",fontSize:34,fontWeight:900,letterSpacing:"-0.02em" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 12px",fontSize:11,color:"#fed7aa",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600 }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 18px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#fecaca" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"26px 40px" }}>
        {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.8,color:"#555",borderLeft:`3px solid ${ac}`,paddingLeft:16 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution} {dr(e.start_date,e.end_date)}</p></div>)}</div>}
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:999,background:"#fff7ed",color:ac,fontSize:10,border:"1px solid #fed7aa" }}>{s}</span>)}</div></div>}
      </div>
    </div>
  );
}

// ── T12: Arctic Cool ──────────────────────────────────────────────
function TplArctic({ cv, color, partitionColor }) {
  const ac=color||"#0ea5e9"; const sb=partitionColor||"#e0f2fe";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#f0f9ff",minHeight:1123,fontSize:12,color:"#0c4a6e" }}>
      <div style={{ padding:"36px 40px",borderBottom:`3px solid ${ac}` }}>
        <h1 style={{ margin:"0 0 4px",fontSize:36,fontWeight:900,color:"#0c4a6e" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:11,color:ac,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 18px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#7dd3fc" }}>{v}</span>)}</div>
      </div>
      <div style={{ display:"flex" }}>
        <div style={{ flex:1,padding:"24px 30px" }}>
          {cv.summary&&<p style={{ margin:"0 0 18px",lineHeight:1.8,color:"#334155" }}><RichText html={cv.summary} /></p>}
          {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.18em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,background:"#fff",border:"1px solid #bae6fd",borderRadius:8,padding:12 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:"#7dd3fc" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#475569",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.18em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,background:"#fff",border:"1px solid #bae6fd",borderRadius:8,padding:12 }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div>)}</div>}
        </div>
        <div style={{ width:180,background:sb,padding:"24px 14px",borderLeft:`1px solid #bae6fd` }}>
          {cv.skills?.length>0&&<div style={{ marginBottom:14 }}><h3 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 8px" }}>Skills</h3>{cv.skills.map((s,i)=><div key={i} style={{ background:"#fff",borderRadius:4,padding:"3px 8px",fontSize:9,marginBottom:3,color:"#0c4a6e" }}>{s}</div>)}</div>}
          {cv.languages?.length>0&&<div style={{ marginBottom:12 }}><h3 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 6px" }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#334155",margin:"0 0 2px" }}>{l}</p>)}</div>}
          {cv.certifications?.length>0&&<div><h3 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 6px" }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#334155",margin:"0 0 2px" }}>• {c}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T13: Royal Purple ─────────────────────────────────────────────
function TplRoyal({ cv, color, partitionColor }) {
  const ac=color||"#7c3aed"; const hd=partitionColor||"#4c1d95";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#faf5ff",minHeight:1123,fontSize:12,color:"#1e1b4b" }}>
      <div style={{ background:`linear-gradient(135deg,${hd},${hd}cc)`,padding:"34px 40px 26px",color:"#fff" }}>
        <h1 style={{ margin:"0 0 4px",fontSize:36,fontWeight:900 }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 12px",fontSize:11,color:"#c4b5fd",textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600 }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 18px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#ddd6fe" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"26px 40px" }}>
        {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.8,color:"#6b21a8",fontStyle:"italic",borderBottom:`2px solid #e9d5ff`,paddingBottom:14 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,paddingLeft:12,borderLeft:`3px solid #e9d5ff` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:"#a78bfa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:12,borderLeft:`3px solid #e9d5ff` }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div>)}</div>}
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:999,background:"#f5f3ff",color:ac,fontSize:10,border:"1px solid #e9d5ff" }}>{s}</span>)}</div></div>}
      </div>
    </div>
  );
}

// ── T14: Desert Sand ──────────────────────────────────────────────
function TplDesert({ cv, color, partitionColor }) {
  const ac=color||"#b45309";
  return (
    <div style={{ fontFamily:"'Crimson Pro','Georgia',serif",maxWidth:780,margin:"0 auto",background:"#fefce8",minHeight:1123,fontSize:12,color:"#422006" }}>
      <div style={{ padding:"38px 40px 28px",borderBottom:`2px solid ${ac}` }}>
        <h1 style={{ margin:"0 0 4px",fontSize:38,fontWeight:600,color:"#78350f" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 12px",fontSize:11,color:ac,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"'Josefin Sans',sans-serif" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 18px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#92400e" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"26px 40px" }}>
        {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.9,color:"#78350f",fontStyle:"italic" }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:ac,margin:"0 0 14px",fontFamily:"'Josefin Sans',sans-serif" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ display:"flex",gap:18,marginBottom:14 }}><div style={{ width:80,flexShrink:0,textAlign:"right",color:"#92400e",fontSize:9,fontFamily:"'Josefin Sans',sans-serif" }}>{e.start_date}<br/>{e.end_date}</div><div><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ color:ac,fontSize:10,marginLeft:8,fontFamily:"'Josefin Sans',sans-serif" }}>{e.company}</span>{e.description&&<p style={{ margin:"3px 0 0",lineHeight:1.7,color:"#78350f",fontSize:10 }}><RichText html={e.description} /></p>}</div></div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:18 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:ac,margin:"0 0 14px",fontFamily:"'Josefin Sans',sans-serif" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ display:"flex",gap:18,marginBottom:10 }}><div style={{ width:80,flexShrink:0,textAlign:"right",color:"#92400e",fontSize:9,fontFamily:"'Josefin Sans',sans-serif" }}>{dr(e.start_date,e.end_date)}</div><div><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div></div>)}</div>}
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.18em",color:ac,margin:"0 0 10px",fontFamily:"'Josefin Sans',sans-serif" }}>Skills</h2><p style={{ margin:0,color:"#78350f",lineHeight:2 }}>{cv.skills.join("  ·  ")}</p></div>}
      </div>
    </div>
  );
}

// ── T15: Ocean Teal ───────────────────────────────────────────────
function TplOcean({ cv, color, partitionColor }) {
  const ac=color||"#0d9488"; const sb=partitionColor||"#134e4a";
  return (
    <div style={{ display:"flex",fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",minHeight:1123,fontSize:12 }}>
      <div style={{ width:210,background:sb,color:"#fff",padding:"32px 16px",flexShrink:0 }}>
        <div style={{ width:60,height:60,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:22,fontWeight:800,color:"#fff" }}>{(cv.name||"?")[0]}</div>
        <h1 style={{ margin:"0 0 2px",fontSize:14,fontWeight:800,textAlign:"center" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 14px",fontSize:8,textAlign:"center",color:"#99f6e4",textTransform:"uppercase",letterSpacing:"0.1em" }}>{cv.title}</p>}
        {[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><p key={i} style={{ margin:"0 0 4px",fontSize:8,color:"#99f6e4",wordBreak:"break-all" }}>{v}</p>)}
        {cv.skills?.length>0&&<div style={{ marginTop:16 }}><p style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:ac,margin:"0 0 7px" }}>Skills</p>{cv.skills.map((s,i)=><div key={i} style={{ background:"rgba(255,255,255,0.1)",borderRadius:3,padding:"2px 7px",fontSize:9,marginBottom:3,color:"#ccfbf1" }}>{s}</div>)}</div>}
        {cv.languages?.length>0&&<div style={{ marginTop:12 }}><p style={{ fontSize:7,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em",color:ac,margin:"0 0 5px" }}>Languages</p>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#99f6e4",margin:"0 0 2px" }}>{l}</p>)}</div>}
      </div>
      <div style={{ flex:1,padding:"32px 26px",background:"#fff",color:"#1a1a1a" }}>
        {cv.summary&&<p style={{ margin:"0 0 18px",lineHeight:1.8,color:"#555",borderBottom:`2px solid #99f6e4`,paddingBottom:14 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:18 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:"#134e4a",margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:13,paddingLeft:10,borderLeft:`3px solid #99f6e4` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:"#999" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:"#134e4a",margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:10,borderLeft:`3px solid #99f6e4` }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div>)}</div>}
      </div>
    </div>
  );
}

// ── T16: Clean White ──────────────────────────────────────────────
function TplClean({ cv, color, partitionColor }) {
  const ac=color||"#111111";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#333",padding:"40px 48px" }}>
      <div style={{ textAlign:"center",marginBottom:24,paddingBottom:20,borderBottom:`2px solid ${ac}30` }}>
        <h1 style={{ margin:"0 0 4px",fontSize:32,fontWeight:800,color:"#111" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:12,color:"#666",letterSpacing:"0.08em" }}>{cv.title}</p>}
        <div style={{ display:"flex",justifyContent:"center",flexWrap:"wrap",gap:"0 16px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#999" }}>{v}</span>)}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 22px",lineHeight:1.8,color:"#555",textAlign:"center",maxWidth:560,marginLeft:"auto",marginRight:"auto" }}><RichText html={cv.summary} /></p>}
      {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#111",margin:"0 0 14px",paddingBottom:6,borderBottom:"1px solid #eee" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ fontSize:10,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:11,color:"#666",fontWeight:600 }}>{e.company}{e.location?` · ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555" }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#111",margin:"0 0 14px",paddingBottom:6,borderBottom:"1px solid #eee" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:10,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:"#666" }}>{e.institution}</p></div>)}</div>}
      <div style={{ display:"flex",gap:30,flexWrap:"wrap" }}>
        {cv.skills?.length>0&&<div style={{ flex:1 }}><h2 style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#111",margin:"0 0 10px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:4,background:"#f5f5f5",fontSize:10 }}>{s}</span>)}</div></div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.12em",color:"#111",margin:"0 0 10px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:11,margin:"0 0 3px" }}>{l}</p>)}</div>}
      </div>
    </div>
  );
}

// ── T17: Bold Modern ──────────────────────────────────────────────
function TplBold({ cv, color, partitionColor }) {
  const ac=color||"#f97316"; const hd=partitionColor||"#111";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#111" }}>
      <div style={{ background:hd,padding:"40px",position:"relative" }}>
        <h1 style={{ margin:0,fontSize:56,fontWeight:900,color:"#fff",letterSpacing:"-0.04em",lineHeight:0.95 }}>{(cv.name||"YOUR NAME").toUpperCase()}</h1>
        {cv.title&&<p style={{ margin:"10px 0 0",fontSize:14,color:ac,fontWeight:700,letterSpacing:"0.06em" }}>{cv.title}</p>}
        <div style={{ marginTop:14,display:"flex",flexWrap:"wrap",gap:"0 20px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#888" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"28px 40px" }}>
        {cv.summary&&<p style={{ margin:"0 0 24px",lineHeight:1.8,color:"#555",fontSize:14,borderLeft:`4px solid ${ac}`,paddingLeft:18 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 14px",paddingBottom:6,borderBottom:`3px solid ${ac}` }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:14 }}>{e.role}</strong><span style={{ fontSize:10,color:ac,fontWeight:700 }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac,fontWeight:700 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555" }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 14px",paddingBottom:6,borderBottom:`3px solid ${ac}` }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><strong style={{ fontSize:13 }}>{e.degree}</strong><p style={{ margin:0,fontSize:11,color:ac,fontWeight:700 }}>{e.institution}</p></div>)}</div>}
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:11,fontWeight:900,textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 12px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"4px 14px",borderRadius:999,background:"#111",color:"#fff",fontSize:11,fontWeight:700 }}>{s}</span>)}</div></div>}
      </div>
    </div>
  );
}

// ── T18: Timeline ─────────────────────────────────────────────────
function TplTimeline({ cv, color, partitionColor }) {
  const ac=color||"#6366f1";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#1e1b4b",padding:"36px 40px" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 4px",fontSize:34,fontWeight:900,color:"#1e1b4b" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 8px",fontSize:11,color:ac,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 16px" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#818cf8" }}>{v}</span>)}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 24px",lineHeight:1.8,color:"#555" }}><RichText html={cv.summary} /></p>}
      {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 16px" }}>Experience</h2><div style={{ position:"relative",paddingLeft:24 }}><div style={{ position:"absolute",left:5,top:0,bottom:0,width:2,background:"#e0e7ff" }}></div>{cv.experience.map((e,i)=><div key={i} style={{ position:"relative",marginBottom:18 }}><div style={{ position:"absolute",left:-22,top:4,width:10,height:10,borderRadius:"50%",background:ac,border:"2px solid #e0e7ff" }}></div><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div></div>}
      {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 16px" }}>Education</h2><div style={{ position:"relative",paddingLeft:24 }}><div style={{ position:"absolute",left:5,top:0,bottom:0,width:2,background:"#e0e7ff" }}></div>{cv.education.map((e,i)=><div key={i} style={{ position:"relative",marginBottom:14 }}><div style={{ position:"absolute",left:-22,top:4,width:10,height:10,borderRadius:"50%",background:"#818cf8",border:"2px solid #e0e7ff" }}></div><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div>)}</div></div>}
      {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:999,background:"#eef2ff",color:ac,fontSize:10,border:"1px solid #c7d2fe" }}>{s}</span>)}</div></div>}
    </div>
  );
}

// ── T19: Compact Pro ──────────────────────────────────────────────
function TplCompact({ cv, color, partitionColor }) {
  const ac=color||"#333333";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:11,color:"#333",padding:"28px 32px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16,paddingBottom:12,borderBottom:`2px solid ${ac}` }}>
        <div><h1 style={{ margin:0,fontSize:22,fontWeight:900,color:"#111" }}>{cv.name||"Your Name"}</h1>{cv.title&&<p style={{ margin:"2px 0 0",fontSize:10,color:"#666" }}>{cv.title}</p>}</div>
        <div style={{ textAlign:"right",fontSize:9,color:"#888",lineHeight:1.8 }}>{cv.email&&<span>{cv.email}</span>}{cv.phone&&<span style={{ marginLeft:10 }}>{cv.phone}</span>}{cv.location&&<span style={{ marginLeft:10 }}>{cv.location}</span>}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 14px",lineHeight:1.7,color:"#555",fontSize:10 }}><RichText html={cv.summary} /></p>}
      <div style={{ display:"grid",gridTemplateColumns:"3fr 1fr",gap:20 }}>
        <div>
          {cv.experience?.length>0&&<div style={{ marginBottom:14 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"#111",margin:"0 0 8px",borderBottom:"1px solid #ddd",paddingBottom:3 }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:11 }}>{e.role}</strong><span style={{ fontSize:8,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"0 0 2px",fontSize:9,color:"#666",fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.6,color:"#555",fontSize:9 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"#111",margin:"0 0 8px",borderBottom:"1px solid #ddd",paddingBottom:3 }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:8 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:10 }}>{e.degree}</strong><span style={{ fontSize:8,color:"#aaa" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:9,color:"#666" }}>{e.institution}</p></div>)}</div>}
        </div>
        <div>
          {cv.skills?.length>0&&<div style={{ marginBottom:12 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"#111",margin:"0 0 6px",borderBottom:"1px solid #ddd",paddingBottom:3 }}>Skills</h2>{cv.skills.map((s,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>• {s}</p>)}</div>}
          {cv.languages?.length>0&&<div style={{ marginBottom:10 }}><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"#111",margin:"0 0 6px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>{l}</p>)}</div>}
          {cv.certifications?.length>0&&<div><h2 style={{ fontSize:8,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.14em",color:"#111",margin:"0 0 6px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>{c}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── T20: Dubai Skyline ────────────────────────────────────────────
function TplSkyline({ cv, color, partitionColor }) {
  const ac=color||"#0891b2"; const hd=partitionColor||"#164e63";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif",maxWidth:780,margin:"0 auto",background:"#ecfeff",minHeight:1123,fontSize:12,color:"#164e63" }}>
      <div style={{ background:`linear-gradient(135deg,${hd} 0%,${hd}cc 50%,${hd}88 100%)`,padding:"36px 40px 30px",color:"#fff",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",bottom:-10,right:20,fontSize:60,opacity:0.1,fontWeight:900 }}>DUBAI</div>
        <h1 style={{ margin:"0 0 4px",fontSize:36,fontWeight:900,position:"relative" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 12px",fontSize:11,color:"#a5f3fc",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.14em",position:"relative" }}>{cv.title}</p>}
        <div style={{ display:"flex",flexWrap:"wrap",gap:"0 18px",position:"relative" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#cffafe" }}>{v}</span>)}</div>
      </div>
      <div style={{ padding:"26px 40px" }}>
        {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.8,color:"#0e7490",borderLeft:`3px solid ${ac}`,paddingLeft:16 }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,background:"#fff",border:"1px solid #a5f3fc",borderRadius:8,padding:12 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#475569",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution}</p></div>)}</div>}
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:999,background:"#fff",color:ac,fontSize:10,border:`1px solid ${ac}40` }}>{s}</span>)}</div></div>}
      </div>
    </div>
  );
}

// ── T21–T30: Wizard Templates ─────────────────────────────────────

function TplWizClassic({ cv, color, partitionColor }) {
  const ac=color||"#1a2a3a";
  return (
    <div style={{ fontFamily:"Georgia,serif",maxWidth:780,margin:"0 auto",padding:40,background:"#fff",minHeight:1123,fontSize:12,color:"#1f2937" }}>
      <div style={{ textAlign:"center",marginBottom:24 }}>
        <h1 style={{ margin:"0 0 6px",fontSize:30,fontWeight:"bold",color:ac }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 8px",fontSize:13,color:"#6b7280" }}>{cv.title}</p>}
        <p style={{ margin:0,fontSize:12,color:"#6b7280" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).join("  ·  ")}</p>
      </div>
      <hr style={{ border:"none",borderTop:"1px solid #e5e7eb",margin:"0 0 20px" }}/>
      {cv.summary&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 8px" }}>Professional Summary</h2><p style={{ margin:0,lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p></div>}
      {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac,fontWeight:600 }}>{e.company}{e.location?` · ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280" }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:ac }}>{e.institution}</p></div>)}</div>}
      {cv.skills?.length>0&&<div style={{ marginBottom:16 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 8px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:4,background:ac+"12",color:ac,fontSize:10 }}>{s}</span>)}</div></div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }}>
        {cv.certifications?.length>0&&<div><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 6px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>· {c}</p>)}</div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 6px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>{l}</p>)}</div>}
      </div>
    </div>
  );
}

function TplWizModern({ cv, color, partitionColor }) {
  const ac=color||"#2563eb"; const sb=partitionColor||"#1e40af";
  return (
    <div style={{ display:"flex",fontFamily:"system-ui,sans-serif",maxWidth:780,margin:"0 auto",minHeight:1123,fontSize:12 }}>
      <div style={{ width:260,background:sb,color:"#fff",padding:32,flexShrink:0 }}>
        <h1 style={{ margin:"0 0 4px",fontSize:20,fontWeight:700 }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 20px",fontSize:10,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",letterSpacing:"0.08em" }}>{cv.title}</p>}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:10,textTransform:"uppercase",opacity:0.6,margin:"0 0 4px",letterSpacing:"0.08em" }}>Contact</p>
          {cv.email&&<p style={{ margin:"0 0 3px",fontSize:10,color:"rgba(255,255,255,0.85)",wordBreak:"break-all" }}>{cv.email}</p>}
          {cv.phone&&<p style={{ margin:"0 0 3px",fontSize:10,color:"rgba(255,255,255,0.85)" }}>{cv.phone}</p>}
          {cv.location&&<p style={{ margin:0,fontSize:10,color:"rgba(255,255,255,0.85)" }}>{cv.location}</p>}
        </div>
        {cv.skills?.length>0&&<div style={{ marginBottom:20 }}><p style={{ fontSize:10,textTransform:"uppercase",opacity:0.6,margin:"0 0 6px",letterSpacing:"0.08em" }}>Skills</p><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 8px",borderRadius:4,background:"rgba(255,255,255,0.15)",fontSize:9,color:"#fff" }}>{s}</span>)}</div></div>}
        {cv.languages?.length>0&&<div style={{ marginBottom:18 }}><p style={{ fontSize:10,textTransform:"uppercase",opacity:0.6,margin:"0 0 6px",letterSpacing:"0.08em" }}>Languages</p>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"rgba(255,255,255,0.85)",margin:"0 0 2px" }}>{l}</p>)}</div>}
        {cv.certifications?.length>0&&<div><p style={{ fontSize:10,textTransform:"uppercase",opacity:0.6,margin:"0 0 6px",letterSpacing:"0.08em" }}>Certifications</p>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"rgba(255,255,255,0.85)",margin:"0 0 2px" }}>· {c}</p>)}</div>}
      </div>
      <div style={{ flex:1,padding:32,background:"#fff",color:"#1f2937" }}>
        {cv.summary&&<p style={{ margin:"0 0 20px",lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,paddingLeft:14,borderLeft:`2px solid ${ac}` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12 }}>{e.role}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:14,borderLeft:`2px solid ${ac}` }}><strong>{e.degree}</strong><p style={{ margin:"2px 0 0",fontSize:10,color:ac }}>{e.institution} · {dr(e.start_date,e.end_date)}</p></div>)}</div>}
      </div>
    </div>
  );
}

function TplWizMinimal({ cv, color, partitionColor }) {
  const ac=color||"#374151";
  return (
    <div style={{ fontFamily:"system-ui,sans-serif",maxWidth:780,margin:"0 auto",padding:40,background:"#fff",minHeight:1123,fontSize:12,color:"#4b5563" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 6px",fontSize:30,fontWeight:300,color:ac,letterSpacing:"0.05em" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 8px",fontSize:12,color:"#9ca3af" }}>{cv.title}</p>}
        <p style={{ margin:0,fontSize:11,color:"#9ca3af" }}>{[cv.email,cv.phone].filter(Boolean).join("  ·  ")}{cv.location?`  ·  ${cv.location}`:""}</p>
      </div>
      {cv.summary&&<div style={{ marginBottom:24,maxWidth:600 }}><p style={{ margin:0,lineHeight:1.8,color:"#6b7280" }}><RichText html={cv.summary} /></p></div>}
      {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,margin:"0 0 14px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12,fontWeight:600,color:"#1f2937" }}>{e.role}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280" }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,margin:"0 0 14px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontWeight:600,color:"#1f2937" }}>{e.degree}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:ac }}>{e.institution}</p></div>)}</div>}
      {cv.skills?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,margin:"0 0 10px" }}>Skills</h2><p style={{ margin:0,lineHeight:2,color:"#6b7280" }}>{cv.skills.join("  ·  ")}</p></div>}
      <div style={{ display:"flex",gap:48 }}>
        {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,margin:"0 0 6px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,margin:"0 0 2px" }}>{c}</p>)}</div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,margin:"0 0 6px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,margin:"0 0 2px" }}>{l}</p>)}</div>}
      </div>
    </div>
  );
}

function TplWizExecutive({ cv, color, partitionColor }) {
  const ac=color||"#1e3a5f"; const hd=partitionColor||"#1e3a5f";
  return (
    <div style={{ fontFamily:"Georgia,serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#1f2937" }}>
      <div style={{ background:hd,textAlign:"center",padding:"40px 32px",color:"#fff" }}>
        <h1 style={{ margin:"0 0 6px",fontSize:30,fontWeight:"bold" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:12,color:"rgba(255,255,255,0.8)" }}>{cv.title}</p>}
        <p style={{ margin:0,fontSize:11,color:"rgba(255,255,255,0.7)" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).join("   |   ")}</p>
      </div>
      <div style={{ padding:32 }}>
        {cv.summary&&<div style={{ marginBottom:20,textAlign:"center" }}><p style={{ margin:0,lineHeight:1.8,color:"#4b5563",fontStyle:"italic",maxWidth:560,marginLeft:"auto",marginRight:"auto" }}><RichText html={cv.summary} /></p><hr style={{ border:"none",borderTop:"1px solid #e5e7eb",margin:"16px 0 0" }}/></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ fontSize:10,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280" }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:11,color:ac }}>{e.institution} · {dr(e.start_date,e.end_date)}</p></div>)}</div>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
          {cv.skills?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"2px 8px",borderRadius:4,background:ac+"12",color:ac,fontSize:9 }}>{s}</span>)}</div></div>}
          {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>{c}</p>)}</div>}
          {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>{l}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

function TplWizCreative({ cv, color, partitionColor }) {
  const ac=color||"#7c3aed"; const sb=partitionColor||"#f5f3ff";
  return (
    <div style={{ fontFamily:"system-ui,sans-serif",maxWidth:780,margin:"0 auto",background:"#fff",minHeight:1123,fontSize:12,color:"#1f2937" }}>
      <div style={{ padding:"32px 32px 20px",display:"flex",alignItems:"flex-end",gap:16 }}>
        <div style={{ width:64,height:64,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700,color:"#fff",flexShrink:0 }}>{(cv.name||"?")[0]}</div>
        <div><h1 style={{ margin:"0 0 4px",fontSize:26,fontWeight:700 }}>{cv.name||"Your Name"}</h1>{cv.title&&<p style={{ margin:0,fontSize:11,color:ac,fontWeight:600 }}>{cv.title}</p>}</div>
      </div>
      {cv.summary&&<div style={{ margin:"0 32px 20px",borderRadius:8,padding:16,background:ac+"08",borderLeft:`4px solid ${ac}` }}><p style={{ margin:0,lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p></div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 230px",gap:28,padding:"0 32px 32px" }}>
        <div>
          {cv.experience?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 12px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,paddingLeft:14,borderLeft:`2px solid ${ac}40`,position:"relative" }}><div style={{ position:"absolute",left:-5,top:4,width:8,height:8,borderRadius:"50%",background:ac }}></div><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.role}</strong><span style={{ fontSize:9,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"1px 0 3px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 12px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,paddingLeft:14,borderLeft:`2px solid ${ac}40` }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution} · {dr(e.start_date,e.end_date)}</p></div>)}</div>}
        </div>
        <div style={{ background:sb,borderRadius:10,padding:18 }}>
          <p style={{ margin:"0 0 3px",fontSize:9,color:"#6b7280",wordBreak:"break-all" }}>{cv.email}</p>
          <p style={{ margin:"0 0 3px",fontSize:9,color:"#6b7280" }}>{cv.phone}</p>
          <p style={{ margin:"0 0 14px",fontSize:9,color:"#6b7280" }}>{cv.location}</p>
          {cv.skills?.length>0&&<div style={{ marginBottom:14 }}><h3 style={{ fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 6px" }}>Skills</h3><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"2px 8px",borderRadius:999,background:ac,color:"#fff",fontSize:9 }}>{s}</span>)}</div></div>}
          {cv.certifications?.length>0&&<div style={{ marginBottom:12 }}><h3 style={{ fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 6px" }}>Certifications</h3>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,color:"#6b7280",margin:"0 0 2px" }}>{c}</p>)}</div>}
          {cv.languages?.length>0&&<div><h3 style={{ fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 6px" }}>Languages</h3>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#6b7280",margin:"0 0 2px" }}>{l}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

function TplWizProfessional({ cv, color, partitionColor }) {
  const ac=color||"#2563eb";
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:780,margin:"0 auto",padding:32,background:"#fff",minHeight:1123,fontSize:12,color:"#1f2937" }}>
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:"0 0 6px",fontSize:26,fontWeight:700,color:"#1f2937" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 6px",fontSize:11,color:"#6b7280" }}>{cv.title}</p>}
        <div style={{ height:4,marginTop:16,borderRadius:999,background:ac,maxWidth:120 }}></div>
        <div style={{ display:"flex",gap:16,marginTop:10 }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#6b7280" }}>{v}</span>)}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 22px",lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p>}
      {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 14px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ display:"flex",gap:16,marginBottom:14 }}><div style={{ width:90,flexShrink:0,paddingTop:2 }}><span style={{ fontSize:10,fontWeight:600,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><div style={{ flex:1 }}><strong style={{ fontSize:12 }}>{e.role}</strong><p style={{ margin:"1px 0 3px",fontSize:11,color:"#6b7280" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280",fontSize:10 }}><RichText html={e.description} /></p>}</div></div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 14px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ display:"flex",gap:16,marginBottom:10 }}><div style={{ width:90,flexShrink:0 }}><span style={{ fontSize:10,fontWeight:600,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><div><strong>{e.degree}</strong><p style={{ margin:0,fontSize:11,color:"#6b7280" }}>{e.institution}</p></div></div>)}</div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Skills</h2>{cv.skills.map((s,i)=><p key={i} style={{ fontSize:10,margin:"0 0 3px" }}>{s}</p>)}</div>}
        {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,margin:"0 0 3px" }}>{c}</p>)}</div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,margin:"0 0 3px" }}>{l}</p>)}</div>}
      </div>
    </div>
  );
}

function TplWizElegant({ cv, color, partitionColor }) {
  const ac=color||"#78716c";
  return (
    <div style={{ fontFamily:"'Palatino Linotype','Book Antiqua',Palatino,serif",maxWidth:780,margin:"0 auto",padding:40,background:"#fff",minHeight:1123,fontSize:12,color:"#57534e",textAlign:"center" }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ margin:"0 0 8px",fontSize:30,fontWeight:400,letterSpacing:"0.15em",textTransform:"uppercase",color:ac }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:11,color:"#a8a29e",letterSpacing:"0.1em" }}>{cv.title}</p>}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:10 }}><div style={{ height:1,flex:1,maxWidth:80,background:ac+"40" }}></div><span style={{ fontSize:10,color:"#a8a29e" }}>{[cv.email,cv.phone].filter(Boolean).join("  |  ")}</span><div style={{ height:1,flex:1,maxWidth:80,background:ac+"40" }}></div></div>
        {cv.location&&<p style={{ margin:0,fontSize:10,color:"#a8a29e" }}>{cv.location}</p>}
      </div>
      {cv.summary&&<div style={{ marginBottom:24 }}><p style={{ margin:0,lineHeight:1.9,color:"#78716c",fontStyle:"italic",maxWidth:560,marginLeft:"auto",marginRight:"auto" }}><RichText html={cv.summary} /></p></div>}
      {cv.experience?.length>0&&<div style={{ marginBottom:24,textAlign:"left" }}><div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}><div style={{ height:1,flex:1,background:ac+"30" }}></div><h2 style={{ margin:0,fontSize:10,fontWeight:400,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,flexShrink:0 }}>Experience</h2><div style={{ height:1,flex:1,background:ac+"30" }}></div></div>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,textAlign:"center" }}><strong style={{ fontSize:13 }}>{e.role}</strong><p style={{ margin:"2px 0",fontSize:10,fontStyle:"italic",color:ac }}>{e.company} · {dr(e.start_date,e.end_date)}</p>{e.description&&<p style={{ margin:"4px auto 0",lineHeight:1.7,color:"#78716c",maxWidth:560,fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:24 }}><div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}><div style={{ height:1,flex:1,background:ac+"30" }}></div><h2 style={{ margin:0,fontSize:10,fontWeight:400,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,flexShrink:0 }}>Education</h2><div style={{ height:1,flex:1,background:ac+"30" }}></div></div>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,fontStyle:"italic",color:ac }}>{e.institution} · {dr(e.start_date,e.end_date)}</p></div>)}</div>}
      {cv.skills?.length>0&&<div style={{ marginBottom:20 }}><div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}><div style={{ height:1,flex:1,background:ac+"30" }}></div><h2 style={{ margin:0,fontSize:10,fontWeight:400,textTransform:"uppercase",letterSpacing:"0.25em",color:ac,flexShrink:0 }}>Skills</h2><div style={{ height:1,flex:1,background:ac+"30" }}></div></div><p style={{ margin:0,lineHeight:2,color:"#78716c" }}>{cv.skills.join("   ·   ")}</p></div>}
    </div>
  );
}

function TplWizBold({ cv, color, partitionColor }) {
  const ac=color||"#f59e0b"; const bg=partitionColor||"#111827";
  return (
    <div style={{ fontFamily:"system-ui,sans-serif",maxWidth:780,margin:"0 auto",background:bg,minHeight:1123,fontSize:12,color:"#f3f4f6",padding:32 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 6px",fontSize:36,fontWeight:900,color:ac }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:12,color:"#9ca3af" }}>{cv.title}</p>}
        <p style={{ margin:0,fontSize:10,color:"#6b7280" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).join("  //  ")}</p>
      </div>
      {cv.summary&&<div style={{ marginBottom:22,padding:16,borderRadius:8,background:ac+"15" }}><p style={{ margin:0,lineHeight:1.8,color:"#d1d5db" }}><RichText html={cv.summary} /></p></div>}
      {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:18,fontWeight:900,textTransform:"uppercase",color:ac,margin:"0 0 14px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:14,padding:16,borderRadius:8,background:"rgba(31,41,55,0.5)",border:"1px solid #374151" }}><div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}><strong style={{ fontSize:13,color:"#f3f4f6" }}>{e.role}</strong><span style={{ padding:"2px 8px",borderRadius:4,background:ac,color:"#111827",fontSize:9,fontWeight:700 }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:10,color:ac,fontWeight:600 }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#9ca3af",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:18,fontWeight:900,textTransform:"uppercase",color:ac,margin:"0 0 14px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10,padding:16,borderRadius:8,background:"rgba(31,41,55,0.5)",border:"1px solid #374151" }}><strong style={{ color:"#f3f4f6" }}>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:ac }}>{e.institution} · {dr(e.start_date,e.end_date)}</p></div>)}</div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:12,fontWeight:900,textTransform:"uppercase",color:ac,margin:"0 0 8px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"3px 10px",borderRadius:999,border:`1px solid ${ac}`,color:ac,fontSize:10,fontWeight:500 }}>{s}</span>)}</div></div>}
        <div>
          {cv.certifications?.length>0&&<div style={{ marginBottom:10 }}><h2 style={{ fontSize:12,fontWeight:900,textTransform:"uppercase",color:ac,margin:"0 0 6px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#9ca3af",margin:"0 0 2px" }}>{c}</p>)}</div>}
          {cv.languages?.length>0&&<div><h2 style={{ fontSize:12,fontWeight:900,textTransform:"uppercase",color:ac,margin:"0 0 6px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#9ca3af",margin:"0 0 2px" }}>{l}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

function TplWizCompact({ cv, color, partitionColor }) {
  const ac=color||"#374151";
  return (
    <div style={{ fontFamily:"'Arial Narrow',Arial,sans-serif",maxWidth:780,margin:"0 auto",padding:24,background:"#fff",minHeight:1123,fontSize:11,color:"#4b5563" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${ac}` }}>
        <div><h1 style={{ margin:0,fontSize:20,fontWeight:"bold",color:ac }}>{cv.name||"Your Name"}</h1>{cv.title&&<p style={{ margin:"2px 0 0",fontSize:10,color:"#6b7280" }}>{cv.title}</p>}</div>
        <div style={{ fontSize:10,color:"#6b7280",textAlign:"right" }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ marginLeft:i>0?10:0 }}>{v}</span>)}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 12px",lineHeight:1.5,color:"#6b7280",fontSize:10 }}><RichText html={cv.summary} /></p>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 200px",gap:16 }}>
        <div>
          {cv.experience?.length>0&&<div style={{ marginBottom:12 }}><h2 style={{ fontWeight:"bold",textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",color:ac,paddingBottom:4,marginBottom:8,borderBottom:`1px solid ${ac}40` }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:11 }}>{e.role}</strong><span style={{ fontSize:9,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"0 0 2px",fontSize:9,color:"#6b7280" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.4,color:"#6b7280",fontSize:9 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div><h2 style={{ fontWeight:"bold",textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",color:ac,paddingBottom:4,marginBottom:8,borderBottom:`1px solid ${ac}40` }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:8 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:10 }}>{e.degree}</strong><span style={{ fontSize:9,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:9,color:"#6b7280" }}>{e.institution}</p></div>)}</div>}
        </div>
        <div>
          {cv.skills?.length>0&&<div style={{ marginBottom:10 }}><h2 style={{ fontWeight:"bold",textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",color:ac,paddingBottom:4,marginBottom:6,borderBottom:`1px solid ${ac}40` }}>Skills</h2>{cv.skills.map((s,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>· {s}</p>)}</div>}
          {cv.certifications?.length>0&&<div style={{ marginBottom:10 }}><h2 style={{ fontWeight:"bold",textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",color:ac,paddingBottom:4,marginBottom:6,borderBottom:`1px solid ${ac}40` }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>{c}</p>)}</div>}
          {cv.languages?.length>0&&<div><h2 style={{ fontWeight:"bold",textTransform:"uppercase",fontSize:10,letterSpacing:"0.05em",color:ac,paddingBottom:4,marginBottom:6,borderBottom:`1px solid ${ac}40` }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,margin:"0 0 2px" }}>{l}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

function TplWizTimeline({ cv, color, partitionColor }) {
  const ac=color||"#6366f1";
  return (
    <div style={{ fontFamily:"system-ui,sans-serif",maxWidth:780,margin:"0 auto",padding:32,background:"#fff",minHeight:1123,fontSize:12,color:"#1f2937" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:"0 0 4px",fontSize:24,fontWeight:700 }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 8px",fontSize:11,color:ac,fontWeight:600 }}>{cv.title}</p>}
        <div style={{ display:"flex",gap:16 }}>{[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i} style={{ fontSize:10,color:"#6b7280" }}>{v}</span>)}</div>
      </div>
      {cv.summary&&<p style={{ margin:"0 0 24px",lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p>}
      {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 16px" }}>Experience</h2><div style={{ position:"relative",marginLeft:12 }}><div style={{ position:"absolute",left:0,top:8,bottom:8,width:2,background:ac+"30" }}></div>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:20,paddingLeft:24,position:"relative" }}><div style={{ position:"absolute",left:-4,top:6,width:9,height:9,borderRadius:"50%",border:`2px solid ${ac}`,background:"#fff" }}></div><p style={{ margin:"0 0 2px",fontSize:10,fontWeight:500,color:ac }}>{dr(e.start_date,e.end_date)}</p><strong style={{ fontSize:12 }}>{e.role}</strong><p style={{ margin:"1px 0 3px",fontSize:10,color:"#6b7280" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280",fontSize:10 }}><RichText html={e.description} /></p>}</div>)}</div></div>}
      {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 16px" }}>Education</h2><div style={{ position:"relative",marginLeft:12 }}><div style={{ position:"absolute",left:0,top:8,bottom:8,width:2,background:ac+"30" }}></div>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:16,paddingLeft:24,position:"relative" }}><div style={{ position:"absolute",left:-4,top:6,width:9,height:9,borderRadius:"50%",border:`2px solid ${ac}`,background:"#fff" }}></div><p style={{ margin:"0 0 2px",fontSize:10,fontWeight:500,color:ac }}>{dr(e.start_date,e.end_date)}</p><strong>{e.degree}</strong><p style={{ margin:0,fontSize:10,color:"#6b7280" }}>{e.institution}</p></div>)}</div></div>}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20 }}>
        {cv.skills?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:4 }}>{cv.skills.map((s,i)=><span key={i} style={{ padding:"2px 8px",borderRadius:4,background:ac+"12",color:ac,fontSize:9 }}>{s}</span>)}</div></div>}
        {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>{c}</p>)}</div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:ac,margin:"0 0 8px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 2px" }}>{l}</p>)}</div>}
      </div>
    </div>
  );
}

// ── Premium T1: Executive Sidebar ─────────────────────────────────
function TplPremiumExecutive({ cv, color, partitionColor }) {
  const ac=color||"#1e3a5f"; const sb=partitionColor||"#f8fafc";
  return (
    <div style={{ display:"flex", fontFamily:"'Crimson Pro',Georgia,serif", maxWidth:780, margin:"0 auto", minHeight:1123, background:"#fff", fontSize:12 }}>
      <div style={{ width:240, background:sb, padding:"36px 22px", borderRight:`3px solid ${ac}` }}>
        <div style={{ width:80,height:80,borderRadius:"50%",background:ac,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:32,fontWeight:700,color:"#fff" }}>{(cv.name||"?")[0]}</div>
        <h1 style={{ fontSize:20,fontWeight:600,textAlign:"center",color:ac,margin:"0 0 4px" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ fontSize:10,textAlign:"center",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 20px" }}>{cv.title}</p>}
        <div style={{ borderTop:`1px solid ${ac}30`,paddingTop:14,marginBottom:16 }}>
          {[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><p key={i} style={{ fontSize:9,color:"#475569",margin:"0 0 5px" }}>{v}</p>)}
        </div>
        {cv.skills?.length>0&&<div style={{ marginBottom:16 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 8px" }}>Core Skills</h2>{cv.skills.map((s,i)=><div key={i} style={{ background:ac+"12",borderRadius:4,padding:"3px 8px",fontSize:9,marginBottom:3,color:ac }}>{s}</div>)}</div>}
        {cv.languages?.length>0&&<div style={{ marginBottom:16 }}><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 8px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:9,color:"#475569",margin:"0 0 3px" }}>{l}</p>)}</div>}
        {cv.interests?.length>0&&<div><h2 style={{ fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:ac,margin:"0 0 8px" }}>Interests</h2>{cv.interests.map((x,i)=><p key={i} style={{ fontSize:9,color:"#475569",margin:"0 0 3px" }}>{x}</p>)}</div>}
      </div>
      <div style={{ flex:1,padding:"36px 30px",color:"#1e293b" }}>
        {cv.summary&&<div style={{ marginBottom:22,paddingBottom:14,borderBottom:`1px solid #e2e8f0` }}><p style={{ margin:0,lineHeight:1.9,fontSize:13,fontStyle:"italic",color:"#475569" }}><RichText html={cv.summary} /></p></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 14px",paddingBottom:5,borderBottom:`2px solid ${ac}` }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13 }}>{e.role}</strong><span style={{ fontSize:9,color:"#94a3b8" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac,fontWeight:600 }}>{e.company}{e.location?` | ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#64748b",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 14px",paddingBottom:5,borderBottom:`2px solid ${ac}` }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:"#94a3b8" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:ac }}>{e.institution}{e.grade?` (${e.grade})`:""}</p></div>)}</div>}
        {cv.certifications?.length>0&&<div style={{ marginBottom:16 }}><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px",paddingBottom:5,borderBottom:`2px solid ${ac}` }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:11,color:"#475569",margin:"0 0 4px" }}>• {c}</p>)}</div>}
        {cv.awards?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.16em",color:ac,margin:"0 0 10px",paddingBottom:5,borderBottom:`2px solid ${ac}` }}>Awards</h2>{cv.awards.map((a,i)=><p key={i} style={{ fontSize:11,color:"#475569",margin:"0 0 4px" }}>{a}</p>)}</div>}
      </div>
    </div>
  );
}

// ── Premium T2: Tech Modern ──────────────────────────────────────
function TplPremiumTech({ cv, color }) {
  const ac=color||"#3b82f6";
  return (
    <div style={{ fontFamily:"'Courier New',Consolas,monospace", maxWidth:780, margin:"0 auto", minHeight:1123, background:"#0f172a", color:"#e2e8f0", fontSize:12 }}>
      <div style={{ background:"#020617",padding:"32px 40px",borderBottom:`3px solid ${ac}` }}>
        <h1 style={{ margin:"0 0 4px",fontSize:32,fontWeight:700,color:"#f8fafc" }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 10px",fontSize:13,color:ac }}>&gt; {cv.title}</p>}
        <div style={{ display:"flex",gap:20,fontSize:10,color:"#64748b" }}>
          {cv.email&&<span>{cv.email}</span>}{cv.phone&&<span>{cv.phone}</span>}{cv.location&&<span>{cv.location}</span>}
        </div>
      </div>
      <div style={{ padding:"28px 40px" }}>
        {cv.summary&&<div style={{ marginBottom:22,padding:16,background:"#1e293b",borderRadius:8,borderLeft:`3px solid ${ac}` }}><p style={{ margin:0,lineHeight:1.8,color:"#94a3b8",fontSize:12 }}>/* <RichText html={cv.summary} /> */</p></div>}
        {cv.skills?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:11,color:ac,margin:"0 0 10px" }}>// SKILLS</h2><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cv.skills.map((s,i)=><span key={i} style={{ background:"#1e293b",color:ac,padding:"3px 10px",borderRadius:3,fontSize:10,border:`1px solid ${ac}40` }}>{s}</span>)}</div></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:11,color:ac,margin:"0 0 14px" }}>// EXPERIENCE</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16,paddingLeft:16,borderLeft:`2px solid ${ac}40` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ color:"#f1f5f9",fontSize:13 }}>{e.role}</strong><span style={{ color:ac,fontSize:10 }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac+"aa" }}>{e.company}{e.location?` | ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#94a3b8",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:11,color:ac,margin:"0 0 14px" }}>// EDUCATION</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12,paddingLeft:16,borderLeft:`2px solid ${ac}40` }}><strong style={{ color:"#f1f5f9" }}>{e.degree}</strong><p style={{ margin:"2px 0",fontSize:11,color:ac+"aa" }}>{e.institution} {dr(e.start_date,e.end_date)}</p></div>)}</div>}
        {cv.certifications?.length>0&&<div style={{ marginBottom:16 }}><h2 style={{ fontSize:11,color:ac,margin:"0 0 10px" }}>// CERTIFICATIONS</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#94a3b8",margin:"0 0 3px" }}>&gt; {c}</p>)}</div>}
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:11,color:ac,margin:"0 0 8px" }}>// LANGUAGES</h2><p style={{ fontSize:10,color:"#94a3b8" }}>{cv.languages.join(" | ")}</p></div>}
      </div>
    </div>
  );
}

// ── Premium T3: Creative Portfolio ───────────────────────────────
function TplPremiumCreative({ cv, color, partitionColor }) {
  const ac=color||"#8b5cf6"; const sb=partitionColor||"#f5f3ff";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", maxWidth:780, margin:"0 auto", minHeight:1123, background:"#fff", fontSize:12 }}>
      <div style={{ display:"flex",gap:0 }}>
        <div style={{ width:8,background:`linear-gradient(180deg,${ac},${ac}60)`,flexShrink:0 }}></div>
        <div style={{ flex:1,padding:"32px 36px" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24 }}>
            <div>
              <h1 style={{ margin:"0 0 4px",fontSize:34,fontWeight:800,color:ac }}>{cv.name||"Your Name"}</h1>
              {cv.title&&<p style={{ margin:0,fontSize:13,color:"#6b7280",fontWeight:500 }}>{cv.title}</p>}
            </div>
            <div style={{ textAlign:"right",fontSize:10,color:"#9ca3af",lineHeight:2 }}>
              {cv.email&&<p style={{ margin:0 }}>{cv.email}</p>}{cv.phone&&<p style={{ margin:0 }}>{cv.phone}</p>}{cv.location&&<p style={{ margin:0 }}>{cv.location}</p>}
            </div>
          </div>
          {cv.summary&&<div style={{ marginBottom:24,padding:"16px 20px",background:sb,borderRadius:12 }}><p style={{ margin:0,lineHeight:1.8,color:"#4b5563" }}><RichText html={cv.summary} /></p></div>}
          {cv.experience?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 14px",display:"flex",alignItems:"center",gap:8 }}><span style={{ width:24,height:3,background:ac,display:"inline-block",borderRadius:2 }}/>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16,padding:"12px 16px",background:i%2===0?"#fafafa":"#fff",borderRadius:8,border:`1px solid #f0f0f0` }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13,color:"#1f2937" }}>{e.role}</strong><span style={{ fontSize:9,color:ac,fontWeight:600 }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:ac }}>{e.company}{e.location?` | ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#6b7280",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
          {cv.education?.length>0&&<div style={{ marginBottom:24 }}><h2 style={{ fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 14px",display:"flex",alignItems:"center",gap:8 }}><span style={{ width:24,height:3,background:ac,display:"inline-block",borderRadius:2 }}/>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:10 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:ac }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:"#6b7280" }}>{e.institution}{e.grade?` (${e.grade})`:""}</p></div>)}</div>}
          {cv.skills?.length>0&&<div style={{ marginBottom:20 }}><h2 style={{ fontSize:11,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.1em",color:ac,margin:"0 0 10px",display:"flex",alignItems:"center",gap:8 }}><span style={{ width:24,height:3,background:ac,display:"inline-block",borderRadius:2 }}/>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>{cv.skills.map((s,i)=><span key={i} style={{ background:`linear-gradient(135deg,${ac},#6366f1)`,color:"#fff",padding:"4px 12px",borderRadius:20,fontSize:10 }}>{s}</span>)}</div></div>}
          <div style={{ display:"flex",gap:30 }}>
            {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:800,color:ac,margin:"0 0 6px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 3px" }}>• {c}</p>)}</div>}
            {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:800,color:ac,margin:"0 0 6px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 3px" }}>{l}</p>)}</div>}
            {cv.awards?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:800,color:ac,margin:"0 0 6px" }}>Awards</h2>{cv.awards.map((a,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 3px" }}>{a}</p>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Premium T4: Minimalist Plus ──────────────────────────────────
function TplPremiumMinimal({ cv, color }) {
  const ac=color||"#111827";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", maxWidth:780, margin:"0 auto", padding:"48px 52px", minHeight:1123, background:"#fff", fontSize:12, color:"#111827" }}>
      <h1 style={{ margin:"0 0 4px",fontSize:36,fontWeight:300,letterSpacing:2,color:ac }}>{cv.name||"Your Name"}</h1>
      {cv.title&&<p style={{ margin:"0 0 12px",fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4 }}>{cv.title}</p>}
      <div style={{ display:"flex",gap:20,fontSize:9,color:"#9ca3af",marginBottom:32 }}>
        {[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
      </div>
      {cv.summary&&<p style={{ margin:"0 0 32px",lineHeight:1.9,color:"#6b7280",fontSize:12 }}><RichText html={cv.summary} /></p>}
      {cv.experience?.length>0&&<div style={{ marginBottom:32 }}><h2 style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4,margin:"0 0 16px" }}>Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:20 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:12,fontWeight:500 }}>{e.role}</strong><span style={{ fontSize:9,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 6px",fontSize:11,color:"#6b7280" }}>{e.company}</p>{e.description&&<p style={{ margin:0,lineHeight:1.8,color:"#6b7280",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
      {cv.education?.length>0&&<div style={{ marginBottom:32 }}><h2 style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4,margin:"0 0 16px" }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:14 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontWeight:500 }}>{e.degree}</strong><span style={{ fontSize:9,color:"#9ca3af" }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:"#6b7280" }}>{e.institution}</p></div>)}</div>}
      {cv.skills?.length>0&&<div style={{ marginBottom:28 }}><h2 style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4,margin:"0 0 12px" }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{cv.skills.map((s,i)=><span key={i} style={{ color:"#374151",fontSize:10,borderBottom:`1px solid #e5e7eb`,padding:"2px 0" }}>{s}</span>)}</div></div>}
      <div style={{ display:"flex",gap:40 }}>
        {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4,margin:"0 0 8px" }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 3px" }}>{l}</p>)}</div>}
        {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,color:"#9ca3af",textTransform:"uppercase",letterSpacing:4,margin:"0 0 8px" }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#6b7280",margin:"0 0 3px" }}>{c}</p>)}</div>}
      </div>
    </div>
  );
}

// ── Premium T5: Dubai Professional ───────────────────────────────
function TplPremiumDubai({ cv, color, partitionColor }) {
  const gold=color||"#d4a853"; const navy=partitionColor||"#0c2340";
  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", maxWidth:780, margin:"0 auto", minHeight:1123, background:"#fff", fontSize:12 }}>
      <div style={{ background:`linear-gradient(135deg,${navy},#1e3a5f)`,padding:"30px 36px",borderBottom:`4px solid ${gold}`,color:"#fff" }}>
        <h1 style={{ margin:"0 0 4px",fontSize:28,fontWeight:700,color:gold }}>{cv.name||"Your Name"}</h1>
        {cv.title&&<p style={{ margin:"0 0 12px",fontSize:12,color:"#e2e8f0" }}>{cv.title}</p>}
        <div style={{ display:"flex",gap:20,fontSize:10,color:"#94a3b8" }}>
          {[cv.email,cv.phone,cv.location].filter(Boolean).map((v,i)=><span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ padding:"28px 36px",color:"#1e293b" }}>
        {cv.summary&&<div style={{ marginBottom:22,padding:"14px 18px",background:"#fefce8",borderLeft:`3px solid ${gold}`,borderRadius:4 }}><p style={{ margin:0,lineHeight:1.8,color:"#44403c",fontSize:12 }}><RichText html={cv.summary} /></p></div>}
        {cv.experience?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:navy,margin:"0 0 14px",paddingBottom:5,borderBottom:`2px solid ${gold}` }}>Professional Experience</h2>{cv.experience.map((e,i)=><div key={i} style={{ marginBottom:16 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong style={{ fontSize:13,color:navy }}>{e.role}</strong><span style={{ fontSize:9,color:gold,fontWeight:600 }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:"2px 0 4px",fontSize:11,color:gold }}>{e.company}{e.location?` | ${e.location}`:""}</p>{e.description&&<p style={{ margin:0,lineHeight:1.7,color:"#64748b",fontSize:11 }}><RichText html={e.description} /></p>}</div>)}</div>}
        {cv.education?.length>0&&<div style={{ marginBottom:22 }}><h2 style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:navy,margin:"0 0 14px",paddingBottom:5,borderBottom:`2px solid ${gold}` }}>Education</h2>{cv.education.map((e,i)=><div key={i} style={{ marginBottom:12 }}><div style={{ display:"flex",justifyContent:"space-between" }}><strong>{e.degree}</strong><span style={{ fontSize:9,color:gold }}>{dr(e.start_date,e.end_date)}</span></div><p style={{ margin:0,fontSize:11,color:gold }}>{e.institution}</p></div>)}</div>}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
          {cv.skills?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:navy,margin:"0 0 8px",paddingBottom:3,borderBottom:`1px solid ${gold}` }}>Skills</h2><div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>{cv.skills.map((s,i)=><span key={i} style={{ background:navy,color:gold,padding:"3px 10px",borderRadius:4,fontSize:9 }}>{s}</span>)}</div></div>}
          {cv.certifications?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:navy,margin:"0 0 8px",paddingBottom:3,borderBottom:`1px solid ${gold}` }}>Certifications</h2>{cv.certifications.map((c,i)=><p key={i} style={{ fontSize:10,color:"#64748b",margin:"0 0 3px" }}>{c}</p>)}</div>}
          {cv.languages?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:navy,margin:"0 0 8px",paddingBottom:3,borderBottom:`1px solid ${gold}` }}>Languages</h2>{cv.languages.map((l,i)=><p key={i} style={{ fontSize:10,color:"#64748b",margin:"0 0 3px" }}>{l}</p>)}</div>}
          {cv.awards?.length>0&&<div><h2 style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:navy,margin:"0 0 8px",paddingBottom:3,borderBottom:`1px solid ${gold}` }}>Awards</h2>{cv.awards.map((a,i)=><p key={i} style={{ fontSize:10,color:"#64748b",margin:"0 0 3px" }}>{a}</p>)}</div>}
        </div>
      </div>
    </div>
  );
}

// ── Template Registry ─────────────────────────────────────────────

const TEMPLATES = [
  { id:"dubai-gold",  label:"Dubai Gold",        emoji:"🏆", dark:true,  Component:TplDubaiGold,  partitions:{ sidebar:{ label:"Sidebar", default:"#111" } } },
  { id:"executive",   label:"Executive Classic",  emoji:"👔", dark:false, Component:TplExecutive,  partitions:{ header:{ label:"Header", default:"#1a2744" } } },
  { id:"tech-min",    label:"Tech Minimal",       emoji:"💻", dark:false, Component:TplTechMinimal, partitions:{} },
  { id:"architect",   label:"Architect",          emoji:"🏗",  dark:false, Component:TplArchitect,  partitions:{ header:{ label:"Header", default:"#111" } } },
  { id:"emerald",     label:"Emerald Pro",        emoji:"🌿", dark:false, Component:TplEmerald,    partitions:{ sidebar:{ label:"Sidebar", default:"#065f46" } } },
  { id:"midnight",    label:"Midnight Blue",      emoji:"🌙", dark:true,  Component:TplMidnight,   partitions:{ header:{ label:"Header", default:"#1e3a5f" } } },
  { id:"rose",        label:"Rose Editorial",     emoji:"🌹", dark:false, Component:TplRose,       partitions:{ sidebar:{ label:"Sidebar", default:"#fff0f3" } } },
  { id:"slate",       label:"Corporate Slate",    emoji:"📊", dark:false, Component:TplSlate,      partitions:{ header:{ label:"Header", default:"#1e293b" } } },
  { id:"vivid",       label:"Vivid Creative",     emoji:"🎨", dark:false, Component:TplVivid,      partitions:{ header:{ label:"Header", default:"#111" } } },
  { id:"ink",         label:"Monochrome Ink",     emoji:"🖤", dark:false, Component:TplInk,        partitions:{} },
  { id:"sunrise",     label:"Sunrise Warm",       emoji:"🌅", dark:false, Component:TplSunrise,    partitions:{ header:{ label:"Header", default:"#ea580c" } } },
  { id:"arctic",      label:"Arctic Cool",        emoji:"❄️", dark:false, Component:TplArctic,     partitions:{ sidebar:{ label:"Sidebar", default:"#e0f2fe" } } },
  { id:"royal",       label:"Royal Purple",       emoji:"👑", dark:false, Component:TplRoyal,      partitions:{ header:{ label:"Header", default:"#4c1d95" } } },
  { id:"desert",      label:"Desert Sand",        emoji:"🏜️", dark:false, Component:TplDesert,     partitions:{} },
  { id:"ocean",       label:"Ocean Teal",         emoji:"🌊", dark:false, Component:TplOcean,      partitions:{ sidebar:{ label:"Sidebar", default:"#134e4a" } } },
  { id:"clean",       label:"Clean White",        emoji:"📝", dark:false, Component:TplClean,      partitions:{} },
  { id:"bold",        label:"Bold Modern",        emoji:"⚡", dark:false, Component:TplBold,       partitions:{ header:{ label:"Header", default:"#111" } } },
  { id:"timeline",    label:"Timeline",           emoji:"📅", dark:false, Component:TplTimeline,   partitions:{} },
  { id:"compact",     label:"Compact Pro",        emoji:"📋", dark:false, Component:TplCompact,    partitions:{} },
  { id:"skyline",     label:"Dubai Skyline",      emoji:"🏙️", dark:false, Component:TplSkyline,    partitions:{ header:{ label:"Header", default:"#164e63" } } },
  { id:"wiz-classic",     label:"Classic Serif",      emoji:"📖", dark:false, Component:TplWizClassic,      partitions:{} },
  { id:"wiz-modern",      label:"Modern Sidebar",     emoji:"🔷", dark:false, Component:TplWizModern,       partitions:{ sidebar:{ label:"Sidebar", default:"#1e40af" } } },
  { id:"wiz-minimal",     label:"Airy Minimal",       emoji:"🕊️", dark:false, Component:TplWizMinimal,      partitions:{} },
  { id:"wiz-executive",   label:"Executive Bar",      emoji:"🏛️", dark:false, Component:TplWizExecutive,    partitions:{ header:{ label:"Header", default:"#1e3a5f" } } },
  { id:"wiz-creative",    label:"Creative Circle",    emoji:"🎭", dark:false, Component:TplWizCreative,     partitions:{ sidebar:{ label:"Sidebar", default:"#f5f3ff" } } },
  { id:"wiz-professional",label:"Professional Line",  emoji:"📐", dark:false, Component:TplWizProfessional, partitions:{} },
  { id:"wiz-elegant",     label:"Elegant Center",     emoji:"✨", dark:false, Component:TplWizElegant,      partitions:{} },
  { id:"wiz-bold",        label:"Bold Dark",          emoji:"🌑", dark:true,  Component:TplWizBold,         partitions:{ header:{ label:"Background", default:"#111827" } } },
  { id:"wiz-compact",     label:"Dense Compact",      emoji:"🔍", dark:false, Component:TplWizCompact,      partitions:{} },
  { id:"wiz-timeline",    label:"Timeline Dots",      emoji:"🔘", dark:false, Component:TplWizTimeline,     partitions:{} },
  // Premium templates (subscription required)
  { id:"premium-executive", label:"Executive Plus",    emoji:"💎", dark:false, Component:TplPremiumExecutive, partitions:{ sidebar:{ label:"Sidebar", default:"#f8fafc" } }, premium:true },
  { id:"premium-tech",      label:"Tech Modern",       emoji:"🖥️", dark:true,  Component:TplPremiumTech,      partitions:{}, premium:true },
  { id:"premium-creative",  label:"Creative Portfolio", emoji:"🎯", dark:false, Component:TplPremiumCreative,  partitions:{ sidebar:{ label:"Accent Bar", default:"#f5f3ff" } }, premium:true },
  { id:"premium-minimal",   label:"Minimalist Plus",   emoji:"◻️", dark:false, Component:TplPremiumMinimal,   partitions:{}, premium:true },
  { id:"premium-dubai",     label:"Dubai Professional", emoji:"🕌", dark:false, Component:TplPremiumDubai,     partitions:{ header:{ label:"Header", default:"#0c2340" } }, premium:true },
];

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE SELECTOR
// ═══════════════════════════════════════════════════════════════════

function ColorPicker({ color, onChange }) {
  return (
    <div style={{ marginBottom:18 }}>
      <p style={{ fontSize:10, fontWeight:800, color:T.accent, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:10 }}>Accent Color</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
        {COLOR_PRESETS.map(c => (
          <button key={c} onClick={() => onChange(c)} style={{
            width:28, height:28, borderRadius:8, border: color===c ? "3px solid #fff" : "2px solid transparent",
            background:c, cursor:"pointer", outline: color===c ? `2px solid ${c}` : "none",
            boxShadow: color===c ? `0 0 8px ${c}60` : "none", transition:"all 0.15s",
          }} />
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:8 }}>
          <input type="color" value={color} onChange={e => onChange(e.target.value)} style={{ width:28, height:28, border:"none", borderRadius:6, cursor:"pointer", padding:0 }} />
          <span style={{ fontSize:10, color:T.muted, fontFamily:"monospace" }}>{color}</span>
        </div>
      </div>
    </div>
  );
}

function PartitionColorPicker({ templateId, color, onChange }) {
  const tpl = TEMPLATES.find(t => t.id === templateId);
  const parts = tpl?.partitions || {};
  const keys = Object.keys(parts);
  if (keys.length === 0) return null;
  const part = parts[keys[0]];
  const PARTITION_PRESETS = ["#111","#1a2744","#065f46","#134e4a","#1e293b","#4c1d95","#ea580c","#164e63","#881337","#1e3a5f","#e0f2fe","#fff0f3","#f5f3ff","#111827","#0f172a"];
  return (
    <div style={{ marginBottom:18 }}>
      <p style={{ fontSize:10, fontWeight:800, color:"#06b6d4", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:4 }}>{part.label} Color</p>
      <p style={{ fontSize:9, color:T.muted, margin:"0 0 8px" }}>Applies to: {part.label}</p>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
        <button onClick={() => onChange(part.default)} style={{ width:28, height:28, borderRadius:8, border: color===part.default ? "3px solid #fff" : "2px solid #444", background:part.default, cursor:"pointer", outline: color===part.default ? `2px solid ${part.default}` : "none", fontSize:8, color:"#fff", fontWeight:900 }} title="Reset to default">R</button>
        {PARTITION_PRESETS.filter(c=>c!==part.default).slice(0,10).map(c => (
          <button key={c} onClick={() => onChange(c)} style={{
            width:28, height:28, borderRadius:8, border: color===c ? "3px solid #fff" : "2px solid transparent",
            background:c, cursor:"pointer", outline: color===c ? `2px solid ${c}` : "none",
            boxShadow: color===c ? `0 0 8px ${c}60` : "none", transition:"all 0.15s",
          }} />
        ))}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:8 }}>
          <input type="color" value={color} onChange={e => onChange(e.target.value)} style={{ width:28, height:28, border:"none", borderRadius:6, cursor:"pointer", padding:0 }} />
          <span style={{ fontSize:10, color:T.muted, fontFamily:"monospace" }}>{color}</span>
        </div>
      </div>
    </div>
  );
}

function TemplateSelector({ selected, onSelect, cv, accentColor, onColorChange, partitionColor, onPartitionColorChange, subscription }) {
  const current = TEMPLATES.find(t => t.id === selected) || TEMPLATES[0];
  const Cmp = current.Component;
  const canUsePremium = subscription?.isActive && !subscription?.isTrial;
  return (
    <div>
      <ColorPicker color={accentColor} onChange={onColorChange} />
      <PartitionColorPicker templateId={selected} color={partitionColor} onChange={onPartitionColorChange} />

      {/* Two-column layout: grid left, preview right */}
      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, alignItems:"start" }}>
        {/* Template grid */}
        <div style={{ maxHeight:"calc(100vh - 200px)", overflowY:"auto", padding:"2px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
            {TEMPLATES.map(t => {
              const locked = t.premium && !canUsePremium;
              return (
              <button key={t.id} onClick={() => { if (!locked) onSelect(t.id); }} style={{
                padding:"8px 6px", borderRadius:10, cursor: locked ? "not-allowed" : "pointer", textAlign:"center", transition:"all 0.15s",
                border:`2px solid ${selected===t.id ? T.accent : T.border}`,
                background: selected===t.id ? T.accentGlow : T.surface,
                opacity: locked ? 0.5 : 1, position:"relative",
              }}
                onMouseEnter={e => { if(selected!==t.id && !locked){ e.currentTarget.style.borderColor=`${T.accent}50`; } }}
                onMouseLeave={e => { if(selected!==t.id){ e.currentTarget.style.borderColor=T.border; } }}
              >
                {locked && <div style={{ position:"absolute",top:2,right:2,fontSize:10 }}>🔒</div>}
                <div style={{ height:28, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4, fontSize:18 }}>{t.emoji}</div>
                <p style={{ margin:0, fontSize:7, fontWeight:800, color:selected===t.id ? T.accent : T.text, textTransform:"uppercase", letterSpacing:"0.04em", lineHeight:1.3 }}>{t.label}</p>
                {t.premium && <p style={{ margin:"2px 0 0", fontSize:6, color:T.accent, fontWeight:700 }}>PREMIUM</p>}
              </button>
              );
            })}
          </div>
        </div>

        {/* Template preview — A4 ratio container */}
        <div style={{ border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden", position:"relative", background:current.dark ? "#0d0d0d" : "#fff" }}>
          <div style={{ position:"absolute", top:10, left:10, zIndex:10, background:accentColor, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 12px", borderRadius:999, textTransform:"uppercase", letterSpacing:"0.1em", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
            {current.emoji} {current.label}
          </div>
          {/* Scaled preview with proper containment */}
          <div style={{ width:"100%", aspectRatio:"210/297", overflow:"hidden" }}>
            <div style={{ transform:"scale(0.52)", transformOrigin:"top left", width:"192.3%", pointerEvents:"none" }}>
              <Cmp cv={cv} color={accentColor} partitionColor={partitionColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PDF EXPORT
// ═══════════════════════════════════════════════════════════════════

function buildPrintHTML(cv) {
  const gold = "#c9952a";

  const expRows = (cv.experience||[]).map(e => `
    <div style="margin-bottom:14px;padding-left:12px;border-left:2px solid rgba(201,149,42,0.4)">
      <div style="display:flex;justify-content:space-between"><strong style="font-family:'Cormorant Garamond',serif;font-size:13px">${esc(e.role)}</strong><span style="font-size:10px;color:${gold}">${esc(e.start_date)}${e.end_date?` – ${esc(e.end_date)}`:""}</span></div>
      <p style="margin:2px 0 4px;font-size:11px;color:${gold};font-style:italic">${esc(e.company)}${e.location?` · ${esc(e.location)}`:""}</p>
      ${e.description?`<p style="margin:0;line-height:1.7;font-size:11px;color:#aaa">${e.description}</p>`:""}
    </div>`).join("");

  const eduRows = (cv.education||[]).map(e => `
    <div style="margin-bottom:11px;padding-left:12px;border-left:2px solid rgba(201,149,42,0.3)">
      <div style="display:flex;justify-content:space-between"><strong style="font-family:'Cormorant Garamond',serif">${esc(e.degree)}</strong><span style="font-size:9px;color:${gold}">${esc(e.start_date)}${e.end_date?` – ${esc(e.end_date)}`:""}</span></div>
      <p style="margin:0;font-size:10px;color:${gold}">${esc(e.institution)}</p>
    </div>`).join("");

  const skillBadges = (cv.skills||[]).map(s =>
    `<span style="background:rgba(201,149,42,0.15);color:${gold};border-radius:3px;padding:2px 8px;font-size:9px;margin:2px;display:inline-block;border:1px solid rgba(201,149,42,0.3)">${esc(s)}</span>`).join("");

  return `<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>CV — ${esc(cv.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@400;600;700;800;900&family=Josefin+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;padding:0;font-family:'Outfit',sans-serif}
  @page{margin:0;size:A4}
  @media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
  h2{margin:0 0 12px;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:0.18em;color:${gold};font-family:'Josefin Sans',sans-serif}
</style></head><body>
<div style="display:flex;max-width:780px;margin:0 auto;min-height:1123px;background:#0d0d0d;color:#fff;font-family:'Outfit',sans-serif;font-size:12px">
  <div style="width:220px;background:#111;border-right:2px solid rgba(201,149,42,0.3);padding:36px 20px;flex-shrink:0">
    <div style="width:66px;height:66px;border-radius:50%;background:linear-gradient(135deg,${gold},#6b4400);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:26px;font-weight:900;color:#fff;font-family:'Cormorant Garamond',serif;text-align:center;line-height:66px">${esc((cv.name||"?")[0])}</div>
    <h1 style="margin:0 0 2px;font-size:17px;font-weight:700;text-align:center;color:${gold};font-family:'Cormorant Garamond',serif">${esc(cv.name)}</h1>
    ${cv.title?`<p style="margin:0 0 16px;font-size:9px;text-align:center;color:#888;text-transform:uppercase;letter-spacing:0.1em">${esc(cv.title)}</p>`:""}
    <div style="border-top:1px solid rgba(201,149,42,0.25);padding-top:12px;margin-bottom:14px">
      ${cv.email?`<p style="margin:0 0 4px;font-size:9px;color:#bbb">✉ ${esc(cv.email)}</p>`:""}
      ${cv.phone?`<p style="margin:0 0 4px;font-size:9px;color:#bbb">☎ ${esc(cv.phone)}</p>`:""}
      ${cv.location?`<p style="margin:0 0 4px;font-size:9px;color:#bbb">◎ ${esc(cv.location)}</p>`:""}
      ${cv.linkedin?`<p style="margin:0 0 4px;font-size:9px;color:#bbb;word-break:break-all">in ${esc(cv.linkedin)}</p>`:""}
    </div>
    ${skillBadges?`<h2>Skills</h2><div style="margin-bottom:14px">${skillBadges}</div>`:""}
    ${(cv.languages||[]).length?`<h2>Languages</h2><div style="margin-bottom:12px">${(cv.languages||[]).map(l=>`<p style="margin:0 0 2px;font-size:9px;color:#bbb">${esc(l)}</p>`).join("")}</div>`:""}
    ${(cv.certifications||[]).length?`<h2>Certifications</h2>${(cv.certifications||[]).map(c=>`<p style="margin:0 0 2px;font-size:9px;color:#bbb">• ${esc(c)}</p>`).join("")}`:""}
    ${(cv.awards||[]).length?`<h2 style="margin-top:12px">Awards</h2>${(cv.awards||[]).map(a=>`<p style="margin:0 0 2px;font-size:9px;color:#bbb">🏆 ${esc(a)}</p>`).join("")}`:""}
  </div>
  <div style="flex:1;padding:36px 28px">
    ${cv.summary?`<div style="margin-bottom:20px;border-bottom:1px solid #222;padding-bottom:14px"><p style="margin:0;line-height:1.8;color:#ccc;font-style:italic;font-family:'Cormorant Garamond',serif;font-size:14px">${cv.summary}</p></div>`:""}
    ${expRows?`<h2>Experience</h2><div style="margin-bottom:20px">${expRows}</div>`:""}
    ${eduRows?`<h2>Education</h2><div style="margin-bottom:16px">${eduRows}</div>`:""}
    ${(cv.volunteer||[]).length?`<h2>Volunteer</h2>${(cv.volunteer||[]).map(v=>`<div style="margin-bottom:10px;padding-left:10px;border-left:2px solid rgba(201,149,42,0.3)"><strong style="font-size:11px">${esc(v.role)}</strong><span style="color:${gold};font-size:10px;margin-left:8px">${esc(v.organization)}</span>${v.description?`<p style="margin:2px 0 0;font-size:10px;color:#aaa">${esc(v.description)}</p>`:""}</div>`).join("")}`:""}
  </div>
</div>
</body></html>`;
}

function PDFExporter({ cv, templateId, onSwitchTemplate, accentColor, onColorChange, partitionColor, onPartitionColorChange, subscription, onShowUpgrade }) {
  const current = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const Cmp = current.Component;
  const printRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const canExport = subscription?.isActive && !subscription?.isTrial;

  const handleDownloadPdf = async () => {
    if (!canExport) {
      if (onShowUpgrade) onShowUpgrade();
      return;
    }
    if (!printRef.current) { alert("Template not rendered yet"); return; }
    setDownloading(true);
    try {
      // Send the rendered template HTML to the backend for PDF conversion
      // This ensures the downloaded PDF matches exactly what the user sees
      const html = printRef.current.innerHTML;
      const fileName = `${(cv.name || "CV").replace(/[^a-zA-Z0-9]/g, "_")}_CV.pdf`;
      const res = await fetch(`${BASE_URL}/job-seeker/cv/html-to-pdf`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ html, fileName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to generate PDF");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download PDF: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleExport = () => {
    if (!canExport) {
      if (onShowUpgrade) onShowUpgrade();
      return;
    }
    if (!printRef.current) return;
    setExporting(true);
    const html = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow popups to export PDF."); setExporting(false); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>CV - ${(cv.name||"CV").replace(/[<>"&]/g,"")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Serif+Display:ital@0;1&family=Josefin+Sans:wght@300;400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
body{margin:0;padding:0}
@page{margin:0;size:A4}
@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}}
</style></head><body>${html}</body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); setExporting(false); }, 1200);
  };

  return (
    <div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
        <div style={{ flex:1 }}>
          <p style={{ margin:"0 0 2px", fontSize:13, fontWeight:700, color:T.text }}>Export as PDF</p>
          <p style={{ margin:0, fontSize:11, color:T.muted }}>Template: <strong style={{ color:T.accent }}>{current.emoji} {current.label}</strong> · Opens print dialog → choose "Save as PDF" for a vector-quality document</p>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={handleDownloadPdf} disabled={downloading} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", background: downloading ? T.subtle : !canExport ? "#6b7280" : "#059669", color: downloading ? T.muted : "#fff", border:"none", borderRadius:10, fontSize:12, fontWeight:800, cursor: downloading ? "wait" : "pointer", letterSpacing:"0.04em" }}>
            {downloading ? <><Spinner size={14} color="#fff" /> Downloading…</> : !canExport ? <>🔒 Upgrade</> : <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Download PDF
            </>}
          </button>
          <button onClick={handleExport} disabled={exporting} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", background: exporting ? T.subtle : !canExport ? "#6b7280" : T.accent, color: exporting ? T.muted : "#fff", border:"none", borderRadius:10, fontSize:12, fontWeight:800, cursor: exporting ? "wait" : "pointer", letterSpacing:"0.04em" }}>
            {exporting ? <><Spinner size={14} color="#fff" /> Generating…</> : !canExport ? <>🔒 Upgrade</> : <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:15,height:15}}><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Print PDF
            </>}
          </button>
        </div>
      </div>

      {/* Color pickers */}
      <ColorPicker color={accentColor} onChange={onColorChange} />
      <PartitionColorPicker templateId={templateId} color={partitionColor} onChange={onPartitionColorChange} />

      {/* Template switcher */}
      <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onSwitchTemplate(t.id)} style={{ padding:"4px 12px", borderRadius:8, border:`1.5px solid ${templateId===t.id?T.accent:T.border}`, background:templateId===t.id?T.accentGlow:T.surface, color:templateId===t.id?T.accent:T.muted, fontSize:10, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div ref={printRef} className="cv-tpl-wrap" style={{ border:`1px solid ${T.border}`, borderRadius:12, overflow:"hidden" }}>
        <Cmp cv={cv} color={accentColor} partitionColor={partitionColor} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════

const TABS = [
  { id:"upload",   emoji:"⬆", label:"Upload & Parse" },
  { id:"edit",     emoji:"✏",  label:"Edit CV" },
  { id:"template", emoji:"🎨", label:"Templates" },
  { id:"export",   emoji:"📄", label:"Export PDF" },
];

export default function App({ subscription }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [affindaKey] = useState(() => { try { return localStorage.getItem("cv_affinda_key")||""; } catch { return ""; } });
  const [cv, setCV] = useState(EMPTY_CV);
  const [tab, setTab] = useState("upload");
  const [template, setTemplate] = useState("dubai-gold");
  const [accentColor, setAccentColor] = useState("#c9952a");
  const [partitionColor, setPartitionColor] = useState("#111");
  const [suggestions, setSuggestions] = useState([]);
  const [enabledSections, setEnabledSections] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const handleTemplateChange = (id) => {
    setTemplate(id);
    const tpl = TEMPLATES.find(t => t.id === id);
    const parts = tpl?.partitions || {};
    const keys = Object.keys(parts);
    if (keys.length > 0) setPartitionColor(parts[keys[0]].default);
  };

  const handleParsed = (data, sug) => {
    setCV(data);
    setSuggestions(sug||[]);
    setTab("edit");
  };

  const handleSaveToProfile = async () => {
    setSaving(true); setSaveMsg("");
    try {
      await saveToProfile(cv);
      setSaveMsg("Profile updated successfully with your CV data!");
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (e) {
      setSaveMsg(`Error: ${e.message}`);
    } finally { setSaving(false); }
  };

  const enableSection = key => { if (!enabledSections.includes(key)) setEnabledSections(p=>[...p,key]); };
  const dismissSugg = key => setDismissed(p=>[...p,key]);
  const visibleSugg = suggestions.filter(s => !dismissed.includes(s.key));

  return (
    <div style={{ minHeight:"100vh", background:T.bg, fontFamily:T.fontBody, color:T.text }}>
      <style>{`
        ${FONTS_CSS}
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes cvSpin{to{transform:rotate(360deg)}}
        @keyframes cvFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        body{background:${T.bg};color:${T.text}}
        textarea,input{font-family:'Outfit',sans-serif}
        textarea:focus,input:focus{outline:none}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${T.surface}}
        ::-webkit-scrollbar-thumb{background:${T.subtle};border-radius:3px}
        ::-webkit-scrollbar-thumb:hover{background:${T.accent}60}
        .quill .ql-toolbar{background:${T.surface};border-color:${T.border};border-radius:8px 8px 0 0}
        .quill .ql-container{border-color:${T.border};border-radius:0 0 8px 8px;background:${T.surface};color:${T.text};font-family:'Outfit',sans-serif;font-size:13px;min-height:80px}
        .quill .ql-editor{min-height:80px;line-height:1.7}
        .quill .ql-editor.ql-blank::before{color:${T.muted};font-style:italic}
        .quill .ql-toolbar button{color:${T.muted}}
        .quill .ql-toolbar button:hover,.quill .ql-toolbar button.ql-active{color:${T.accent}}
        .quill .ql-toolbar .ql-stroke{stroke:${T.muted}}
        .quill .ql-toolbar button:hover .ql-stroke,.quill .ql-toolbar button.ql-active .ql-stroke{stroke:${T.accent}}
        .quill .ql-toolbar .ql-fill{fill:${T.muted}}
        .quill .ql-toolbar button:hover .ql-fill,.quill .ql-toolbar button.ql-active .ql-fill{fill:${T.accent}}
        .quill .ql-toolbar .ql-picker-label{color:${T.muted}}
        .quill .ql-toolbar .ql-picker-options{background:${T.card};border-color:${T.border}}
        .quill .ql-toolbar .ql-picker-item{color:${T.text}}
        .cv-tpl-wrap{overflow:hidden;word-break:break-word;overflow-wrap:break-word}
        .cv-tpl-wrap p{margin:0 0 2px;overflow-wrap:break-word;word-break:break-word}
        .cv-tpl-wrap ul,.cv-tpl-wrap ol{margin:2px 0;padding-left:18px}
        .cv-tpl-wrap li{margin-bottom:1px}
        .cv-tpl-wrap h1,.cv-tpl-wrap h2,.cv-tpl-wrap h3{overflow-wrap:break-word;word-break:break-word}
      `}</style>

      {/* ── Header ── */}
      <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:"0 28px" }}>
        <div style={{ maxWidth:1120, margin:"0 auto", display:"flex", alignItems:"center", gap:18, padding:"13px 0", flexWrap:"wrap" }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:11, flexShrink:0 }}>
            <div style={{ width:38,height:38,borderRadius:10,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg viewBox="0 0 24 24" fill="white" style={{width:19,height:19}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v1H8v-1zm0-3h8v1H8v-1zm0-3h5v1H8v-1z"/></svg>
            </div>
            <div>
              <p style={{ fontSize:18,fontWeight:800,color:T.accent,fontFamily:T.fontDisplay,letterSpacing:"-0.02em",lineHeight:1 }}>CV Forge</p>
              <p style={{ fontSize:8,color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em" }}>AI-Powered Builder</p>
            </div>
          </div>

          {/* Platform CV indicator */}
          <div style={{ flex:1,maxWidth:440,display:"flex",alignItems:"center",gap:10 }}>
            {cv._platformCvId && (
              <span style={{ fontSize:10, fontWeight:700, color:T.success, background:`${T.success}20`, border:`1px solid ${T.success}40`, borderRadius:999, padding:"4px 12px", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{fontSize:14}}>&#10003;</span> Saved to platform
              </span>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:2, marginLeft:"auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,border:"none",background:tab===t.id?T.accentGlow:"transparent",color:tab===t.id?T.accent:T.muted,fontWeight:700,fontSize:11,cursor:"pointer",transition:"all 0.15s",textTransform:"uppercase",letterSpacing:"0.06em",fontFamily:T.fontBody }}>
                <span style={{fontSize:13}}>{t.emoji}</span>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:1120, margin:"0 auto", padding:"30px 28px 60px" }}>

        {/* ── UPLOAD ── */}
        {tab==="upload" && (
          <div style={{ animation:"cvFadeUp 0.3s ease both" }}>
            <div style={{ marginBottom:24 }}>
              <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:5 }}>Step 1</p>
              <h2 style={{ fontSize:30,fontWeight:900,fontFamily:T.fontDisplay,color:T.text,letterSpacing:"-0.02em",marginBottom:5 }}>Upload Your CV</h2>
              <p style={{ color:T.muted,fontSize:14 }}>Upload a PDF and Affinda AI will extract all fields automatically into the editor.</p>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:22 }}>
              <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:26 }}>
                <UploadPanel affindaKey={affindaKey} onParsed={handleParsed} />
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:18 }}>
                  <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:12 }}>How it works</p>
                  {["Upload your current CV as PDF","Platform AI extracts all structured data","Edit fields and refine your information","Pick a professional template","Export as PDF or save to your profile"].map((s,i)=>(
                    <div key={i} style={{ display:"flex",gap:10,marginBottom:9 }}>
                      <span style={{ width:20,height:20,borderRadius:"50%",background:T.accentGlow,border:`1px solid ${T.accent}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:T.accent,flexShrink:0 }}>{i+1}</span>
                      <p style={{ fontSize:12,color:T.muted,lineHeight:1.6 }}>{s}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background:`${T.accent}10`,border:`1px solid ${T.accent}30`,borderRadius:14,padding:16 }}>
                  <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6 }}>30 Premium Templates</p>
                  <p style={{ fontSize:11,color:T.muted,lineHeight:1.8 }}>{TEMPLATES.map(t => `${t.emoji} ${t.label}`).join(" · ")}</p>
                </div>
                <button onClick={()=>setTab("edit")} style={{ padding:"11px",borderRadius:12,border:`1px solid ${T.border}`,background:T.surface,color:T.muted,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                  Or start from scratch →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT ── */}
        {tab==="edit" && (
          <div style={{ animation:"cvFadeUp 0.3s ease both" }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12 }}>
              <div>
                <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:4 }}>Step 2</p>
                <h2 style={{ fontSize:28,fontWeight:900,fontFamily:T.fontDisplay,color:T.text,letterSpacing:"-0.02em" }}>Edit Your CV</h2>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn variant="success" onClick={handleSaveToProfile} disabled={saving}>
                  {saving ? <><Spinner size={14} color="#fff" /> Saving…</> : "Save to Profile"}
                </Btn>
                <Btn variant="primary" onClick={()=>setTab("template")}>Preview Templates →</Btn>
              </div>
            </div>

            {saveMsg && (
              <div style={{ marginBottom:16, padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:500,
                background: saveMsg.startsWith("Error") ? "#2d0b0b" : "#052e16",
                color: saveMsg.startsWith("Error") ? "#f87171" : "#4ade80",
                border: `1px solid ${saveMsg.startsWith("Error") ? "#ef4444" : "#10b981"}60` }}>
                {saveMsg}
              </div>
            )}

            <SuggestionBanner suggestions={visibleSugg} enabled={enabledSections} onEnable={enableSection} onDismiss={dismissSugg} />

            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:28 }}>
              <CVEditor cv={cv} onChange={setCV} enabledSections={enabledSections} />
            </div>
          </div>
        )}

        {/* ── TEMPLATE ── */}
        {tab==="template" && (
          <div style={{ animation:"cvFadeUp 0.3s ease both" }}>
            <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12 }}>
              <div>
                <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:4 }}>Step 3</p>
                <h2 style={{ fontSize:28,fontWeight:900,fontFamily:T.fontDisplay,color:T.text,letterSpacing:"-0.02em" }}>Choose Template</h2>
              </div>
              <Btn variant="success" onClick={()=>setTab("export")}>Export PDF →</Btn>
            </div>
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24 }}>
              <TemplateSelector selected={template} onSelect={handleTemplateChange} cv={cv} accentColor={accentColor} onColorChange={setAccentColor} partitionColor={partitionColor} onPartitionColorChange={setPartitionColor} subscription={subscription} />
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {tab==="export" && (
          <div style={{ animation:"cvFadeUp 0.3s ease both" }}>
            <div style={{ marginBottom:22 }}>
              <p style={{ fontSize:10,fontWeight:800,color:T.accent,textTransform:"uppercase",letterSpacing:"0.22em",marginBottom:4 }}>Step 4</p>
              <h2 style={{ fontSize:28,fontWeight:900,fontFamily:T.fontDisplay,color:T.text,letterSpacing:"-0.02em" }}>Export as PDF</h2>
            </div>
            <div style={{ background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24 }}>
              <PDFExporter cv={cv} templateId={template} onSwitchTemplate={handleTemplateChange} accentColor={accentColor} onColorChange={setAccentColor} partitionColor={partitionColor} onPartitionColorChange={setPartitionColor} subscription={subscription} onShowUpgrade={() => setShowUpgradeModal(true)} />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }} onClick={() => setShowUpgradeModal(false)}>
          <div style={{ background:T.card, borderRadius:20, padding:"40px 32px", maxWidth:420, width:"90%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"#0097A7", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" style={{width:28,height:28}}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h3 style={{ fontSize:22, fontWeight:800, color:T.text, margin:"0 0 8px", fontFamily:T.fontDisplay }}>Upgrade to Export PDF</h3>
            <p style={{ fontSize:14, color:T.muted, margin:"0 0 24px", lineHeight:1.6 }}>
              PDF export is available on paid plans. Your CV has been saved — upgrade to download it as a professional PDF.
            </p>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ flex:1, padding:"12px 20px", borderRadius:12, border:`1px solid ${T.border}`, background:T.surface, color:T.text, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Maybe Later
              </button>
              <button onClick={() => { setShowUpgradeModal(false); window.location.hash = "#/dashboard/subscriptions"; window.location.href = "/dashboard/subscriptions"; }} style={{ flex:1, padding:"12px 20px", borderRadius:12, border:"none", background:"#0097A7", color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer" }}>
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}