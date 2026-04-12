import { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../themes/ThemeContext';
import logo from '../assets/logo.png';
import logodark from '../assets/logodark.png';

const navItems = [
  { name: 'Jobs', path: '/joblisting' },
  { name: 'Companies', path: '/companies' },
  { name: 'How it works', path: '/#how_it_works' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  { name: 'Login', path: '/login' },
];

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState(
    window.location.pathname + window.location.hash
  );

  useEffect(() => {
    const updatePath = () => {
      setActivePath(window.location.pathname + window.location.hash);
    };

    window.addEventListener('popstate', updatePath);
    window.addEventListener('hashchange', updatePath);

    return () => {
      window.removeEventListener('popstate', updatePath);
      window.removeEventListener('hashchange', updatePath);
    };
  }, []);

  const isLinkActive = (path) => {
    if (path.includes('#')) {
      return activePath === path;
    }
    return activePath.startsWith(path);
  };

  const handleNavClick = (path) => {
    setIsMenuOpen(false);

    if (path.includes('#')) {
      const [, hash] = path.split('#');
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 50);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-slate-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 md:h-24 items-center justify-between">

          {/* Logo + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center"
            >
              <img
                src={isDark ? logodark : logo}
                alt="RatchetUp"
                className="w-[180px] sm:w-[220px] md:w-[260px] h-auto"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`relative text-sm font-medium transition-colors pb-0.5
                  ${isLinkActive(item.path)
                    ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400'
                    : 'text-slate-600 hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400'
                  }`}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <a
              href="https://recruiter.ratchetup.ai/register"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex px-4 lg:px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition"
            >
              For Employers
            </a>

            <Link
              to="/joblisting"
              className="hidden lg:inline-flex px-5 py-2 rounded-lg border border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium text-sm transition"
            >
              Find Jobs
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-[64px] bottom-0 z-40
          bg-white dark:bg-gray-950
          transition-all duration-300 ease-in-out
          ${isMenuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
      >
        <nav className="h-full flex flex-col gap-1 px-4 py-6 bg-white dark:bg-gray-950 overflow-y-auto">
          {navItems.map((item) => {
            const active = isLinkActive(item.path);

            return (
              <a
                key={item.name}
                href={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`
                  block w-full rounded-lg px-4 py-3 text-base font-medium transition
                  ${active
                    ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }
                `}
              >
                {item.name}
              </a>
            );
          })}

          {/* CTA buttons */}
          <div className="mt-6 flex flex-col gap-3 px-1">
            <a
              href="https://recruiter.ratchetup.ai/register"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-center font-medium transition"
            >
              For Employers
            </a>

            <Link
              to="/joblisting"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 rounded-lg border border-orange-600 text-orange-600 dark:text-orange-400 text-center font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            >
              Find Jobs
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
