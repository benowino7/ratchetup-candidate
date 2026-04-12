import { useState, useEffect } from "react";
import {
  UserPlus,
  Upload,
  Search,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import teamImg from "../assets/team.jpg";

const ProfileProgressSection = () => {
  const steps = [
    {
      icon: Search,
      title: "Explore Opportunities",
      description:
        "Browse through a diverse range of job listings tailored to your interests and expertise",
    },
    {
      icon: Upload,
      title: "Create Your Profile",
      description:
        "Build a standout profile highlighting your skills, experience, and qualifications",
    },
    {
      icon: UserPlus,
      title: "Apply with Ease",
      description:
        "Effortlessly apply to jobs that match your preferences with just a few clicks",
    },
    {
      icon: CheckCircle,
      title: "Track Your Progress",
      description:
        "Stay informed on your applications and manage your job-seeking journey effectively",
    },
  ];

  return (
    <div className="bg-background dark:bg-dark-background transition-colors duration-300 py-10 md:py-24">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Create Profile Section */}
        <div className="mb-12 sm:mb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Side */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-orange-500/20 dark:bg-orange-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={teamImg}
                  alt="Professional woman working"
                  className="w-full h-[280px] sm:h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Bottom Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-dark-sidebar/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    98% Profile Match Rate
                  </p>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme_color/10 dark:bg-dark-theme_color/10 rounded-full border border-theme_color/20 dark:border-dark-theme_color/20">
                <Sparkles
                  size={16}
                  className="text-theme_color dark:text-dark-theme_color"
                />
                <span className="text-sm font-semibold text-theme_color dark:text-dark-theme_color">
                  Create Profile
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Create Your Personal{" "}
                <span className="text-orange-600">
                  Account Profile
                </span>
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                Work Profile is a personality assessment that measures an
                individual's work personality through their workplace traits,
                social and emotional traits; as well as the values and
                aspirations that drive them forward.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                      Stand Out to Employers
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Showcase your unique skills and experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                      Get Matched Faster
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      AI-powered matching with relevant opportunities
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-8">
                <a href="/register" className="group flex-1 px-5 sm:px-8 py-3 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 sm:gap-3 text-sm sm:text-base justify-center">
                  <span>Create Job Seeker Profile</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform flex-shrink-0"
                  />
                </a>
                <a
                  href="https://recruiter.ratchetup.ai/register"
                  target='_blank'
                  className="group flex-1 px-5 sm:px-8 py-3 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 sm:gap-3 text-sm sm:text-base justify-center">
                  <span>Create Company Profile</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform flex-shrink-0"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Working Process Section */}
        <div id="how_it_works" className="relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/30 pointer-events-none" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme_color/5 dark:bg-dark-theme_color/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

          {/* Section Header */}
          <div className="text-center mb-10 sm:mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme_color/10 dark:bg-dark-theme_color/10 rounded-full border border-theme_color/20 dark:border-dark-theme_color/20 mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-theme_color dark:bg-dark-theme_color rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-theme_color dark:text-dark-theme_color">
                Simple Process
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
              <span className="text-theme_color dark:text-dark-theme_color">
                RatchetUp
              </span>{" "}
              Working Process
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
              Your journey to the perfect job starts here. Follow these simple
              steps
            </p>
          </div>

          {/* Progress Steps */}
          <div className="relative max-w-[90rem] mx-auto">
            {/* Connection Lines with Animated Arrows */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-40 pointer-events-none z-0">
              <svg
                className="w-full h-full"
                preserveAspectRatio="none"
                viewBox="0 0 1200 150"
              >
                <defs>
                  {/* Gradient for lines */}
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#E8600A" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                  </linearGradient>

                  {/* Arrow markers with gradient */}
                  <marker
                    id="arrow1"
                    markerWidth="12"
                    markerHeight="12"
                    refX="10"
                    refY="6"
                    orient="auto"
                  >
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="url(#lineGradient)" />
                  </marker>
                  <marker
                    id="arrow2"
                    markerWidth="12"
                    markerHeight="12"
                    refX="10"
                    refY="6"
                    orient="auto"
                  >
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="url(#lineGradient)" />
                  </marker>
                  <marker
                    id="arrow3"
                    markerWidth="12"
                    markerHeight="12"
                    refX="10"
                    refY="6"
                    orient="auto"
                  >
                    <path d="M 0 0 L 12 6 L 0 12 z" fill="url(#lineGradient)" />
                  </marker>
                </defs>

                {/* Smooth flowing curves */}
                <path
                  d="M 160 40 Q 250 10, 340 40"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,8"
                  markerEnd="url(#arrow1)"
                  className="animate-dash"
                />

                <path
                  d="M 460 40 Q 600 100, 740 40"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,8"
                  markerEnd="url(#arrow2)"
                  className="animate-dash"
                  style={{ animationDelay: "0.3s" }}
                />

                <path
                  d="M 860 40 Q 950 10, 1040 40"
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,8"
                  markerEnd="url(#arrow3)"
                  className="animate-dash"
                  style={{ animationDelay: "0.6s" }}
                />
              </svg>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 lg:gap-8 relative z-10">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="text-center group relative"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg border-4 border-background dark:border-dark-background">
                      {index + 1}
                    </div>
                  </div>

                  {/* Icon Container with Glow Effect */}
                  <div className="flex justify-center mb-4 sm:mb-8 relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-theme_color/20 dark:bg-dark-theme_color/20 rounded-full blur-xl group-hover:bg-theme_color/30 dark:group-hover:bg-dark-theme_color/30 transition-all duration-500" />
                    </div>

                    {/* Main icon circle */}
                    <div className="relative w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white dark:bg-dark-sidebar border-3 sm:border-4 border-theme_color/30 dark:border-dark-theme_color/30 flex items-center justify-center transform group-hover:scale-110 group-hover:border-theme_color dark:group-hover:border-dark-theme_color transition-all duration-500 shadow-xl">
                      <step.icon
                        className="text-theme_color dark:text-dark-theme_color"
                        size={24}
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 px-1 sm:px-4 group-hover:text-theme_color dark:group-hover:text-dark-theme_color transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-sm px-1 sm:px-2 hidden sm:block">
                    {step.description}
                  </p>

                  {/* Decorative dot */}
                  <div className="mt-6 flex justify-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-theme_color/30 dark:bg-dark-theme_color/30 group-hover:bg-theme_color dark:group-hover:bg-dark-theme_color transition-all duration-300"
                        style={{ transitionDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfileProgressSection;
