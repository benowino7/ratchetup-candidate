import { useState, useEffect, useCallback } from 'react';
import { Building2, MapPin, Briefcase, Shield, Search, X, Loader, Users, ExternalLink } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

const AllCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [industries, setIndustries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Fetch industry taxonomy for filter dropdown
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/industries/taxonomy`);
        const data = await res.json();
        if (!data.error && data.result) {
          const allIndustries = [];
          for (const group of data.result) {
            for (const ind of group.industries || []) {
              allIndustries.push({ id: ind.id, name: ind.name, vertical: group.vertical, jobCount: ind.jobCount });
            }
          }
          allIndustries.sort((a, b) => a.name.localeCompare(b.name));
          setIndustries(allIndustries);
        }
      } catch (err) {
        console.error('Failed to fetch industries:', err);
      }
    };
    fetchIndustries();
  }, []);

  const fetchCompanies = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', '12');
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedIndustry) params.set('industry', selectedIndustry);

      const res = await fetch(`${BASE_URL}/public/companies?${params.toString()}`);
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        setCompanies(data.result.data || []);
        setPagination({
          page: data.result.pagination.page,
          totalPages: data.result.pagination.totalPages,
          total: data.result.pagination.total,
        });
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedIndustry]);

  useEffect(() => {
    fetchCompanies(1);
  }, [selectedIndustry]);

  const handleSearch = () => {
    fetchCompanies(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('');
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#e7f0fa] dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-3">
            Discover{' '}
            <span className="text-orange-600">
              Companies Hiring
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore opportunities at {pagination.total}+ companies with open positions
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search companies by name or industry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-12 py-4 bg-white dark:bg-dark-sidebar border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme_color text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-theme_color hover:bg-orange-600 text-white font-semibold rounded-2xl transition shadow-lg"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700 custom-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-theme_color transition-all"
              >
                <option value="">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.name}>{ind.name}</option>
                ))}
              </select>

              {(searchQuery || selectedIndustry) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-theme_color dark:text-dark-theme_color hover:underline font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              {pagination.total} companies
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-theme_color" size={40} />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20">
            <Building2 size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No companies found</h3>
            <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Companies Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => {
                const companyIndustries = (company.industries || []).map(i => i.industry?.name).filter(Boolean);
                const jobCount = company._count?.jobs || 0;

                return (
                  <a
                    href={`/companies/${company.id}`}
                    key={company.id}
                    className="group bg-white dark:bg-dark-sidebar rounded-2xl p-6 custom-shadow hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-theme_color/10 dark:bg-theme_color/20 border-2 border-slate-200 dark:border-slate-700 group-hover:border-theme_color dark:group-hover:border-dark-theme_color transition-all flex items-center justify-center">
                        <span className="text-xl font-bold text-theme_color">{getInitials(company.name)}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors">
                            {company.name}
                          </h3>
                          {company.isVerified && (
                            <div className="flex-shrink-0 w-6 h-6 bg-theme_color/10 rounded-full flex items-center justify-center">
                              <Shield size={14} className="text-theme_color" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {companyIndustries[0] || 'Company'}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 mb-4">
                      {company.country && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <MapPin size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <span>{company.address ? `${company.address}, ` : ''}{company.country}</span>
                        </div>
                      )}

                      {company.website && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Building2 size={16} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <span className="truncate">{company.website.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}

                      {companyIndustries.length > 1 && (
                        <div className="flex flex-wrap gap-1.5">
                          {companyIndustries.slice(0, 3).map((ind) => (
                            <span key={ind} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 rounded-lg">
                              {ind}
                            </span>
                          ))}
                          {companyIndustries.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-slate-500">+{companyIndustries.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Recruiter Company */}
                    {(company.recruiterCompanies || []).length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Users size={13} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Recruiting Agency</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {company.recruiterCompanies.slice(0, 2).map((rc) => (
                            <span key={rc.id} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-600 dark:text-blue-400 rounded-lg font-medium">
                              {rc.name}
                            </span>
                          ))}
                          {company.recruiterCompanies.length > 2 && (
                            <span className="px-2 py-0.5 text-xs text-slate-500">+{company.recruiterCompanies.length - 2} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-slate-200 dark:bg-slate-700 mb-4" />

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={14} className="text-theme_color dark:text-dark-theme_color" />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {company.totalVacancies || jobCount} {(company.totalVacancies || jobCount) === 1 ? 'Vacancy' : 'Vacancies'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {jobCount} {jobCount === 1 ? 'role' : 'roles'}
                        </span>
                      </div>

                      {jobCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-theme_color/10 rounded-full">
                          <div className="w-1.5 h-1.5 bg-theme_color rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-theme_color">Hiring</span>
                        </div>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => fetchCompanies(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 bg-white dark:bg-dark-sidebar border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchCompanies(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-white dark:bg-dark-sidebar border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export default AllCompanies;
