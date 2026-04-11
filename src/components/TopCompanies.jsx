import { useState, useEffect } from 'react';
import { Building2, MapPin, Briefcase, Shield, Loader, Users } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

const TopCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch(`${BASE_URL}/public/companies?limit=6`);
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          setCompanies(data.result.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <section className="bg-[#e7f0fa] dark:bg-gray-950 py-8 transition-colors duration-300">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-12">
          <Loader className="animate-spin text-theme_color" size={32} />
        </div>
      </section>
    );
  }

  if (companies.length === 0) return null;

  return (
    <section className="bg-[#e7f0fa] dark:bg-gray-950 py-8 transition-colors duration-300">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme_color/10 dark:bg-theme_color/10 rounded-full border border-theme_color/20 dark:border-theme_color mb-6">
            <Shield size={16} className="text-theme_color dark:text-theme_color" />
            <span className="text-sm font-semibold text-theme_color dark:text-theme_color">Verified Employers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
            Top Companies Hiring{' '}
            <span className="text-teal-600">
              Right Now
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Trusted employers actively recruiting top talent across Dubai and beyond
          </p>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {companies.map((company, index) => {
            const industries = (company.industries || []).map(i => i.industry?.name).filter(Boolean);
            const jobCount = company._count?.jobs || 0;

            return (
              <a
                href={`/companies/${company.id}`}
                key={company.id}
                className="group bg-white dark:bg-dark-sidebar rounded-xl sm:rounded-2xl p-4 sm:p-6 custom-shadow hover:shadow-2xl transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden bg-theme_color/10 dark:bg-theme_color/20 border-2 border-slate-200 dark:border-slate-700 group-hover:border-theme_color dark:group-hover:border-dark-theme_color transition-all flex items-center justify-center">
                    <span className="text-base sm:text-xl font-bold text-theme_color">{getInitials(company.name)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors">
                        {company.name}
                      </h3>
                      {company.isVerified && (
                        <div className="flex-shrink-0 w-6 h-6 bg-theme_color/10 rounded-full flex items-center justify-center">
                          <Shield size={14} className="text-theme_color" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {industries[0] || 'Company'}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
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
                </div>

                {/* Recruiter Company */}
                {(company.recruiterCompanies || []).length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Users size={12} className="text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Recruiter</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {company.recruiterCompanies[0].name}
                      {company.recruiterCompanies.length > 1 && ` +${company.recruiterCompanies.length - 1}`}
                    </span>
                  </div>
                )}

                {/* Divider */}
                <div className="h-px bg-slate-200 dark:bg-slate-700 mb-3 sm:mb-4" />

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-theme_color dark:text-dark-theme_color" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {company.totalVacancies || jobCount} {(company.totalVacancies || jobCount) === 1 ? 'Vacancy' : 'Vacancies'}
                    </span>
                  </div>

                  {jobCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-theme_color/10 rounded-full">
                      <div className="w-1.5 h-1.5 bg-theme_color rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-theme_color">Hiring</span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* View All */}
        <div className="text-center">
          <a
            href="/companies"
            className="inline-flex items-center gap-2 px-8 py-3 bg-theme_color hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg"
          >
            View All Companies
          </a>
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;
