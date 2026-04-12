import { useState, useEffect } from 'react';
import {
  Briefcase, Building2, Users, Target, Award, TrendingUp,
  Heart, Globe, CheckCircle, Zap, Shield, Sparkles,
  ArrowRight, Star, MapPin, Clock, ChevronRight, UserPlus,
  DollarSign, MousePointerClick, UserCheck
} from 'lucide-react';
import partner1 from '../assets/nio.png';
import partner2 from '../assets/ensigma.png';

const About = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: DollarSign,
      title: 'Cost Effective',
      description: 'Whether you choose to post your jobs directly or have them indexed automatically, our pricing model is highly competitive and cost-effective.'
    },
    {
      icon: MousePointerClick,
      title: 'Easy to Use',
      description: 'We have created a streamlined user interface so you can easily manage your jobs and candidates.'
    },
    {
      icon: UserCheck,
      title: 'Quality Candidate',
      description: 'Irrespective of your organization\'s size, we have a large pool of candidates with diverse skill sets and experience levels.'
    }
  ];

  const stats = [
    { icon: Briefcase, label: 'Live Jobs', value: '0' },
    { icon: Building2, label: 'Companies', value: '64682' },
    { icon: Users, label: 'Candidates', value: '3167' }
  ];

  const partners = [
    { name: 'NIO', logo: partner1 },
    { name: 'ENSIGMA TECHNOLOGIES', logo: partner2 },
    { name: 'NIO', logo: partner1 },
    { name: 'ENSIGMA TECHNOLOGIES', logo: partner2 },
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-gray-950 transition-colors duration-300 font-sans">

      {/* Who We Are Section */}
      <section className="bg-white dark:bg-gray-950 py-16 md:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12 md:flex-row">

            <div className="md:w-3/5">
              <div className="mb-2">
                <span className="text-orange-600 font-medium text-xs uppercase tracking-widest">
                  01 / About
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-[#1A2D42] dark:text-white mb-6 border-l-4 border-orange-600 pl-4">
                We're a highly skilled and professional team.
              </h2>

              <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                At RatchetUp, we're more than just a job portal; we're your partner in career success. Our dedicated team is committed to revolutionizing the job search experience.
              </p>

              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe in connecting talent with opportunity, ensuring that every individual finds meaningful work, and every employer discovers exceptional talent. With a passion for excellence, we strive to make the job market accessible, transparent, and rewarding for all. Join us on this journey as we shape the future of employment.
              </p>
            </div>

            {/* Stats */}
            <div className="md:w-2/5 flex flex-col gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-5 p-5 bg-[#FAFBFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon size={22} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-[#FAFBFC] dark:bg-slate-900 py-16 md:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="mb-12">
            <span className="text-orange-600 font-medium text-xs uppercase tracking-widest">
              02 / Why Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2D42] dark:text-white mt-2 border-l-4 border-orange-600 pl-4">
              Why Choose <span className="text-orange-600">RatchetUp</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Teal top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-orange-600" />

                  <div className="w-12 h-12 mb-4 bg-orange-600/10 rounded-lg flex items-center justify-center">
                    <Icon size={22} className="text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1A2D42] dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-3 text-sm">
              Have a question?
            </p>
            <a href="/contact" className="text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors">
              Contact us <ArrowRight size={14} className="inline ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white dark:bg-gray-950 py-16 md:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-orange-600 font-medium text-xs uppercase tracking-widest">
              03 / Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A2D42] dark:text-white mt-2 mb-8 border-l-4 border-orange-600 pl-4">
              We're a highly professional team
            </h2>

            <blockquote className="border-l-4 border-orange-600 pl-6 mb-8">
              <p className="text-lg italic text-slate-600 dark:text-slate-400 leading-relaxed">
                "At RatchetUp, our mission is to empower individuals and organizations to achieve their full potential by connecting talent with opportunity. We believe that every person deserves meaningful work, and every employer deserves exceptional talent."
              </p>
            </blockquote>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We are dedicated to delivering quality connections. We strive for excellence in matching talent to the right opportunities, resulting in long-lasting, fulfilling employment relationships.
            </p>
          </div>
        </div>
      </section>

      {/* Trusted Partners */}
      <section className="bg-[#FAFBFC] dark:bg-slate-900 py-12 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Trusted Partners
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <img
                  className="w-[120px] h-[80px] object-contain"
                  src={partner?.logo}
                  alt={partner?.name}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white dark:bg-gray-950 py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-orange-600 font-medium text-xs uppercase tracking-widest">
            04 / Get Started
          </span>
          <h2 className="text-3xl font-bold text-[#1A2D42] dark:text-white mt-2 mb-4">
            Join Our Talent Network
          </h2>
          <p className="mb-8 text-slate-500 dark:text-slate-400 leading-relaxed">
            Unlock endless opportunities and connect with top employers. Let your skills shine and land your dream job.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started <ArrowRight size={18} />
          </a>
        </div>
      </section>

    </div>
  );
};

export default About;
