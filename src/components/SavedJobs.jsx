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
  LayoutGrid,
  LayoutList,
  Loader,
  ExternalLink,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import Modal from "../allmodals/Modal";
import ApplyJob from "./Applyjob";
import successMessage from "../utilities/successMessage";

const getRelativeTime = (dateStr) => {
  const diffDays = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

function SavedJobs({ isAiSubscribed2 }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [layout, setLayout] = useState(
    () => localStorage.getItem("savedJobsLayout") || "modern-grid",
  );
  const [sortBy, setSortBy] = useState("dateDesc");
  const [filters, setFilters] = useState({
    location: "",
    jobType: [],
    industry: [],
    experienceLevel: [],
    salaryMin: "",
    salaryMax: "",
    postedWithin: "",
  });
  const [unsavedIds, setUnsavedIds] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(9);
  const loadMoreRef = useRef(null);
  const [jobToUnsave, setJobToUnsave] = useState(null);
  const [unsaving, setUnsaving] = useState(false);
  const [reload, setReload] = useState(false);
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");

  // ─── FETCH SAVED JOBS ───
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");

        const response = await fetch(`${BASE_URL}/job-seeker/jobs/saved-jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch saved jobs");

        const result = await response.json();

        const transformed = result.result.map((entry) => {
          const job = entry.job;
          const logoAbbr = job.company.name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);

          return {
            savedId: entry.id,
            note: entry.note,
            savedAt: entry.savedAt,
            id: job.id,
            title: job.title,
            description: job.description,
            vacancies: job.vacancies,
            company: {
              name: job.company.name,
              logo: logoAbbr,
              website: job.company.website,
              country: job.company.country,
            },
            location: job.locationName,
            isRemote: job.isRemote,
            jobType: job.employmentType,
            industry: job.industries[0]?.industry.name || "General",
            experienceLevel: job.experienceLevel,
            salary: {
              min: job.minSalary,
              max: job.maxSalary,
              currency: job.currency,
              show: job.showSalary,
            },
            skills: job.skills.map((s) => s.skill.name),
            postedAt: job.publishedAt || job.createdAt,
          };
        });

        setJobs(transformed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [reload]);

  useEffect(() => {
    localStorage.setItem("savedJobsLayout", layout);
  }, [layout]);

  // ─── FILTER + SORT ───
  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs.filter((j) => !unsavedIds.has(j.id));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)),
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
      const days =
        filters.postedWithin === "today"
          ? 1
          : filters.postedWithin === "7days"
            ? 7
            : 30;
      const cutoff = Date.now() - days * 86400000;
      result = result.filter((j) => new Date(j.postedAt).getTime() >= cutoff);
    }

    switch (sortBy) {
      case "salaryDesc":
        result.sort((a, b) => b.salary.max - a.salary.max);
        break;
      case "titleAsc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "savedDesc":
        result.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
        break;
      default:
        result.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    }

    return result;
  }, [jobs, searchQuery, filters, sortBy, unsavedIds]);

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

  const handleUnsaveConfirm = async () => {
    if (!jobToUnsave) return;
    setUnsaving(true);
    try {
      const response = await fetch(
        `${BASE_URL}/job-seeker/jobs/${jobToUnsave.id}/save`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to remove job");
      successMessage(data?.message || "Job Removed successfully");
      setReload((prev) => !prev);
      setJobToUnsave(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUnsaving(false);
    }
  };

  const resetFilters = () => {
    setFilters({
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
    (v) => (Array.isArray(v) && v.length > 0) || !!v,
  );

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-theme_color animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading saved jobs...
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
            Error Loading Saved Jobs
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

  return (
    <div className="w-full h-full">
      <div className="w-full">
        {/* ─── HEADER ─── */}
        <div className="pt-10 pb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Saved Jobs
            </h1>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-300">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} bookmarked
            </p>
          </div>

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
              <LayoutGrid size={18} /> Grid
            </button>
            <button
              onClick={() => setLayout("elegant-list")}
              className={`px-6 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                layout === "elegant-list"
                  ? "bg-theme_color text-white shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-theme_color/10"
              }`}
            >
              <LayoutList size={18} /> List
            </button>
          </div>
        </div>

        {/* ─── CONTROLS ─── */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
              <option value="dateDesc">Most Recent</option>
              <option value="savedDesc">Recently Saved</option>
              <option value="salaryDesc">Highest Salary</option>
              <option value="titleAsc">Title A–Z</option>
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
            Filters{" "}
            {hasActiveFilters && (
              <span className="text-xs">
                (
                {
                  Object.values(filters).filter((v) =>
                    Array.isArray(v) ? v.length : !!v,
                  ).length
                }
                )
              </span>
            )}
          </button>
        </div>

        {/* ─── FILTERS PANEL ─── */}
        {showFilters && (
          <div className="mb-10 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 lg:p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Nairobi, Remote..."
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
                <div className="space-y-2.5">
                  {[
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "FREELANCE",
                    "INTERNSHIP",
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

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                  Experience Level
                </label>
                <div className="space-y-2.5">
                  {["Entry-Level", "Mid-Level", "Senior-Level", "Lead"].map(
                    (lvl) => (
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
                    ),
                  )}
                </div>
              </div>

              {/* Salary + Posted Within */}
              <div className="space-y-6">
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
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-gray-200">
                    Posted Within
                  </label>
                  <div className="space-y-2.5">
                    {[
                      { label: "Today", value: "today" },
                      { label: "Last 7 days", value: "7days" },
                      { label: "Last 30 days", value: "30days" },
                      { label: "Any time", value: "" },
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
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t dark:border-gray-800 flex justify-end gap-4">
              <button
                onClick={resetFilters}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white rounded-xl font-medium shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          Showing {displayedJobs.length} of {filteredAndSortedJobs.length} saved
          job{filteredAndSortedJobs.length !== 1 ? "s" : ""}
        </div>

        {/* ─── EMPTY STATE ─── */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center shadow-xl">
            <Bookmark className="mx-auto mb-6 text-theme_color" size={64} />
            <h3 className="text-2xl font-bold mb-3 dark:text-white">
              No saved jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8">
              {hasActiveFilters || searchQuery
                ? "Try adjusting your filters or search query."
                : "Browse jobs and bookmark the ones you're interested in."}
            </p>
            {(hasActiveFilters || searchQuery) && (
              <button
                onClick={() => {
                  resetFilters();
                  setSearchQuery("");
                }}
                className="px-8 py-4 bg-theme_color text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : layout === "modern-grid" ? (
          /* ─── GRID LAYOUT ─── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-gray-900/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] hover:border-theme_color/60 transition-all duration-300 flex flex-col"
              >
                <div className="p-6 pb-4 border-b dark:border-gray-800/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-theme_color flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {job.company.logo}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-theme_color transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {job.company.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setJobToUnsave(job)}
                      title="Remove from saved"
                      className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <BookmarkCheck
                        size={22}
                        className="text-theme_color fill-theme_color"
                      />
                    </button>
                  </div>
                </div>

                <div className="p-4 flex-1 space-y-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-gray-400 shrink-0" />
                      <span>
                        {job.isRemote ? "Remote" : job.location.split(",")[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={15} className="text-gray-400 shrink-0" />
                      <span>{job.jobType.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={15} className="text-gray-400 shrink-0" />
                      <span>{getRelativeTime(job.postedAt)}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 bg-theme_color/10 text-theme_color text-xs rounded-full border border-theme_color/30"
                      >
                        {s}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="px-3 py-1 text-gray-400 text-xs">
                        +{job.skills.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Note */}
                  {job.note && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic border-l-2 border-theme_color/30 pl-2">
                      "{job.note}"
                    </p>
                  )}
                </div>

                <div className="p-4 pt-3 border-t dark:border-gray-800/60">
                  <div className="flex gap-3">
                    {job.applicationUrl ? (
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm inline-flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={14} />
                        Apply Externally
                      </a>
                    ) : (
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="flex-1 py-3 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                      >
                        Quick Apply
                      </button>
                    )}
                    <a
                      href={`/joblisting/${job.id}`}
                      className="px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-xl hover:bg-theme_color/10 transition-colors text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ─── LIST LAYOUT ─── */
          <div className="space-y-4">
            {displayedJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-gray-900/80 border border-gray-200/70 dark:border-gray-700/60 rounded-2xl p-5 hover:border-theme_color/60 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center gap-5"
              >
                <div className="flex items-center gap-4 md:w-72 lg:w-80 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-theme_color flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {job.company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-theme_color transition-colors truncate">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {job.company.name}
                    </p>
                    {job.note && (
                      <p className="text-xs text-gray-400 italic mt-0.5 truncate">
                        "{job.note}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">
                      {job.isRemote ? "Remote" : job.location.split(",")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={15} className="text-gray-400 shrink-0" />
                    <span>{job.jobType.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={15} className="text-gray-400 shrink-0" />
                    <span>{getRelativeTime(job.postedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setJobToUnsave(job)}
                    title="Remove from saved"
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <BookmarkCheck
                      size={22}
                      className="text-theme_color fill-theme_color"
                    />
                  </button>
                  {job.applicationUrl ? (
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all text-sm inline-flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Apply Externally
                    </a>
                  ) : (
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-6 py-3 bg-theme_color hover:bg-theme_color/90 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Infinite scroll trigger */}
        {visibleCount < filteredAndSortedJobs.length && (
          <div ref={loadMoreRef} className="py-12 flex justify-center">
            <div className="animate-pulse text-theme_color font-medium">
              Loading more...
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {selectedJob && (
        <Modal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={`Apply for ${selectedJob?.title}`}
          subtitle={`${selectedJob?.company?.name} · Job application made simple`}
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

      {jobToUnsave && (
        <Modal
          isOpen={!!jobToUnsave}
          onClose={() => setJobToUnsave(null)}
          title="Remove Saved Job"
          subtitle="This action cannot be undone"
          size="sm"
        >
          <div className="px-1 pb-2 space-y-5">
            {/* Job preview */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/40">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 font-bold text-red-500 text-sm">
                {jobToUnsave.company.logo}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {jobToUnsave.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {jobToUnsave.company.name}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {jobToUnsave.title}
              </span>{" "}
              from your saved jobs? You can always save it again later.
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={() => setJobToUnsave(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Keep Saved
              </button>
              <button
                onClick={handleUnsaveConfirm}
                disabled={unsaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-60"
              >
                {unsaving ? (
                  <>
                    <Loader size={15} className="animate-spin" /> Removing...
                  </>
                ) : (
                  <>
                    <Bookmark size={15} /> Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SavedJobs;
