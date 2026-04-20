import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Star,
  Share2,
  BookmarkPlus,
  ArrowRight,
  Loader,
  X,
  ExternalLink,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch job details and related jobs
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch single job by ID
        const response = await fetch(`${BASE_URL}/public/jobs/${id}`);

        if (!response.ok) {
          throw new Error("Job not found");
        }

        const result = await response.json();
        const jobData = result.data;

        if (!jobData) {
          throw new Error("Job not found");
        }

        // Transform the job data
        const transformedJob = {
          id: jobData.id,
          title: jobData.title,
          company: jobData.company.name,
          companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(jobData.company.name)}`,
          companyWebsite: jobData.company.website,
          companyCountry: jobData.company.country,
          location: jobData.locationName,
          locationType: jobData.isRemote ? "Remote" : "On-site",
          salary: {
            min: jobData.minSalary,
            max: jobData.maxSalary,
            currency: jobData.currency,
            frequency: "monthly",
          },
          matchScore: Math.floor(Math.random() * 20) + 80,
          jobType: (jobData.employmentType || "").replace(/_/g, " ").split(" ").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" "),
          experienceLevel: jobData.experienceLevel,
          postedDate: jobData.publishedAt || jobData.createdAt,
          urgency:
            jobData.status === "PUBLISHED" && Math.random() > 0.7
              ? "New"
              : null,
          category: jobData.industries[0]?.industry.name || "General",
          subCategory: jobData.industries[0]?.industry.slug || "",
          skills: jobData.skills.map((s) => s.skill.name),
          description: jobData.description,
          vacancies: jobData.vacancies,
          requirements: extractRequirements(jobData.description),
          benefits: extractBenefits(jobData.description),
          applyUrl: "/login",
          applicationUrl: jobData.applicationUrl || null,
        };

        setJob(transformedJob);

        // Fetch related jobs from same industry
        try {
          const industryId = jobData.industries[0]?.industryId;
          const relatedRes = await fetch(`${BASE_URL}/public/jobs?limit=4${industryId ? `&industryId=${industryId}` : ''}`);
          if (relatedRes.ok) {
            const relatedResult = await relatedRes.json();
            const related = relatedResult.data
              .filter((j) => j.id !== id)
              .slice(0, 3)
              .map((relJob) => ({
                id: relJob.id,
                title: relJob.title,
                company: relJob.company.name,
                location: relJob.locationName,
                salary: {
                  min: relJob.minSalary,
                  max: relJob.maxSalary,
                  currency: relJob.currency,
                  frequency: "monthly",
                },
                matchScore: Math.floor(Math.random() * 20) + 80,
                jobType:relJob.employmentType,
              }));
            setRelatedJobs(related);
          }
        } catch (relErr) {
          console.error("Error fetching related jobs:", relErr);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching job details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobData();
    }
  }, [id]);

  // Helper function to extract requirements from description
  const extractRequirements = (description) => {
    const lines = String(description || "").split("\n").filter((line) => line.trim());
    const requirements = [];

    let inRequirementsSection = false;
    for (let line of lines) {
      if (
        line.toLowerCase().includes("requirement") ||
        line.toLowerCase().includes("qualifications")
      ) {
        inRequirementsSection = true;
        continue;
      }
      if (inRequirementsSection && line.trim().startsWith("•")) {
        requirements.push(line.trim().substring(1).trim());
      } else if (inRequirementsSection && line.trim() && !line.includes("•")) {
        break; // End of requirements section
      }
    }

    // If no requirements found, generate generic ones
    if (requirements.length === 0) {
      return [
        "Relevant experience in the field",
        "Strong communication skills",
        "Ability to work in a team environment",
        "Problem-solving abilities",
      ];
    }

    return requirements;
  };

  // Helper function to extract benefits from description
  const extractBenefits = (description) => {
    return [
      "Competitive salary",
      "Professional development opportunities",
      "Flexible working hours",
      "Team collaboration",
    ];
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading job details...
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-dark-sidebar p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Job Not Found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate("/joblisting")}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  // If no job found
  if (!job) {
    return null;
  }

  const postedDate = new Date(job.postedDate);
  const now = new Date();
  const daysAgo = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Sticky Header Bar */}
      <div className="bg-white dark:bg-dark-sidebar border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-slate-600 dark:text-slate-400">
              <Building2 size={18} />
              <span className="font-medium">{job.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              title="Save job"
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300"
            >
              <BookmarkPlus size={20} />
            </button>
            <button
              title="Share"
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300"
            >
              <Share2 size={20} />
            </button>
            {job.applicationUrl ? (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  px-6 sm:px-8 py-3 bg-orange-600
                  hover:bg-orange-700
                  text-white font-semibold rounded-xl shadow-md hover:shadow-lg
                  transition-all flex items-center gap-2 text-base
                "
              >
                <ExternalLink size={18} />
                Apply Externally
              </a>
            ) : (
              <a
                href={`/login?redirect=/joblisting/${job.id}`}
                className="
                  px-6 sm:px-8 py-3 bg-orange-600
                  hover:bg-orange-700
                  text-white font-semibold rounded-xl shadow-md hover:shadow-lg
                  transition-all flex items-center gap-2 text-base
                "
              >
                <Briefcase size={18} />
                Apply Internally
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-dark-sidebar p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Location
                </div>
                <div className="text-base font-medium flex items-center gap-1.5 text-gray-600 dark:text-gray-300 line-clamp-2">
                  <MapPin size={16} className="flex-shrink-0" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {job.locationType}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-sidebar p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Posted
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-300">
                  {daysAgo === 0
                    ? "Today"
                    : daysAgo === 1
                      ? "Yesterday"
                      : `${daysAgo} days ago`}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-sidebar p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Vacancies
                </div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-500">
                  {job.vacancies}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  positions
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                About the Role
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                {/<[a-z][\s\S]*>/i.test(job.description || "") ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                ) : (
                  String(job.description || "").split("\n").map((line, i) => (
                    <p key={i} className="mb-4 last:mb-0 whitespace-pre-wrap">
                      {line}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
                <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                  Requirements
                </h2>
                <ul className="space-y-3 text-slate-700 dark:text-slate-300">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits.length > 0 && (
              <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
                <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                  Benefits & Perks
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 text-orange-500 text-lg">✓</div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md bg-slate-200 dark:bg-slate-700">
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/80?text=Co")
                    }
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {job.company}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {job.category} • {job.companyCountry}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="flex-shrink-0 mt-1" />
                  <span className="text-sm">{job.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={18} />
                  <span className="text-sm">{job.jobType}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} />
                  <span className="text-sm">{job.experienceLevel} Level</span>
                </div>
                {job.companyWebsite && (
                  <div className="flex items-center gap-3">
                    <Building2 size={18} />
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 dark:text-orange-500 hover:underline"
                    >
                      Company Website
                    </a>
                  </div>
                )}
              </div>

              {job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    w-full py-4 bg-orange-600
                    hover:bg-orange-700
                    text-white font-bold rounded-xl shadow-md hover:shadow-lg
                    transition-all mb-4 flex items-center justify-center gap-2 text-lg
                  "
                >
                  <ExternalLink size={20} />
                  Apply Externally
                </a>
              ) : (
                <a
                  href={`/login?redirect=/joblisting/${job.id}`}
                  className="
                    w-full py-4 bg-orange-600
                    hover:bg-orange-700
                    text-white font-bold rounded-xl shadow-md hover:shadow-lg
                    transition-all mb-4 flex items-center justify-center gap-2 text-lg
                  "
                >
                  <Briefcase size={20} />
                  Apply Internally
                </a>
              )}

              <button
                onClick={() => navigate("/joblisting")}
                className="
                  w-full inline-block text-center py-3.5 border border-slate-300 dark:border-slate-700
                  text-slate-700 dark:text-slate-300 font-medium rounded-xl
                  hover:bg-slate-50 dark:hover:bg-slate-800 transition
                "
              >
                Back to all jobs
              </button>
            </div>
          </div>
        </div>

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                More {job.category} Jobs
              </h2>
              <a
                href={`/joblisting?category=${encodeURIComponent(job.category)}`}
                className="
                  flex items-center gap-2 text-orange-600 dark:text-orange-500
                  font-medium hover:text-orange-700 dark:hover:text-orange-400 transition
                "
              >
                View all <ArrowRight size={18} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relJob) => (
                <a
                  href={`/joblisting/${relJob.id}`}
                  key={relJob.id}
                  className="
                    bg-white dark:bg-dark-sidebar rounded-xl border border-slate-200 dark:border-slate-800
                    p-5 hover:border-orange-400 dark:hover:border-orange-500
                    hover:shadow-md transition-all group cursor-pointer
                  "
                >
                  <h3
                    className="
                      text-lg font-semibold text-slate-900 dark:text-white
                      group-hover:text-orange-600 dark:group-hover:text-orange-400 mb-2 line-clamp-2
                    "
                  >
                    {relJob.title}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {relJob.company} • {String(relJob.location || "").split(",")[0] || "Remote"}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default JobDetails;
