// Checkout.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  Map,
  Globe,
  Lock,
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  Smartphone,
  BadgeCheck,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import successMessage from '../utilities/successMessage';

// ─── Country list ──────────────────────────────────────────────────────────────
const countries = [
  { name: 'Afghanistan', code: 'AF', phone: '+93' },
  { name: 'Albania', code: 'AL', phone: '+355' },
  { name: 'Algeria', code: 'DZ', phone: '+213' },
  { name: 'Argentina', code: 'AR', phone: '+54' },
  { name: 'Armenia', code: 'AM', phone: '+374' },
  { name: 'Australia', code: 'AU', phone: '+61' },
  { name: 'Austria', code: 'AT', phone: '+43' },
  { name: 'Azerbaijan', code: 'AZ', phone: '+994' },
  { name: 'Bahrain', code: 'BH', phone: '+973' },
  { name: 'Bangladesh', code: 'BD', phone: '+880' },
  { name: 'Belarus', code: 'BY', phone: '+375' },
  { name: 'Belgium', code: 'BE', phone: '+32' },
  { name: 'Bolivia', code: 'BO', phone: '+591' },
  { name: 'Brazil', code: 'BR', phone: '+55' },
  { name: 'Bulgaria', code: 'BG', phone: '+359' },
  { name: 'Cambodia', code: 'KH', phone: '+855' },
  { name: 'Cameroon', code: 'CM', phone: '+237' },
  { name: 'Canada', code: 'CA', phone: '+1' },
  { name: 'Chile', code: 'CL', phone: '+56' },
  { name: 'China', code: 'CN', phone: '+86' },
  { name: 'Colombia', code: 'CO', phone: '+57' },
  { name: 'Croatia', code: 'HR', phone: '+385' },
  { name: 'Cyprus', code: 'CY', phone: '+357' },
  { name: 'Czech Republic', code: 'CZ', phone: '+420' },
  { name: 'Denmark', code: 'DK', phone: '+45' },
  { name: 'Dominican Republic', code: 'DO', phone: '+1-809' },
  { name: 'Ecuador', code: 'EC', phone: '+593' },
  { name: 'Egypt', code: 'EG', phone: '+20' },
  { name: 'Estonia', code: 'EE', phone: '+372' },
  { name: 'Ethiopia', code: 'ET', phone: '+251' },
  { name: 'Finland', code: 'FI', phone: '+358' },
  { name: 'France', code: 'FR', phone: '+33' },
  { name: 'Georgia', code: 'GE', phone: '+995' },
  { name: 'Germany', code: 'DE', phone: '+49' },
  { name: 'Ghana', code: 'GH', phone: '+233' },
  { name: 'Greece', code: 'GR', phone: '+30' },
  { name: 'Guatemala', code: 'GT', phone: '+502' },
  { name: 'Hungary', code: 'HU', phone: '+36' },
  { name: 'Iceland', code: 'IS', phone: '+354' },
  { name: 'India', code: 'IN', phone: '+91' },
  { name: 'Indonesia', code: 'ID', phone: '+62' },
  { name: 'Iran', code: 'IR', phone: '+98' },
  { name: 'Iraq', code: 'IQ', phone: '+964' },
  { name: 'Ireland', code: 'IE', phone: '+353' },
  { name: 'Israel', code: 'IL', phone: '+972' },
  { name: 'Italy', code: 'IT', phone: '+39' },
  { name: 'Jamaica', code: 'JM', phone: '+1-876' },
  { name: 'Japan', code: 'JP', phone: '+81' },
  { name: 'Jordan', code: 'JO', phone: '+962' },
  { name: 'Kazakhstan', code: 'KZ', phone: '+7' },
  { name: 'Kenya', code: 'KE', phone: '+254' },
  { name: 'Kuwait', code: 'KW', phone: '+965' },
  { name: 'Latvia', code: 'LV', phone: '+371' },
  { name: 'Lebanon', code: 'LB', phone: '+961' },
  { name: 'Libya', code: 'LY', phone: '+218' },
  { name: 'Lithuania', code: 'LT', phone: '+370' },
  { name: 'Luxembourg', code: 'LU', phone: '+352' },
  { name: 'Malaysia', code: 'MY', phone: '+60' },
  { name: 'Maldives', code: 'MV', phone: '+960' },
  { name: 'Malta', code: 'MT', phone: '+356' },
  { name: 'Mauritius', code: 'MU', phone: '+230' },
  { name: 'Mexico', code: 'MX', phone: '+52' },
  { name: 'Moldova', code: 'MD', phone: '+373' },
  { name: 'Morocco', code: 'MA', phone: '+212' },
  { name: 'Mozambique', code: 'MZ', phone: '+258' },
  { name: 'Myanmar', code: 'MM', phone: '+95' },
  { name: 'Namibia', code: 'NA', phone: '+264' },
  { name: 'Nepal', code: 'NP', phone: '+977' },
  { name: 'Netherlands', code: 'NL', phone: '+31' },
  { name: 'New Zealand', code: 'NZ', phone: '+64' },
  { name: 'Nigeria', code: 'NG', phone: '+234' },
  { name: 'Norway', code: 'NO', phone: '+47' },
  { name: 'Oman', code: 'OM', phone: '+968' },
  { name: 'Pakistan', code: 'PK', phone: '+92' },
  { name: 'Panama', code: 'PA', phone: '+507' },
  { name: 'Peru', code: 'PE', phone: '+51' },
  { name: 'Philippines', code: 'PH', phone: '+63' },
  { name: 'Poland', code: 'PL', phone: '+48' },
  { name: 'Portugal', code: 'PT', phone: '+351' },
  { name: 'Qatar', code: 'QA', phone: '+974' },
  { name: 'Romania', code: 'RO', phone: '+40' },
  { name: 'Russia', code: 'RU', phone: '+7' },
  { name: 'Rwanda', code: 'RW', phone: '+250' },
  { name: 'Saudi Arabia', code: 'SA', phone: '+966' },
  { name: 'Senegal', code: 'SN', phone: '+221' },
  { name: 'Serbia', code: 'RS', phone: '+381' },
  { name: 'Singapore', code: 'SG', phone: '+65' },
  { name: 'Slovakia', code: 'SK', phone: '+421' },
  { name: 'Slovenia', code: 'SI', phone: '+386' },
  { name: 'South Africa', code: 'ZA', phone: '+27' },
  { name: 'South Korea', code: 'KR', phone: '+82' },
  { name: 'Spain', code: 'ES', phone: '+34' },
  { name: 'Sri Lanka', code: 'LK', phone: '+94' },
  { name: 'Sudan', code: 'SD', phone: '+249' },
  { name: 'Sweden', code: 'SE', phone: '+46' },
  { name: 'Switzerland', code: 'CH', phone: '+41' },
  { name: 'Taiwan', code: 'TW', phone: '+886' },
  { name: 'Tanzania', code: 'TZ', phone: '+255' },
  { name: 'Thailand', code: 'TH', phone: '+66' },
  { name: 'Tunisia', code: 'TN', phone: '+216' },
  { name: 'Turkey', code: 'TR', phone: '+90' },
  { name: 'Uganda', code: 'UG', phone: '+256' },
  { name: 'Ukraine', code: 'UA', phone: '+380' },
  { name: 'United Arab Emirates', code: 'AE', phone: '+971' },
  { name: 'United Kingdom', code: 'GB', phone: '+44' },
  { name: 'United States', code: 'US', phone: '+1' },
  { name: 'Uruguay', code: 'UY', phone: '+598' },
  { name: 'Uzbekistan', code: 'UZ', phone: '+998' },
  { name: 'Venezuela', code: 'VE', phone: '+58' },
  { name: 'Vietnam', code: 'VN', phone: '+84' },
  { name: 'Yemen', code: 'YE', phone: '+967' },
  { name: 'Zambia', code: 'ZM', phone: '+260' },
  { name: 'Zimbabwe', code: 'ZW', phone: '+263' },
];

const STEPS = [
  { number: 1, title: 'Personal Info', icon: User },
  { number: 2, title: 'Billing Address', icon: MapPin },
  { number: 3, title: 'Review & Pay', icon: BadgeCheck },
];

// ─── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

// ─── Input class helper ────────────────────────────────────────────────────────
const inputCls = (hasError) =>
  [
    'w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none',
    'bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:ring-2 focus:ring-theme_color/20 dark:focus:ring-dark-theme_color/20',
    hasError
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-200 dark:border-gray-700 focus:border-theme_color dark:focus:border-dark-theme_color',
  ].join(' ');

const plainInputCls = (hasError) =>
  [
    'w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none',
    'bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'focus:ring-2 focus:ring-theme_color/20 dark:focus:ring-dark-theme_color/20',
    hasError
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-200 dark:border-gray-700 focus:border-theme_color dark:focus:border-dark-theme_color',
  ].join(' ');

// ─── Main Component ────────────────────────────────────────────────────────────
function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = JSON.parse(sessionStorage.getItem('accessToken') || '{}');

  // ── Parse URL params (handles typo ?planId=...&?name=... safely) ───────────
  const planId = searchParams.get('planId') || '';
  const planName = (
    searchParams.get('name') ||
    searchParams.get('?name') ||
    ''
  ).toUpperCase();

  // ── Read & parse user from sessionStorage ─────────────────────────────────
  const storedUser = (() => {
    try {
      const raw = sessionStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Match stored countryCode (+254 etc.) to a country entry
  const prefillCountry =
    (storedUser?.countryCode
      ? countries.find((c) => c.phone === storedUser.countryCode)
      : null) || countries.find((c) => c.code === 'AE');

  // ── State ──────────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    firstName:         storedUser?.firstName   || '',
    lastName:          storedUser?.lastName    || '',
    email:             storedUser?.email       || '',
    phonePrefix:       storedUser?.countryCode || prefillCountry?.phone || '+971',
    phone:             storedUser?.phoneNumber || '',
    country:           prefillCountry?.code    || 'AE',
    countryName:       prefillCountry?.name    || 'United Arab Emirates',
    address1:          '',
    locality:          '',
    administrativeArea:'',
    postalCode:        '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleCountryChange = (e) => {
    const selected = countries.find((c) => c.code === e.target.value);
    if (selected) {
      setFormData((p) => ({
        ...p,
        country:     selected.code,
        countryName: selected.name,
        phonePrefix: selected.phone,
      }));
    }
  };

  const validateStep = (step) => {
    const e = {};
    if (step === 1) {
      if (!formData.firstName.trim())  e.firstName = 'First name is required';
      if (!formData.lastName.trim())   e.lastName  = 'Last name is required';
      if (!formData.email.trim())      e.email     = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format';
      if (!formData.phone.trim())      e.phone     = 'Phone number is required';
      if (!formData.country)           e.country   = 'Country is required';
    }
    if (step === 2) {
      if (!formData.address1.trim())          e.address1          = 'Street address is required';
      if (!formData.locality.trim())          e.locality          = 'City is required';
      if (!formData.administrativeArea.trim()) e.administrativeArea = 'State / Province is required';
      if (!formData.postalCode.trim())        e.postalCode        = 'Postal code is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => p + 1);
  };

  const handleBack = () => setCurrentStep((p) => p - 1);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    setIsProcessing(true);

    const payload = {
      planId,
      paymentMethod: 'GPAY_APAY',
      customer: {
        firstName:   formData.firstName,
        lastName:    formData.lastName,
        email:       formData.email,
        phone:       `${formData.phonePrefix}${formData.phone}`,
        country:     formData.country,
        countryName: formData.countryName,
      },
      billingAddress: {
        address1:           formData.address1,
        locality:           formData.locality,
        administrativeArea: formData.administrativeArea,
        postalCode:         formData.postalCode,
        country:            formData.country,
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/job-seeker/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data?.message || 'Failed to initiate subscription');

      successMessage(data?.message || 'Subscription initiated successfully!');

      setPaymentResult(data?.result || null);
      setPaymentSuccess(true);

      // Google Ads purchase conversion event
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: 'AW-18030826186/DypyCOed2IwcEMql4pVD',
          value: (data?.result?.plan?.amountToPay || 1.0),
          currency: data?.result?.plan?.currency || 'CAD',
          transaction_id: data?.result?.gateway?.externalId || '',
        });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Success / Payment Link screen ──────────────────────────────────────────
  if (paymentSuccess) {
    const link = paymentResult?.gateway?.payment_link;
    const planData = paymentResult?.plan;

    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-sidebar rounded-3xl shadow-2xl max-w-3xl w-full p-8">
          {/* Icon + title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-theme_color/10 dark:bg-dark-theme_color/10 border-2 border-theme_color dark:border-dark-theme_color flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-theme_color dark:text-dark-theme_color" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Subscription Ready!
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete your payment to activate the{' '}
              <span className="font-semibold text-theme_color dark:text-dark-theme_color">
                {planData?.name || planName}
              </span>{' '}
              plan.
            </p>
          </div>

          {/* Plan amount summary */}
          {planData && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-theme_color/5 dark:bg-dark-theme_color/5 border border-theme_color/15 dark:border-dark-theme_color/15 mb-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Amount due</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${planData.amountToPay}{' '}
                  <span className="text-sm font-normal text-gray-400">{planData.currency}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Billing</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                  {planData.interval?.toLowerCase()}ly
                </p>
              </div>
            </div>
          )}

          {/* Payment link box */}
          {link && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Payment Link
              </p>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60">
                <p className="flex-1 text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                  {link}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {link && (
              <>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold border-2 border-theme_color dark:border-dark-theme_color text-theme_color dark:text-dark-theme_color hover:bg-theme_color/5 dark:hover:bg-dark-theme_color/5 transition-all text-sm"
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Payment Link</>
                  )}
                </button>

                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold bg-theme_color dark:bg-dark-theme_color text-white hover:opacity-90 transition-all shadow-md shadow-theme_color/30 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Payment Page
                </a>
              </>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-6 rounded-xl font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm"
            >
              Go to Dashboard
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
            ⚠ Complete payment soon — this link may expire
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-full pt-10 md:px-4 ">
      <div className="w-full">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-theme_color dark:hover:text-dark-theme_color transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        {/* Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-theme_color/10 dark:bg-dark-theme_color/10 border border-theme_color/20 dark:border-dark-theme_color/20">
            <Smartphone className="w-3.5 h-3.5 text-theme_color dark:text-dark-theme_color" />
            <span className="text-xs font-semibold text-theme_color dark:text-dark-theme_color">
              Google Pay / Apple Pay
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Your Purchase
          </h1>
          {planName && (
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Subscribing to the{' '}
              <span className="font-semibold text-theme_color dark:text-dark-theme_color">
                {planName}
              </span>{' '}
              Plan
            </p>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const active = currentStep === step.number;
            const done   = currentStep > step.number;
            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold',
                      done
                        ? 'bg-theme_color dark:bg-dark-theme_color text-white shadow-md shadow-theme_color/20'
                        : active
                          ? 'bg-theme_color dark:bg-dark-theme_color text-white shadow-lg shadow-theme_color/30 scale-110'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500',
                    ].join(' ')}
                  >
                    {done ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={[
                      'text-xs font-semibold mt-1.5 whitespace-nowrap',
                      active || done
                        ? 'text-theme_color dark:text-dark-theme_color'
                        : 'text-gray-400 dark:text-gray-500',
                    ].join(' ')}
                  >
                    {step.title}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={[
                      'flex-1 h-0.5 mx-3 mb-5 rounded-full transition-all duration-500',
                      currentStep > step.number
                        ? 'bg-theme_color dark:bg-dark-theme_color'
                        : 'bg-gray-200 dark:bg-gray-700',
                    ].join(' ')}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-dark-sidebar rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Personal Info ───────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-theme_color/10 dark:bg-dark-theme_color/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-theme_color dark:text-dark-theme_color" />
                  </span>
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="First Name *" error={errors.firstName}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="firstName"
                        value={formData.firstName} onChange={handleChange}
                        className={inputCls(errors.firstName)} placeholder="John"
                      />
                    </div>
                  </Field>

                  <Field label="Last Name *" error={errors.lastName}>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="lastName"
                        value={formData.lastName} onChange={handleChange}
                        className={inputCls(errors.lastName)} placeholder="Doe"
                      />
                    </div>
                  </Field>
                </div>

                <Field label="Email Address *" error={errors.email}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" name="email"
                      value={formData.email} onChange={handleChange}
                      className={inputCls(errors.email)} placeholder="john@example.com"
                    />
                  </div>
                </Field>

                <Field label="Country *" error={errors.country}>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      name="country" value={formData.country}
                      onChange={handleCountryChange}
                      className={`${inputCls(errors.country)} appearance-none`}
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name} ({c.code}) {c.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>

                <Field label="Phone Number *" error={null}>
                  <div className="flex gap-2">
                    <div className="relative w-28 flex-shrink-0">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" value={formData.phonePrefix} readOnly
                        className="w-full pl-9 pr-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-mono cursor-not-allowed"
                      />
                    </div>
                    <input
                      type="tel" name="phone"
                      value={formData.phone} onChange={handleChange}
                      className={`flex-1 ${plainInputCls(errors.phone)}`}
                      placeholder="712 345 678"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.phone}
                    </p>
                  )}
                </Field>

                <div className="flex justify-end pt-2">
                  <button
                    type="button" onClick={handleNext}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-theme_color dark:bg-dark-theme_color text-white hover:opacity-90 transition-all shadow-md shadow-theme_color/25 text-sm"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Billing Address ─────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-theme_color/10 dark:bg-dark-theme_color/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-theme_color dark:text-dark-theme_color" />
                  </span>
                  Billing Address
                </h2>

                <Field label="Street Address *" error={errors.address1}>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" name="address1"
                      value={formData.address1} onChange={handleChange}
                      className={inputCls(errors.address1)} placeholder="123 Main Street"
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="City / Locality *" error={errors.locality}>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="locality"
                        value={formData.locality} onChange={handleChange}
                        className={inputCls(errors.locality)} placeholder="Dubai"
                      />
                    </div>
                  </Field>

                  <Field label="State / Province *" error={errors.administrativeArea}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="administrativeArea"
                        value={formData.administrativeArea} onChange={handleChange}
                        className={inputCls(errors.administrativeArea)} placeholder="Dubai"
                      />
                    </div>
                  </Field>

                  <Field label="Postal Code *" error={errors.postalCode}>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" name="postalCode"
                        value={formData.postalCode} onChange={handleChange}
                        className={inputCls(errors.postalCode)} placeholder="12345"
                      />
                    </div>
                  </Field>

                  <Field label="Country">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" value={formData.countryName} readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>
                  </Field>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button" onClick={handleBack}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="button" onClick={handleNext}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-theme_color dark:bg-dark-theme_color text-white hover:opacity-90 transition-all shadow-md shadow-theme_color/25 text-sm"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review & Pay ────────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                  <span className="w-7 h-7 rounded-lg bg-theme_color/10 dark:bg-dark-theme_color/10 flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-theme_color dark:text-dark-theme_color" />
                  </span>
                  Review Your Details
                </h2>

                {/* Personal summary */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Personal
                    </span>
                    <button
                      type="button" onClick={() => setCurrentStep(1)}
                      className="text-xs text-theme_color dark:text-dark-theme_color font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-y-2.5 text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.firstName} {formData.lastName}</span>
                    <span className="text-gray-400 dark:text-gray-500">Email</span>
                    <span className="text-gray-900 dark:text-white font-medium break-all">{formData.email}</span>
                    <span className="text-gray-400 dark:text-gray-500">Phone</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.phonePrefix} {formData.phone}</span>
                    <span className="text-gray-400 dark:text-gray-500">Country</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.countryName}</span>
                  </div>
                </div>

                {/* Billing summary */}
                <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Billing Address
                    </span>
                    <button
                      type="button" onClick={() => setCurrentStep(2)}
                      className="text-xs text-theme_color dark:text-dark-theme_color font-semibold hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-y-2.5 text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Street</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.address1}</span>
                    <span className="text-gray-400 dark:text-gray-500">City</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.locality}</span>
                    <span className="text-gray-400 dark:text-gray-500">State</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.administrativeArea}</span>
                    <span className="text-gray-400 dark:text-gray-500">Postal Code</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formData.postalCode}</span>
                  </div>
                </div>

                {/* Payment method */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-theme_color/5 dark:bg-dark-theme_color/5 border border-theme_color/15 dark:border-dark-theme_color/15">
                  <div className="w-9 h-9 rounded-lg bg-theme_color dark:bg-dark-theme_color flex items-center justify-center flex-shrink-0 shadow shadow-theme_color/30">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white">Google Pay / Apple Pay</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fast, secure wallet payment</p>
                  </div>
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-theme_color/10 dark:bg-dark-theme_color/10 text-theme_color dark:text-dark-theme_color">
                    GPAY_APAY
                  </span>
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <button
                    type="button" onClick={handleBack}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit" disabled={isProcessing}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-theme_color dark:bg-dark-theme_color hover:opacity-90 transition-all shadow-md shadow-theme_color/30 text-sm disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px] justify-center"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Confirm & Pay</>
                    )}
                  </button>
                </div>

                <p className="text-xs text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1 pt-1">
                  <Lock className="w-3 h-3" />
                  Secure & encrypted · Cancel anytime
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Step progress dots */}
        <div className="flex justify-center gap-2 my-5">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={[
                'h-1.5 rounded-full transition-all duration-500',
                currentStep >= s.number
                  ? 'w-8 bg-theme_color dark:bg-dark-theme_color'
                  : 'w-4 bg-gray-200 dark:bg-gray-700',
              ].join(' ')}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Checkout;