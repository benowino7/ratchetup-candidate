import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../allmodals/Modal";
import {
  Bookmark,
  Sparkles,
  Tag,
  FileText,
  CheckCircle,
  Loader2,
} from "lucide-react";
import ErrorMessage from "../utilities/ErrorMessage";
import successMessage from "../utilities/successMessage";
import { BASE_URL } from "../BaseUrl";

const NOTE_SUGGESTIONS = [
  { label: "Save for later", value: "Saved for later" },
  {
    label: "Strong match",
    value: "This looks like a strong match for my skills",
  },
  { label: "Research needed", value: "Need to research the company more" },
  { label: "Apply soon", value: "Want to apply before deadline" },
];

function SaveJob({ open, onClose, jobId, jobTitle, companyName }) {
  const navigate = useNavigate();
  const [note, setNote] = useState("Saved for later");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/job-seeker/jobs/${jobId}/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        if (data?.result?.requiresUpgrade) {
          onClose();
          navigate("/dashboard/subscriptions");
          return;
        }
        ErrorMessage(data?.message || "Failed to save job");
        return;
      }
      successMessage(data?.message || "Job Saved successfully");
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNote("Saved for later");
    setError(null);
    setSaved(false);
    onClose();
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title="Save Job"
      subtitle=""
      size="xl"
    >
      <div className="px-1 pb-2 space-y-5">
        {/* Job preview card */}
        {(jobTitle || companyName) && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/40">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
              <Bookmark size={18} className="text-teal-500" />
            </div>
            <div className="min-w-0">
              {jobTitle && (
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {jobTitle}
                </p>
              )}
              {companyName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {companyName}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Note section */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileText size={14} />
            Add a personal note
            <span className="text-xs text-gray-400 font-normal ml-1">
              (optional)
            </span>
          </label>

          {/* Quick suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {NOTE_SUGGESTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setNote(s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                  ${
                    note === s.value
                      ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400"
                  }`}
              >
                <Tag size={10} />
                {s.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Write your own note about this job..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
          />
          <p className="text-right text-xs text-gray-400">{note.length}/300</p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || saved}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm
              ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-teal-500 hover:bg-teal-600 text-white disabled:opacity-60"
              }`}
          >
            {saved ? (
              <>
                <CheckCircle size={16} />
                Saved!
              </>
            ) : loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Save Job
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SaveJob;
