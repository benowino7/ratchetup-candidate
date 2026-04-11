import { useState, useEffect } from 'react';
import {
  Briefcase, Bookmark, Sparkles, UserCheck,
  TrendingUp, PieChart, Calendar,
  MapPin, DollarSign,
  CheckCircle2, Clock, XCircle, AlertCircle,
  ArrowRight, Loader2, FileText
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';

// ─── Match score (same as Recommendations.jsx) ──────────────────────────────
const computeMatchScore = (jobSkills, matchedSkills, recommendation) => {
  if (recommendation?.score != null && recommendation.score > 0) {
    const rawScore = recommendation.score;
    const percentage = Math.min(99, Math.round(30 + (70 * (1 - Math.exp(-rawScore / 40)))));
    return Math.max(percentage, 1);
  }
  if (!jobSkills?.length) return 0;
  const matched = matchedSkills?.map((s) => s.toLowerCase()) ?? [];
  const hits = jobSkills.filter((s) =>
    matched.includes((s.skill?.name || s).toString().toLowerCase()),
  ).length;
  return Math.round((hits / jobSkills.length) * 100);
};

// ─── Auth helpers (same pattern as MyApplications.jsx) ───────────────────────

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem('accessToken') || '{}');
  } catch {
    return '';
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const formatSalary = (min, max, currency) => {
  if (!min && !max) return null;
  const fmt = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`;
  return `${currency || 'USD'} ${fmt(min)} - ${fmt(max)}`;
};

// ─── Status config for applications ──────────────────────────────────────────

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  REVIEWING: { label: 'Reviewing', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  HIRED: { label: 'Hired', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
};

const getStatusStyle = (status) => STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-500' };

const getStatusIcon = (status) => {
  switch (status) {
    case 'HIRED':
    case 'SHORTLISTED': return <CheckCircle2 size={14} />;
    case 'REVIEWING':
    case 'SUBMITTED': return <Clock size={14} />;
    case 'REJECTED':
    case 'WITHDRAWN': return <XCircle size={14} />;
    default: return <Calendar size={14} />;
  }
};

// ─── Status chart colors ─────────────────────────────────────────────────────

const STATUS_CHART_COLORS = {
  SUBMITTED: '#3b82f6',
  REVIEWING: '#eab308',
  SHORTLISTED: '#8b5cf6',
  HIRED: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#6b7280',
};

function DashboardOverview({ subscription }) {
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : {};
  const isPaidActive = subscription?.isActive && !subscription?.isTrial && subscription?.planName && subscription?.planName !== "Free Trial";

  // ── State ──
  const [stats, setStats] = useState({
    totalApplications: 0,
    totalSavedJobs: 0,
    totalCvs: 0,
    profileCompletionPercentage: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [appsError, setAppsError] = useState('');
  const [recsError, setRecsError] = useState('');

  // ── Fetch dashboard stats (wait for subscription to load) ──
  useEffect(() => {
    if (subscription === null) return; // still loading
    if (!isPaidActive) { setStatsLoading(false); setAppsLoading(false); setRecsLoading(false); return; }
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError('');
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/dashboard`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const json = await res.json();
        const data = json.result || json.data || json;
        setStats({
          totalApplications: data.applications?.total || data.totalApplications || 0,
          totalSavedJobs: data.savedJobs?.total || data.totalSavedJobs || 0,
          totalCvs: data.cvs?.total || data.totalCvs || 0,
          profileCompletionPercentage: data.profileCompletion?.percentage || data.profileCompletionPercentage || 0,
        });
      } catch (err) {
        setStatsError(err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [isPaidActive]);

  // ── Fetch recent applications (wait for subscription) ──
  useEffect(() => {
    if (subscription === null) return;
    if (!isPaidActive) { setAppsLoading(false); return; }
    const fetchApplications = async () => {
      setAppsLoading(true);
      setAppsError('');
      try {
        const res = await fetch(
          `${BASE_URL}/job-seeker/jobs/applications?page=1&limit=5`,
          { headers: authHeaders() }
        );
        if (!res.ok) throw new Error('Failed to fetch recent applications');
        const json = await res.json();
        const data = json.message || {};
        setRecentApplications(data.applications || []);
      } catch (err) {
        setAppsError(err.message);
      } finally {
        setAppsLoading(false);
      }
    };
    fetchApplications();
  }, [isPaidActive]);

  // ── Fetch job recommendations (wait for subscription) ──
  useEffect(() => {
    if (subscription === null) return;
    if (!isPaidActive) { setRecsLoading(false); return; }
    const fetchRecommendations = async () => {
      setRecsLoading(true);
      setRecsError('');
      try {
        // Try AI suggestions first, fall back to public jobs
        let res = await fetch(
          `${BASE_URL}/job-seeker/jobs/suggestions?page=1&limit=5`,
          { headers: authHeaders() }
        );

        if (!res.ok) {
          // Fall back to public jobs
          res = await fetch(`${BASE_URL}/public/jobs?page=1&limit=5`, {
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (!res.ok) throw new Error('Failed to fetch recommendations');

        const json = await res.json();
        const rawJobs = json.message?.jobs ?? json.data ?? [];
        setRecommendedJobs(rawJobs.slice(0, 5));
      } catch (err) {
        setRecsError(err.message);
      } finally {
        setRecsLoading(false);
      }
    };
    fetchRecommendations();
  }, [isPaidActive]);

  // ── Derive chart data from recent applications ──
  const statusChartData = (() => {
    if (!recentApplications.length) return [];
    const counts = {};
    recentApplications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_CONFIG[status]?.label || status,
      count,
      color: STATUS_CHART_COLORS[status] || '#6b7280',
    }));
  })();

  const isProfileIncomplete = stats.profileCompletionPercentage < 85;

  return (
    <div className="h-full text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="w-full space-y-6">

        {/* Trial Banner */}
        {subscription?.isTrial && (
          <div className="bg-teal-600 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-white gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold">Free Trial &mdash; {subscription.trialDaysLeft} {subscription.trialDaysLeft === 1 ? 'day' : 'days'} remaining</p>
                <p className="text-sm opacity-90">Upgrade to unlock job applications, saved jobs, AI suggestions, and PDF export</p>
              </div>
            </div>
            <Link to="/dashboard/subscriptions" className="px-4 py-2 bg-white text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors flex-shrink-0">
              Upgrade Now
            </Link>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {user.firstName || 'there'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's a quick snapshot of your job search activity
          </p>
        </div>

        {/* Subscription required banner */}
        {subscription !== null && !isPaidActive && (
          <Link to="/dashboard/subscriptions" className="block p-5 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl hover:shadow-lg transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Subscribe to unlock your dashboard</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Get a Silver plan or higher to access all features — applications, saved jobs, CV builder, AI matching & more.</p>
              </div>
              <span className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-lg group-hover:bg-teal-600 transition shrink-0">
                View Plans
              </span>
            </div>
          </Link>
        )}

        {/* Key Metrics Cards */}
        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-theme_color animate-spin" />
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading stats...</span>
          </div>
        ) : statsError ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-300">{statsError}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Link to={'/dashboard/applications'} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Applications Sent</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Link>

            <Link to={'/dashboard/saved_jobs'} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Saved Jobs</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalSavedJobs}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">View saved</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Bookmark size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Link>

            <Link to={'/dashboard/cv-builder'} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded CVs</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stats.totalCvs}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">Manage CVs</p>
                </div>
                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText size={24} className="text-teal-600 dark:text-teal-400" />
                </div>
              </div>
            </Link>

            <Link to={'/dashboard/profile'} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Profile Completion</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stats.profileCompletionPercentage}%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <UserCheck size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500 rounded-full"
                  style={{ width: `${stats.profileCompletionPercentage}%` }}
                />
              </div>
            </Link>
          </div>
        )}

        {/* Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Applications Status Chart */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Application Status</h3>
              <PieChart size={20} className="text-gray-500" />
            </div>
            {appsLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-6 h-6 text-theme_color animate-spin" />
              </div>
            ) : statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry) => (
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {value} ({entry.payload.count})
                      </span>
                    )}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                <PieChart size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No application data yet</p>
                <p className="text-xs mt-1">Start applying to jobs to see your stats here</p>
              </div>
            )}
          </div>

          {/* Applications Over Time (bar chart from real data) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Applications</h3>
              <TrendingUp size={20} className="text-gray-500" />
            </div>
            {appsLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Loader2 className="w-6 h-6 text-theme_color animate-spin" />
              </div>
            ) : recentApplications.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis
                    dataKey="status"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    name="Applications"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-gray-400 dark:text-gray-500">
                <TrendingUp size={40} className="mb-3 opacity-30" />
                <p className="text-sm">No data yet</p>
                <p className="text-xs mt-1">Your application trends will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Recommended for You</h2>
            <Link to={'/dashboard/recommendations'} className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1.5 text-sm md:text-base hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {recsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-theme_color animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading recommendations...</span>
            </div>
          ) : recsError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{recsError}</span>
            </div>
          ) : recommendedJobs.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
              <Sparkles size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No recommendations yet. Complete your profile and add skills to get matched.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job) => {
                const logoAbbr = job.company?.name
                  ? job.company.name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2)
                  : '?';
                const salary = job.showSalary
                  ? formatSalary(job.minSalary, job.maxSalary, job.currency)
                  : null;
                const matchScore = job.recommendation
                  ? computeMatchScore(job.skills, job.recommendation.matchedSkills, job.recommendation)
                  : null;

                return (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-600/50 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-theme_color flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {logoAbbr}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{job.company?.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin size={16} /> {job.locationName || 'Remote'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      {matchScore !== null ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium">
                          <Sparkles size={14} />
                          {matchScore}% Match
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {timeAgo(job.publishedAt || job.createdAt)}
                        </span>
                      )}
                      <Link
                        to={`/dashboard/recommendations/${job.id}`}
                        className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg active:scale-95"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold">Recent Applications</h2>
            <Link to={'/dashboard/applications'} className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium flex items-center gap-1.5 text-sm md:text-base hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {appsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-theme_color animate-spin" />
              <span className="ml-3 text-sm text-gray-500">Loading applications...</span>
            </div>
          ) : appsError ? (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">{appsError}</span>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
              <Briefcase size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No applications yet. Start applying to jobs and track your progress here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => {
                const cfg = getStatusStyle(app.status);
                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-300 group"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-lg group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {app.job?.title || 'Untitled Position'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {app.job?.company?.name || 'Unknown Company'}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {timeAgo(app.createdAt)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium ${cfg.color}`}>
                        {getStatusIcon(app.status)}
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Completion Prompt */}
        {!statsLoading && isProfileIncomplete && (
          <div className="mt-10 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle size={24} className="text-teal-600 dark:text-teal-400" />
                  <h3 className="text-xl font-semibold text-teal-700 dark:text-teal-300">
                    Complete your profile to unlock better matches
                  </h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your profile is {stats.profileCompletionPercentage}% complete. Add skills, experience, and preferences to get more relevant recommendations.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    Add your CV / resume
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    List key skills & certifications
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                    Set salary & location preferences
                  </li>
                </ul>
              </div>
              <Link to={'/dashboard/profile'} className="inline-flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-all hover:shadow-lg active:scale-95 whitespace-nowrap">
                Complete Profile Now
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardOverview;
