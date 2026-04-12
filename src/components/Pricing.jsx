// Pricing.jsx
import React, { useState } from 'react';
import { Check, X, Crown, Star, Zap, ArrowRight, Sparkles, TrendingUp, Shield, Gem, MessageCircle } from 'lucide-react';

const DURATIONS = [
  { key: '1mo', label: '1 Month', months: 1 },
  { key: '3mo', label: '3 Months', months: 3 },
  { key: '6mo', label: '6 Months', months: 6 },
  { key: '12mo', label: '1 Year', months: 12, badge: 'Best Value' },
];

const ACTIVE_DURATION = '12mo';

const PRICING = {
  Silver: { '1mo': 10.00, '3mo': 29.95, '6mo': 47.95, '12mo': 119.40 },
  Gold: { '1mo': 20.00, '3mo': 59.95, '6mo': 95.95, '12mo': 239.40 },
  Platinum: { '1mo': 30.00, '3mo': 89.95, '6mo': 143.95, '12mo': 359.40 },
};

const YEARLY_MONTHLY_RATE = {
  Silver: 9.95,
  Gold: 19.95,
  Platinum: 29.95,
};

const plans = [
  {
    name: 'Silver',
    accentColor: 'text-slate-600',
    accentBg: 'bg-slate-600',
    cardBg: 'bg-slate-50 dark:bg-gray-800',
    popular: false,
    icon: Shield,
    description: 'Perfect for getting started',
    features: [
      { text: 'Save up to 25 jobs', included: true },
      { text: 'Basic job recommendations', included: true },
      { text: 'View application status', included: true },
      { text: 'Standard CV template', included: true },
      { text: 'Apply to jobs directly', included: true },
      { text: 'AI match score on jobs', included: false },
      { text: 'Priority support', included: false },
      { text: 'Advanced filters & sorting', included: false },
    ],
  },
  {
    name: 'Gold',
    accentColor: 'text-orange-600',
    accentBg: 'bg-orange-600',
    cardBg: 'bg-orange-50 dark:bg-orange-950',
    popular: true,
    icon: Crown,
    description: 'Most popular choice',
    features: [
      { text: 'Unlimited saved jobs', included: true },
      { text: 'AI job recommendations', included: true },
      { text: 'Detailed application tracking', included: true },
      { text: 'Premium CV templates', included: true },
      { text: 'One-click apply', included: true },
      { text: 'AI match score + skills gap', included: true },
      { text: 'Priority email & chat', included: true },
      { text: 'Advanced filters & alerts', included: true },
    ],
  },
  {
    name: 'Platinum',
    accentColor: 'text-purple-600',
    accentBg: 'bg-purple-600',
    cardBg: 'bg-purple-50 dark:bg-purple-950',
    popular: false,
    icon: Sparkles,
    description: 'For serious career growth',
    features: [
      { text: 'Everything in Gold', included: true },
      { text: 'AI-powered CV optimization', included: true },
      { text: 'AI-generated cover letters', included: true },
      { text: 'Priority visibility', included: true },
      { text: 'Exclusive job alerts', included: true },
      { text: '1-on-1 coaching/month', included: true },
      { text: 'Early access to features', included: true },
      { text: 'VIP phone support', included: true },
    ],
  },
];

const customPlan = {
  name: 'Custom Package',
  accentColor: 'text-cyan-600',
  accentBg: 'bg-cyan-600',
  cardBg: 'bg-cyan-50 dark:bg-cyan-950',
  icon: Gem,
  description: 'Everything in Platinum, Plus',
  features: [
    { text: 'Everything in Platinum', included: true },
    { text: 'Recruiter does custom job searches', included: true },
    { text: 'Represents you to companies', included: true },
    { text: 'Schedules interviews for you', included: true },
    { text: 'Completes reference checks', included: true },
    { text: 'Assists with offer negotiations', included: true },
    { text: 'Hiring manager feedback', included: true },
    { text: 'Dedicated telephone support', included: true },
  ],
};

function Pricing() {
  const [duration, setDuration] = useState('12mo');
  const activeDuration = DURATIONS.find((d) => d.key === duration);

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-gray-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-100 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-orange-300 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-800">
            <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Simple, transparent pricing</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
            Choose Your Plan
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Unlock better job matches, premium tools, and accelerate your career growth in Dubai & UAE
          </p>

          {/* Duration Toggle */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {DURATIONS.map((d) => (
              <button
                key={d.key}
                onClick={() => setDuration(d.key)}
                className={`relative px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
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
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const totalPrice = PRICING[plan.name][duration];
            const perMonth = (totalPrice / activeDuration.months).toFixed(2);

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 group flex flex-col ${
                  plan.popular
                    ? 'shadow-2xl ring-2 ring-orange-400/50'
                    : 'shadow-xl hover:shadow-2xl'
                }`}
              >
                <div className={`absolute inset-0 ${plan.cardBg} backdrop-blur-xl`}></div>
                <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-orange-600 text-white text-[11px] font-bold py-1.5 text-center z-10">
                    MOST POPULAR
                  </div>
                )}

                <div className={`relative ${plan.popular ? 'pt-10' : 'pt-6'} px-5 pb-6 flex flex-col flex-1`}>
                  {/* Icon & Plan Name */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`w-10 h-10 rounded-xl ${plan.accentBg} flex items-center justify-center shadow-md flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{plan.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-extrabold ${plan.accentColor}`}>
                        ${totalPrice}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        / {activeDuration.months === 1 ? 'month' : activeDuration.months === 12 ? 'year' : `${activeDuration.months} months`}
                      </span>
                    </div>
                    {duration === '12mo' && YEARLY_MONTHLY_RATE[plan.name] ? (
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
                        or ${YEARLY_MONTHLY_RATE[plan.name]}/mo × 12 installments
                      </p>
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
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px]">
                          {feature.included ? (
                            <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <X className="w-2.5 h-2.5 text-gray-400 dark:text-gray-600" />
                            </div>
                          )}
                          <span className={`leading-snug break-words ${
                            feature.included
                              ? 'text-gray-700 dark:text-gray-300'
                              : 'text-gray-400 dark:text-gray-600 line-through'
                          }`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  {duration !== ACTIVE_DURATION ? (
                    <div className="relative group/inactive w-full mt-5">
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-xl font-bold text-center text-sm bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      >
                        Get Started
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover/inactive:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                        Only yearly plan is available — payable monthly or one-time
                      </div>
                    </div>
                  ) : (
                    <a
                      href={`/register?plan=${plan.name.toLowerCase()}&duration=${duration}`}
                      className={`w-full mt-5 py-3 px-4 rounded-xl font-bold text-center text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group/btn ${
                        plan.popular
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : `${plan.accentBg} text-white hover:shadow-xl hover:opacity-90`
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Package Card */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className={`relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group`}>
            <div className={`absolute inset-0 ${customPlan.cardBg} backdrop-blur-xl`}></div>
            <div className="absolute inset-0 bg-orange-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>

            <div className="relative pt-6 px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl ${customPlan.accentBg} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <Gem className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{customPlan.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{customPlan.description}</p>
                  </div>
                </div>
                <span className={`text-2xl font-extrabold ${customPlan.accentColor} sm:ml-auto`}>Custom Pricing</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {customPlan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[13px]">
                    <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 leading-snug">{feature.text}</span>
                  </div>
                ))}
              </div>

              <a
                href="mailto:info@ratchetup.ai?subject=Custom Package Inquiry"
                className={`inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg ${customPlan.accentBg} text-white hover:opacity-90`}
              >
                Contact Us
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-center text-base font-semibold text-gray-900 dark:text-white mb-5">
              Join thousands of job seekers landing better opportunities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Secure Payments</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">256-bit SSL encryption</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Cancel Anytime</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">No long-term commitment</p>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">24/7 Support</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">We're here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default Pricing;
