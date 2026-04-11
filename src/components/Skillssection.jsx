import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  XCircle,
  Loader2,
  Search,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  X,
  Zap,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import ErrorMessage from "../utilities/ErrorMessage";
import successMessage from "../utilities/successMessage";

const getToken = () => {
  try {
    const t = JSON.parse(sessionStorage.getItem("accessToken") || "{}");
    return t;
  } catch {
    return "";
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

// ─── Proficiency config ───────────────────────────────────────────────────────

const PROFICIENCY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

const PROFICIENCY_META = {
  BEGINNER: {
    label: "Beginner",
    color:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    dot: "bg-gray-400",
    bars: 1,
  },
  INTERMEDIATE: {
    label: "Intermediate",
    color:
      "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    dot: "bg-blue-500",
    bars: 2,
  },
  ADVANCED: {
    label: "Advanced",
    color:
      "bg-theme_color/10 text-theme_color dark:bg-theme_color/20 border-theme_color/30",
    dot: "bg-theme_color",
    bars: 3,
  },
  EXPERT: {
    label: "Expert",
    color:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700",
    dot: "bg-green-500",
    bars: 4,
  },
};

// ─── Proficiency bars visual ──────────────────────────────────────────────────

const ProficiencyBars = ({ level, size = "sm" }) => {
  const meta = PROFICIENCY_META[level] || PROFICIENCY_META.BEGINNER;
  const h = size === "sm" ? "h-2" : "h-3";
  const w = size === "sm" ? "w-1.5" : "w-2";
  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${w} ${h} rounded-sm transition-colors ${
            i <= meta.bars ? meta.dot : "bg-gray-200 dark:bg-gray-600"
          }`}
          style={{
            height: size === "sm" ? `${4 + i * 3}px` : `${6 + i * 4}px`,
          }}
        />
      ))}
    </div>
  );
};

// ─── API calls ────────────────────────────────────────────────────────────────

const api = {
  /** GET /admin/skills - all available skills */
  listAllSkills: async () => {
    const res = await fetch(`${BASE_URL}/admin/skills`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch skills");
    const json = await res.json();
    return json.data;
  },

  /** GET /job-seeker/skills - job seeker's own skills */
  listMySkills: async () => {
    const res = await fetch(`${BASE_URL}/job-seeker/skills`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch your skills");
    const json = await res.json();
    return json.data;
  },

  /** POST /job-seeker/skills */
  addSkill: async ({ skillId, proficiency }) => {
    const res = await fetch(`${BASE_URL}/job-seeker/skill`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ skillId, proficiency }),
    });
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "Failed to add skill");
      return null;
    }
    successMessage(data?.message || "Skill added successfully");
    return data?.data;
  },

  /** PATCH /job-seeker/skills/:id */
  updateSkill: async (jobSeekerSkillId, proficiency) => {
    const res = await fetch(
      `${BASE_URL}/job-seeker/skills/${jobSeekerSkillId}`,
      {
        method: "PATCH",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ proficiency }),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "Failed to update skill");
      return null;
    }
    successMessage(data?.message || "Skill updated successfully");
    return data?.data;
  },

  /** DELETE /job-seeker/skills/:id */
  removeSkill: async (jobSeekerSkillId) => {
    const res = await fetch(
      `${BASE_URL}/job-seeker/skills/${jobSeekerSkillId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      },
    );
    const data = await res.json();
    if (!res.ok) {
      ErrorMessage(data?.message || "Failed to remove skill");
      return false;
    }
    successMessage(data?.message || "Skill removed");
    return true;
  },
};

// ─── Searchable skill select ──────────────────────────────────────────────────

const SkillSelect = ({ value, onChange, allSkills, mySkillIds, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = allSkills.find((s) => s.id === value);

  const filtered = allSkills
    .filter((s) => !mySkillIds.includes(s.id)) // hide already-added skills
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-left transition-colors focus:outline-none focus:border-theme_color"
      >
        <span
          className={
            selected
              ? "text-gray-900 dark:text-white"
              : "text-gray-400 dark:text-gray-500"
          }
        >
          {loading
            ? "Loading skills…"
            : selected
              ? selected.name
              : "Search and select a skill…"}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills…"
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-gray-400">
                  {search
                    ? `No skills match "${search}"`
                    : "All skills already added"}
                </p>
              </div>
            ) : (
              filtered.map((skill) => (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() => {
                    onChange(skill.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2.5 text-sm text-left transition-colors flex items-center justify-between group ${
                    value === skill.id
                      ? "bg-theme_color/10 text-theme_color font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <span>{skill.name}</span>
                  {skill.industries?.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {skill.industries.length} industri
                      {skill.industries.length !== 1 ? "es" : "y"}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Proficiency selector ─────────────────────────────────────────────────────

const ProficiencySelect = ({ value, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {PROFICIENCY_LEVELS.map((level) => {
      const meta = PROFICIENCY_META[level];
      const active = value === level;
      return (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            active
              ? meta.color + " ring-2 ring-offset-1 ring-theme_color/30"
              : "border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500"
          }`}
        >
          <ProficiencyBars level={level} />
          {meta.label}
        </button>
      );
    })}
  </div>
);

// ─── Add skill form ───────────────────────────────────────────────────────────

const AddSkillForm = ({ allSkills, mySkillIds, onAdded, onCancel }) => {
  const [skillId, setSkillId] = useState("");
  const [proficiency, setProficiency] = useState("BEGINNER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!skillId) {
      setError("Please select a skill.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const created = await api.addSkill({ skillId, proficiency });
      if (created) onAdded(created);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/40 space-y-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Add a new skill
      </p>

      {/* Skill select */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
          Skill
        </label>
        <SkillSelect
          value={skillId}
          onChange={setSkillId}
          allSkills={allSkills}
          mySkillIds={mySkillIds}
          loading={false}
        />
      </div>

      {/* Proficiency */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
          Proficiency Level
        </label>
        <ProficiencySelect value={proficiency} onChange={setProficiency} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <XCircle className="w-3.5 h-3.5" /> Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={loading || !skillId}
          className="px-4 py-1.5 bg-theme_color text-white text-sm rounded-lg hover:bg-theme_color/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 font-medium"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          Add Skill
        </button>
      </div>
    </div>
  );
};

// ─── Single skill card ────────────────────────────────────────────────────────

const SkillCard = ({ skill, onUpdated, onDeleted }) => {
  const [editing, setEditing] = useState(false);
  const [proficiency, setProficiency] = useState(skill.proficiency);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = PROFICIENCY_META[skill.proficiency] || PROFICIENCY_META.BEGINNER;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await api.updateSkill(skill.id, proficiency);
      if (updated) onUpdated(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await api.removeSkill(skill.id);
    if (ok) {
      onDeleted(skill.id);
    } else {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleCancelEdit = () => {
    setProficiency(skill.proficiency);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 rounded-xl p-3.5 transition-all">
      <div className="flex items-start gap-3">
        {/* Proficiency bars */}
        <div className="pt-0.5 flex-shrink-0">
          <ProficiencyBars level={skill.proficiency} size="md" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
            {skill.skillName}
          </p>

          {!editing && (
            <span
              className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium border rounded-full ${meta.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
          )}

          {editing && (
            <div className="mt-2 space-y-3">
              <ProficiencySelect
                value={proficiency}
                onChange={setProficiency}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-2.5 py-1 text-xs bg-theme_color text-white rounded-lg hover:bg-theme_color/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  {saving ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              title="Edit proficiency"
              className="p-1.5 text-theme_color hover:bg-theme_color/10 rounded-lg transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
              title="Remove skill"
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="mt-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">
            Remove <strong>{skill.skillName}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center gap-1"
            >
              {deleting && <Loader2 className="w-3 h-3 animate-spin" />}
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main SkillsSection ───────────────────────────────────────────────────────

const SkillsSection = () => {
  const [mySkills, setMySkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSkillsLoading, setAllSkillsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [reload, setReload] = useState(false);
  const [filterLevel, setFilterLevel] = useState("ALL");

  const fetchMySkills = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMySkills();
      setMySkills(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSkills = async () => {
    setAllSkillsLoading(true);
    try {
      const data = await api.listAllSkills();
      setAllSkills(data || []);
    } catch {
      // non-fatal
    } finally {
      setAllSkillsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySkills();
    fetchAllSkills();
  }, [reload]);

  const handleAdded = (newSkill) => {
    setReload((p) => !p);
    setShowAdd(false);
  };

  const handleUpdated = () => {
    setReload((p) => !p);
  };

  const handleDeleted = () => {
    setReload((p) => !p);
  };

  const mySkillIds = mySkills.map((s) => s.skillId);

  // Group by proficiency for display
  const filtered =
    filterLevel === "ALL"
      ? mySkills
      : mySkills.filter((s) => s.proficiency === filterLevel);

  const grouped = PROFICIENCY_LEVELS.reduce((acc, level) => {
    const items = filtered.filter((s) => s.proficiency === level);
    if (items.length) acc[level] = items;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {mySkills.length > 0
            ? `${mySkills.length} skill${mySkills.length !== 1 ? "s" : ""} added`
            : "No skills added yet"}
        </p>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-theme_color text-white text-sm font-medium rounded-lg hover:bg-theme_color/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Skill
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <AddSkillForm
          allSkills={allSkills}
          mySkillIds={mySkillIds}
          onAdded={handleAdded}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10 gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-theme_color" />
          <span className="text-sm">Loading skills…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 flex-1">
            {error}
          </p>
          <button
            onClick={fetchMySkills}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter tabs */}
      {!loading && !error && mySkills.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterLevel("ALL")}
            className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
              filterLevel === "ALL"
                ? "bg-theme_color text-white border-theme_color"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
            }`}
          >
            All ({mySkills.length})
          </button>
          {PROFICIENCY_LEVELS.filter((l) =>
            mySkills.some((s) => s.proficiency === l),
          ).map((level) => {
            const meta = PROFICIENCY_META[level];
            const count = mySkills.filter(
              (s) => s.proficiency === level,
            ).length;
            return (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors flex items-center gap-1.5 ${
                  filterLevel === level
                    ? meta.color + " ring-1 ring-offset-0 ring-theme_color/20"
                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                <ProficiencyBars level={level} />
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Skills grouped by proficiency */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([level, skills]) => (
            <div key={level}>
              <div className="flex items-center gap-2 mb-2">
                <ProficiencyBars level={level} />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {PROFICIENCY_META[level].label}
                </span>
                <span className="text-xs text-gray-400">({skills.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onUpdated={handleUpdated}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && mySkills.length === 0 && !showAdd && (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center bg-gray-50 dark:bg-gray-800/30">
          <div className="w-16 h-16 bg-theme_color/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-theme_color" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Add your skills
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            Help employers and AI matching find the right fit
          </p>
          <p className="text-xs text-gray-500 mb-6">
            Adding 5+ skills improves your job match accuracy by up to 40%
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-6 py-2.5 bg-theme_color text-white rounded-lg hover:bg-theme_color/90 transition-colors font-medium text-sm"
          >
            Add First Skill
          </button>
        </div>
      )}

      {/* No results for filter */}
      {!loading && !error && mySkills.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No skills at this level yet.
        </p>
      )}

      {/* Tip */}
      {!loading && mySkills.length > 0 && mySkills.length < 5 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Tip:</strong> Add at least{" "}
            <strong>
              {5 - mySkills.length} more skill
              {5 - mySkills.length !== 1 ? "s" : ""}
            </strong>{" "}
            to unlock premium job matches and boost your profile visibility.
          </p>
        </div>
      )}

      {mySkills.length >= 5 && !loading && (
        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-green-700 dark:text-green-300">
            Great! You have {mySkills.length} skills. AI job matching is fully
            active.
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;
