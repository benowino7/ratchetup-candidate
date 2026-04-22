import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Share2,
  BookmarkPlus,
  ArrowRight,
  Loader,
  Sparkles,
  Lock,
  X,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import Modal from "../allmodals/Modal";
import ApplyJob from "./Applyjob";
import SaveJob from "./SaveJob";

// ────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────

/** Compute match % using the backend's composite score or fallback to skill matching */
const computeMatchScore = (jobSkills, matchedSkills, recommendation) => {
  // Use the backend's composite score if available
  if (recommendation?.score != null && recommendation.score > 0) {
    const rawScore = recommendation.score;
    const percentage = Math.min(99, Math.round(30 + (70 * (1 - Math.exp(-rawScore / 40)))));
    return Math.max(percentage, 1);
  }
  if (!jobSkills?.length) return null;
  const matched = (matchedSkills ?? []).map((s) => s.toLowerCase());
  const hits = jobSkills.filter((s) =>
    matched.includes(s.skill.name.toLowerCase()),
  ).length;
  return Math.round((hits / jobSkills.length) * 100);
};

const extractRequirements = (description) => {
  const lines = description.split("\n").filter((line) => line.trim());
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
      break;
    }
  }

  return requirements.length > 0
    ? requirements
    : [
        "Relevant experience in the field",
        "Strong communication skills",
        "Ability to work in a team environment",
        "Problem-solving abilities",
      ];
};

const extractBenefits = () => [
  "Competitive salary",
  "Professional development opportunities",
  "Flexible working hours",
  "Team collaboration",
];

// ────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────

const JobRecommandationDetails = ({ isAiSubscribed2 }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apply, setApply] = useState(false);
  const [error, setError] = useState(null);
  const [jobToBeSaved, setJobToBeSaved] = useState(null);

  // Derive subscription status from token presence in sessionStorage
  const token = JSON.parse(sessionStorage.getItem("accessToken"));
  const isAiSubscribed = Boolean(isAiSubscribed2);

  // ─── FETCH ───
  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Attach token only for subscribed users
        const headers = { "Content-Type": "application/json" };
        if (isAiSubscribed) headers["Authorization"] = `Bearer ${token}`;

        // Try AI suggestions first (has match data), fall back to direct job fetch
        let jobData = null;
        let allJobs = [];

        if (isAiSubscribed) {
          const suggestionsRes = await fetch(`${BASE_URL}/job-seeker/jobs/suggestions`, { headers });
          if (suggestionsRes.ok) {
            const suggestionsResult = await suggestionsRes.json();
            allJobs = suggestionsResult.message?.jobs ?? [];
            jobData = allJobs.find((j) => j.id === id);
          }
        }

        // If not found in suggestions, fetch directly by ID
        if (!jobData) {
          const directRes = await fetch(`${BASE_URL}/public/jobs/${id}`);
          if (!directRes.ok) throw new Error("Job not found");
          const directResult = await directRes.json();
          jobData = directResult.data;
        }

        if (!jobData) throw new Error("Job not found");

        // Compute real AI match score — only when subscribed
        const aiMatchScore =
          isAiSubscribed && jobData.recommendation
            ? computeMatchScore(
                jobData.skills,
                jobData.recommendation.matchedSkills,
                jobData.recommendation,
              )
            : null;

        const matchedSkillNames =
          isAiSubscribed && jobData.recommendation
            ? jobData.recommendation.matchedSkills
            : [];

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
          },
          aiMatchScore, // null when not subscribed
          matchedSkills: matchedSkillNames,
          jobType: jobData.employmentType,
          experienceLevel: jobData.experienceLevel,
          postedDate: jobData.publishedAt || jobData.createdAt,
          category: jobData.industries?.[0]?.industry.name || "General",
          subCategory: jobData.industries?.[0]?.industry.slug || "",
          skills: jobData.skills.map((s) => s.skill.name),
          description: jobData.description,
          vacancies: jobData.vacancies,
          requirements: extractRequirements(jobData.description),
          benefits: extractBenefits(),
        };

        setJob(transformedJob);

        // Related jobs — fetch from same industry
        try {
          const industryId = jobData.industries?.[0]?.industryId;
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
                },
                aiMatchScore: null,
                jobType: relJob.employmentType,
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

    if (id) fetchJobData();
  }, [id]);

  // ─── LOADING ───
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

  // ─── ERROR ───
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
            onClick={() => navigate("/dashboard/recommendations")}
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const postedDate = new Date(job.postedDate);
  const daysAgo = Math.floor((Date.now() - postedDate) / 86400000);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* ─── STICKY HEADER ─── */}
      <div className="bg-white dark:bg-dark-sidebar border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-slate-600 dark:text-slate-400">
              <Building2 size={18} />
              <span className="font-medium">{job.company}</span>

              {/* AI Match badge — subscribed only */}
              {isAiSubscribed && job.aiMatchScore !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full border border-orange-200 dark:border-orange-800">
                  <Sparkles size={13} className="animate-pulse" />
                  {job.aiMatchScore}% AI Match
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-3 rounded-full hover:bg-theme_color/10 transition-colors">
              <Bookmark
                onClick={() => {
                  setJobToBeSaved(job);
                  setOpen(true);
                }}
                size={26}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
            <button
              title="Share"
              className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-gray-600 dark:text-gray-300"
            >
              <Share2 size={20} />
            </button>
            {job.applicationUrl && (
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 sm:px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-base"
              >
                <ExternalLink size={18} />
                Apply Externally
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ─── MAIN CONTENT ─── */}
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

            {/* AI Match breakdown — subscribed only */}
            {isAiSubscribed &&
              job.aiMatchScore !== null &&
              job.matchedSkills.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles
                      size={18}
                      className="text-orange-600 dark:text-orange-400 animate-pulse"
                    />
                    <h3 className="font-semibold text-orange-700 dark:text-orange-300">
                      AI Match: {job.aiMatchScore}%
                    </h3>
                  </div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                    Your profile matches these required skills:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {job.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full border border-orange-300 dark:border-orange-700"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Description */}
            <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-5 text-slate-900 dark:text-white">
                About the Role
              </h2>
              <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
                {/<[a-z][\s\S]*>/i.test(job.description) ? (
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                ) : (
                  job.description.split("\n").map((line, i) => (
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
                  {job.skills.map((skill, i) => {
                    const isMatched =
                      isAiSubscribed &&
                      job.matchedSkills
                        .map((s) => s.toLowerCase())
                        .includes(skill.toLowerCase());
                    return (
                      <span
                        key={i}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          isMatched
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isMatched && <span className="mr-1">✓</span>}
                        {skill}
                      </span>
                    );
                  })}
                </div>
                {isAiSubscribed && job.matchedSkills.length > 0 && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Highlighted skills match your profile
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ─── SIDEBAR ─── */}
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
                  <span className="text-sm">
                    {job.jobType.replace("_", " ")}
                  </span>
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

              {/* AI match summary in sidebar — subscribed only */}
              {isAiSubscribed && job.aiMatchScore !== null ? (
                <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <Sparkles
                    size={16}
                    className="text-orange-500 animate-pulse"
                  />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {job.aiMatchScore}% match with your profile
                  </span>
                </div>
              ) : !isAiSubscribed ? (
                <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Lock size={15} className="text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Subscribe to unlock AI match score
                  </span>
                </div>
              ) : null}

              {job.applicationUrl ? (
                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2 text-lg"
                >
                  <ExternalLink size={20} />
                  Apply Externally
                </a>
              ) : isAiSubscribed ? (
                <button
                  onClick={() => setApply(true)}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2 text-lg"
                >
                  <Briefcase size={20} />
                  Apply for this job
                </button>
              ) : (
                <Link
                  to={"/dashboard/subscriptions"}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-4 flex items-center justify-center gap-2 text-lg"
                >
                  <Briefcase size={20} />
                  Apply for this job
                </Link>
              )}
              <button
                onClick={() => navigate("/dashboard/recommendations")}
                className="w-full inline-block text-center py-3.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Back to all jobs
              </button>
            </div>
          </div>
        </div>

        {/* ─── RELATED JOBS ─── */}
        {relatedJobs.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                More {job.category} Jobs
              </h2>
              <a
                href={`/dashboard/recommendations?category=${encodeURIComponent(job.category)}`}
                className="flex items-center gap-2 text-orange-600 dark:text-orange-500 font-medium hover:text-orange-700 dark:hover:text-orange-400 transition"
              >
                View all <ArrowRight size={18} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedJobs.map((relJob) => (
                <a
                  href={`/dashboard/recommendations/${relJob.id}`}
                  key={relJob.id}
                  className="bg-white dark:bg-dark-sidebar rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all group cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 mb-2 line-clamp-2">
                    {relJob.title}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {relJob.company} • {relJob.location.split(",")[0]}
                  </div>
                  <div className="flex items-center justify-between">
                    {/* AI match on related cards — subscribed only */}
                    {isAiSubscribed && relJob.aiMatchScore !== null && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                        <Sparkles size={11} />
                        {relJob.aiMatchScore}%
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── APPLY MODAL ─── */}
      {job !== null && (
        <Modal
          isOpen={apply}
          onClose={() => setApply(false)}
          title={`Applying Job for ${job?.title} Position`}
          subtitle={`${job?.company} : Job application made simple`}
          size="xl"
        >
          <ApplyJob
            jobId={job?.id}
            jobTitle={job?.title}
            companyName={job?.company}
            onCancel={() => setApply(false)}
          />
        </Modal>
      )}
      {jobToBeSaved !== null && (
        <SaveJob
          open={jobToBeSaved !== null}
          onClose={() => setJobToBeSaved(null)}
          jobId={jobToBeSaved.id}
          jobTitle={jobToBeSaved.title}
          companyName={jobToBeSaved.company?.name}
        />
      )}
    </div>
  );
};

export default JobRecommandationDetails;
