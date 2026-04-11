import { useState, useEffect } from "react";
import {
  Camera,
  Plus,
  X,
  Edit2,
  Save,
  XCircle,
  Trash2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import ResumeSection from "./ResumeSection";
import SkillsSection from "./Skillssection";

// ─── HTML content helper ─────────────────────────────────────────────────────
const RichText = ({ html, className = "" }) => {
  if (!html) return null;
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  if (isHtml) {
    return (
      <div
        className={`prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <p className={`break-words overflow-hidden ${className}`}>{html}</p>;
};

// ─── Auth helpers (same pattern as MyApplications.jsx) ───────────────────────

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem("accessToken") || "{}");
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

const Profile = () => {
  const [userData] = useState(
    JSON.parse(sessionStorage.getItem("user")) || {},
  );

  // ── Loading / error state for profile fetch ──
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [profileData, setProfileData] = useState({
    basicInfo: {
      firstName: userData?.firstName || "--",
      lastName: userData?.lastName || "--",
      email: userData?.email || "--",
      phone:
        (userData?.countryCode || "") + (userData?.phoneNumber || "") || "--",
      location: userData?.location || "",
      nationality: userData?.nationality || "",
      photo: null,
    },
    summary: "",
    hasVisa: false,
    hasWorkPermit: false,
    languages: [],
    awards: [],
    interests: [],
    experience: [],
    education: [],
    certifications: [],
    resume: {
      file: null,
      uploadedDate: null,
    },
    portfolio: {
      website: "",
      linkedin: "",
      github: "",
      behance: "",
      other: "",
    },
    preferences: {
      jobTitles: [],
      industries: [],
      jobType: "",
      workMode: "",
      locations: [],
      salary: { min: 0, max: 0, currency: "USD" },
      availability: "",
      relocate: false,
    },
    visibility: {
      profileVisible: true,
      resumeVisible: true,
      allowContact: true,
    },
  });

  // ── Fetch profile from API on mount ──
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError("");
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/profile`, {
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const json = await res.json();
        const data = json.message || json.data || json;
        // Profile data is nested under jobSeekerProfile
        const profile = data.jobSeekerProfile || {};

        // Also refresh sessionStorage user data if available
        const user = JSON.parse(sessionStorage.getItem("user")) || {};

        // Extract arrays from profile (DB JSON fields)
        const experience = Array.isArray(profile.experience) ? profile.experience : [];
        const education = Array.isArray(profile.education) ? profile.education : [];
        const certifications = Array.isArray(profile.certifications) ? profile.certifications : [];
        const skills = Array.isArray(profile.skills) ? profile.skills : [];
        const cvs = Array.isArray(profile.cvs) ? profile.cvs : [];
        const languages = Array.isArray(profile.languages) ? profile.languages : [];
        const awards = Array.isArray(profile.awards) ? profile.awards : [];
        const interests = Array.isArray(profile.interests) ? profile.interests : [];

        setProfileData((prev) => ({
          ...prev,
          basicInfo: {
            firstName: data.firstName || user.firstName || "--",
            lastName: data.lastName || user.lastName || "--",
            email: data.email || user.email || "--",
            phone:
              data.phone ||
              data.phoneNumber ||
              (user.countryCode || "") + (user.phoneNumber || "") ||
              "--",
            location: data.location || user.location || "",
            nationality: data.nationality || user.nationality || "",
            photo: data.photo || data.avatar || null,
          },
          summary: profile.summary || data.summary || data.bio || "",
          hasVisa: profile.hasVisa || false,
          hasWorkPermit: profile.hasWorkPermit || false,
          languages,
          awards,
          interests,
          skills,
          experience: experience.map((exp, i) => ({
            id: exp.id || i + 1,
            jobTitle: exp.jobTitle || exp.title || "",
            company: exp.company || exp.companyName || "",
            location: exp.location || "",
            employmentType: exp.employmentType || exp.type || "",
            startDate: exp.startDate || { month: "", year: "" },
            endDate: exp.endDate || { month: "", year: "", present: false },
            responsibilities: exp.responsibilities || exp.description || "",
          })),
          education: education.map((edu, i) => ({
            id: edu.id || i + 1,
            degree: edu.degree || "",
            institution: edu.institution || edu.school || "",
            fieldOfStudy: edu.fieldOfStudy || edu.field || "",
            startYear: edu.startYear || "",
            endYear: edu.endYear || "",
          })),
          certifications: certifications.map((cert, i) => ({
            id: cert.id || i + 1,
            name: cert.name || cert.title || "",
            organization: cert.organization || cert.issuer || "",
            issueYear: cert.issueYear || cert.issuedAt || "",
            expiryYear: cert.expiryYear || cert.expiresAt || "",
            file: cert.file || null,
          })),
          resume: {
            ...prev.resume,
            cvs,
          },
          portfolio: {
            website: data.website || data.portfolio?.website || "",
            linkedin: data.linkedin || data.portfolio?.linkedin || "",
            github: data.github || data.portfolio?.github || "",
            behance: data.behance || data.portfolio?.behance || "",
            other: data.other || data.portfolio?.other || "",
          },
          preferences: data.preferences || prev.preferences,
          visibility: data.visibility || prev.visibility,
        }));
      } catch (err) {
        setProfileError(err.message);
        // Still show whatever we have from sessionStorage
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [editingSection, setEditingSection] = useState(null);
  const [tempData, setTempData] = useState({});

  const calculateCompletion = () => {
    // 6 core sections matching backend dashboard calculation
    const checks = {
      basicInfo: !!(
        profileData.basicInfo.firstName &&
        profileData.basicInfo.firstName !== "--" &&
        profileData.basicInfo.lastName &&
        profileData.basicInfo.lastName !== "--" &&
        profileData.basicInfo.phone &&
        profileData.basicInfo.phone !== "--"
      ),
      cvUploaded: !!(profileData.resume?.file || profileData.resume?.cvs?.length > 0),
      skillsAdded: !!(profileData.skills?.length > 0),
      experienceAdded: profileData.experience.length > 0,
      educationAdded: profileData.education.length > 0,
      certificationsAdded: profileData.certifications.length > 0,
    };

    const completedCount = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;

    return Math.round((completedCount / total) * 100);
  };

  const startEdit = (section, data) => {
    setEditingSection(section);
    setTempData(JSON.parse(JSON.stringify(data)));
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setTempData({});
  };

  const saveEdit = async (section, data) => {
    // Update local state immediately
    setProfileData((prev) => ({
      ...prev,
      [section]: data,
    }));
    setEditingSection(null);
    setTempData({});

    // Persist to backend for supported fields
    const persistableFields = ["summary", "languages", "awards", "interests", "workAuth"];
    if (persistableFields.includes(section)) {
      try {
        const payload = section === "workAuth" ? data : { [section]: data };
        const res = await fetch(`${BASE_URL}/job-seeker/profile`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.error(`Failed to save ${section}:`, err.message || res.statusText);
        }
      } catch (err) {
        console.error(`Failed to save ${section}:`, err.message);
      }
    }
  };

  const addItem = (section, newItem) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: [...prev[section], { ...newItem, id: Date.now() }],
    }));
  };

  const removeItem = (section, id) => {
    setProfileData((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== id),
    }));
  };

  const completion = calculateCompletion();

  // ── Loading state ──
  if (profileLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-theme_color animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-[90rem] mx-auto py-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your professional information for better job matches
          </p>
        </div>

        {/* Profile fetch error banner */}
        {profileError && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                Could not load full profile from server
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                {profileError}. Showing locally available data.
              </p>
            </div>
          </div>
        )}

        {/* Profile Completion */}
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg shadow-sm p-6 mb-6 border border-theme_color/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Profile Completion
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your profile is{" "}
                <span className="font-bold text-theme_color">
                  {completion}%
                </span>{" "}
                complete
              </p>
            </div>
            {completion === 100 && (
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Complete!
                </span>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-teal-600 h-3 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${completion}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          {completion < 100 ? (
            <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-theme_color flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Complete your profile to stand out
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Profiles with {completion < 50 ? "50%" : "100%"} completion
                  get{" "}
                  <span className="font-semibold text-theme_color">
                    {completion < 50 ? "3x" : "5x"} more views
                  </span>{" "}
                  from employers
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Excellent! Your profile is optimized
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  You're getting maximum visibility to employers and AI job
                  matching
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <ProfileCard
          title="Basic Information"
          onEdit={() => startEdit("basicInfo", profileData.basicInfo)}
        >
          {editingSection === "basicInfo" ? (
            <BasicInfoEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("basicInfo", tempData)}
              onCancel={cancelEdit}
            />
          ) : (
            <BasicInfoView data={profileData.basicInfo} />
          )}
        </ProfileCard>

        {/* Work Authorization */}
        <ProfileCard
          title="Work Authorization"
          onEdit={() => startEdit("workAuth", { hasVisa: profileData.hasVisa, hasWorkPermit: profileData.hasWorkPermit })}
        >
          {editingSection === "workAuth" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editHasVisa"
                  checked={tempData.hasVisa || false}
                  onChange={(e) => setTempData((prev) => ({ ...prev, hasVisa: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="editHasVisa" className="text-sm text-gray-700 dark:text-gray-300">I have a valid visa</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editHasWorkPermit"
                  checked={tempData.hasWorkPermit || false}
                  onChange={(e) => setTempData((prev) => ({ ...prev, hasWorkPermit: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                />
                <label htmlFor="editHasWorkPermit" className="text-sm text-gray-700 dark:text-gray-300">I have a valid work permit</label>
              </div>
              <EditActions
                onSave={() => {
                  setProfileData((prev) => ({ ...prev, hasVisa: tempData.hasVisa, hasWorkPermit: tempData.hasWorkPermit }));
                  setEditingSection(null);
                  saveEdit("workAuth", { hasVisa: tempData.hasVisa, hasWorkPermit: tempData.hasWorkPermit });
                }}
                onCancel={cancelEdit}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${profileData.hasVisa ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {profileData.hasVisa ? '✓' : '✗'} Visa
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${profileData.hasWorkPermit ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {profileData.hasWorkPermit ? '✓' : '✗'} Work Permit
              </span>
            </div>
          )}
        </ProfileCard>

        {/* Professional Summary */}
        <ProfileCard
          title="Professional Summary"
          onEdit={() => startEdit("summary", profileData.summary)}
        >
          {editingSection === "summary" ? (
            <div className="space-y-4">
              <textarea
                value={tempData}
                onChange={(e) => setTempData(e.target.value.slice(0, 300))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows="4"
                maxLength="300"
                placeholder="Write a brief professional summary..."
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {(tempData || "").length}/300 characters
                </span>
                <EditActions
                  onSave={() => saveEdit("summary", tempData)}
                  onCancel={cancelEdit}
                />
              </div>
            </div>
          ) : profileData.summary ? (
            <RichText html={profileData.summary} className="text-gray-700 dark:text-gray-300" />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              No summary added yet. Add a professional summary to stand out.
            </p>
          )}
        </ProfileCard>

        {/* Skills -- API-connected */}
        <ProfileCard title="Skills">
          <SkillsSection />
        </ProfileCard>

        {/* Work Experience */}
        <ProfileCard
          title="Work Experience"
          onAdd={() => setEditingSection("experience-new")}
        >
          <div className="space-y-4">
            {profileData.experience.length === 0 &&
              editingSection !== "experience-new" && (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No experience added yet. Add your work experience to improve
                  job matches.
                </p>
              )}
            {profileData.experience.map((exp) => (
              <ExperienceItem
                key={exp.id}
                data={exp}
                onRemove={() => removeItem("experience", exp.id)}
              />
            ))}
            {editingSection === "experience-new" && (
              <ExperienceForm
                onSave={(data) => {
                  addItem("experience", data);
                  setEditingSection(null);
                }}
                onCancel={cancelEdit}
              />
            )}
          </div>
        </ProfileCard>

        {/* Education */}
        <ProfileCard
          title="Education"
          onAdd={() => setEditingSection("education-new")}
        >
          <div className="space-y-4">
            {profileData.education.length === 0 &&
              editingSection !== "education-new" && (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No education added yet. Add your educational background.
                </p>
              )}
            {profileData.education.map((edu) => (
              <EducationItem
                key={edu.id}
                data={edu}
                onRemove={() => removeItem("education", edu.id)}
              />
            ))}
            {editingSection === "education-new" && (
              <EducationForm
                onSave={(data) => {
                  addItem("education", data);
                  setEditingSection(null);
                }}
                onCancel={cancelEdit}
              />
            )}
          </div>
        </ProfileCard>

        {/* Certifications */}
        <ProfileCard
          title="Certifications & Licenses"
          onAdd={() => setEditingSection("certifications-new")}
        >
          <div className="space-y-4">
            {profileData.certifications.length === 0 &&
              editingSection !== "certifications-new" && (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  No certifications added yet. Add certifications to boost your
                  profile.
                </p>
              )}
            {profileData.certifications.map((cert) => (
              <CertificationItem
                key={cert.id}
                data={cert}
                onRemove={() => removeItem("certifications", cert.id)}
              />
            ))}
            {editingSection === "certifications-new" && (
              <CertificationForm
                onSave={(data) => {
                  addItem("certifications", data);
                  setEditingSection(null);
                }}
                onCancel={cancelEdit}
              />
            )}
          </div>
        </ProfileCard>

        {/* Languages */}
        <ProfileCard
          title="Languages"
          onEdit={() => startEdit("languages", profileData.languages)}
        >
          {editingSection === "languages" ? (
            <LanguagesEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("languages", tempData)}
              onCancel={cancelEdit}
            />
          ) : profileData.languages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.languages.map((lang, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
                >
                  {typeof lang === "string" ? lang : lang.name}
                  {lang.proficiency && (
                    <span className="text-xs text-blue-500 dark:text-blue-400">
                      ({lang.proficiency})
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              No languages added yet.
            </p>
          )}
        </ProfileCard>

        {/* Awards */}
        <ProfileCard
          title="Awards & Achievements"
          onEdit={() => startEdit("awards", profileData.awards)}
        >
          {editingSection === "awards" ? (
            <AwardsEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("awards", tempData)}
              onCancel={cancelEdit}
            />
          ) : profileData.awards.length > 0 ? (
            <div className="space-y-3">
              {profileData.awards.map((award, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 text-sm">&#9733;</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {typeof award === "string" ? award : award.title}
                    </p>
                    {award.issuer && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{award.issuer}</p>
                    )}
                    {award.date && (
                      <p className="text-xs text-gray-400">{award.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              No awards added yet.
            </p>
          )}
        </ProfileCard>

        {/* Interests */}
        <ProfileCard
          title="Interests"
          onEdit={() => startEdit("interests", profileData.interests)}
        >
          {editingSection === "interests" ? (
            <InterestsEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("interests", tempData)}
              onCancel={cancelEdit}
            />
          ) : profileData.interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profileData.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700"
                >
                  {typeof interest === "string" ? interest : interest.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">
              No interests added yet.
            </p>
          )}
        </ProfileCard>

        {/* Resume / CV */}
        <ProfileCard title="Resume / CV">
          <ResumeSection />
        </ProfileCard>

        {/* Portfolio & Links */}
        <ProfileCard
          title="Portfolio & Links"
          onEdit={() => startEdit("portfolio", profileData.portfolio)}
        >
          {editingSection === "portfolio" ? (
            <PortfolioEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("portfolio", tempData)}
              onCancel={cancelEdit}
            />
          ) : (
            <PortfolioView data={profileData.portfolio} />
          )}
        </ProfileCard>

        {/* Job Preferences */}
        <ProfileCard
          title="Job Preferences"
          subtitle="Help us match you with the right opportunities"
          onEdit={() => startEdit("preferences", profileData.preferences)}
        >
          {editingSection === "preferences" ? (
            <PreferencesEdit
              data={tempData}
              setData={setTempData}
              onSave={() => saveEdit("preferences", tempData)}
              onCancel={cancelEdit}
            />
          ) : (
            <PreferencesView data={profileData.preferences} />
          )}
        </ProfileCard>

        {/* Privacy & Visibility */}
        <ProfileCard title="Privacy & Visibility">
          <VisibilitySettings
            data={profileData.visibility}
            setData={(data) =>
              setProfileData((prev) => ({ ...prev, visibility: data }))
            }
          />
        </ProfileCard>
      </div>
    </div>
  );
};

const ProfileCard = ({ title, subtitle, children, onEdit, onAdd }) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6 overflow-hidden">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-theme_color hover:bg-theme_color/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
        {onAdd && (
          <button
            onClick={onAdd}
            className="p-2 text-theme_color hover:bg-theme_color/10 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
    {children}
  </div>
);

const EditActions = ({ onSave, onCancel }) => (
  <div className="flex gap-2">
    <button
      onClick={onCancel}
      className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
    >
      <XCircle className="w-4 h-4" />
      Cancel
    </button>
    <button
      onClick={onSave}
      className="px-4 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors flex items-center gap-2"
    >
      <Save className="w-4 h-4" />
      Save
    </button>
  </div>
);

const BasicInfoView = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="relative">
        <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
          {(data.firstName || "-")[0]}
          {(data.lastName || "-")[0]}
        </div>
        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {data.firstName} {data.lastName}
        </h3>
        {data.location && (
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            {data.location}
          </p>
        )}
      </div>
    </div>
    <InfoItem label="Email" value={data.email} icon="mail" />
    <InfoItem label="Phone" value={data.phone} icon="phone" />
    {data.location && (
      <InfoItem label="Location" value={data.location} icon="location" />
    )}
    {data.nationality && (
      <InfoItem label="Nationality" value={data.nationality} icon="globe" />
    )}
  </div>
);

const BasicInfoEdit = ({ data, setData, onSave, onCancel }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputField
        label="First Name"
        value={data.firstName}
        onChange={(v) => setData({ ...data, firstName: v })}
      />
      <InputField
        label="Last Name"
        value={data.lastName}
        onChange={(v) => setData({ ...data, lastName: v })}
      />
      <InputField label="Email" value={data.email} disabled />
      <InputField
        label="Phone Number"
        value={data.phone}
        onChange={(v) => setData({ ...data, phone: v })}
      />
      <InputField
        label="Current Location"
        value={data.location}
        onChange={(v) => setData({ ...data, location: v })}
      />
      <SelectField
        label="Nationality"
        value={data.nationality}
        onChange={(v) => setData({ ...data, nationality: v })}
        options={[
          "",
          "Kenyan",
          "Emirati",
          "Indian",
          "Pakistani",
          "Egyptian",
          "Filipino",
          "Other",
        ]}
      />
    </div>
    <EditActions onSave={onSave} onCancel={onCancel} />
  </div>
);

const ExperienceItem = ({ data, onRemove }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group overflow-hidden">
    <button
      onClick={onRemove}
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
    >
      <Trash2 className="w-4 h-4" />
    </button>
    <h3 className="font-semibold text-gray-900 dark:text-white">
      {data.jobTitle || "Untitled Position"}
    </h3>
    {data.company && <p className="text-theme_color">{data.company}</p>}
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {[data.location, data.employmentType].filter(Boolean).join(" - ")}
    </p>
    {(data.startDate?.month || data.startDate?.year) && (
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        {data.startDate.month ? `${data.startDate.month}/` : ""}
        {data.startDate.year || ""} -{" "}
        {data.endDate?.present
          ? "Present"
          : `${data.endDate?.month ? `${data.endDate.month}/` : ""}${data.endDate?.year || ""}`}
      </p>
    )}
    {data.responsibilities && (
      <div className="mt-2">
        <RichText html={data.responsibilities} className="text-sm text-gray-700 dark:text-gray-300" />
      </div>
    )}
  </div>
);

const ExperienceForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    jobTitle: "",
    company: "",
    location: "",
    employmentType: "Full-time",
    startDate: { month: "", year: "" },
    endDate: { month: "", year: "", present: false },
    responsibilities: "",
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Job Title"
          value={formData.jobTitle}
          onChange={(v) => setFormData({ ...formData, jobTitle: v })}
        />
        <InputField
          label="Company"
          value={formData.company}
          onChange={(v) => setFormData({ ...formData, company: v })}
        />
        <InputField
          label="Location"
          value={formData.location}
          onChange={(v) => setFormData({ ...formData, location: v })}
        />
        <SelectField
          label="Employment Type"
          value={formData.employmentType}
          onChange={(v) => setFormData({ ...formData, employmentType: v })}
          options={["Full-time", "Part-time", "Contract", "Freelance"]}
        />
        <div className="flex gap-2">
          <InputField
            label="Start Month"
            value={formData.startDate.month}
            onChange={(v) =>
              setFormData({
                ...formData,
                startDate: { ...formData.startDate, month: v },
              })
            }
            placeholder="MM"
          />
          <InputField
            label="Start Year"
            value={formData.startDate.year}
            onChange={(v) =>
              setFormData({
                ...formData,
                startDate: { ...formData.startDate, year: v },
              })
            }
            placeholder="YYYY"
          />
        </div>
        <div className="flex gap-2">
          <InputField
            label="End Month"
            value={formData.endDate.month}
            onChange={(v) =>
              setFormData({
                ...formData,
                endDate: { ...formData.endDate, month: v },
              })
            }
            placeholder="MM"
            disabled={formData.endDate.present}
          />
          <InputField
            label="End Year"
            value={formData.endDate.year}
            onChange={(v) =>
              setFormData({
                ...formData,
                endDate: { ...formData.endDate, year: v },
              })
            }
            placeholder="YYYY"
            disabled={formData.endDate.present}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={formData.endDate.present}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  endDate: { ...formData.endDate, present: e.target.checked },
                })
              }
              className="rounded"
            />
            Present
          </label>
        </div>
      </div>
      <textarea
        value={formData.responsibilities}
        onChange={(e) =>
          setFormData({ ...formData, responsibilities: e.target.value })
        }
        placeholder="Describe your responsibilities and achievements..."
        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        rows="3"
      />
      <EditActions onSave={() => onSave(formData)} onCancel={onCancel} />
    </div>
  );
};

const EducationItem = ({ data, onRemove }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group">
    <button
      onClick={onRemove}
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
    >
      <Trash2 className="w-4 h-4" />
    </button>
    <h3 className="font-semibold text-gray-900 dark:text-white">
      {data.degree || "Untitled Degree"}
    </h3>
    {data.institution && (
      <p className="text-theme_color">{data.institution}</p>
    )}
    {data.fieldOfStudy && (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {data.fieldOfStudy}
      </p>
    )}
    {(data.startYear || data.endYear) && (
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        {data.startYear} - {data.endYear}
      </p>
    )}
  </div>
);

const EducationForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    degree: "",
    institution: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Degree"
          value={formData.degree}
          onChange={(v) => setFormData({ ...formData, degree: v })}
        />
        <InputField
          label="Institution"
          value={formData.institution}
          onChange={(v) => setFormData({ ...formData, institution: v })}
        />
        <InputField
          label="Field of Study"
          value={formData.fieldOfStudy}
          onChange={(v) => setFormData({ ...formData, fieldOfStudy: v })}
        />
        <div className="flex gap-2">
          <InputField
            label="Start Year"
            value={formData.startYear}
            onChange={(v) => setFormData({ ...formData, startYear: v })}
            placeholder="YYYY"
          />
          <InputField
            label="End Year"
            value={formData.endYear}
            onChange={(v) => setFormData({ ...formData, endYear: v })}
            placeholder="YYYY"
          />
        </div>
      </div>
      <EditActions onSave={() => onSave(formData)} onCancel={onCancel} />
    </div>
  );
};

const CertificationItem = ({ data, onRemove }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group">
    <button
      onClick={onRemove}
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
    >
      <Trash2 className="w-4 h-4" />
    </button>
    <h3 className="font-semibold text-gray-900 dark:text-white">
      {data.name || "Untitled Certification"}
    </h3>
    {data.organization && (
      <p className="text-theme_color">{data.organization}</p>
    )}
    {(data.issueYear || data.expiryYear) && (
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
        {data.issueYear ? `Issued: ${data.issueYear}` : ""}
        {data.expiryYear ? ` - Expires: ${data.expiryYear}` : ""}
      </p>
    )}
  </div>
);

const CertificationForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    issueYear: "",
    expiryYear: "",
    file: null,
  });

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Certification Name"
          value={formData.name}
          onChange={(v) => setFormData({ ...formData, name: v })}
        />
        <InputField
          label="Issuing Organization"
          value={formData.organization}
          onChange={(v) => setFormData({ ...formData, organization: v })}
        />
        <InputField
          label="Issue Year"
          value={formData.issueYear}
          onChange={(v) => setFormData({ ...formData, issueYear: v })}
          placeholder="YYYY"
        />
        <InputField
          label="Expiry Year (Optional)"
          value={formData.expiryYear}
          onChange={(v) => setFormData({ ...formData, expiryYear: v })}
          placeholder="YYYY"
        />
      </div>
      <EditActions onSave={() => onSave(formData)} onCancel={onCancel} />
    </div>
  );
};

const PortfolioView = ({ data }) => {
  const links = [
    { label: "Website", value: data.website, icon: ExternalLink },
    { label: "LinkedIn", value: data.linkedin, icon: ExternalLink },
    { label: "GitHub", value: data.github, icon: ExternalLink },
    { label: "Behance", value: data.behance, icon: ExternalLink },
    { label: "Other", value: data.other, icon: ExternalLink },
  ].filter((link) => link.value);

  return (
    <div className="space-y-3">
      {links.length > 0 ? (
        links.map((link, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {link.label}
              </p>
              <a
                href={link.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme_color hover:underline flex items-center gap-1"
              >
                {link.value}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400 dark:text-gray-500 italic">
          No portfolio links added yet
        </p>
      )}
    </div>
  );
};

const PortfolioEdit = ({ data, setData, onSave, onCancel }) => (
  <div className="space-y-4">
    <InputField
      label="Portfolio Website"
      value={data.website}
      onChange={(v) => setData({ ...data, website: v })}
      placeholder="https://yourportfolio.com"
    />
    <InputField
      label="LinkedIn"
      value={data.linkedin}
      onChange={(v) => setData({ ...data, linkedin: v })}
      placeholder="https://linkedin.com/in/yourprofile"
    />
    <InputField
      label="GitHub"
      value={data.github}
      onChange={(v) => setData({ ...data, github: v })}
      placeholder="https://github.com/yourusername"
    />
    <InputField
      label="Behance"
      value={data.behance}
      onChange={(v) => setData({ ...data, behance: v })}
      placeholder="https://behance.net/yourprofile"
    />
    <InputField
      label="Other Link"
      value={data.other}
      onChange={(v) => setData({ ...data, other: v })}
      placeholder="Any other professional link"
    />
    <EditActions onSave={onSave} onCancel={onCancel} />
  </div>
);

const PreferencesView = ({ data }) => (
  <div className="space-y-4">
    {(!data.jobTitles?.length &&
      !data.industries?.length &&
      !data.jobType &&
      !data.workMode) ? (
      <p className="text-gray-400 dark:text-gray-500 italic">
        No preferences set yet. Edit to add your job preferences.
      </p>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.jobTitles?.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Preferred Job Titles
              </p>
              <div className="flex flex-wrap gap-2">
                {data.jobTitles.map((title, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-theme_color/10 text-theme_color rounded-full text-sm"
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.industries?.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Industries
              </p>
              <div className="flex flex-wrap gap-2">
                {data.industries.map((industry, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-theme_color/10 text-theme_color rounded-full text-sm"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.jobType && <InfoItem label="Job Type" value={data.jobType} />}
          {data.workMode && (
            <InfoItem label="Work Mode" value={data.workMode} />
          )}
          {data.availability && (
            <InfoItem label="Availability" value={data.availability} />
          )}
        </div>
        {data.locations?.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Preferred Locations
            </p>
            <div className="flex flex-wrap gap-2">
              {data.locations.map((location, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                >
                  {location}
                </span>
              ))}
            </div>
          </div>
        )}
        {(data.salary?.min > 0 || data.salary?.max > 0) && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Salary Expectation
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {data.salary.currency || "USD"}{" "}
              {(data.salary.min || 0).toLocaleString()} -{" "}
              {(data.salary.max || 0).toLocaleString()}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CheckCircle
            className={`w-5 h-5 ${data.relocate ? "text-green-500" : "text-gray-400"}`}
          />
          <span className="text-gray-700 dark:text-gray-300">
            {data.relocate ? "Open to relocation" : "Not open to relocation"}
          </span>
        </div>
      </>
    )}
  </div>
);

const PreferencesEdit = ({ data, setData, onSave, onCancel }) => {
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const addJobTitle = () => {
    if (newJobTitle && !(data.jobTitles || []).includes(newJobTitle)) {
      setData({
        ...data,
        jobTitles: [...(data.jobTitles || []), newJobTitle],
      });
      setNewJobTitle("");
    }
  };

  const removeJobTitle = (title) => {
    setData({
      ...data,
      jobTitles: (data.jobTitles || []).filter((t) => t !== title),
    });
  };

  const addIndustry = () => {
    if (newIndustry && !(data.industries || []).includes(newIndustry)) {
      setData({
        ...data,
        industries: [...(data.industries || []), newIndustry],
      });
      setNewIndustry("");
    }
  };

  const removeIndustry = (industry) => {
    setData({
      ...data,
      industries: (data.industries || []).filter((i) => i !== industry),
    });
  };

  const addLocation = () => {
    if (newLocation && !(data.locations || []).includes(newLocation)) {
      setData({
        ...data,
        locations: [...(data.locations || []), newLocation],
      });
      setNewLocation("");
    }
  };

  const removeLocation = (location) => {
    setData({
      ...data,
      locations: (data.locations || []).filter((l) => l !== location),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preferred Job Titles
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newJobTitle}
            onChange={(e) => setNewJobTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addJobTitle()}
            placeholder="e.g., Frontend Developer"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={addJobTitle}
            className="px-4 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.jobTitles || []).map((title, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-theme_color/10 text-theme_color rounded-full text-sm flex items-center gap-2"
            >
              {title}
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => removeJobTitle(title)}
              />
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Industries
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newIndustry}
            onChange={(e) => setNewIndustry(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIndustry()}
            placeholder="e.g., Technology"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={addIndustry}
            className="px-4 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.industries || []).map((industry, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-theme_color/10 text-theme_color rounded-full text-sm flex items-center gap-2"
            >
              {industry}
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => removeIndustry(industry)}
              />
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Job Type"
          value={data.jobType || ""}
          onChange={(v) => setData({ ...data, jobType: v })}
          options={[
            "",
            "Full-time",
            "Part-time",
            "Contract",
            "Freelance",
            "Internship",
          ]}
        />
        <SelectField
          label="Work Mode"
          value={data.workMode || ""}
          onChange={(v) => setData({ ...data, workMode: v })}
          options={["", "Remote", "Hybrid", "Onsite"]}
        />
        <SelectField
          label="Availability"
          value={data.availability || ""}
          onChange={(v) => setData({ ...data, availability: v })}
          options={["", "Immediate", "1 Month", "2 Months", "3 Months"]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preferred Locations
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLocation()}
            placeholder="e.g., Dubai"
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={addLocation}
            className="px-4 py-2 bg-theme_color text-white rounded-lg hover:bg-theme_color/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.locations || []).map((location, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
            >
              {location}
              <X
                className="w-4 h-4 cursor-pointer"
                onClick={() => removeLocation(location)}
              />
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Salary Expectation ({data.salary?.currency || "USD"})
        </label>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Minimum"
            type="number"
            value={data.salary?.min || 0}
            onChange={(v) =>
              setData({
                ...data,
                salary: { ...(data.salary || {}), min: parseInt(v) || 0 },
              })
            }
          />
          <InputField
            label="Maximum"
            type="number"
            value={data.salary?.max || 0}
            onChange={(v) =>
              setData({
                ...data,
                salary: { ...(data.salary || {}), max: parseInt(v) || 0 },
              })
            }
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={data.relocate || false}
          onChange={(e) => setData({ ...data, relocate: e.target.checked })}
          className="w-4 h-4 text-theme_color rounded focus:ring-theme_color"
        />
        <span className="text-gray-700 dark:text-gray-300">
          I am willing to relocate
        </span>
      </label>

      <EditActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
};

const VisibilitySettings = ({ data, setData }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">
          Profile Visibility
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Make your profile visible to employers
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={data.profileVisible}
          onChange={(e) =>
            setData({ ...data, profileVisible: e.target.checked })
          }
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme_color"></div>
      </label>
    </div>

    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">
          Resume Visibility
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Allow employers to view your resume
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={data.resumeVisible}
          onChange={(e) =>
            setData({ ...data, resumeVisible: e.target.checked })
          }
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme_color"></div>
      </label>
    </div>

    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white">
          Allow Direct Contact
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Employers can contact you directly
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={data.allowContact}
          onChange={(e) => setData({ ...data, allowContact: e.target.checked })}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme_color"></div>
      </label>
    </div>

    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        <strong>Privacy Note:</strong> Your contact information is never shared
        without your permission. Employers can only send you messages through
        the platform.
      </p>
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-gray-900 dark:text-white font-medium truncate">
        {value || "--"}
      </p>
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option || "-- Select --"}
        </option>
      ))}
    </select>
  </div>
);

// ─── Languages Edit ───────────────────────────────────────────────────────────

const LanguagesEdit = ({ data, setData, onSave, onCancel }) => {
  const [newLang, setNewLang] = useState("");
  const [newProf, setNewProf] = useState("Conversational");

  const langs = Array.isArray(data) ? data : [];

  const addLanguage = () => {
    if (!newLang.trim()) return;
    setData([...langs, { name: newLang.trim(), proficiency: newProf }]);
    setNewLang("");
    setNewProf("Conversational");
  };

  const removeLanguage = (idx) => {
    setData(langs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {langs.map((lang, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800">
            {lang.name} {lang.proficiency && `(${lang.proficiency})`}
            <button onClick={() => removeLanguage(i)} className="ml-1 text-blue-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newLang} onChange={(e) => setNewLang(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addLanguage()} placeholder="e.g., English" className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
        <select value={newProf} onChange={(e) => setNewProf(e.target.value)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm">
          <option>Native</option>
          <option>Fluent</option>
          <option>Conversational</option>
          <option>Basic</option>
        </select>
        <button onClick={addLanguage} className="px-3 py-2 bg-theme_color text-white rounded-lg text-sm hover:bg-theme_color/90"><Plus className="w-4 h-4" /></button>
      </div>
      <EditActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
};

// ─── Awards Edit ──────────────────────────────────────────────────────────────

const AwardsEdit = ({ data, setData, onSave, onCancel }) => {
  const [newTitle, setNewTitle] = useState("");
  const [newIssuer, setNewIssuer] = useState("");

  const awards = Array.isArray(data) ? data : [];

  const addAward = () => {
    if (!newTitle.trim()) return;
    setData([...awards, { title: newTitle.trim(), issuer: newIssuer.trim() || null }]);
    setNewTitle("");
    setNewIssuer("");
  };

  const removeAward = (idx) => {
    setData(awards.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {awards.map((award, i) => (
        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-yellow-600">&#9733;</span>
          <span className="flex-1 text-sm text-gray-900 dark:text-white">{award.title}{award.issuer && ` — ${award.issuer}`}</span>
          <button onClick={() => removeAward(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      ))}
      <div className="flex gap-2">
        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Award title" className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
        <input type="text" value={newIssuer} onChange={(e) => setNewIssuer(e.target.value)} placeholder="Issuer (optional)" className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
        <button onClick={addAward} className="px-3 py-2 bg-theme_color text-white rounded-lg text-sm hover:bg-theme_color/90"><Plus className="w-4 h-4" /></button>
      </div>
      <EditActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
};

// ─── Interests Edit ───────────────────────────────────────────────────────────

const InterestsEdit = ({ data, setData, onSave, onCancel }) => {
  const [newInterest, setNewInterest] = useState("");

  const interests = Array.isArray(data) ? data : [];

  const addInterest = () => {
    if (!newInterest.trim()) return;
    setData([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const removeInterest = (idx) => {
    setData(interests.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {interests.map((interest, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700">
            {typeof interest === "string" ? interest : interest.name}
            <button onClick={() => removeInterest(i)} className="ml-1 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addInterest()} placeholder="e.g., Machine Learning, Travel" className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm" />
        <button onClick={addInterest} className="px-3 py-2 bg-theme_color text-white rounded-lg text-sm hover:bg-theme_color/90"><Plus className="w-4 h-4" /></button>
      </div>
      <EditActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
};

export default Profile;
