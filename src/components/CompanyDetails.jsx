import { useState, useEffect, useCallback } from 'react';
import {
    Building2, MapPin, Briefcase, Shield, Globe, ExternalLink,
    ChevronRight, ChevronLeft, Loader, ArrowLeft, Lock
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';

const formatEnum = (val) => {
    if (!val) return '';
    return val.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
};

const CompanyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobsPagination, setJobsPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [userPlan, setUserPlan] = useState(null); // null = not logged in or no sub

    // Check if user is logged in and fetch subscription
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) return;
        const fetchSub = async () => {
            try {
                const res = await fetch(`${BASE_URL}/job-seeker/subscriptions/latest`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.status === 'SUCCESS' && data.result?.subscription) {
                    const sub = data.result.subscription;
                    const isActive = sub.status === 'ACTIVE' && new Date(sub.expiresAt) > new Date();
                    setUserPlan({
                        name: sub.plan?.name || '',
                        isActive,
                        isTrial: (sub.plan?.name || '').toLowerCase().includes('trial'),
                    });
                }
            } catch (err) {
                // Not logged in or error - leave as null
            }
        };
        fetchSub();
    }, []);

    // Silver, Gold, Platinum are paid plans that unlock "Apply External"
    const canApplyExternal = userPlan?.isActive && !userPlan?.isTrial &&
        ['silver', 'gold', 'platinum'].some(p => (userPlan?.name || '').toLowerCase().includes(p));

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`${BASE_URL}/public/companies/${id}`);
                const data = await res.json();
                if (data.status === 'SUCCESS') {
                    setCompany(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch company:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [id]);

    const fetchJobs = useCallback(async (page = 1) => {
        try {
            setJobsLoading(true);
            const params = new URLSearchParams();
            params.set('page', page);
            params.set('limit', '10');
            if (selectedIndustry) params.set('industry', selectedIndustry);

            const res = await fetch(`${BASE_URL}/public/companies/${id}/jobs?${params.toString()}`);
            const data = await res.json();
            if (data.status === 'SUCCESS') {
                setJobs(data.data || []);
                setJobsPagination({
                    page: data.meta.page,
                    totalPages: data.meta.totalPages,
                    total: data.meta.total,
                });
            }
        } catch (err) {
            console.error('Failed to fetch company jobs:', err);
        } finally {
            setJobsLoading(false);
        }
    }, [id, selectedIndustry]);

    useEffect(() => {
        fetchJobs(1);
    }, [fetchJobs]);

    const getInitials = (name) => {
        return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    };

    const handleQuickApply = (e) => {
        e.stopPropagation();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 flex items-center justify-center">
                <Loader className="animate-spin text-theme_color" size={40} />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <Building2 size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Company not found</h3>
                    <a href="/companies" className="text-theme_color hover:underline">Back to companies</a>
                </div>
            </div>
        );
    }

    const industries = (company.industries || []).map(i => i.industry?.name).filter(Boolean);
    const jobCount = company._count?.jobs || 0;

    // Get unique industries from the jobs for filter buttons
    const jobIndustries = [...new Set(jobs.flatMap(j => (j.industries || []).map(i => i.industry?.name)).filter(Boolean))];

    return (
        <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 transition-colors duration-300">

            {/* Cover Image */}
            <div className="relative h-48 md:h-64 bg-teal-600 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Company Header */}
                <div className="relative -mt-20 mb-8">
                    <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-theme_color/10 dark:bg-theme_color/20 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center">
                                    <span className="text-3xl font-bold text-theme_color">{getInitials(company.name)}</span>
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
                                                {company.name}
                                            </h1>
                                            {company.isVerified && (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-theme_color/10 rounded-full">
                                                    <Shield size={16} className="text-theme_color" />
                                                    <span className="text-sm font-semibold text-theme_color">Verified</span>
                                                </div>
                                            )}
                                        </div>

                                        {industries.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {industries.map((ind) => (
                                                    <span key={ind} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-lg font-medium">
                                                        {ind}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <a
                                        href="/companies"
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm font-medium"
                                    >
                                        <ArrowLeft size={16} />
                                        All Companies
                                    </a>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {company.country && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <MapPin size={16} className="text-slate-400" />
                                            <span>{company.address ? `${company.address}, ` : ''}{company.country}</span>
                                        </div>
                                    )}
                                    {company.website && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Globe size={16} className="text-slate-400" />
                                            <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-theme_color">
                                                {company.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    {company.registrationNumber && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Building2 size={16} className="text-slate-400" />
                                            <span>Reg: {company.registrationNumber}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <Briefcase size={16} className="text-green-600 dark:text-green-400" />
                                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                                            {jobCount} Open {jobCount === 1 ? 'Position' : 'Positions'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jobs Section */}
                <div className="grid lg:grid-cols-3 gap-8 pb-8">

                    {/* Jobs List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Open Positions
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Briefcase size={20} className="text-theme_color" />
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                                        {jobsPagination.total} jobs
                                    </span>
                                </div>
                            </div>

                            {/* Industry Filter from jobs */}
                            {jobIndustries.length > 1 && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button
                                        onClick={() => setSelectedIndustry('')}
                                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${!selectedIndustry
                                            ? 'bg-theme_color text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        All Jobs
                                    </button>
                                    {jobIndustries.map((ind) => (
                                        <button
                                            key={ind}
                                            onClick={() => setSelectedIndustry(ind)}
                                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${selectedIndustry === ind
                                                ? 'bg-theme_color text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Job Listings */}
                            {jobsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader className="animate-spin text-theme_color" size={32} />
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase size={40} className="mx-auto text-slate-400 mb-3" />
                                    <p className="text-slate-600 dark:text-slate-400">No open positions at the moment</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {jobs.map((job) => {
                                        const jobInds = (job.industries || []).map(i => i.industry?.name).filter(Boolean);
                                        const jobSkills = (job.skills || []).map(s => s.skill?.name).filter(Boolean);

                                        return (
                                            <div
                                                key={job.id}
                                                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                                className={`border rounded-xl p-5 transition-all cursor-pointer group ${selectedJob?.id === job.id
                                                    ? 'border-theme_color dark:border-dark-theme_color bg-theme_color/5 dark:bg-theme_color/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-theme_color dark:hover:border-dark-theme_color'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors mb-1">
                                                            {job.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                            {jobInds[0] && (
                                                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium">
                                                                    {jobInds[0]}
                                                                </span>
                                                            )}
                                                            {job.locationName && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin size={14} />
                                                                    {job.locationName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {job.showSalary && job.minSalary && (
                                                            <div className="text-lg font-bold text-theme_color dark:text-dark-theme_color mb-1">
                                                                {job.currency || 'AED'} {job.minSalary.toLocaleString()}{job.maxSalary ? ` - ${job.maxSalary.toLocaleString()}` : ''}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {timeAgo(job.publishedAt || job.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 flex-wrap">
                                                    {job.employmentType && (
                                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-lg">
                                                            {formatEnum(job.employmentType)}
                                                        </span>
                                                    )}
                                                    {job.isRemote && (
                                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg flex items-center gap-1">
                                                            <Globe size={12} />
                                                            Remote
                                                        </span>
                                                    )}
                                                    {job.experienceLevel && (
                                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-semibold rounded-lg">
                                                            {job.experienceLevel}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Expanded Job Details */}
                                                {selectedJob?.id === job.id && (
                                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                        {/* Description */}
                                                        <div className="mb-4">
                                                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Job Description</h4>
                                                            <div
                                                                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none prose-sm"
                                                                dangerouslySetInnerHTML={{ __html: job.description || 'No description available.' }}
                                                            />
                                                        </div>

                                                        {/* Skills */}
                                                        {jobSkills.length > 0 && (
                                                            <div className="mb-4">
                                                                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Required Skills</h4>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {jobSkills.map((skill) => (
                                                                        <span key={skill} className="px-3 py-1 bg-theme_color/10 text-theme_color text-xs font-medium rounded-lg">
                                                                            {skill}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Quick Apply */}
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <button
                                                                onClick={handleQuickApply}
                                                                className="px-6 py-3 bg-theme_color hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg shadow-theme_color/30 flex items-center gap-2"
                                                            >
                                                                <Briefcase size={18} />
                                                                Quick Apply
                                                            </button>
                                                            {job.applicationUrl && (
                                                                canApplyExternal ? (
                                                                    <a
                                                                        href={job.applicationUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="px-6 py-3 border-2 border-theme_color text-theme_color hover:bg-theme_color hover:text-white font-semibold rounded-xl transition flex items-center gap-2"
                                                                    >
                                                                        <ExternalLink size={18} />
                                                                        Apply External
                                                                    </a>
                                                                ) : (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const token = sessionStorage.getItem('token');
                                                                            navigate(token ? '/dashboard/subscriptions' : '/login');
                                                                        }}
                                                                        className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-semibold rounded-xl transition flex items-center gap-2 hover:border-theme_color hover:text-theme_color"
                                                                        title="Silver subscription or higher required"
                                                                    >
                                                                        <Lock size={18} />
                                                                        Apply External
                                                                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">Silver+</span>
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Pagination */}
                            {jobsPagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => fetchJobs(jobsPagination.page - 1)}
                                        disabled={jobsPagination.page <= 1}
                                        className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                                        Page {jobsPagination.page} of {jobsPagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => fetchJobs(jobsPagination.page + 1)}
                                        disabled={jobsPagination.page >= jobsPagination.totalPages}
                                        className="flex items-center gap-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                    >
                                        Next
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Company Info Card */}
                        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                                Company Info
                            </h3>
                            <div className="space-y-3">
                                {company.country && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} className="text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300">
                                            {company.address ? `${company.address}, ` : ''}{company.country}
                                        </span>
                                    </div>
                                )}
                                {company.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe size={18} className="text-slate-400 flex-shrink-0" />
                                        <a
                                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-theme_color hover:underline truncate"
                                        >
                                            {company.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <Briefcase size={18} className="text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {jobCount} open positions
                                    </span>
                                </div>
                                {industries.length > 0 && (
                                    <div className="flex items-start gap-3">
                                        <Building2 size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                                        <div className="flex flex-wrap gap-1.5">
                                            {industries.map((ind) => (
                                                <span key={ind} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 rounded-lg">
                                                    {ind}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA Card */}
                        <div className="bg-teal-600 rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-bold mb-2">Interested in this company?</h3>
                            <p className="text-sm text-white/80 mb-4">
                                Sign in to apply to jobs, save positions, and get personalized recommendations.
                            </p>
                            <a
                                href="/login"
                                className="block w-full py-3 bg-white text-theme_color font-semibold rounded-xl text-center hover:bg-slate-100 transition"
                            >
                                Sign In to Apply
                            </a>
                            <a
                                href="/register"
                                className="block w-full py-3 mt-2 border-2 border-white/30 text-white font-semibold rounded-xl text-center hover:bg-white/10 transition"
                            >
                                Create Account
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default CompanyDetails;
