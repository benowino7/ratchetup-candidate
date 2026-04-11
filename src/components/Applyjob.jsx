import React, { useState, useEffect } from "react";
import {
  FileText,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  ChevronRight,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import ErrorMessage from "../utilities/ErrorMessage";
import successMessage from "../utilities/successMessage";
import { useLocation, useNavigate } from "react-router-dom";

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

// ─── API ──────────────────────────────────────────────────────────────────────

const api = {
  listCVs: async () => {
    const res = await fetch(`${BASE_URL}/job-seeker/cvs`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch CVs");
    const json = await res.json();
    return json.data || [];
  },

  apply: async (jobId, { cvId, coverLetter }) => {
    const body = { cvId };
    if (coverLetter?.trim()) body.coverLetter = coverLetter.trim();

    const res = await fetch(`${BASE_URL}/job-seeker/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "Application failed");
      return null;
    }
    successMessage(data?.message || "Application submitted successfully!");
    return data?.data;
  },
};

// ─── CV Card ──────────────────────────────────────────────────────────────────

const CVCard = ({ cv, selected, onSelect }) => {
  const isSelected = selected?.id === cv.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(cv)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-150 ${
        isSelected
          ? "border-theme_color bg-theme_color/5 dark:bg-theme_color/10"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isSelected ? "bg-theme_color/20" : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          <FileText
            className={`w-5 h-5 ${
              isSelected
                ? "text-theme_color"
                : "text-gray-500 dark:text-gray-400"
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-medium text-sm truncate ${
                isSelected
                  ? "text-theme_color"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {cv.fileName}
            </p>
            {cv.isPrimary && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-theme_color text-white text-xs rounded-full font-medium flex-shrink-0">
                <Star className="w-2.5 h-2.5" /> Primary
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
            {cv.industry?.name && (
              <span className="text-xs text-theme_color bg-theme_color/10 px-1.5 py-0.5 rounded-md font-medium">
                {cv.industry.name}
              </span>
            )}
            {cv.fileSize && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatBytes(cv.fileSize)}
              </span>
            )}
          </div>

          {cv.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic truncate">
              "{cv.notes}"
            </p>
          )}
        </div>

        {/* Selection indicator */}
        <div className="flex-shrink-0 mt-0.5">
          {isSelected ? (
            <CheckCircle className="w-5 h-5 text-theme_color" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600" />
          )}
        </div>
      </div>
    </button>
  );
};

// ─── Main ApplyJob ────────────────────────────────────────────────────────────

const ApplyJob = ({ jobId, jobTitle, companyName, onCancel }) => {
    const navigation = useNavigate()
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCV, setSelectedCV] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await api.listCVs();
        setCvs(data);
        // Default to primary CV
        const primary = data.find((cv) => cv.isPrimary) || data[0] || null;
        setSelectedCV(primary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async () => {
    if (!selectedCV) return;
    setSubmitting(true);
    try {
      const result = await api.apply(jobId, {
        cvId: selectedCV.id,
        coverLetter,
      });
      if (result !== null) {
        navigation("/dashboard/applications");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const charCount = coverLetter.length;
  const MAX_CHARS = 1000;

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* CV Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Select a CV
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Your primary CV is selected by default
              </p>
            </div>
            {cvs.length > 0 && (
              <span className="text-xs text-gray-400">
                {cvs.length} CV{cvs.length !== 1 ? "s" : ""} available
              </span>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-10 gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-theme_color" />
              <span className="text-sm">Loading your CVs…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* No CVs */}
          {!loading && !error && cvs.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/30">
              <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No CVs uploaded yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a CV from your profile before applying
              </p>
            </div>
          )}

          {/* CV list */}
          {!loading && !error && cvs.length > 0 && (
            <div className="space-y-2.5">
              {/* Sort: primary first */}
              {[...cvs]
                .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                .map((cv) => (
                  <CVCard
                    key={cv.id}
                    cv={cv}
                    selected={selectedCV}
                    onSelect={setSelectedCV}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Cover Letter{" "}
                <span className="font-normal text-gray-400">(optional)</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                A personalised message can increase your chances
              </p>
            </div>
            <span
              className={`text-xs font-medium tabular-nums ${
                charCount > MAX_CHARS
                  ? "text-red-500"
                  : charCount > MAX_CHARS * 0.85
                    ? "text-yellow-500"
                    : "text-gray-400"
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <textarea
            value={coverLetter}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS)
                setCoverLetter(e.target.value);
            }}
            rows={5}
            placeholder={`Hi, I'm excited to apply for the ${jobTitle || "role"} position. I believe my experience and skills make me a great fit because…`}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none focus:border-theme_color dark:focus:border-theme_color transition-colors leading-relaxed"
          />
        </div>

        {/* Selected CV summary */}
        {selectedCV && !loading && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-xs text-green-700 dark:text-green-300">
              Applying with{" "}
              <span className="font-semibold">{selectedCV.fileName}</span>
              {selectedCV.isPrimary && " (Primary)"}
            </p>
          </div>
        )}
      </div>
      {/* Footer actions — sticky */}
      <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !selectedCV || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-theme_color text-white text-sm font-semibold rounded-xl hover:bg-theme_color/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ApplyJob;
