import React, { useState, useEffect } from "react";
import {
  Crown,
  Shield,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Star,
  Zap,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  CreditCard,
  Smartphone,
  ArrowUpCircle,
  Info,
  Clock,
  Gem,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../BaseUrl";
import Modal from "../allmodals/Modal";
import successMessage from "../utilities/successMessage";
import ErrorMessage from "../utilities/ErrorMessage";

// ─── Duration options ────────────────────────────────────────────────────────
const DURATIONS = [
  { key: "1mo", label: "1 Month", months: 1 },
  { key: "3mo", label: "3 Months", months: 3 },
  { key: "6mo", label: "6 Months", months: 6 },
  { key: "12mo", label: "1 Year", months: 12, badge: "Best Value" },
];

// Only yearly plans have active Get Started button
const ACTIVE_DURATION = "12mo";

// ─── PayPal available for all plans ──────────────────────────────────────────
const PAYPAL_ENABLED = true;

// ─── Pricing by plan and duration ───────────────────────────────────────────
// Yearly is most affordable (payable monthly or one-time)
const PRICING = {
  Silver: { "1mo": 10.00, "3mo": 29.95, "6mo": 47.95, "12mo": 119.40 },
  Gold: { "1mo": 20.00, "3mo": 59.95, "6mo": 95.95, "12mo": 239.40 },
  Platinum: { "1mo": 30.00, "3mo": 89.95, "6mo": 143.95, "12mo": 359.40 },
};

// Monthly installment rates for yearly plans
const YEARLY_MONTHLY_RATE = {
  Silver: 9.95,
  Gold: 19.95,
  Platinum: 29.95,
};

// ─── Static feature lists for display ────────────────────────────────────────
const PLAN_FEATURES = {
  Silver: [
    { text: "Save up to 25 jobs", included: true },
    { text: "Basic job recommendations", included: true },
    { text: "View application status", included: true },
    { text: "Standard CV template", included: true },
    { text: "Apply to jobs directly", included: true },
    { text: "AI match score on jobs", included: false },
    { text: "Priority support", included: false },
    { text: "Advanced filters & sorting", included: false },
  ],
  Gold: [
    { text: "Unlimited saved jobs", included: true },
    { text: "AI job recommendations", included: true },
    { text: "Detailed application tracking", included: true },
    { text: "Premium CV templates", included: true },
    { text: "One-click apply", included: true },
    { text: "AI match score + skills gap", included: true },
    { text: "Priority email & chat", included: true },
    { text: "Advanced filters & alerts", included: true },
  ],
  Platinum: [
    { text: "Everything in Gold", included: true },
    { text: "AI-powered CV optimization", included: true },
    { text: "AI-generated cover letters", included: true },
    { text: "Priority visibility", included: true },
    { text: "Exclusive job alerts", included: true },
    { text: "1-on-1 coaching/month", included: true },
    { text: "Early access to features", included: true },
    { text: "VIP phone support", included: true },
  ],
};

// ─── Static visual config keyed by plan name ──────────────────────────────────
const PLAN_VISUAL = {
  Silver: {
    accentColor: "text-slate-600",
    accentBg: "bg-slate-600",
    cardBg: "bg-slate-50 dark:bg-gray-800",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Shield,
    description: "Perfect for getting started",
  },
  Gold: {
    accentColor: "text-orange-600",
    accentBg: "bg-orange-600",
    cardBg: "bg-orange-50 dark:bg-orange-950",
    shadowColor: "shadow-lg",
    popular: true,
    icon: Crown,
    description: "Most popular choice",
  },
  Platinum: {
    accentColor: "text-purple-600",
    accentBg: "bg-purple-600",
    cardBg: "bg-purple-50 dark:bg-purple-950",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Sparkles,
    description: "For serious career growth",
  },
  Diamond: {
    accentColor: "text-cyan-600",
    accentBg: "bg-cyan-600",
    cardBg: "bg-cyan-50 dark:bg-cyan-950",
    shadowColor: "shadow-lg",
    popular: false,
    icon: Gem,
    description: "Everything in Platinum, plus dedicated recruiter services",
  },
};

// Helper: extract tier name from plan name (e.g. "Silver 3-Month" -> "Silver")
const getTier = (name) => {
  if (!name) return null;
  for (const tier of ["Silver", "Gold", "Platinum", "Diamond"]) {
    if (name.startsWith(tier)) return tier;
  }
  return null;
};

// Map DB interval to duration key
const INTERVAL_TO_DURATION = {
  MONTH: "1mo",
  QUARTER: "3mo",
  HALF_YEAR: "6mo",
  YEAR: "12mo",
};

const FALLBACK_VISUAL = {
  accentColor: "text-gray-600",
  accentBg: "bg-gray-600",
  cardBg: "bg-gray-50 dark:bg-gray-800",
  shadowColor: "shadow-lg",
  popular: false,
  icon: Star,
  description: "Great value",
};

// ─── Transform API features object into a flat list for display ───────────────
const buildFeatureList = (planName, features) => {
  // Use static feature list if available for the known plans
  if (PLAN_FEATURES[planName]) return PLAN_FEATURES[planName];

  // Fallback: build from API features object
  if (!features) return [];
  const rows = [];

  const access = features.access || {};
  if (access.jobAccess) rows.push({ text: access.jobAccess, included: true });
  if (access.applicationTool)
    rows.push({ text: access.applicationTool, included: true });
  if (access.searchFilters)
    rows.push({ text: `Filters: ${access.searchFilters}`, included: true });
  if (access.visibility)
    rows.push({ text: `Visibility: ${access.visibility}`, included: true });
  if (access.support)
    rows.push({ text: `Support: ${access.support}`, included: true });

  const ai = features.ai || {};
  if (ai.cvBuilder)
    rows.push({ text: `CV Builder: ${ai.cvBuilder}`, included: true });
  if (ai.matchScore)
    rows.push({ text: `Match Score: ${ai.matchScore}`, included: true });

  const coverIncluded = ai.coverLetters && ai.coverLetters !== "Not Included";
  rows.push({
    text: coverIncluded
      ? `Cover Letters: ${ai.coverLetters}`
      : "AI Cover Letters",
    included: !!coverIncluded,
  });

  rows.push({
    text: "Skill Gap Analysis",
    included: ai.skillGapAnalysis === true,
  });

  const dubaiVal = features.insights?.dubaiMarketInsights;
  const dubaiIncluded = dubaiVal && dubaiVal !== false;
  rows.push({
    text: dubaiIncluded
      ? typeof dubaiVal === "string"
        ? `Market Insights: ${dubaiVal}`
        : "Dubai Market Insights"
      : "Dubai Market Insights",
    included: !!dubaiIncluded,
  });

  const rs = features.recruiter || {};
  if (rs.customJobSearch) rows.push({ text: "Dedicated Recruiter: Custom Job Search", included: true });
  if (rs.companyRepresentation) rows.push({ text: "Company Representation", included: true });
  if (rs.interviewScheduling) rows.push({ text: "Interview Scheduling", included: true });
  if (rs.referenceChecks) rows.push({ text: "Reference Checks", included: true });
  if (rs.offerNegotiation) rows.push({ text: "Offer Negotiation", included: true });
  if (rs.hiringManagerFeedback) rows.push({ text: "Hiring Manager Feedback", included: true });
  if (rs.telephoneSupport) rows.push({ text: "Telephone Support", included: true });

  if (access.externalApply) rows.push({ text: "External Job Applications", included: true });

  return rows;
};

// ─── Main Component ───────────────────────────────────────────────────────────
function Subscriptions({ subscription }) {
  const navigate = useNavigate();
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");
  const [duration, setDuration] = useState("12mo");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("PAYPAL");
  const [paymentType, setPaymentType] = useState("INSTALLMENT"); // INSTALLMENT or ONE_TIME
  const [consentChecked, setConsentChecked] = useState(false);
  const [askingPrice, setAskingPrice] = useState(false);

  const handleAskForPrice = async () => {
    setAskingPrice(true);
    try {
      const res = await fetch(`${BASE_URL}/messaging/diamond-inquiry`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        navigate("/dashboard/messages");
      } else {
        ErrorMessage(data.message || "Failed to send inquiry");
      }
    } catch {
      ErrorMessage("Failed to send inquiry. Please try again.");
    } finally {
      setAskingPrice(false);
    }
  };

  // Top-up state
  const [upgradeQuote, setUpgradeQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // API state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // Payment link states
  const [paymentLink, setPaymentLink] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [activePlanDetails, setActivePlanDetails] = useState(null);

  // Handle PayPal return URLs (?paypal=success|cancelled&ref=xxx)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypalStatus = params.get("paypal");
    const ref = params.get("ref");

    if (paypalStatus && ref) {
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);

      if (paypalStatus === "cancelled") {
        // Mark the payment as cancelled on the backend
        fetch(`${BASE_URL}/job-seeker/subscriptions/paypal/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reference: ref, reason: "User cancelled on PayPal checkout page" }),
        }).catch(() => {});
        ErrorMessage("Payment was cancelled. No charges were made.");
      } else if (paypalStatus === "success") {
        successMessage("Payment submitted! Your subscription will activate shortly.");
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchActiveSubscriptions(), fetchSubscriptions()]);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      }
    };
    loadData();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${BASE_URL}/public/subscriptions?userType=JOB_SEEKER`,
      );
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to load plans");
      setPlans(json.result || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/job-seeker/subscriptions/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to load plans");
      setActivePlan(json.result?.subscription?.plan?.id || null);
      setActivePlanDetails(json.result || null);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch upgrade quote when user selects a new plan and has an active plan ──
  const fetchUpgradeQuote = async (planId) => {
    setLoadingQuote(true);
    setQuoteError(null);
    setUpgradeQuote(null);
    try {
      const res = await fetch(
        `${BASE_URL}/job-seeker/subscriptions/upgrade-quote?planId=${planId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to fetch upgrade quote");
      setUpgradeQuote(json.result);
    } catch (e) {
      setQuoteError(e.message);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handlePlanSelect = (plan, dur) => {
    setSelectedPlan(plan);
    setSelectedDuration(dur);
    setShowConfirmation(true);
    setPaymentLink(null);
    setPaymentMessage(null);
    setPaymentMethod("PAYPAL");
    setConsentChecked(false);
    setPaymentType("INSTALLMENT");
    setUpgradeQuote(null);
    setQuoteError(null);

    // If there's an active paid plan and user is switching, fetch upgrade quote
    if (activePlan && activePlan !== plan.id && !isTrial) {
      fetchUpgradeQuote(plan.id);
    }
  };

  const handleConfirm = async (plan) => {
    // If Google/Apple Pay selected, navigate to checkout page
    if (paymentMethod === "GPAY_APAY") {
      navigate(`/dashboard/checkout?planId=${plan.id}`);
      setShowConfirmation(false);
      return;
    }

    // If PayPal selected, create PENDING subscription via PayPal API and redirect
    if (paymentMethod === "PAYPAL") {
      setLoadingSubscription(true);
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/subscriptions/paypal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ planId: plan?.id, paymentType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to initiate PayPal payment");

        const approveUrl = data?.result?.approveUrl;
        if (approveUrl) {
          window.location.href = approveUrl;
        } else {
          throw new Error("No PayPal approval URL returned");
        }
      } catch (err) {
        ErrorMessage(err.message);
      } finally {
        setLoadingSubscription(false);
      }
      return;
    }

    setLoadingSubscription(true);
    setPaymentLink(null);
    setPaymentMessage(null);

    try {
      const res = await fetch(`${BASE_URL}/job-seeker/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan?.id,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to initiate subscription");
      }

      successMessage(data?.message || "Subscription initiated");

      const link = data?.result?.gateway?.payment_link;

      if (link) {
        setPaymentLink(link);
        setPaymentMessage(
          "Payment link ready! Complete payment to activate your plan.",
        );
        setShowConfirmation(false);

        // Google Ads purchase conversion event
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            send_to: 'AW-18030826186/DypyCOed2IwcEMql4pVD',
            value: (data?.result?.plan?.amountToPay || selectedPlan?.amount / 100 || 1.0),
            currency: data?.result?.plan?.currency || 'CAD',
            transaction_id: data?.result?.gateway?.externalId || '',
          });
        }
      } else {
        setPaymentMessage(
          "Subscription created, but no payment link was returned.",
        );
      }

      setResponse(data?.result || data?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const copyToClipboard = async () => {
    if (!paymentLink) return;
    try {
      await navigator.clipboard.writeText(paymentLink);
      setPaymentMessage("Payment link copied to clipboard!");
      setTimeout(() => setPaymentMessage(null), 3200);
    } catch (err) {
      setPaymentMessage("Failed to copy link");
    }
  };

  const isTrial = subscription?.isTrial || activePlanDetails?.isTrial;
  const isUpgrade = activePlan && selectedPlan && activePlan !== selectedPlan?.id && !isTrial;

  // Compute subscription status
  const subData = activePlanDetails?.subscription;
  const expiresAt = subData?.expiresAt ? new Date(subData.expiresAt) : null;
  const now = new Date();
  const isExpired = expiresAt && expiresAt < now;
  const daysRemaining = expiresAt && !isExpired
    ? Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const activeDuration = DURATIONS.find((d) => d.key === duration);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-theme_color/20 dark:bg-theme_color/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-theme_color animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading subscription plans...
        </p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Failed to load plans
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
        <button
          onClick={fetchSubscriptions}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-100 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-300 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Unlock better job matches, premium tools, and accelerate your career
            growth in Dubai & UAE
          </p>
        </div>

        {/* Current Subscription Status */}
        {activePlanDetails?.subscription && !isTrial && (
          <div className={`mb-8 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isExpired
              ? 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800'
              : 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex items-start gap-3">
              {isExpired ? (
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Calendar className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-bold text-lg ${isExpired ? 'text-red-800 dark:text-red-200' : 'text-orange-800 dark:text-orange-200'}`}>
                  {isExpired
                    ? 'Your subscription has expired'
                    : `Current Plan: ${subData?.plan?.name || 'Active'}`
                  }
                </p>
                {isExpired ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Your subscription expired on {expiresAt?.toLocaleDateString()}. Renew to continue accessing premium features.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-1">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Expires on: <strong>{expiresAt?.toLocaleDateString()}</strong>
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      Days remaining: <strong>{daysRemaining}</strong>
                    </p>
                    {subData?.subscription?.installmentMeta?.type === "INSTALLMENT" && (
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Installments: <strong>{subData.subscription.installmentMeta.paidInstallments || 0} of {subData.subscription.installmentMeta.totalInstallments || 12}</strong> paid
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            {isExpired && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-bold uppercase">
                Expired
              </span>
            )}
            {!isExpired && !isTrial && subData?.subscription && (
              <button
                onClick={async () => {
                  try {
                    const infoRes = await fetch(`${BASE_URL}/job-seeker/subscriptions/cancellation-info`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    const info = await infoRes.json();
                    if (!infoRes.ok) throw new Error(info.message);

                    const r = info.result;
                    if (r.isCancelled) {
                      ErrorMessage("Subscription is already cancelled. Access continues until current period ends.");
                      return;
                    }
                    if (!r.canCancel) {
                      ErrorMessage(`Your plan has a ${r.commitmentDays}-day minimum commitment. You can cancel after ${new Date(r.eligibleDate).toLocaleDateString()} (${r.daysUntilCancellable} days remaining).`);
                      return;
                    }

                    if (!window.confirm("Are you sure you want to cancel? Access continues until the end of your current billing period. No further charges will be made.")) return;

                    const cancelRes = await fetch(`${BASE_URL}/job-seeker/subscriptions/cancel`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ subscriptionId: r.subscriptionId, reason: "User requested cancellation" }),
                    });
                    const cancelData = await cancelRes.json();
                    if (!cancelRes.ok) throw new Error(cancelData.message);
                    successMessage("Subscription cancelled. Access continues until end of current billing period.");
                    fetchActiveSubscriptions();
                  } catch (err) {
                    ErrorMessage(err.message);
                  }
                }}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 underline transition-colors mt-1"
              >
                Cancel subscription
              </button>
            )}
          </div>
        )}

        {/* Trial Status Banner */}
        {isTrial && (
          <div className="mb-8 bg-orange-600 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between text-white gap-3">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">You're on a Free Trial &mdash; {subscription?.trialDaysLeft || 0} {(subscription?.trialDaysLeft || 0) === 1 ? 'day' : 'days'} remaining</p>
                <p className="text-sm opacity-90">Upgrade to a paid plan to unlock all features including job applications, saved jobs, AI suggestions, and PDF export</p>
              </div>
            </div>
          </div>
        )}

        {/* Duration Toggle */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {DURATIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDuration(d.key)}
              className={`relative px-5 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
                duration === d.key
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {d.label}
              {d.badge && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {d.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mx-auto mb-8">
          {plans
            .filter((p) => {
              const tier = getTier(p.name);
              if (!tier || tier === "Diamond") return false;
              if (p.name === "Free Trial") return false;
              // Match plan interval to selected duration
              const planDuration = INTERVAL_TO_DURATION[p.interval] || "3mo";
              return planDuration === duration;
            })
            .map((plan) => {
              const tier = getTier(plan.name);
              const visual = PLAN_VISUAL[tier] || FALLBACK_VISUAL;
              const Icon = visual.icon;
              const featureList = buildFeatureList(tier, plan.features);
              const totalPrice = plan.amount ? (plan.amount / 100).toFixed(2) : PRICING[tier]?.[duration];
              const perMonth = totalPrice
                ? (totalPrice / activeDuration.months).toFixed(2)
                : null;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 group flex flex-col ${
                    visual.popular
                      ? "shadow-2xl ring-2 ring-orange-400/50"
                      : `shadow-xl hover:shadow-2xl ${visual.shadowColor}`
                  }`}
                >
                  <div
                    className={`absolute inset-0 ${visual.cardBg} backdrop-blur-xl`}
                  ></div>
                  <div
                    className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                  ></div>

                  {/* Popular Badge */}
                  {visual.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-orange-600 text-white text-[11px] font-bold py-1.5 text-center z-10">
                      MOST POPULAR
                    </div>
                  )}

                  <div className={`relative ${visual.popular ? 'pt-10' : 'pt-6'} px-5 pb-6 flex flex-col flex-1`}>
                    {/* Icon & Plan Name */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${visual.accentBg} flex items-center justify-center shadow-md flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                          {getTier(plan.name) || plan.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {visual.description}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-3xl font-extrabold ${visual.accentColor}`}
                        >
                          ${totalPrice}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / {activeDuration.months === 1 ? 'month' : activeDuration.months === 12 ? 'year' : `${activeDuration.months} months`}
                        </span>
                      </div>
                      {duration === "12mo" && YEARLY_MONTHLY_RATE[tier] ? (
                        <div className="mt-1">
                          <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                            or ${YEARLY_MONTHLY_RATE[tier]}/mo × 12 installments
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            Payable monthly or one-time
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          ~${perMonth}/mo
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex-1">
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        What's included
                      </p>
                      <ul className="space-y-2">
                        {featureList.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[13px]"
                          >
                            {feature.included ? (
                              <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-600" />
                              </div>
                            )}
                            <span
                              className={`leading-snug break-words ${
                                feature.included
                                  ? "text-gray-700 dark:text-gray-300"
                                  : "text-gray-400 dark:text-gray-600 line-through"
                              }`}
                            >
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Active plan info */}
                    {activePlan === plan?.id && (
                      <div className="py-2 px-3 bg-white dark:bg-dark-theme_color/10 rounded-xl mt-3">
                        <p className="text-[11px] py-0.5">
                          Started:{" "}
                          {new Date(
                            activePlanDetails?.subscription?.startedAt,
                          )?.toDateString()}
                        </p>
                        <p className="text-[11px] py-0.5">
                          Expires:{" "}
                          {new Date(
                            activePlanDetails?.subscription?.expiresAt,
                          )?.toDateString()}
                        </p>
                      </div>
                    )}

                    {/* CTA */}
                    {duration !== ACTIVE_DURATION ? (
                      <div className="relative group/inactive w-full mt-4">
                        <button
                          disabled
                          className="w-full py-3 px-4 rounded-xl font-bold text-center text-sm bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        >
                          Get Started
                        </button>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover/inactive:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                          Only yearly plan is available — payable in monthly installments or one-time
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePlanSelect(plan, duration)}
                        disabled={activePlan === plan?.id && !isTrial && !isExpired}
                        className={`${activePlan === plan?.id && !isExpired ? "disabled:bg-gray-200 disabled:cursor-not-allowed" : "cursor-pointer"} w-full mt-4 py-3 px-4 rounded-xl font-bold text-center text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn ${
                          visual.popular
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : `${visual.accentBg} text-white hover:shadow-xl hover:opacity-90`
                        }`}
                      >
                        {isExpired
                          ? "Renew Now"
                          : activePlan === null || isTrial
                            ? "Get Started"
                            : activePlan === plan?.id
                              ? "Current Plan"
                              : "Switch Plan"}
                        {(activePlan !== plan?.id || isExpired) && (
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Diamond / Custom plan cards from API */}
        {plans
          .filter((p) => {
            if (p.name === "Free Trial") return false;
            const tier = getTier(p.name);
            // Show only Diamond/unrecognized plans here
            return tier === "Diamond" || (!tier && p.name !== "Free Trial");
          })
          .map((plan) => {
            const visual = PLAN_VISUAL[plan.name] || FALLBACK_VISUAL;
            const Icon = visual.icon;
            const isDiamond = plan.name?.toLowerCase().includes("diamond") || plan.name?.toLowerCase().includes("custom");

            return (
              <div key={plan.id} className="max-w-2xl mx-auto mb-8">
                <div className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group`}>
                  <div className={`absolute inset-0 ${visual.cardBg} backdrop-blur-xl`}></div>
                  <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                  <div className="relative pt-6 px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-xl ${visual.accentBg} flex items-center justify-center shadow-md flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{visual.description}</p>
                        </div>
                      </div>
                      <span className={`text-2xl font-extrabold ${visual.accentColor} sm:ml-auto`}>Custom Pricing</span>
                    </div>

                    <button
                      onClick={isDiamond ? handleAskForPrice : () => handlePlanSelect(plan, duration)}
                      disabled={askingPrice}
                      className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${visual.accentBg} text-white hover:opacity-90 disabled:opacity-60`}
                    >
                      {isDiamond ? (askingPrice ? "Sending..." : "Ask for Price") : "Get Started"}
                      {isDiamond ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Trust Indicators */}
        <div className="w-full mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-center text-base font-semibold text-gray-900 dark:text-white mb-5">
              Join thousands of job seekers landing better opportunities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Secure Payments
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  256-bit SSL encryption
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Cancel Anytime
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  No long-term commitment
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  24/7 Support
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  We're here to help
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation / Upgrade Modal ─────────────────────────────────────── */}
      {showConfirmation &&
        selectedPlan &&
        !paymentLink &&
        (() => {
          const tier = getTier(selectedPlan.name);
          const visual = PLAN_VISUAL[tier] || FALLBACK_VISUAL;
          const Icon = visual.icon;
          const totalPrice = PRICING[tier]?.[selectedDuration || duration]
            || (selectedPlan.amount ? (selectedPlan.amount / 100).toFixed(2) : null);
          const durObj = DURATIONS.find((d) => d.key === (selectedDuration || duration));
          const perMonth = totalPrice
            ? (totalPrice / durObj.months).toFixed(2)
            : (selectedPlan.amount / 100).toFixed(2);

          // Current plan visual for upgrade flow
          const currentPlanName = upgradeQuote?.currentSubscription?.plan?.name;
          const currentVisual = currentPlanName
            ? PLAN_VISUAL[currentPlanName] || FALLBACK_VISUAL
            : null;

          return (
            <Modal
              isOpen={showConfirmation}
              onClose={() => {
                setShowConfirmation(false);
                setSelectedPlan(null);
                setSelectedDuration(null);
                setUpgradeQuote(null);
                setQuoteError(null);
              }}
              title={isUpgrade ? "Upgrade Subscription" : "Add Subscription"}
              subtitle={`${selectedPlan.name} Subscription Plan`}
              size="lg"
            >
              <div className="w-full p-8 relative animate-scale-in">
                {/* Plan icon */}
                <div
                  className={`w-16 h-16 rounded-full ${visual.accentBg} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  {isUpgrade ? "Upgrade Your Plan" : "Confirm Your Subscription"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  You're about to{" "}
                  {isUpgrade ? "upgrade to the" : "subscribe to the"}{" "}
                  <strong className="text-theme_color dark:text-dark-theme_color uppercase">
                    {selectedPlan.name}
                  </strong>{" "}
                  Plan
                </p>

                {/* ── Upgrade journey banner ─────────────────────────── */}
                {isUpgrade && (
                  <div className="mb-2">
                    {loadingQuote ? (
                      <div className="flex items-center justify-center gap-3 py-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
                        <Loader2 className="w-5 h-5 text-theme_color animate-spin" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Calculating your top-up amount...
                        </span>
                      </div>
                    ) : quoteError ? (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {quoteError}
                        </p>
                      </div>
                    ) : upgradeQuote ? (
                      <>
                        {/* From -> To visual */}
                        <div className="flex items-center justify-center gap-3 mb-2">
                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${currentVisual?.accentBg || "bg-gray-600"} text-white text-sm font-semibold shadow-md`}
                          >
                            {currentPlanName}
                          </div>

                          <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                            <ArrowUpCircle className="w-6 h-6 text-green-500" />
                          </div>

                          <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${visual.accentBg} text-white text-sm font-semibold shadow-md`}
                          >
                            {selectedPlan.name}
                          </div>
                        </div>

                        {/* Credit & Top-up breakdown */}
                        <div className="rounded-2xl border border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-bold text-green-700 dark:text-green-300 uppercase tracking-wider">
                              Upgrade Cost Breakdown
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Remaining credit from{" "}
                              <strong>{currentPlanName}</strong>
                            </span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              -${upgradeQuote.creditMajor.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              New plan price (
                              {upgradeQuote.newPlan?.name})
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              ${(upgradeQuote.newPlan?.amount / 100).toFixed(2)}
                            </span>
                          </div>

                          <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                              Top-up amount due
                            </span>
                            <span className="text-lg font-extrabold text-theme_color dark:text-dark-theme_color">
                              ${upgradeQuote.topUpMajor.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}

                {/* Standard plan summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Plan
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {selectedPlan.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Duration
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {durObj?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Total Price (1 Year)
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      ${totalPrice || (selectedPlan.amount / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* ── Payment Type (Installment vs One-Time) ──────────── */}
                {YEARLY_MONTHLY_RATE[getTier(selectedPlan?.name)] && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      How would you like to pay?
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentType === "INSTALLMENT"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" name="paymentType" value="INSTALLMENT" checked={paymentType === "INSTALLMENT"} onChange={() => setPaymentType("INSTALLMENT")} className="sr-only" />
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentType === "INSTALLMENT" ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                            {paymentType === "INSTALLMENT" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm font-bold ${paymentType === "INSTALLMENT" ? "text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"}`}>
                            Monthly Installments
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                          ${YEARLY_MONTHLY_RATE[getTier(selectedPlan?.name)]}/mo × 12 months
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-6 mt-0.5">
                          90-day minimum commitment
                        </p>
                      </label>

                      <label
                        className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentType === "ONE_TIME"
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <input type="radio" name="paymentType" value="ONE_TIME" checked={paymentType === "ONE_TIME"} onChange={() => setPaymentType("ONE_TIME")} className="sr-only" />
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentType === "ONE_TIME" ? "border-orange-500 bg-orange-500" : "border-gray-300"}`}>
                            {paymentType === "ONE_TIME" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm font-bold ${paymentType === "ONE_TIME" ? "text-orange-700 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"}`}>
                            One-Time Payment
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                          ${totalPrice} paid in full
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-6 mt-0.5">
                          Full year activated immediately
                        </p>
                      </label>
                    </div>
                  </div>
                )}

                {/* ── Payment method ────────────────────────── */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {/* PayPal - only active payment method */}
                    {PAYPAL_ENABLED && (
                      <label
                        className={`relative flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          paymentMethod === "PAYPAL"
                            ? "border-theme_color bg-theme_color/5 dark:bg-theme_color/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="PAYPAL"
                          checked={paymentMethod === "PAYPAL"}
                          onChange={() => setPaymentMethod("PAYPAL")}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            paymentMethod === "PAYPAL"
                              ? "border-theme_color bg-theme_color"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {paymentMethod === "PAYPAL" && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className={`w-5 h-5 flex-shrink-0 ${paymentMethod === "PAYPAL" ? "text-[#003087]" : "text-gray-400"}`} viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>
                          <div>
                            <p className={`text-sm font-semibold leading-tight ${paymentMethod === "PAYPAL" ? "text-[#003087]" : "text-gray-700 dark:text-gray-300"}`}>
                              PayPal
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              Secure checkout
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Terms & Consent */}
                <div className="mb-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-orange-600 focus:ring-orange-500 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {paymentType === "ONE_TIME" ? (
                        <>I agree to a <strong>1-year subscription</strong> for <strong>${totalPrice}</strong> (one-time payment). My subscription will be active for 12 months from the date of purchase. I understand that this is a non-refundable payment and my account features will be available for the full subscription period.</>
                      ) : (
                        <>I agree to a <strong>12-month subscription</strong> at <strong>${YEARLY_MONTHLY_RATE[tier]}/month</strong> (${totalPrice} total). I understand there is a <strong>90-day minimum commitment</strong> before I can cancel. PayPal will automatically charge my account each month for 12 months. Cancellation after 90 days will stop future charges but access continues until the end of the current billing period.</>
                      )}
                    </span>
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setSelectedPlan(null);
                      setSelectedDuration(null);
                      setUpgradeQuote(null);
                      setQuoteError(null);
                    }}
                    className="flex-1 py-3 px-6 rounded-xl font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>

                  {false ? null : (
                    <button
                      onClick={() => handleConfirm(selectedPlan)}
                      disabled={loadingSubscription || (isUpgrade && loadingQuote) || !consentChecked}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold bg-theme_color dark:bg-dark-theme_color text-white hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {loadingSubscription && (
                        <Loader2 className="text-white animate-spin w-5 h-5" />
                      )}
                      {paymentMethod === "GPAY_APAY"
                        ? "Continue to Checkout"
                        : isUpgrade
                          ? "Pay Top-up & Upgrade"
                          : "Continue to Payment"}
                      {!loadingSubscription && (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </Modal>
          );
        })()}

      {/* ── Payment Success / Link Modal ──────────────────────────────────────── */}
      {paymentLink && (
        <Modal
          isOpen={!!paymentLink}
          onClose={() => {
            setPaymentLink(null);
          }}
          title={"Subscription Alert"}
          subtitle={`${selectedPlan?.name} Subscription Plan Alert`}
          size="xl"
          closeOnOverlayClick={false}
        >
          <div className="bg-emerald-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/60 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200">
                  Ready to Pay
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  {selectedPlan?.name} Plan — ${selectedPlan?.amount / 100}
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {paymentMessage ||
                "Your subscription has been prepared. Use the buttons below to copy the link or open the secure payment page."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-white dark:bg-gray-800 border-2 border-green-600 text-green-700 dark:text-green-400 font-semibold rounded-xl hover:bg-green-50 dark:hover:bg-green-950/60 transition-colors shadow-sm hover:shadow"
              >
                <Copy className="w-5 h-5" />
                Copy Payment Link
              </button>

              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <ExternalLink className="w-5 h-5" />
                Open Payment Page
              </a>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
              Please complete payment soon — link may expire
            </p>
          </div>
        </Modal>
      )}

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes scale-in {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Subscriptions;
