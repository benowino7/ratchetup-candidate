// src/pages/Footer.jsx
import React, { useState } from 'react';
import {
  Building2, Briefcase, Mail, Phone, MapPin, Send,
  Linkedin, Twitter, Instagram, Facebook, ArrowUp
} from 'lucide-react';
import logo from '../assets/logo.png';
import logodark from '../assets/logodark.png';
import { useTheme } from '../themes/ThemeContext';
import PolicyModal from '../components/PolicyModal';
import { CookieSettingsButton } from '../components/CookieConsent';

const Footer = () => {
  const [showTerms, setShowTerms] = useState(false);
  const { isDark } = useTheme();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">

            {/* Brand + Newsletter */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mb-4">
                <img
                  className="w-[220px] sm:w-[260px] h-auto object-contain"
                  src={isDark ? logodark : logo}
                  alt="RatchetUp logo"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
                Precision Hiring. AI Powered.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Connecting top talent with the best career opportunities across Dubai and the UAE.
              </p>

              {/* Newsletter */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-[#1A2D42] dark:text-white">
                  Stay Updated
                </h4>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-3 py-2 bg-[#FAFBFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600/30 text-sm dark:text-white dark:placeholder:text-slate-500 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Job Seekers */}
            <div>
              <h3 className="text-sm font-semibold text-[#1A2D42] dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Briefcase size={16} className="text-orange-600" /> For Job Seekers
              </h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/joblisting" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Find Jobs</a></li>
                <li><a href="/login" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Login</a></li>
                <li><a href="/register" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Create Profile</a></li>
                <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Job Alerts</a></li>
                <li><a href="/pricing" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Employers */}
            <div>
              <h3 className="text-sm font-semibold text-[#1A2D42] dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2">
                <Building2 size={16} className="text-orange-600" /> For Employers
              </h3>
              <ul className="space-y-3 text-sm">
                <li><a href="https://recruiter.ratchetup.ai/login?target=jobs" target="_blank" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Post a Job</a></li>
                <li><a href="https://recruiter.ratchetup.ai/login" target="_blank" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Employer Login</a></li>
                <li><a href="https://recruiter.ratchetup.ai/pricing" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Pricing Plans</a></li>
                <li><a href="https://recruiter.ratchetup.ai/register" target="_blank" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Create Company Profile</a></li>
              </ul>
            </div>

            {/* Company + Contact */}
            <div>
              <h3 className="text-sm font-semibold text-[#1A2D42] dark:text-white uppercase tracking-wider mb-5">
                Company & Contact
              </h3>

              <ul className="space-y-3 mb-6 text-sm">
                <li><a href="/about" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><button onClick={() => setShowTerms(true)} className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Terms of Use</button></li>
                <li><CookieSettingsButton className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors" /></li>
              </ul>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-500">Suite 502, 55 Commerce Valley,<br />Markham, ON, L3T 7V9</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <div><a href="tel:+16477888715" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Customer Care: 647-788-8715</a></div>
                    <div><a href="tel:+16479307516" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">Support: 647-930-7516</a></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-orange-600 flex-shrink-0" />
                  <a href="mailto:support@ratchetup.ai" className="text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                    support@ratchetup.ai
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              {/* Copyright */}
              <div className="text-slate-400 text-center md:text-left">
                &copy; {new Date().getFullYear()} RatchetUp &mdash; All rights reserved.
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[
                  { Icon: Facebook, href: '#', label: 'Facebook' },
                  { Icon: Twitter, href: '#', label: 'Twitter' },
                  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                  { Icon: Instagram, href: '#', label: 'Instagram' },
                ].map(({ Icon, href, label }, i) => (
                  <a
                    key={i}
                    href={href}
                    className="w-9 h-9 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-colors"
                    aria-label={`Follow us on ${label}`}
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll to top */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-6 md:right-10 z-50 w-11 h-11 bg-orange-600 hover:bg-orange-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp size={20} className="text-white" />
        </button>
      </footer>
      <PolicyModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </>
  );
};

export default Footer;
