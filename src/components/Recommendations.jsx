import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
  Star,
  Sparkles,
  LayoutGrid,
  LayoutList,
  Loader,
  Lock,
  ExternalLink,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import Modal from "../allmodals/Modal";
import ApplyJob from "./Applyjob";
import SaveJob from "./SaveJob";
import { Link } from "react-router-dom";

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────
const getMatchStyle = (score) => ({
  bg: "bg-theme_color/80 dark:bg-theme_color/20",
  text: "text-theme_color dark:text-theme_color",
  border: "border-theme_color/70 dark:border-theme_color/60",
  icon: "text-theme_color dark:text-theme_color",
});

const getRelativeTime = (dateStr) => {
  const diffDays = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

/**
 * Computes a match percentage from the backend recommendation.
 * Uses the composite AI score (skills + keywords + title + industry + recency)
 * and normalizes it to 0-100%.
 */
const computeMatchScore = (jobSkills, matchedSkills, recommendation) => {
  // Use the backend's composite score if available
  if (recommendation?.score != null && recommendation.score > 0) {
    // The backend score is a composite: each skill match = 10pts, keyword = 2-4pts,
    // AI title = 8pts, industry = 5pts, inferred skill = 4pts, recency up to 8pts.
    // A strong match typically scores 30-80+. Normalize to 0-100% with a cap.
    const rawScore = recommendation.score;
    // Use logarithmic-ish scaling: 10pts = ~40%, 20pts = ~55%, 40pts = ~75%, 60pts = ~85%, 80+ = ~95%
    const percentage = Math.min(99, Math.round(30 + (70 * (1 - Math.exp(-rawScore / 40)))));
    return Math.max(percentage, 1);
  }
  // Fallback: compute from matched skills if no backend score
  if (!jobSkills?.length) return 0;
  const matched = matchedSkills?.map((s) => s.toLowerCase()) ?? [];
  const hits = jobSkills.filter((s) =>
    matched.includes(s.skill.name.toLowerCase()),
  ).length;
  return Math.round((hits / jobSkills.length) * 100);
};

// ────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────
function RecommendedJobs({ isAiSubscribed2 }) {
  const [jobs, setJobs] = useState([]);
  const [isAiSubscribed, setIsAiSubscribed] = useState(isAiSubscribed2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToBeSaved, setJobToBeSaved] = useState(null);
  const [layout, setLayout] = useState(
    () => localStorage.getItem("recommendedJobsLayout") || "modern-grid",
  );
  const [sortBy, setSortBy] = useState("bestMatch");

  const [filters, setFilters] = useState({
    minMatchScore: 0,
    location: "",
    jobType: [],
    industry: [],
    experienceLevel: [],
    salaryMin: "",
    salaryMax: "",
    postedWithin: "",
  });

  const [savedJobs, setSavedJobs] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(9);
  const loadMoreRef = useRef(null);

  // ─── FETCH JOBS ───
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use different endpoint based on subscription status
        const endpoint = isAiSubscribed
          ? `${BASE_URL}/job-seeker/jobs/suggestions`
          : `${BASE_URL}/public/jobs`;

        const token = JSON.parse(sessionStorage.getItem("accessToken") || "null");

        const headers = { "Content-Type": "application/json" };
        if (isAiSubscribed && token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(endpoint, { headers });

        if (!response.ok) throw new Error("Failed to fetch jobs");

        const result = await response.json();

        // Support both response shapes:
        //   AI endpoint  → result.message.jobs  (per the sample JSON)
        //   Public endpoint → result.data
        const rawJobs = result.message?.jobs ?? result.data ?? [];

        const transformedJobs = rawJobs.map((job) => {
          const companyName = job.company?.name || "Unknown";
          const logoAbbr = companyName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);

          // AI match data — only meaningful when subscribed
          const recommendation = job.recommendation ?? null;
          const aiMatchScore =
            isAiSubscribed && recommendation
              ? computeMatchScore(job.skills, recommendation.matchedSkills, recommendation)
              : null;

          const matchedSkillNames =
            isAiSubscribed && recommendation
              ? recommendation.matchedSkills // already plain strings from API
              : job.skills.map((s) => s.skill.name);

          return {
            id: job.id,
            title: job.title,
            company: {
              name: companyName,
              logo: logoAbbr,
              rating: "4.2",
            },
            location: job.locationName || "Remote",
            jobType: job.employmentType,
            industry: job.industries?.[0]?.industry?.name ?? "General",
            experienceLevel: job.experienceLevel,
            salary: {
              min: job.minSalary,
              max: job.maxSalary,
              currency: job.currency,
            },
            aiMatchScore, // null when not subscribed
            matchedSkills: matchedSkillNames,
            allSkills: job.skills.map((s) => s.skill.name),
            postedAt: job.publishedAt || job.createdAt,
            recommendation, // keep raw rec for future use
          };
        });

        setJobs(transformedJobs);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isAiSubscribed]);

  // Persist layout preference
  useEffect(() => {
    localStorage.setItem("recommendedJobsLayout", layout);
  }, [layout]);

  // ─── FILTERED & SORTED JOBS ───
  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.allSkills.some((s) => s.toLowerCase().includes(q)),
      );
    }

    // AI match score filter — only applies when subscribed
    if (isAiSubscribed && filters.minMatchScore > 0) {
      result = result.filter(
        (j) => (j.aiMatchScore ?? 0) >= filters.minMatchScore,
      );
    }

    if (filters.location.trim()) {
      const loc = filters.location.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(loc));
    }
    if (filters.jobType.length > 0) {
      result = result.filter((j) => filters.jobType.includes(j.jobType));
    }
    if (filters.industry.length > 0) {
      result = result.filter((j) => filters.industry.includes(j.industry));
    }
    if (filters.experienceLevel.length > 0) {
      result = result.filter((j) =>
        filters.experienceLevel.includes(j.experienceLevel),
      );
    }
    if (filters.salaryMin !== "") {
      result = result.filter((j) => j.salary.min >= Number(filters.salaryMin));
    }
    if (filters.salaryMax !== "") {
      result = result.filter((j) => j.salary.max <= Number(filters.salaryMax));
    }
    if (filters.postedWithin) {
      const now = Date.now();
      const days =
        filters.postedWithin === "today"
          ? 1
          : filters.postedWithin === "7days"
            ? 7
            : 30;
      const cutoff = now - days * 86400000;
      result = result.filter((j) => new Date(j.postedAt).getTime() >= cutoff);
    }

    // Sorting
    switch (sortBy) {
      case "salaryDesc":
        result.sort((a, b) => b.salary.max - a.salary.max);
        break;
      case "dateDesc":
        result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        break;
      case "ratingDesc":
        result.sort((a, b) => b.company.rating - a.company.rating);
        break;
      case "bestMatch":
      default:
        if (isAiSubscribed) {
          result.sort((a, b) => (b.aiMatchScore ?? 0) - (a.aiMatchScore ?? 0));
        } else {
          result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
        }
    }

    return result;
  }, [jobs, searchQuery, filters, sortBy, isAiSubscribed]);

  const displayedJobs = filteredAndSortedJobs.slice(0, visibleCount);

  // ─── INFINITE SCROLL ───
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < filteredAndSortedJobs.length
        ) {
          setVisibleCount((c) => Math.min(c + 9, filteredAndSortedJobs.length));
        }
      },
      { threshold: 0.1 },
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [filteredAndSortedJobs.length, visibleCount]);

  const toggleSave = (id) => {
    setSavedJobs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setFilters({
      minMatchScore: 0,
      location: "",
      jobType: [],
      industry: [],
      experienceLevel: [],
      salaryMin: "",
      salaryMax: "",
      postedWithin: "",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => (Array.isArray(v) && v.length > 0) || (!!v && v !== 0),
  );

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-theme_color animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading recommended jobs...
          </p>
        </div>
      </div>
    );
  }

  // ─── ERROR ───
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Jobs
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ───
  return (
    <div className="w-full h-full">
      <div className="w-full pb-4">
        {/* ─── HEADER ─── */}
        <div className="pt-10 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Recommended Jobs
            </h1>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">
              Smart matches built for your career
            </p>
          </div>

          <div className="flex items-center gap-5 flex-wrap">
            {/* AI Matching badge — or upsell */}
            {isAiSubscribed ? (
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme_color/10 dark:bg-theme_color/20 rounded-full border border-theme_color/50 dark:border-theme_color/40 text-theme_color font-medium shadow-sm">
                <Sparkles size={18} className="animate-pulse" />
                AI Matching Active
              </button>
            ) : (
              <Link
                to={"/dashboard/subscriptions"}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 font-medium shadow-sm cursor-pointer hover:border-theme_color/50 hover:text-theme_color transition-colors"
              >
                <Lock size={16} />
                Unlock AI Matching
              </Link>
            )}

            {/* Layout Toggle */}
            <div className="flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/60 rounded-full overflow-hidden shadow-md">
              <button
                onClick={() => setLayout("modern-grid")}
                className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                  layout === "modern-grid"
                    ? "bg-theme_color text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-theme_color/10"
                }`}
              >
                <LayoutGrid size={18} />
                Grid
              </button>
              <button
                onClick={() => setLayout("elegant-list")}
                className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                  layout === "elegant-list"
                    ? "bg-theme_color text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:bg-theme_color/10"
                }`}
              >
                <LayoutList size={18} />
                List
              </button>
            </div>
          </div>
        </div>

        {/* ─── CONTROLS ─── */}
        <div className="mb-4 flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Job title, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-theme_color shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-theme_color"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="relative min-w-[200px]">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-theme_color shadow-sm"
            >
              {isAiSubscribed && <option value="bestMatch">Best Match</option>}
              <option value="salaryDesc">Highest Salary</option>
              <option value="dateDesc">Most Recent</option>
              <option value="ratingDesc">Company Rating</option>
            </select>
            <ArrowUpDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all shadow-sm ${
              showFilters || hasActiveFilters
                ? "bg-theme_color text-white"
                : "bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 hover:bg-theme_color/10"
            }`}
          >
            <SlidersHorizontal size={20} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 text-xs">
                (
                {
                  Object.values(filters).filter((v) =>
                    Array.isArray(v) ? v.length : !!v && v !== 0,
                  ).length
                }
                )
              </span>
            )}
          </button>
        </div>

        {/* ─── FILTERS PANEL ─── */}
        {showFilters && (
          <div className="mb-10 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 lg:p-8 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* AI Match Score — only show when subscribed */}
              {isAiSubscribed && (
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                    Min AI Match Score: {filters.minMatchScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.minMatchScore}
                    onChange={(e) =>
                      setFilters((p) => ({
                        ...p,
                        minMatchScore: Number(e.target.value),
                      }))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer accent-theme_color"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Dubai, Nairobi, Remote..."
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color"
                />
              </div>

              {/* Job Type */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Job Type
                </label>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {[
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "FREELANCE",
                    "INTERNSHIP",
                    "REMOTE",
                  ].map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(t)}
                        onChange={() =>
                          setFilters((p) => ({
                            ...p,
                            jobType: p.jobType.includes(t)
                              ? p.jobType.filter((x) => x !== t)
                              : [...p.jobType, t],
                          }))
                        }
                        className="w-4 h-4 rounded text-theme_color focus:ring-theme_color"
                      />
                      <span className="dark:text-gray-300">
                        {t.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Industry
                </label>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {[
                    "Software Engineering",
                    "Sales & Marketing",
                    "Finance",
                    "E-commerce",
                    "Healthcare",
                    "Hospitality",
                    "Construction",
                    "Logistics",
                    "Education",
                    "Manufacturing",
                  ].map((ind) => (
                    <label
                      key={ind}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={filters.industry.includes(ind)}
                        onChange={() =>
                          setFilters((p) => ({
                            ...p,
                            industry: p.industry.includes(ind)
                              ? p.industry.filter((x) => x !== ind)
                              : [...p.industry, ind],
                          }))
                        }
                        className="w-4 h-4 rounded text-theme_color focus:ring-theme_color"
                      />
                      <span className="dark:text-gray-300">{ind}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Experience Level
                </label>
                <div className="space-y-2.5">
                  {[
                    "Entry",
                    "Mid-Level",
                    "Senior-Level",
                    "Executive",
                    "Lead",
                  ].map((lvl) => (
                    <label
                      key={lvl}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={filters.experienceLevel.includes(lvl)}
                        onChange={() =>
                          setFilters((p) => ({
                            ...p,
                            experienceLevel: p.experienceLevel.includes(lvl)
                              ? p.experienceLevel.filter((x) => x !== lvl)
                              : [...p.experienceLevel, lvl],
                          }))
                        }
                        className="w-4 h-4 rounded text-theme_color focus:ring-theme_color"
                      />
                      <span className="dark:text-gray-300">{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.salaryMin}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, salaryMin: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.salaryMax}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, salaryMax: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-theme_color"
                  />
                </div>
              </div>

              {/* Posted Within */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Posted Within
                </label>
                <div className="space-y-2.5">
                  {[
                    { label: "Today", value: "today" },
                    { label: "Last 7 days", value: "7days" },
                    { label: "Last 30 days", value: "30days" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="postedWithin"
                        checked={filters.postedWithin === opt.value}
                        onChange={() =>
                          setFilters((p) => ({
                            ...p,
                            postedWithin: opt.value,
                          }))
                        }
                        className="w-4 h-4 text-theme_color focus:ring-theme_color"
                      />
                      <span className="dark:text-gray-300">{opt.label}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="radio"
                      name="postedWithin"
                      checked={filters.postedWithin === ""}
                      onChange={() =>
                        setFilters((p) => ({ ...p, postedWithin: "" }))
                      }
                      className="w-4 h-4 text-theme_color focus:ring-theme_color"
                    />
                    <span className="dark:text-gray-300">Any time</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t dark:border-gray-800 flex justify-end gap-4">
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium shadow-md transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {displayedJobs.length} of {filteredAndSortedJobs.length}{" "}
          recommended job{displayedJobs.length !== 1 ? "s" : ""}
        </div>

        {/* ─── LAYOUTS ─── */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center shadow-xl">
            <Sparkles className="mx-auto mb-6 text-theme_color" size={64} />
            <h3 className="text-2xl font-bold mb-3 dark:text-white">
              No matching opportunities
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
              Try adjusting your filters or updating your profile to see more
              relevant jobs.
            </p>
            <button className="px-8 py-4 bg-theme_color text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
              Update Profile
            </button>
          </div>
        ) : layout === "modern-grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedJobs.map((job) => {
              const match = getMatchStyle(job.aiMatchScore);
              const isSaved = savedJobs.has(job.id);

              return (
                <div
                  key={job.id}
                  className="group bg-white dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-theme_color/60 transition-all duration-300 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4 border-b dark:border-gray-800/60">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-theme_color flex items-center justify-center text-white font-bold text-2xl shadow-md ring-1 ring-theme_color/40">
                          {job.company.logo}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-theme_color transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">
                              {job.company.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star
                                size={15}
                                className="text-theme_color fill-theme_color"
                              />
                              {job.company.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSave(job.id)}
                        className="p-3 rounded-full hover:bg-theme_color/10 transition-colors"
                      >
                        <Bookmark
                          onClick={() => {
                            setJobToBeSaved(job);
                            setOpen(true);
                          }}
                          size={26}
                          className="text-gray-500 dark:text-gray-400"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1">
                    <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-fit flex items-center gap-2">
                        <MapPin size={18} className="text-gray-500" />
                        <span>{(job.location || "Remote").split(",")[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-gray-500" />
                        {(job.jobType || "FULL_TIME").replace("_", " ")}
                      </div>
                    </div>

                    {/* AI Match Badge — only for subscribed users */}
                    {isAiSubscribed && job.aiMatchScore !== null && (
                      <div
                        className={`inline-flex items-center gap-2.5 px-5 py-2 rounded-full border ${match.border} ${match.bg} ${match.text} font-semibold mb-5 shadow-sm`}
                      >
                        <Sparkles size={18} className={match.icon} />
                        {job.aiMatchScore}% AI Match
                      </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2">
                      {(isAiSubscribed ? job.matchedSkills : job.allSkills)
                        .slice(0, 5)
                        .map((s) => (
                          <span
                            key={s}
                            className={`px-3.5 py-1.5 text-xs rounded-full border ${
                              isAiSubscribed
                                ? "bg-theme_color/10 text-theme_color border-theme_color/50"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            {isAiSubscribed && (
                              <span className="mr-1 opacity-60">✓</span>
                            )}
                            {s}
                          </span>
                        ))}
                      {(isAiSubscribed ? job.matchedSkills : job.allSkills)
                        .length > 5 && (
                        <span className="px-3.5 py-1.5 text-gray-500 dark:text-gray-400 text-xs">
                          +
                          {(isAiSubscribed ? job.matchedSkills : job.allSkills)
                            .length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-4 border-t dark:border-gray-800/60">
                    <div className="flex gap-3">
                      {job.applicationUrl ? (
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center inline-flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          Apply Externally
                        </a>
                      ) : isAiSubscribed ? (
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="flex-1 py-3.5 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                        >
                          Quick Apply
                        </button>
                      ) : (
                        <Link
                          to={"/dashboard/subscriptions"}
                          className="flex-1 py-3.5 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                        >
                          Quick Apply
                        </Link>
                      )}
                      <a
                        href={`/dashboard/recommendations/${job.id}`}
                        className="px-6 py-3.5 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-theme_color/10 transition-colors"
                      >
                        View
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── LIST LAYOUT ─── */
          <div className="space-y-5">
            {displayedJobs.map((job) => {
              const match = getMatchStyle(job.aiMatchScore);
              const isSaved = savedJobs.has(job.id);
              return (
                <div
                  key={job.id}
                  className="group bg-white dark:bg-gray-900/80 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-6 hover:border-theme_color/60 hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6"
                >
                  <div className="flex items-center gap-5 md:w-80 lg:w-96 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-theme_color flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-2 ring-theme_color/40">
                      {job.company.logo}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-theme_color transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                        {job.company?.name || "Unknown"} • {(job.location || "Remote").split(",")[0]}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Briefcase size={18} className="text-gray-500" />
                      {job.jobType.replace("_", " ")}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-gray-500" />
                      {getRelativeTime(job.postedAt)}
                    </div>

                    {/* AI Match — subscribed only */}
                    {isAiSubscribed && job.aiMatchScore !== null ? (
                      <div
                        className={`inline-flex items-center gap-2 font-semibold ${match.text}`}
                      >
                        <Sparkles size={18} className={match.icon} />
                        {job.aiMatchScore}% Match
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                        <Lock size={16} />
                        <span className="text-xs">AI Match locked</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
                    <button
                      onClick={() => toggleSave(job.id)}
                      className="p-3 rounded-full hover:bg-theme_color/10 transition-colors"
                    >
                      <Bookmark
                        onClick={() => {
                          setJobToBeSaved(job);
                          setOpen(true);
                        }}
                        size={26}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </button>
                    {job.applicationUrl ? (
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                      >
                        <ExternalLink size={16} />
                        Apply Externally
                      </a>
                    ) : isAiSubscribed ? (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-8 py-3.5 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <Link
                        to={"/dashboard/subscriptions"}
                        className="px-8 py-3.5 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Apply Now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more indicator */}
        {visibleCount < filteredAndSortedJobs.length && (
          <div ref={loadMoreRef} className="py-16 flex justify-center">
            <div className="animate-pulse text-theme_color font-medium">
              Discovering more opportunities...
            </div>
          </div>
        )}
      </div>

      {selectedJob !== null && (
        <Modal
          isOpen={selectedJob !== null}
          onClose={() => setSelectedJob(null)}
          title={`Applying Job for ${selectedJob?.title} Position`}
          subtitle={`${selectedJob?.company?.name} : Job application made simple`}
          size="xl"
        >
          <ApplyJob
            jobId={selectedJob?.id}
            jobTitle={selectedJob?.title}
            companyName={selectedJob?.company?.name}
            onCancel={() => setSelectedJob(null)}
          />
        </Modal>
      )}
      {jobToBeSaved !== null && (
        <SaveJob
          open={open}
          onClose={() => setOpen(false)}
          jobId={jobToBeSaved.id}
          jobTitle={jobToBeSaved.title}
          companyName={jobToBeSaved.company?.name}
        />
      )}
    </div>
  );
}

export default RecommendedJobs;
