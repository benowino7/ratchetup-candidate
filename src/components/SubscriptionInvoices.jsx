import React, { useState, useEffect, useCallback } from "react";
import {
  Receipt,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  CalendarDays,
  Hash,
  Layers,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { BASE_URL } from "../BaseUrl";

const getToken = () => {
  try {
    return JSON.parse(sessionStorage.getItem("accessToken") || "null") || "";
  } catch {
    return "";
  }
};

const fmt = {
  currency: (amount, currency = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
      amount / 100,
    ),
  date: (iso) =>
    iso
      ? new Intl.DateTimeFormat("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(new Date(iso))
      : "—",
  shortDate: (iso) =>
    iso
      ? new Intl.DateTimeFormat("en-US", {
          day: "2-digit",
          month: "short",
        }).format(new Date(iso))
      : "—",
};

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchInvoices = async (status) => {
  const url =
    status && status !== "ALL"
      ? `${BASE_URL}/job-seeker/subscriptions/invoices?status=${status}`
      : `${BASE_URL}/job-seeker/subscriptions/invoices`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (res.status === 401) {
    sessionStorage.removeItem("accessToken");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (res.status === 403) {
    window.location.href = "/dashboard/subscriptions";
    throw new Error("Subscription required.");
  }
  if (!res.ok) throw new Error(`Failed to fetch invoices (${res.status})`);
  const json = await res.json();
  return { data: json.result ?? [], meta: json.meta ?? {} };
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-500",
    Icon: Clock,
  },
  PAID: {
    label: "Paid",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  VOID: {
    label: "Void",
    color: "text-gray-500 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-800",
    border: "border-gray-200 dark:border-gray-700",
    dot: "bg-gray-400",
    Icon: XCircle,
  },
  FAILED: {
    label: "Failed",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
    Icon: AlertCircle,
  },
  PENDING: {
    label: "Pending",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-400",
    Icon: Clock,
  },
};

const getStatusCfg = (s) => STATUS_CONFIG[s] ?? STATUS_CONFIG.OPEN;

const PAYMENT_STATUS = {
  PENDING: {
    label: "Pending",
    cls: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
  },
  PAID: {
    label: "Paid",
    cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  },
  SUCCESS: {
    label: "Paid",
    cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
  },
  FAILED: {
    label: "Failed",
    cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
  },
};
const getPaymentCfg = (s) => PAYMENT_STATUS[s] ?? PAYMENT_STATUS.PENDING;

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "PAID", label: "Paid" },
  { value: "VOID", label: "Void" },
];

// ─── Invoice row ──────────────────────────────────────────────────────────────

const InvoiceRow = ({ invoice }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = getStatusCfg(invoice.status);
  const StatusIcon = cfg.Icon;

  // Determine overall payment status from payments array
  const latestPayment = invoice.payments?.[invoice.payments.length - 1];
  const pmtCfg = latestPayment ? getPaymentCfg(latestPayment.status) : null;

  return (
    <div
      className={`group rounded-xl border transition-all duration-200 overflow-hidden ${expanded ? "border-theme_color/30 shadow-md shadow-theme_color/5" : "border-gray-200 dark:border-gray-700/60 hover:border-theme_color/20 hover:shadow-sm"}`}
    >
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          {/* Status dot + icon */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.border} border`}
          >
            <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
          </div>

          {/* Reference + date */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono tracking-tight truncate">
                #{(invoice.reference || invoice.id || "—").slice(-12).toUpperCase()}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {fmt.shortDate(invoice.periodStart)} –{" "}
              {fmt.shortDate(invoice.periodEnd)}
              <span className="mx-1.5 text-gray-300 dark:text-gray-600">·</span>
              {invoice.items?.[0]?.planName ?? "—"} ·{" "}
              {invoice.items?.[0]?.interval}LY
            </p>
          </div>

          {/* Payment status */}
          {pmtCfg && (
            <div
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${pmtCfg.cls}`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {pmtCfg.label}
            </div>
          )}

          {/* Amount */}
          <div className="text-right flex-shrink-0">
            <p className="text-base font-bold text-gray-900 dark:text-white tabular-nums">
              {fmt.currency(invoice.total, invoice.currency)}
            </p>
            {invoice.tax > 0 && (
              <p className="text-xs text-gray-400">
                +{fmt.currency(invoice.tax)} tax
              </p>
            )}
          </div>

          {/* Chevron */}
          <div
            className={`ml-2 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/60 dark:bg-gray-800/30 px-5 py-5 space-y-5">
          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Invoice ID",
                value: invoice.id.slice(0, 8) + "…",
                Icon: Hash,
              },
              {
                label: "Created",
                value: fmt.date(invoice.createdAt),
                Icon: CalendarDays,
              },
              {
                label: "Period Start",
                value: fmt.date(invoice.periodStart),
                Icon: CalendarDays,
              },
              {
                label: "Period End",
                value: fmt.date(invoice.periodEnd),
                Icon: CalendarDays,
              },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-lg px-3 py-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-gray-400" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    {label}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Items */}
          {invoice.items?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Line Items
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700/50">
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Plan
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                        Interval
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                        Hours
                      </th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.planName}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                          {item.interval}LY
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                          {item.hours ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white tabular-nums">
                          {fmt.currency(item.amount, item.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40">
                      <td
                        colSpan={3}
                        className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Total
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                        {fmt.currency(invoice.total, invoice.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Payments */}
          {invoice.payments?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Payment Attempts
                </p>
              </div>
              <div className="space-y-2">
                {invoice.payments.map((pmt) => {
                  const pc = getPaymentCfg(pmt.status);
                  return (
                    <div
                      key={pmt.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {pmt.gateway}
                          </p>
                          <p className="text-xs text-gray-500">
                            {pmt?.paidAt
                              ? fmt.date(pmt.paidAt) +
                                ", " +
                                new Date(pmt?.paidAt).toLocaleTimeString()
                              : fmt.date(pmt.createdAt) +
                                ", " +
                                new Date(pmt?.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${pc.cls}`}
                        >
                          {pc.label}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white tabular-nums text-sm">
                          {fmt.currency(pmt.amount, pmt.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Summary cards ────────────────────────────────────────────────────────────

const SummaryCards = ({ invoices }) => {
  const total = invoices.reduce((s, i) => s + i.total, 0);
  const paid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.total, 0);
  const open = invoices
    .filter((i) => i.status === "OPEN")
    .reduce((s, i) => s + i.total, 0);
  const currency = invoices[0]?.currency ?? "USD";

  const cards = [
    {
      label: "Total Invoiced",
      value: fmt.currency(total, currency),
      Icon: FileText,
      cls: "text-gray-700 dark:text-gray-200",
      bg: "bg-gray-100 dark:bg-gray-700",
    },
    {
      label: "Amount Paid",
      value: fmt.currency(paid, currency),
      Icon: CheckCircle2,
      cls: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
    },
    {
      label: "Outstanding",
      value: fmt.currency(open, currency),
      Icon: Clock,
      cls: "text-amber-700 dark:text-amber-300",
      bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    {
      label: "Total Invoices",
      value: invoices.length,
      Icon: TrendingUp,
      cls: "text-theme_color",
      bg: "bg-theme_color/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
      {cards.map(({ label, value, Icon, cls, bg }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-4"
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}
          >
            <Icon className={`w-5 h-5 ${cls}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {label}
            </p>
            <p className={`text-lg font-bold truncate ${cls}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const SubscriptionInvoices = () => {
  const [status, setStatus] = useState("ALL");
  const [invoices, setInvoices] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, meta } = await fetchInvoices(status);
      setInvoices(data);
      setMeta(meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full h-full">
      <div className="max-w-[98rem] mx-auto py-2">
        {/* Page header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              Invoices
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your billing history and subscription charges
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Summary cards (only when we have data) */}
        {!loading && !error && invoices.length > 0 && (
          <SummaryCards invoices={invoices} />
        )}

        {/* Filter tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-1 inline-flex gap-1 mb-3">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                status === f.value
                  ? "bg-theme_color text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {f.label}
              {f.value !== "ALL" && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    status === f.value
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {invoices.filter((i) => i.status === f.value).length ||
                    (status === f.value ? (meta.total ?? 0) : 0)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-2xl bg-theme_color/20 dark:bg-theme_color/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-theme_color animate-spin" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Loading subscription Invoices...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
            <button
              onClick={load}
              className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && invoices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              No invoices found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              {status !== "ALL"
                ? `You don't have any ${status.toLowerCase()} invoices yet.`
                : "Your invoice history will appear here once you have an active subscription."}
            </p>
            {status !== "ALL" && (
              <button
                onClick={() => setStatus("ALL")}
                className="mt-4 px-4 py-2 text-sm text-theme_color hover:bg-theme_color/10 rounded-lg transition-colors font-medium"
              >
                View all invoices
              </button>
            )}
          </div>
        )}

        {/* Invoice list */}
        {!loading && !error && invoices.length > 0 && (
          <>
            <div className="space-y-3 h-[calc(100vh-370px)] overflow-y-auto border dark:border-gray-800 rounded-md py-2 px-4">
              {invoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>

            {/* Pagination info */}
            {meta.total > 0 && (
              <div className="flex items-center justify-between mt-6 px-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {invoices.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {meta.total}
                  </span>{" "}
                  invoice{meta.total !== 1 ? "s" : ""}
                </p>
                {meta.totalPages > 1 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionInvoices;
