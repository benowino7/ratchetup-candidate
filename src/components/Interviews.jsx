import { useEffect, useState } from "react";
import { Calendar, Clock, Video, Loader2, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { BASE_URL } from "../BaseUrl";

const STATUS_PILLS = {
  SCHEDULED:   { label: "Scheduled",   cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  LIVE:        { label: "Live",        cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  COMPLETED:   { label: "Completed",   cls: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  CANCELLED:   { label: "Cancelled",   cls: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  NO_SHOW:     { label: "No-show",     cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  RESCHEDULED: { label: "Rescheduled", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
};

function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Interviews() {
  const token = JSON.parse(sessionStorage.getItem("accessToken"));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`${BASE_URL}/job-seeker/interviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.message || "Failed to load");
      setItems(j.result?.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // refresh every minute so Join button enables on time
    return () => clearInterval(t);
  }, []);

  return (
    <div className="md:px-4 lg:px-14 py-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Interviews</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upcoming and past interviews recruiters scheduled with you.
          </p>
        </div>
        <button onClick={load} className="p-2 text-gray-400 hover:text-theme_color rounded-lg" title="Refresh">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">No interviews scheduled yet.</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">When a recruiter schedules one with you, it'll show up here with a Join button.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((iv) => {
            const status = STATUS_PILLS[iv.status] || STATUS_PILLS.SCHEDULED;
            return (
              <div
                key={iv.id}
                className="bg-white dark:bg-dark-sidebar rounded-2xl border border-gray-200 dark:border-gray-700 p-4 md:p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {iv.job?.title || "Interview"}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {iv.job?.company?.name ? `${iv.job.company.name} · ` : ""}{iv.round} · {iv.durationMins} min
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {fmt(iv.scheduledFor)}
                      </span>
                      {iv.joinOpensAt && (
                        <span className="inline-flex items-center gap-1 text-gray-400">
                          <Clock className="w-3.5 h-3.5" /> Join opens {fmt(iv.joinOpensAt)}
                        </span>
                      )}
                    </div>
                    {iv.notes && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        <strong>Notes:</strong> {iv.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {iv.canJoinNow && iv.meetUrl ? (
                      <a
                        href={iv.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1"
                      >
                        <Video className="w-4 h-4" /> Join Meet
                      </a>
                    ) : iv.calendarLink ? (
                      <a
                        href={iv.calendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg inline-flex items-center gap-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Add to Calendar
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
