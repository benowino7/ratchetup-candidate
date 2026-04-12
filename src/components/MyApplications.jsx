import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  MapPin,
  Building2,
  FileText,
  Calendar,
  DollarSign,
  Globe,
  Wifi,
  ExternalLink,
  Loader2,
  AlertCircle,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  RefreshCw,
  Star,
  UserCheck,
  Ban,
  Download,
  LogOut,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import CvPreviewModal from "./CvPreviewModal";
import ErrorMessage from "../utilities/ErrorMessage";
import { Pagination } from "./Pagination";
import Modal from "../allmodals/Modal";
import successMessage from "../utilities/successMessage";

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
  "Content-Type": "application/json",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "";
  return (
    new Date(iso).toDateString() + ", " + new Date(iso).toLocaleTimeString()
  );
};

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

const formatSalary = (min, max, currency) => {
  if (!min && !max) return null;
  const fmt = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
  return `${currency} ${fmt(min)} – ${fmt(max)}`;
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    icon: Clock,
    pill: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    dot: "bg-blue-500",
    leftBar: "bg-blue-400",
    statColor: "text-blue-600 dark:text-blue-400",
    canWithdraw: true,
  },
  REVIEWING: {
    label: "Reviewing",
    icon: RefreshCw,
    pill: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    dot: "bg-amber-500",
    leftBar: "bg-amber-400",
    statColor: "text-amber-600 dark:text-amber-400",
    canWithdraw: true,
  },
  SHORTLISTED: {
    label: "Shortlisted",
    icon: Star,
    pill: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
    dot: "bg-violet-500",
    leftBar: "bg-violet-400",
    statColor: "text-violet-600 dark:text-violet-400",
    canWithdraw: true,
  },
  HIRED: {
    label: "Hired",
    icon: UserCheck,
    pill: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    dot: "bg-green-500",
    leftBar: "bg-green-400",
    statColor: "text-green-600 dark:text-green-400",
    canWithdraw: false,
  },
  REJECTED: {
    label: "Rejected",
    icon: XCircle,
    pill: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    dot: "bg-red-400",
    leftBar: "bg-red-300",
    statColor: "text-red-500 dark:text-red-400",
    canWithdraw: false,
  },
  WITHDRAWN: {
    label: "Withdrawn",
    icon: Ban,
    pill: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    dot: "bg-gray-400",
    leftBar: "bg-gray-300 dark:bg-gray-600",
    statColor: "text-gray-500 dark:text-gray-400",
    canWithdraw: false,
  },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const getStatus = (s) =>
  STATUS_CONFIG[s] || {
    label: s,
    icon: Clock,
    pill: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
    leftBar: "bg-gray-300",
    statColor: "text-gray-500",
    canWithdraw: false,
  };

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchApplications = async (status, page = 1, limit = 20) => {
  const statusFilter2 = status !== "ALL" ? status : "";
  const res = await fetch(
    `${BASE_URL}/job-seeker/jobs/applications?status=${statusFilter2}&page=${page}&limit=${limit}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error("Failed to fetch applications");
  const json = await res.json();
  return json.message || {};
};

const withdrawApplication = async (jobApplicationId, note = "") => {
  const res = await fetch(
    `${BASE_URL}/job-seeker/jobs/${jobApplicationId}/withdraw`,
    {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ note }),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to withdraw application");
  }
  return res.json();
};

// ─── Withdraw Confirmation Modal ──────────────────────────────────────────────

const WithdrawModal = ({ app, onConfirm, onCancel, loading }) => {
  const [note, setNote] = useState("");

  return (
    <Modal
      isOpen={app}
      onClose={() => onCancel()}
      title={"Withdraw Application?"}
      subtitle={`This action cannot be undone`}
      size="lg"
    >
      <div className="px-6 py-5 space-y-4">
        {/* Application summary */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-theme_color" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {app.job.title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {app.job.company.name}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          You are about to withdraw your application. The employer will be
          notified and you will no longer be considered for this position.
        </p>

        {/* Optional note */}
        <div>
          <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Reason (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. I accepted another offer…"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-theme_color dark:focus:border-theme_color transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
          >
            Keep Application
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            {loading ? "Withdrawing…" : "Yes, Withdraw"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Detail row ───────────────────────────────────────────────────────────────

const DetailRow = ({ label, value, accent }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 w-28">
      {label}
    </span>
    <span
      className={`text-xs font-medium text-right ${
        accent ? "text-theme_color" : "text-gray-700 dark:text-gray-300"
      }`}
    >
      {value}
    </span>
  </div>
);

// ─── Application card ─────────────────────────────────────────────────────────

const ApplicationCard = ({ app, index, setCvPreview, onWithdraw }) => {
  const [expanded, setExpanded] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const cfg = getStatus(app.status);
  const salary = app.job.showSalary
    ? formatSalary(app.job.minSalary, app.job.maxSalary, app.job.currency)
    : null;

  const handleWithdrawConfirm = async (note) => {
    setWithdrawLoading(true);
    try {
      const data = await withdrawApplication(app.id, note);
      setShowWithdrawModal(false);
      onWithdraw(app.id);
      successMessage(data?.message || "Application withdrawn successfully");
    } catch (err) {
      ErrorMessage(err.message || "Failed to withdraw application");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex"
        style={{
          animation: "fadeSlideUp 0.4s ease both",
          animationDelay: `${index * 55}ms`,
        }}
      >
        {/* Left colour bar */}
        <div className={`w-1 flex-shrink-0 ${cfg.leftBar}`} />

        <div className="flex-1 min-w-0 p-5 space-y-4">
          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-theme_color" />
                </div>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                  {app.job.company.name}
                </span>
                {app.job.company.isVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                {app.job.title}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <StatusBadge status={app.status} />
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="w-3 h-3" />
                {timeAgo(app.createdAt)}
              </span>
              {/* Withdraw button — only for eligible statuses */}
              {cfg.canWithdraw && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400 hover:underline transition-colors mt-0.5"
                  title="Withdraw this application"
                >
                  <LogOut className="w-3 h-3" />
                  Withdraw
                </button>
              )}
            </div>
          </div>

          {/* ── Quick meta pills ── */}
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {app.job.locationName || "—"}
            </span>

            {app.job.isRemote && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Wifi className="w-3 h-3" /> Remote
              </span>
            )}

          </div>

          {/* ── Expanded details ── */}
          {expanded && (
            <div
              className="space-y-4"
              style={{ animation: "fadeSlideUp 0.2s ease both" }}
            >
              {/* Detail grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company info */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Company
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                    {app.job.company.name}
                  </p>
                  {app.job.company.address && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {app.job.company.address}
                    </p>
                  )}
                  {app.job.company.country && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">
                      {app.job.company.country}
                    </p>
                  )}
                  {app.job.company.website && (
                    <a
                      href={app.job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-theme_color hover:underline mt-2"
                    >
                      <Globe className="w-3 h-3" />
                      {app.job.company.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {/* Application info */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3.5">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Application Info
                  </p>
                  <DetailRow
                    label="Date Applied"
                    value={formatDate(app.createdAt)}
                  />
                  <DetailRow
                    label="Status"
                    value={getStatus(app.status).label}
                  />
                  {salary && (
                    <DetailRow label="Salary Range" value={salary} accent />
                  )}
                  <DetailRow
                    label="Work Mode"
                    value={app.job.isRemote ? "Remote" : "On-site"}
                  />
                </div>
              </div>

              {/* CV used */}
              <div className="flex items-center gap-2.5 p-3 bg-theme_color/5 dark:bg-theme_color/10 border border-theme_color/15 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-theme_color/15 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-theme_color" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-theme_color/70 uppercase tracking-widest mb-0.5">
                    Submitted CV
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {app.cv.fileName}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatBytes(app.cv.fileSize)}
                </span>
                <Download
                  onClick={() =>
                    setCvPreview({
                      open: true,
                      cvId: app.cv.id,
                      cvFileName: app.cv.fileName,
                    })
                  }
                  className="text-theme_color dark:text-dark-theme_color cursor-pointer w-[18px] h-[18px]"
                />
              </div>

              {/* Cover letter */}
              {app.coverLetter ? (
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Cover Letter
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                    {app.coverLetter}
                  </p>
                </div>
              ) : (
                <div className="px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No cover letter submitted
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Show more / less toggle ── */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-theme_color pt-1 border-t border-gray-100 dark:border-gray-800 w-full"
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border border-theme_color flex items-center justify-center transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <svg viewBox="0 0 10 10" className="w-2 h-2 fill-theme_color">
                <path
                  d="M1 3l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          app={app}
          onConfirm={handleWithdrawConfirm}
          onCancel={() => setShowWithdrawModal(false)}
          loading={withdrawLoading}
        />
      )}
    </>
  );
};

// ─── Stats bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ applications }) => {
  const byStatus = useMemo(
    () =>
      applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
    [applications],
  );

  const cards = [
    {
      label: "Total",
      value: applications.length,
      color: "text-gray-900 dark:text-white",
    },
    {
      label: "Submitted",
      value: byStatus.SUBMITTED || 0,
      color: STATUS_CONFIG.SUBMITTED.statColor,
    },
    {
      label: "Reviewing",
      value: byStatus.REVIEWING || 0,
      color: STATUS_CONFIG.REVIEWING.statColor,
    },
    {
      label: "Shortlisted",
      value: byStatus.SHORTLISTED || 0,
      color: STATUS_CONFIG.SHORTLISTED.statColor,
    },
    {
      label: "Hired",
      value: byStatus.HIRED || 0,
      color: STATUS_CONFIG.HIRED.statColor,
    },
    {
      label: "Rejected",
      value: byStatus.REJECTED || 0,
      color: STATUS_CONFIG.REJECTED.statColor,
    },
  ];

  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8"
      style={{
        animation: "fadeSlideUp 0.4s ease both",
        animationDelay: "60ms",
      }}
    >
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-900 rounded-xl p-3.5 border border-gray-100 dark:border-gray-800 text-center"
        >
          <p className={`text-2xl font-black ${color} leading-none mb-1`}>
            {value}
          </p>
          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ filtered }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-20 h-20 rounded-3xl bg-theme_color/10 flex items-center justify-center mb-5">
      <Briefcase className="w-9 h-9 text-theme_color/50" />
    </div>
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
      {filtered ? "No matching applications" : "No applications yet"}
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
      {filtered
        ? "Try adjusting your search or filters."
        : "Start applying to jobs and track your progress right here."}
    </p>
  </div>
);
// ─── Main page ────────────────────────────────────────────────────────────────

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [cvPreview, setCvPreview] = useState({
    open: false,
    cvId: null,
    cvFileName: null,
  });
  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchApplications(
          statusFilter,
          page,
          pagination.limit,
        );
        setApplications(data?.applications || []);
        if (data?.pagination) setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, statusFilter],
  );

  useEffect(() => {
    load(1);
  }, [reload, statusFilter, pagination.limit]);

  const handlePageChange = (newPage) => {
    setPagination((p) => ({ ...p, page: newPage }));
    load(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Optimistically update a withdrawn application in local state
  const handleWithdrawn = useCallback((applicationId) => {
    setReload((prev) => !prev);
  }, []);

  const byStatus = useMemo(
    () =>
      applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {}),
    [applications],
  );

  const filtered = useMemo(() => {
    let list = [...applications];

    if (statusFilter !== "ALL")
      list = list.filter((a) => a.status === statusFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.job.title.toLowerCase().includes(q) ||
          a.job.company.name.toLowerCase().includes(q) ||
          (a.job.locationName || "").toLowerCase().includes(q) ||
          a.cv.fileName.toLowerCase().includes(q) ||
          (a.coverLetter || "").toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "title") return a.job.title.localeCompare(b.job.title);
      if (sortBy === "company")
        return a.job.company.name.localeCompare(b.job.company.name);
      return 0;
    });

    return list;
  }, [applications, search, statusFilter, sortBy]);

  const isFiltered = search.trim() || statusFilter !== "ALL";

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full h-full">
        <div className="max-w-[95rem] mx-auto px-4 py-4">
          {/* ── Header ── */}
          <div
            className="mb-4 flex items-end justify-between flex-wrap gap-4"
            style={{ animation: "fadeSlideUp 0.35s ease both" }}
          >
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-none tracking-tight">
                My Applications
              </h1>
            </div>
            <button
              onClick={() => load(pagination.page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* ── Stats ── */}
          {!loading && !error && applications.length > 0 && (
            <StatsBar applications={applications} />
          )}

          {/* ── Search + filter bar ── */}
          <div
            className="mb-6 space-y-3"
            style={{
              animation: "fadeSlideUp 0.4s ease both",
              animationDelay: "80ms",
            }}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, company, location, CV or cover letter…"
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-theme_color dark:focus:border-theme_color transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl border transition-colors ${
                  showFilters || statusFilter !== "ALL" || sortBy !== "newest"
                    ? "bg-theme_color text-white border-theme_color"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4"
                style={{ animation: "fadeSlideUp 0.2s ease both" }}
              >
                {/* Status */}
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setStatusFilter("ALL")}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                        statusFilter === "ALL"
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent"
                          : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      All ({applications.length})
                    </button>
                    {ALL_STATUSES.map((s) => {
                      const count = byStatus[s] || 0;
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                            statusFilter === s
                              ? cfg.pill
                              : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {cfg.label} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Sort by
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "newest", l: "Newest first" },
                      { v: "oldest", l: "Oldest first" },
                      { v: "title", l: "Job title A–Z" },
                      { v: "company", l: "Company A–Z" },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setSortBy(v)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                          sortBy === v
                            ? "bg-theme_color text-white border-theme_color"
                            : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active chips */}
            {isFiltered && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Active:</span>
                {statusFilter !== "ALL" && (
                  <button
                    onClick={() => setStatusFilter("ALL")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-theme_color/10 text-theme_color text-xs font-medium rounded-full"
                  >
                    {getStatus(statusFilter).label}
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="flex items-center gap-1 px-2.5 py-1 bg-theme_color/10 text-theme_color text-xs font-medium rounded-full"
                  >
                    "{search}"
                    <XCircle className="w-3 h-3" />
                  </button>
                )}
                <span className="text-xs text-gray-400">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-2xl bg-theme_color/10 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-theme_color animate-spin" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Fetching your applications…
              </p>
            </div>
          )}

          {/* ── Error ── */}
          {error && !loading && (
            <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  Something went wrong
                </p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  {error}
                </p>
              </div>
              <button
                onClick={() => load(pagination.page)}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Cards ── */}
          {!loading && !error && (
            <>
              {filtered.length === 0 ? (
                <EmptyState filtered={!!isFiltered} />
              ) : (
                <div className="space-y-4">
                  {filtered.map((app, i) => (
                    <ApplicationCard
                      key={app.id}
                      app={app}
                      index={i}
                      setCvPreview={setCvPreview}
                      onWithdraw={handleWithdrawn}
                    />
                  ))}
                </div>
              )}

              {/* ── Pagination ── */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPageChange={handlePageChange}
                    onLimitChange={(l) => {
                      setPagination((prev) => ({ ...prev, limit: l, page: 1 }));
                    }}
                  />
                </div>
              )}

              {filtered.length > 0 && pagination.totalPages <= 1 && (
                <p className="text-center text-xs text-gray-300 dark:text-gray-700 mt-8 pb-2">
                  {filtered.length} of {applications.length} application
                  {applications.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}

          {cvPreview?.open && (
            <CvPreviewModal
              isOpen={cvPreview.open}
              onClose={() =>
                setCvPreview({ open: false, cvId: null, cvFileName: null })
              }
              cvId={cvPreview.cvId}
              cvFileName={cvPreview.cvFileName}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default MyApplications;
