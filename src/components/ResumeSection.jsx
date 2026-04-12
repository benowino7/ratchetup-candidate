import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  XCircle,
  Star,
  StarOff,
  FileText,
  Loader2,
  Plus,
  Search,
  ChevronDown,
  Eye,
  X,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import ErrorMessage from "../utilities/ErrorMessage";
import successMessage from "../utilities/successMessage";
import Modal from "../allmodals/Modal";

const getToken = () => {
  try {
    const t = JSON.parse(sessionStorage.getItem("accessToken") || "{}");
    return t;
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return (
    new Date(iso).toDateString() + ", " + new Date(iso).toLocaleTimeString()
  );
};

// ─── API calls ───────────────────────────────────────────────────────────────

const api = {
  list: async () => {
    const res = await fetch(`${BASE_URL}/job-seeker/cvs`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch CVs");
    const json = await res.json();
    return json.data;
  },

  listIndustries: async () => {
    const res = await fetch(`${BASE_URL}/public/industries/taxonomy`);
    if (!res.ok) throw new Error("Failed to fetch industries");
    const json = await res.json();
    const items = [];
    for (const group of json.result || []) {
      for (const ind of group.industries || []) {
        items.push({ id: ind.id, name: ind.name });
      }
    }
    items.sort((a, b) => a.name.localeCompare(b.name));
    return items;
  },

  upload: async ({ file, industryId, notes, makePrimary }) => {
    const form = new FormData();
    form.append("file", file);
    if (industryId) form.append("industryId", industryId);
    if (notes) form.append("notes", notes);
    form.append("makePrimary", String(makePrimary));

    const res = await fetch(`${BASE_URL}/job-seeker/cv`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "Upload failed");
      return;
    }
    successMessage(data?.message || "CV uploaded successfully");
    return data?.data;
  },

  update: async (id, { notes, makePrimary, industryId }) => {
    const form = new FormData();
    if (notes !== undefined) form.append("notes", notes);
    if (makePrimary !== undefined)
      form.append("makePrimary", String(makePrimary));
    if (industryId !== undefined) form.append("industryId", industryId);

    const res = await fetch(`${BASE_URL}/job-seeker/cvs/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: form,
    });
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "CV Update failed");
      return;
    }
    successMessage(data?.message || "CV updated successfully");
    return data?.data;
  },

  remove: async (id) => {
    const res = await fetch(`${BASE_URL}/job-seeker/cvs/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "CV delete operation failed");
      return;
    }
    successMessage(data?.message || "CV deleted successfully");
  },

  download: async (cv) => {
    const res = await fetch(`${BASE_URL}${cv.url}`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = cv.fileName;
    a.click();
    URL.revokeObjectURL(href);
  },

  extractAndFill: async (cvId) => {
    const res = await fetch(`${BASE_URL}/job-seeker/cv/extract-and-fill`, {
      method: "POST",
      headers: {
        ...authHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cvId }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.message || "Extraction failed");
    }
    return data?.data;
  },
};

// ─── Searchable Industry Select ──────────────────────────────────────────────

const IndustrySelect = ({ value, onChange, industries, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = industries.find((i) => i.id === value);

  const filtered = industries.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-left transition-colors focus:outline-none focus:border-theme_color dark:focus:border-dark-theme_color"
      >
        <span
          className={
            selected
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {loading
            ? "Loading industries…"
            : selected
              ? selected.name
              : "Select an industry (optional)"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search industries…"
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {/* Clear option */}
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                  setSearch("");
                }}
                className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 italic flex items-center gap-2"
              >
                <XCircle className="w-3.5 h-3.5" /> Clear selection
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-400 text-center">
                No industries found
              </p>
            ) : (
              filtered.map((industry) => (
                <button
                  type="button"
                  key={industry.id}
                  onClick={() => {
                    onChange(industry.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2.5 text-sm text-left transition-colors flex items-center justify-between group ${
                    value === industry.id
                      ? "bg-theme_color/10 text-theme_color dark:text-theme_color font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span>{industry.name}</span>
                  {industry.skills?.length > 0 && (
                    <span className="text-xs text-gray-400 group-hover:text-gray-500">
                      {industry.skills.length} skill
                      {industry.skills.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CV Preview Modal ─────────────────────────────────────────────────────────

const CVPreviewModal = ({
  file,
  notes,
  industry,
  makePrimary,
  onConfirm,
  onCancel,
  uploading,
  showPreview,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const isPDF = file?.type === "application/pdf";

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Modal
      isOpen={showPreview}
      onClose={onCancel}
      title={"Preview & Confirm Upload"}
      subtitle="Review before submitting"
      size="xl"
    >
      {/* Preview area */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-800/50 min-h-0">
        {isPDF && previewUrl ? (
          <iframe
            src={previewUrl}
            title="CV Preview"
            className="w-full h-full border-0"
            style={{ minHeight: "400px" }}
          />
        ) : previewUrl && file?.type?.startsWith("image/") ? (
          <div className="flex items-center justify-center h-full p-4">
            <img
              src={previewUrl}
              alt="CV preview"
              className="max-h-full max-w-full object-contain rounded-lg shadow"
            />
          </div>
        ) : (
          // DOC/DOCX - no native preview
          <div className="flex flex-col items-center justify-center h-full py-16 gap-4">
            <div className="w-20 h-20 bg-theme_color/10 rounded-2xl flex items-center justify-center">
              <FileText className="w-10 h-10 text-theme_color" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-800 dark:text-white text-sm">
                {file?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatBytes(file?.size)} · Preview not available for Word
                documents
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details summary */}
      <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              File
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file?.name}
            </p>
            <p className="text-xs text-gray-500">{formatBytes(file?.size)}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
              Industry
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {industry?.name || (
                <span className="text-gray-400 font-normal">Not specified</span>
              )}
            </p>
          </div>
          {notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Notes
              </p>
              <p className="text-sm text-gray-900 dark:text-white italic">
                "{notes}"
              </p>
            </div>
          )}
        </div>

        {makePrimary && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-theme_color/5 border border-theme_color/20 rounded-lg">
            <Star className="w-4 h-4 text-theme_color flex-shrink-0" />
            <p className="text-xs text-theme_color font-medium">
              This CV will be set as your Primary CV
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={uploading}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={uploading}
            className="px-5 py-2 bg-theme_color text-white text-sm font-medium rounded-lg hover:bg-theme_color/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Uploading…" : "Confirm & Upload"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Upload form ──────────────────────────────────────────────────────────────

const UploadForm = ({
  onUploaded,
  onCancel,
  industries,
  industriesLoading,
}) => {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [makePrimary, setMakePrimary] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const selectedIndustry = industries.find((i) => i.id === industryId);

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handlePreview = () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }
    setError("");
    setShowPreview(true);
  };

  const handleConfirmUpload = async () => {
    setUploading(true);
    try {
      const created = await api.upload({
        file,
        industryId,
        notes,
        makePrimary,
      });
      onUploaded(created);
      setShowPreview(false);
    } catch (err) {
      setError(err.message);
      setShowPreview(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-gray-50 dark:bg-gray-800/40 space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-theme_color/40 hover:border-theme_color rounded-xl p-8 text-center cursor-pointer transition-colors bg-white dark:bg-gray-800"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-theme_color" />
              <p className="font-medium text-gray-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-sm text-gray-500">{formatBytes(file.size)}</p>
              <span className="text-xs text-theme_color underline underline-offset-2">
                Click to change file
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-theme_color/50" />
              <p className="font-medium text-gray-700 dark:text-gray-300">
                Drag & drop or click to browse
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, or DOCX · max 10 MB
              </p>
            </div>
          )}
        </div>

        {/* Industry select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Industry <span className="text-gray-400">(optional)</span>
          </label>
          <IndustrySelect
            value={industryId}
            onChange={setIndustryId}
            industries={industries}
            loading={industriesLoading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. CV for Software Engineering"
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-theme_color dark:focus:border-dark-theme_color"
          />
        </div>

        {/* Make primary */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={makePrimary}
            onChange={(e) => setMakePrimary(e.target.checked)}
            className="w-4 h-4 text-theme_color rounded focus:ring-theme_color accent-theme_color dark:accent-dark-theme_color"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Set as primary CV
          </span>
        </label>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={handlePreview}
            disabled={!file}
            className="px-5 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview & Upload
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <CVPreviewModal
          file={file}
          notes={notes}
          industry={selectedIndustry}
          makePrimary={makePrimary}
          uploading={uploading}
          onConfirm={handleConfirmUpload}
          onCancel={() => setShowPreview(false)}
          showPreview={showPreview}
        />
      )}
    </>
  );
};

// ─── Inline edit form (notes + industry) ─────────────────────────────────────

const EditCVForm = ({ cv, industries, onSaved, onCancel }) => {
  const [notes, setNotes] = useState(cv.notes || "");
  const [industryId, setIndustryId] = useState(
    cv.industryId || cv.industry?.id || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const updated = await api.update(cv.id, { notes, industryId });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 space-y-3">
      {/* Industry select */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Industry
        </label>
        <IndustrySelect
          value={industryId}
          onChange={setIndustryId}
          industries={industries}
          loading={false}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes about this CV…"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-theme_color"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
        >
          <XCircle className="w-3 h-3" /> Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-3 py-1.5 text-xs bg-theme_color text-white rounded-lg hover:bg-theme_color/90 disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
          Save changes
        </button>
      </div>
    </div>
  );
};

// ─── Extraction Preview ──────────────────────────────────────────────────────

const ExtractionPreview = ({ data, onClose }) => {
  if (!data) return null;

  const {
    personalInfo,
    experience = [],
    education = [],
    skills = [],
    languages = [],
    awards = [],
    interests = [],
    summary,
    profileUpdated,
    skillsAdded,
  } = data;

  return (
    <div className="mt-3 border border-theme_color/30 bg-theme_color/5 dark:bg-theme_color/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-theme_color/10 dark:bg-theme_color/20 border-b border-theme_color/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-theme_color" />
          <span className="text-sm font-semibold text-theme_color">
            Extracted Profile Data
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Success banner */}
        {(profileUpdated || skillsAdded > 0) && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-300 font-medium">
              {profileUpdated && "Profile updated. "}
              {skillsAdded > 0 &&
                `${skillsAdded} skill${skillsAdded !== 1 ? "s" : ""} added to your profile.`}
            </p>
          </div>
        )}

        {/* Personal Info */}
        {personalInfo && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Personal Info
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {personalInfo.name && (
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">Name</p>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {personalInfo.name}
                  </p>
                </div>
              )}
              {personalInfo.email && (
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {personalInfo.email}
                  </p>
                </div>
              )}
              {personalInfo.phone && (
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {personalInfo.phone}
                  </p>
                </div>
              )}
              {personalInfo.location && (
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">
                    Location
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {personalInfo.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">
              Summary
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg leading-relaxed">
              {summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Experience ({experience.length})
              </h4>
            </div>
            <div className="space-y-2">
              {experience.map((exp, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {exp.title || exp.jobTitle}
                  </p>
                  <p className="text-xs text-theme_color">
                    {exp.company}
                    {exp.duration || exp.period
                      ? ` · ${exp.duration || exp.period}`
                      : ""}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Education ({education.length})
              </h4>
            </div>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {edu.degree || edu.qualification}
                  </p>
                  <p className="text-xs text-theme_color">
                    {edu.institution || edu.school}
                    {edu.year || edu.period
                      ? ` · ${edu.year || edu.period}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Wrench className="w-3.5 h-3.5 text-gray-500" />
              <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Skills ({skills.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {typeof skill === "string" ? skill : skill.name || skill.skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Languages ({languages.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 rounded-full"
                >
                  {typeof lang === "string" ? lang : lang.name}
                  {lang.proficiency && ` (${lang.proficiency})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Awards ({awards.length})
            </h4>
            <div className="space-y-1.5">
              {awards.map((award, i) => (
                <div key={i} className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof award === "string" ? award : award.title}
                  </p>
                  {award.issuer && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{award.issuer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
              Interests ({interests.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full"
                >
                  {typeof interest === "string" ? interest : interest.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Single CV card ───────────────────────────────────────────────────────────

const CVCard = ({ cv, onDeleted, onUpdated, industries }) => {
  const [editing, setEditing] = useState(false);
  const [makingPrimary, setMakingPrimary] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async () => {
    setExtracting(true);
    try {
      const data = await api.extractAndFill(cv.id);
      setExtractedData(data);
      successMessage("CV data extracted and profile updated!");
    } catch (err) {
      ErrorMessage(err.message || "Failed to extract CV data");
    } finally {
      setExtracting(false);
    }
  };

  const handleMakePrimary = async () => {
    setMakingPrimary(true);
    try {
      const updated = await api.update(cv.id, { makePrimary: true });
      onUpdated(updated);
    } catch {
      // silently fail
    } finally {
      setMakingPrimary(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.remove(cv.id);
      onDeleted(cv.id);
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.download(cv);
    } catch {
      // silently fail
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        cv.isPrimary
          ? "border-theme_color/40 bg-theme_color/5 dark:bg-theme_color/10"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${cv.isPrimary ? "bg-theme_color/20" : "bg-gray-100 dark:bg-gray-700"}`}
        >
          <FileText
            className={`w-6 h-6 ${cv.isPrimary ? "text-theme_color" : "text-gray-500 dark:text-gray-400"}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900 dark:text-white truncate text-sm">
              {cv.fileName}
            </p>
            {cv.isPrimary && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-theme_color text-white text-xs rounded-full font-medium flex-shrink-0">
                <Star className="w-3 h-3" /> Primary
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            {cv.fileSize && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatBytes(cv.fileSize)}
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Uploaded {formatDate(cv.createdAt)}
            </span>
            {(cv.industry?.name || cv.industryName) && (
              <span className="text-xs text-theme_color font-medium bg-theme_color/10 px-1.5 py-0.5 rounded-md">
                {cv.industry?.name || cv.industryName}
              </span>
            )}
          </div>

          {cv.notes && !editing && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
              "{cv.notes}"
            </p>
          )}

          {editing && (
            <EditCVForm
              cv={cv}
              industries={industries}
              onSaved={(updated) => {
                onUpdated(updated);
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          )}

          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">
              AI parsed · ready for matching
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download"
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setEditing(!editing)}
            title="Edit notes & industry"
            className="p-1.5 text-theme_color hover:bg-theme_color/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {!cv.isPrimary && (
            <button
              onClick={handleMakePrimary}
              disabled={makingPrimary}
              title="Set as primary"
              className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
            >
              {makingPrimary ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <StarOff className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            title="Delete"
            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleExtract}
            disabled={extracting}
            title="Extract & fill profile from this CV"
            className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
          >
            {extracting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Extract & Fill button (full-width below card info) */}
      {!extractedData && !extracting && (
        <div className="mt-3">
          <button
            onClick={handleExtract}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Extract & Fill Profile
          </button>
        </div>
      )}

      {/* Extracting spinner */}
      {extracting && (
        <div className="mt-3 flex items-center justify-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Extracting data from your CV...
          </span>
        </div>
      )}

      {/* Extraction preview */}
      {extractedData && (
        <ExtractionPreview
          data={extractedData}
          onClose={() => setExtractedData(null)}
        />
      )}

      {confirmDelete && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 dark:text-red-300">
            Delete this CV? This cannot be undone.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main ResumeSection ───────────────────────────────────────────────────────

const ResumeSection = () => {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [reloadCV, setReloadCv] = useState(false);

  // Industries state
  const [industries, setIndustries] = useState([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);

  const fetchCVs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.list();
      setCvs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchIndustries = async () => {
    setIndustriesLoading(true);
    try {
      const data = await api.listIndustries();
      setIndustries(data || []);
    } catch {
      // non-fatal – select will just show empty
    } finally {
      setIndustriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
    fetchIndustries();
  }, [reloadCV]);

  const handleUploaded = () => {
    setReloadCv((prev) => !prev);
    setShowUpload(false);
  };

  const handleUpdated = () => {
    setReloadCv((prev) => !prev);
  };

  const handleDeleted = () => {
    setReloadCv((prev) => !prev);
  };

  const sorted = [...cvs].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
  );

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {cvs.length > 0
            ? `${cvs.length} CV${cvs.length > 1 ? "s" : ""} uploaded`
            : "No CVs uploaded yet"}
        </p>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-theme_color text-white text-sm font-medium rounded-lg hover:bg-theme_color/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload CV
        </button>
      </div>

      {/* Upload form */}
      {showUpload && (
        <UploadForm
          onUploaded={handleUploaded}
          onCancel={() => setShowUpload(false)}
          industries={industries}
          industriesLoading={industriesLoading}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-theme_color" />
          <span className="text-sm">Loading CVs…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={fetchCVs}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* CV list */}
      {!loading && !error && sorted.length > 0 && (
        <div className="space-y-3">
          {sorted.map((cv) => (
            <CVCard
              key={cv.id}
              cv={cv}
              onDeleted={handleDeleted}
              onUpdated={handleUpdated}
              industries={industries}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && sorted.length === 0 && !showUpload && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center bg-gray-50 dark:bg-gray-800/30">
          <div className="w-16 h-16 bg-theme_color/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-theme_color" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Upload your CV / Resume
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            Help employers find you faster
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
            PDF, DOC, or DOCX · max 10 MB
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-2.5 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors font-medium text-sm"
          >
            Choose File
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Your CV will be parsed by AI to improve job matching
          </p>
        </div>
      )}

      {/* Tip */}
      {!loading && sorted.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> Mark your most relevant CV as <em>Primary</em>{" "}
            - it's the one employers and AI matching will use first.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeSection;
