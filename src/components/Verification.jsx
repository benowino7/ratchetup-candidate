import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";
import ErrorMessage from "../utilities/ErrorMessage";
import VerifiedBadge from "./VerifiedBadge";

const VERIFICATION_TYPES = [
  {
    type: "PERSONA_ID",
    title: "Identity Verification",
    description:
      "Confirm your government-issued ID and a live selfie. Verified identities surface a trust badge to recruiters and dramatically improve recommendation visibility.",
  },
];

const STATUS_META = {
  DRAFT: { label: "Not started", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", Icon: Clock },
  PAYMENT_PENDING: { label: "Payment pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", Icon: Clock },
  IN_PROGRESS: { label: "In progress", color: "text-sky-600", bg: "bg-sky-100 dark:bg-sky-900/30", Icon: Loader2 },
  PASSED: { label: "Verified", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", Icon: CheckCircle2 },
  FAILED: { label: "Verification failed", color: "text-rose-600", bg: "bg-rose-100 dark:bg-rose-900/30", Icon: XCircle },
  INCONCLUSIVE: { label: "Inconclusive", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", Icon: AlertTriangle },
  CANCELLED: { label: "Cancelled", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", Icon: XCircle },
  EXPIRED: { label: "Expired", color: "text-slate-500", bg: "bg-slate-100 dark:bg-slate-800", Icon: Clock },
};

function authHeaders() {
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "null");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

function formatPrice(cents, currency = "USD") {
  const v = (Number(cents) || 0) / 100;
  const sym = currency === "USD" ? "$" : `${currency} `;
  return `${sym}${v.toFixed(2)}`;
}

export default function Verification() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/job-seeker/verification`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load verifications");
      const json = await res.json();
      setItems(Array.isArray(json.result) ? json.result : []);
    } catch (e) {
      ErrorMessage(e.message || "Could not load verifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // PayPal returns the user with paypal=cancelled when they close the window.
  // Move the row out of PAYMENT_PENDING so the UI offers a clean retry.
  useEffect(() => {
    const paypal = searchParams.get("paypal");
    const verificationId = searchParams.get("verification");
    if ((paypal === "cancelled" || paypal === "cancel") && verificationId) {
      (async () => {
        try {
          await fetch(`${BASE_URL}/job-seeker/verification/${verificationId}/cancel`, {
            method: "POST",
            headers: authHeaders(),
          });
        } catch {}
        // Strip the query params so a refresh doesn't re-trigger the cancel.
        const next = new URLSearchParams(searchParams);
        next.delete("paypal");
        next.delete("verification");
        setSearchParams(next, { replace: true });
        load();
      })();
    } else if (paypal === "success") {
      // Clean the URL but reload so the IN_PROGRESS row + hostedUrl appear.
      const next = new URLSearchParams(searchParams);
      next.delete("paypal");
      next.delete("verification");
      setSearchParams(next, { replace: true });
      setTimeout(load, 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Light polling while a row is in flight — picks up webhook-driven changes.
  useEffect(() => {
    const inFlight = items.some((v) => v.status === "PAYMENT_PENDING" || v.status === "IN_PROGRESS");
    if (!inFlight) return undefined;
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [items, load]);

  const callInitiate = async (type, force = false) => {
    const res = await fetch(`${BASE_URL}/job-seeker/verification/initiate`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ type, force }),
    });
    const json = await res.json();
    if (!res.ok || json.error) throw new Error(json.message || "Could not start verification");
    return json.result || {};
  };

  const initiate = async (type) => {
    if (submitting) return;
    setSubmitting(type);
    try {
      const result = await callInitiate(type, false);
      if (result.alreadyVerified) {
        await load();
        return;
      }
      if (result.paypalOrderUrl) {
        window.open(result.paypalOrderUrl, "_blank", "noopener,noreferrer");
      }
      await load();
    } catch (e) {
      ErrorMessage(e.message || "Could not start verification");
    } finally {
      setSubmitting(null);
    }
  };

  // Re-open the same PayPal checkout for a still-pending row. Avoids
  // creating a duplicate order. Legacy rows have no saved URL, so we
  // automatically force a fresh order in that case so the click never
  // silently fails.
  const reopen = async (row) => {
    if (row?.paypalApproveUrl) {
      window.open(row.paypalApproveUrl, "_blank", "noopener,noreferrer");
      return;
    }
    await startOver(row.type);
  };

  // User explicitly wants to abandon a stuck pending order and start over.
  const startOver = async (type) => {
    if (submitting) return;
    setSubmitting(type);
    try {
      const result = await callInitiate(type, true);
      if (result.paypalOrderUrl) {
        window.open(result.paypalOrderUrl, "_blank", "noopener,noreferrer");
      }
      await load();
    } catch (e) {
      ErrorMessage(e.message || "Could not start verification");
    } finally {
      setSubmitting(null);
    }
  };

  const cardForType = (typeMeta) => {
    const matching = items.filter((v) => v.type === typeMeta.type);
    const latest = matching[0];
    const status = latest?.status || "DRAFT";
    const meta = STATUS_META[status] || STATUS_META.DRAFT;
    const Icon = meta.Icon;

    const isVerified = status === "PASSED";
    const isPending = status === "PAYMENT_PENDING";
    const isInProgress = status === "IN_PROGRESS";

    return (
      <div
        key={typeMeta.type}
        className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-900/50 p-6 flex flex-col gap-4"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-theme_color/10 dark:bg-theme_color/20 flex items-center justify-center text-theme_color">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{typeMeta.title}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{typeMeta.description}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${meta.bg} ${meta.color}`}>
            <Icon className={`w-3.5 h-3.5 ${isInProgress ? "animate-spin" : ""}`} />
            {meta.label}
          </span>
        </div>

        {/* Action area */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {!latest && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                One-time fee: <strong className="text-slate-900 dark:text-white">{formatPrice(799)}</strong>
              </span>
              <button
                onClick={() => initiate(typeMeta.type)}
                disabled={submitting === typeMeta.type}
                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme_color hover:bg-theme_color/90 text-white font-semibold transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting === typeMeta.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Verify Now
              </button>
            </>
          )}

          {latest && isPending && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Awaiting payment confirmation. Complete the PayPal checkout in the new tab to proceed.
              </span>
              <button
                onClick={load}
                className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button
                onClick={() => reopen(latest)}
                disabled={submitting === typeMeta.type}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-theme_color hover:bg-theme_color/90 text-white text-sm font-semibold disabled:opacity-60"
              >
                <ExternalLink className="w-4 h-4" />
                Reopen payment
              </button>
              <button
                onClick={() => startOver(typeMeta.type)}
                disabled={submitting === typeMeta.type}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
              >
                <RotateCcw className="w-4 h-4" />
                Start over
              </button>
            </>
          )}

          {latest && isInProgress && latest.hostedUrl && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Complete the verification in the secure window. We will update this page automatically once it is finished.
              </span>
              <a
                href={latest.hostedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme_color hover:bg-theme_color/90 text-white font-semibold shadow-md"
              >
                <ExternalLink className="w-4 h-4" /> Continue verification
              </a>
            </>
          )}

          {latest && isVerified && (
            <span className="text-sm text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-2">
              <VerifiedBadge size="md" title="Verified" />
              Identity verified
              {latest.completedAt ? ` on ${new Date(latest.completedAt).toLocaleDateString()}` : ""}
            </span>
          )}

          {latest && (status === "FAILED" || status === "INCONCLUSIVE" || status === "EXPIRED" || status === "CANCELLED") && (
            <>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {status === "FAILED" && "We couldn't verify your identity from the submitted documents."}
                {status === "INCONCLUSIVE" && "The result was inconclusive. You can retry with a clearer scan."}
                {status === "EXPIRED" && "The previous attempt expired. You can start a fresh verification."}
                {status === "CANCELLED" && "The previous attempt was cancelled."}
              </span>
              <button
                onClick={() => initiate(typeMeta.type)}
                disabled={submitting === typeMeta.type}
                className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-theme_color hover:bg-theme_color/90 text-white font-semibold shadow-md disabled:opacity-60"
              >
                {submitting === typeMeta.type ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const isAccountVerified = items.some((v) => v.type === "PERSONA_ID" && v.status === "PASSED");

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white inline-flex items-center gap-2">
          Verification
          {isAccountVerified && <VerifiedBadge size="lg" title="Verified account" />}
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Verified candidates stand out to recruiters. Each verification is paid once via PayPal and runs through a secure third-party provider — your documents never sit on our servers.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-theme_color" />
        </div>
      ) : (
        <div className="space-y-4">
          {VERIFICATION_TYPES.map((t) => cardForType(t))}
        </div>
      )}

      <p className="mt-8 text-xs text-slate-400 dark:text-slate-500">
        Need help? <Link to="/contact" className="text-theme_color hover:underline">Contact support</Link>.
      </p>
    </div>
  );
}
