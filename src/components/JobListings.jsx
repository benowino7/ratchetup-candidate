import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Clock,
  Zap,
  X,
  ChevronDown,
  TrendingUp,
  Star,
  Building2,
  LayoutGrid,
  List,
  Loader,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import PlacesAutocomplete from "./PlacesAutocomplete";

// Format enum like FULL_TIME → "Full Time"
const formatEnum = (val) => {
  if (!val) return "";
  return val.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

// Strip HTML tags from text
const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim();
};

const JobListings = () => {
  const [searchParams] = useState(
    new URLSearchParams(window.location.search),
  );
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState("grid");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 24, totalPages: 1 });
  const [aiFilters, setAiFilters] = useState(null);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [isLeadMode, setIsLeadMode] = useState(false);
  const [leadInfo, setLeadInfo] = useState(null);
  const [industries, setIndustries] = useState([]);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || searchParams.get("q") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
  });

  // Fetch industry taxonomy for filter dropdown (SIC-like verticals with real industries)
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/industries/taxonomy`);
        const data = await res.json();
        if (!data.error && data.result) {
          // Flatten: collect all DB industries from all verticals
          const allIndustries = [];
          for (const group of data.result) {
            for (const ind of group.industries || []) {
              allIndustries.push({ id: ind.id, name: ind.name, vertical: group.vertical, jobCount: ind.jobCount });
            }
          }
          // Sort alphabetically
          allIndustries.sort((a, b) => a.name.localeCompare(b.name));
          setIndustries(allIndustries);
        }
      } catch (err) {
        console.error("Failed to fetch industries:", err);
      }
    };
    fetchIndustries();
  }, []);

  // Fetch lead recommendations by leadId
  const fetchLeadRecommendations = useCallback(async (leadId, page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, limit: 24 });
      const response = await fetch(`${BASE_URL}/public/lead-recommendations/${leadId}?${params}`);
      if (!response.ok) throw new Error("Failed to fetch recommendations");
      const result = await response.json();
      if (result.error) throw new Error(result.message);

      if (result.aiFilters) setAiFilters(result.aiFilters);
      if (result.leadInfo) setLeadInfo(result.leadInfo);

      const transformedJobs = (result.data || []).map((job) => ({
        id: job.id,
        title: job.title || "Untitled",
        company: job.company?.name || "Unknown Company",
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company?.name || "UC")}`,
        location: job.locationName || "",
        locationType: job.isRemote ? "Remote" : "On-site",
        salary: { min: job.minSalary, max: job.maxSalary, currency: job.currency, frequency: "monthly" },
        matchScore: job.matchScore || 0,
        jobType: formatEnum(job.employmentType),
        experienceLevel: job.experienceLevel,
        postedDate: job.publishedAt || job.createdAt,
        urgency: null,
        category: job.industries?.[0]?.industry?.name || "General",
        subCategory: job.industries?.[0]?.industry?.slug || "",
        skills: (job.skills || []).map((s) => s.skill?.name).filter(Boolean),
        description: stripHtml(job.description || "").substring(0, 120) + "...",
        applyUrl: "/login",
        applicationUrl: job.applicationUrl || null,
      }));

      setJobs(transformedJobs);
      setPagination({
        total: result.meta?.total || 0,
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 24,
        totalPages: result.meta?.totalPages || 1,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching lead recommendations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Server-side search
  const fetchJobs = useCallback(async (currentFilters, page = 1, useAi = false) => {
    try {
      setLoading(true);
      setError(null);

      let url;
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", "24");

      if (useAi && currentFilters.search) {
        params.set("q", currentFilters.search);
        if (currentFilters.location) params.set("location", currentFilters.location);
        if (currentFilters.category) params.set("category", currentFilters.category);
        url = `${BASE_URL}/public/jobs/ai-search?${params.toString()}`;
      } else {
        if (currentFilters.search) params.set("search", currentFilters.search);
        if (currentFilters.location) params.set("location", currentFilters.location);
        if (currentFilters.category) params.set("industryName", currentFilters.category);
        url = `${BASE_URL}/public/jobs?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch jobs");

      const result = await response.json();

      if (result.aiFilters) {
        setAiFilters(result.aiFilters);
      }

      const transformedJobs = (result.data || []).map((job) => ({
        id: job.id,
        title: job.title || "Untitled",
        company: job.company?.name || "Unknown Company",
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company?.name || "UC")}`,
        location: job.locationName || "",
        locationType: job.isRemote ? "Remote" : "On-site",
        salary: {
          min: job.minSalary,
          max: job.maxSalary,
          currency: job.currency,
          frequency: "monthly",
        },
        matchScore: job.matchScore || 0,
        jobType: formatEnum(job.employmentType),
        experienceLevel: job.experienceLevel,
        postedDate: job.publishedAt || job.createdAt,
        urgency: Math.random() > 0.7 ? "Fast" : null,
        category: job.industries?.[0]?.industry?.name || "General",
        subCategory: job.industries?.[0]?.industry?.slug || "",
        skills: (job.skills || []).map((s) => s.skill?.name).filter(Boolean),
        description: stripHtml(job.description || "").substring(0, 120) + "...",
        applyUrl: "/login",
        applicationUrl: job.applicationUrl || null,
      }));

      setJobs(transformedJobs);
      setPagination({
        total: result.meta?.total || 0,
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 24,
        totalPages: result.meta?.totalPages || 1,
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (leadId) {
      setIsLeadMode(true);
      setIsAiSearch(true);
      fetchLeadRecommendations(leadId, 1);
      return;
    }
    const hasSearchQuery = filters.search.trim().length > 0;
    if (hasSearchQuery) {
      setIsAiSearch(true);
      fetchJobs(filters, 1, true);
    } else {
      fetchJobs(filters, 1, false);
    }
  }, []);

  const triggerSearch = (useAi = isAiSearch) => {
    fetchJobs(filters, 1, useAi);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const emptyFilters = { search: "", location: "", category: "" };
    setFilters(emptyFilters);
    setIsAiSearch(false);
    setAiFilters(null);
    window.history.replaceState({}, "", window.location.pathname);
    fetchJobs(emptyFilters, 1, false);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "" && v !== false,
  ).length;

  // Job Card Component
  const JobCard = ({ job }) => {
    const daysAgo = Math.floor(
      (new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24),
    );

    return (
      <a
        href={`/joblisting/${job.id}`}
        className="group relative bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        <div className="absolute inset-0 group-hover:bg-orange-500/5 transition-all duration-500 pointer-events-none" />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-slate-100 dark:ring-slate-700 group-hover:ring-orange-200 dark:group-hover:ring-orange-800 transition-all flex-shrink-0">
                <img
                  src={job.companyLogo}
                  alt={job.company}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1 line-clamp-1">
                  {job.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Building2 size={14} />
                  <span className="font-medium">{job.company}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {job.matchScore > 0 && (
                <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Star size={12} fill="white" />
                  {job.matchScore}%
                </div>
              )}
              {job.urgency && (
                <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full border border-red-200">
                  {job.urgency}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <MapPin size={14} className="text-slate-400 dark:text-slate-500" />
              <span className="flex-1">{job.location.split(",")[0]}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">{job.locationType}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-lg border border-blue-100 dark:border-blue-900">
              {job.jobType}
            </span>
            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-lg border border-purple-100 dark:border-purple-900">
              {job.experienceLevel}
            </span>
            <span className="px-3 py-1 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300 text-xs font-medium rounded-lg border border-green-100 dark:border-green-900">
              {job.category}
            </span>
          </div>

          <div className="mb-5">
            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 4).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded border border-slate-200 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-1 text-slate-500 dark:text-slate-400 text-xs">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 line-clamp-2">
            {job.description}
          </p>

          <a
            href={`/login?redirect=/joblisting/${job.id}`}
            onClick={(e) => {
              e.stopPropagation();
              if (isLeadMode && leadInfo) {
                e.preventDefault();
                // Store pending action
                sessionStorage.setItem('pendingAction', JSON.stringify({ type: 'apply', jobId: job.id }));
                // Check if email exists to decide login vs register
                fetch(`${BASE_URL}/public/check-email?email=${encodeURIComponent(leadInfo.email)}`)
                  .then(r => r.json())
                  .then(data => {
                    if (data.exists) {
                      window.location.href = `/login?email=${encodeURIComponent(leadInfo.email)}&redirect=/joblisting/${job.id}`;
                    } else {
                      window.location.href = `/register?email=${encodeURIComponent(leadInfo.email)}`;
                    }
                  })
                  .catch(() => {
                    window.location.href = `/register?email=${encodeURIComponent(leadInfo.email)}`;
                  });
              }
            }}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all group-hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            <Briefcase size={18} />
            {job.applicationUrl ? "Apply" : "Quick Apply"}
          </a>
        </div>
      </a>
    );
  };

  // Job List Item Component
  const JobListItem = ({ job }) => {
    const daysAgo = Math.floor(
      (new Date() - new Date(job.postedDate)) / (1000 * 60 * 60 * 24),
    );

    return (
      <a
        href={`/joblisting/${job.id}`}
        className="group relative flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 px-5 sm:px-6 py-5 sm:py-6 border-b border-slate-200/80 dark:border-slate-800/70 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition-all duration-250 ease-out cursor-pointer bg-white dark:bg-dark-sidebar rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700"
      >
        <div className="relative flex-shrink-0 self-start sm:self-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg ring-1 ring-slate-100/70 dark:ring-slate-700/50 transition-all duration-300">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-full h-full object-cover"
            />
          </div>

          {job.matchScore > 0 && (
            <div className="absolute -bottom-2 -right-2 sm:-right-3 bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg ring-2 ring-white/40 dark:ring-slate-900/60 flex items-center gap-1 z-10">
              <Star size={12} fill="white" />
              {job.matchScore}%
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base sm:text-lg font-semibold leading-snug text-slate-900 dark:text-slate-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
              {job.title}
            </h3>

            {job.urgency && (
              <span className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50/90 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40 whitespace-nowrap">
                {job.urgency}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-1.5">
              <Building2 size={15} className="opacity-80" />
              <span className="font-medium truncate max-w-[180px]">{job.company}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin size={15} className="opacity-80" />
              <span className="truncate max-w-[160px] flex-1">{job.location.split(",")[0]}</span>
            </div>

            <div className="flex items-center gap-1.5 opacity-75">
              <Clock size={15} />
              <span>{daysAgo === 0 ? "Today" : `${daysAgo}d ago`}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3.5">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100/80 dark:bg-orange-900/35 text-orange-800 dark:text-orange-300 border border-orange-200/50 dark:border-orange-800/40">
              {job.jobType}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {job.experienceLevel}
            </span>
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
              {job.locationType}
            </span>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {job.skills.slice(0, 6).map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-xs rounded-md bg-slate-100/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 6 && (
                <span className="px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400">
                  +{job.skills.length - 6}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 self-start sm:self-center mt-4 sm:mt-0">
          <a
            href={`/login?redirect=/joblisting/${job.id}`}
            onClick={(e) => { e.stopPropagation(); }}
            className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-250 group-hover:scale-105 active:scale-95"
          >
            Apply
            <Briefcase size={17} />
          </a>
        </div>
      </a>
    );
  };

  // Inline Loading Component
  const InlineLoader = () => (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Loading jobs...</p>
      </div>
    </div>
  );

  // Error State — only show on initial load error
  if (error && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-dark-background flex items-center justify-center">
        <div className="text-center bg-white dark:bg-dark-sidebar p-8 rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Error Loading Jobs
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-dark-background py-8">
      {/* Hero Section */}
      <div className="text-white pt-16 pb-24 px-4">
        <div className="max-w-[90rem] mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-full px-4 py-2">
                <TrendingUp
                  size={16}
                  className="text-theme_color dark:text-white"
                />
                <span className="text-sm font-medium text-theme_color dark:text-white">
                  Live Job Market
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-600 dark:text-slate-300">
              Find Your Dream Job in{" "}
              <span className="text-orange-400">Dubai</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              AI-powered matching • Verified employers • Tax-free salaries
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-2xl p-3 border border-transparent dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Try: banking, remote react, finance manager..."
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setIsAiSearch(true);
                        triggerSearch(true);
                      }
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>
                <div className="md:w-64">
                  <PlacesAutocomplete
                    value={filters.location}
                    onChange={(val) => updateFilter("location", val)}
                    placeholder="Location"
                    icon={<MapPin className="text-slate-400 dark:text-slate-500" size={20} />}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') triggerSearch(true);
                    }}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>
                <button
                  onClick={() => {
                    setIsAiSearch(true);
                    triggerSearch(true);
                  }}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex items-center gap-2"
                >
                  <Zap size={18} />
                  AI Search
                </button>
              </div>
            </div>

            {/* AI Search Badge */}
            {isAiSearch && filters.search && (
              <div className="mt-3 flex items-center gap-2">
                <Zap size={14} className="text-orange-500" />
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  AI-powered results for <span className="font-semibold text-orange-500">"{filters.search}"</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Industry Filter */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Filter size={20} className="text-slate-600 dark:text-slate-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Filter by Industry
              </h3>
              {filters.category && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm font-semibold rounded-full">
                  1 active
                </span>
              )}
            </div>
            {filters.category && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center gap-1 transition"
              >
                <X size={16} />
                Clear filter
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filters.category}
              onChange={(e) => {
                const newFilters = { ...filters, category: e.target.value };
                setFilters(newFilters);
                // If AI search is active, re-run with industry filter
                if (isAiSearch && filters.search) {
                  fetchJobs(newFilters, 1, true);
                } else {
                  setIsAiSearch(false);
                  setAiFilters(null);
                  fetchJobs(newFilters, 1, false);
                }
              }}
              className="flex-1 sm:max-w-sm px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              <option value="">All Industries</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.name}>{ind.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Lead Mode Banner */}
        {isLeadMode && (
          <div className="mb-6 bg-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star size={20} fill="white" /> AI-Matched Jobs for {leadInfo?.name || "You"}
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  Based on your CV analysis — register to apply, save jobs, and unlock full features
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/register${leadInfo?.email ? `?email=${encodeURIComponent(leadInfo.email)}` : ''}`}
                  className="px-5 py-2.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition text-sm shadow"
                >
                  Create Account
                </a>
                <a
                  href={`/login${leadInfo?.email ? `?email=${encodeURIComponent(leadInfo.email)}` : ''}`}
                  className="px-5 py-2.5 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition text-sm"
                >
                  Sign In
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Results Header with Layout Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-600 dark:text-slate-300">
              {pagination.total.toLocaleString()}{" "}
              {isLeadMode ? "Matching Jobs" : (pagination.total === 1 ? "Job" : "Jobs") + " Found"}
            </h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm mt-1">
              {isLeadMode ? "Ranked by CV match score" : (filters.category ? `Industry: ${filters.category}` : "Showing latest jobs")} — Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout("grid")}
              className={`p-2 rounded ${layout === "grid" ? "bg-orange-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"} hover:bg-orange-500 hover:text-white transition`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={`p-2 rounded ${layout === "list" ? "bg-orange-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"} hover:bg-orange-500 hover:text-white transition`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Jobs Display — show loader inline instead of replacing the whole page */}
        {loading ? (
          <InlineLoader />
        ) : jobs.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2">
              No jobs found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              We couldn't find any jobs matching your criteria. Try adjusting
              your filters or search terms.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : layout === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-16">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden pb-4 flex flex-col gap-2">
            {jobs.map((job) => (
              <JobListItem key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pb-16">
            <button
              onClick={() => { isLeadMode ? fetchLeadRecommendations(searchParams.get("leadId"), pagination.page - 1) : fetchJobs(filters, pagination.page - 1, isAiSearch); }}
              disabled={pagination.page <= 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-orange-50 dark:hover:bg-slate-700 transition font-medium text-sm"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} jobs)
            </span>
            <button
              onClick={() => { isLeadMode ? fetchLeadRecommendations(searchParams.get("leadId"), pagination.page + 1) : fetchJobs(filters, pagination.page + 1, isAiSearch); }}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-orange-50 dark:hover:bg-slate-700 transition font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
