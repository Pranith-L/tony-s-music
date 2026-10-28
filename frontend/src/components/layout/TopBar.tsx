import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  X,
  User,
  Sparkles,
  Calendar,
  LogOut,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { ThemeToggle } from '../common/ThemeToggle.js';

interface TopBarProps {
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync input value with URL search param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/music?search=${encodeURIComponent(val.trim())}`, {
        replace: location.pathname === '/music',
      });
    } else if (location.pathname === '/music') {
      navigate('/music', { replace: true });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/music?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (location.pathname === '/music') {
      navigate('/music', { replace: true });
    }
  };

  const filterTabs = [
    { label: 'Home', te: 'ముఖ్యాంశం', path: '/' },
    { label: 'Devotional Songs', te: 'భక్తి గీతాలు (Free)', path: '/music' },
    { label: 'Studio Tracks (₹99)', te: 'ట్రాక్స్ (₹99)', path: '/tracks' },
    { label: 'My Library', te: 'నా లైబ్రరీ', path: '/library' },
    { label: 'Albums', te: 'ఆల్బమ్‌లు', path: '/albums' },
    { label: 'Live Videos', te: 'వీడియోలు', path: '/videos' },
    { label: "One-Time Pass (₹299)", te: 'లైఫ్‌టైమ్ పాస్', path: '/membership', hideOnMobile: true },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-white/95 dark:bg-[#121214]/95 backdrop-blur-xl border-b border-[#E5E5EA] dark:border-[#27272A] px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2">
      {/* Top Main Row - Balanced Equal Spacing for Brand, Search, and Profile */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Mobile Brand Monogram */}
        <Link to="/" className="md:hidden flex items-center gap-2 shrink-0" title="Tony's Music">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-white dark:bg-[#18181B] border border-[#D4A017]/40 shadow-sm">
            <img
              src="/tony_avatar_cutout.png"
              alt="Rev. Tony Prakash"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="h-8 flex items-center gap-1">
            <img
              src="/branding/brand_wordmark_light.png"
              alt="Tony's Music"
              className="h-8 w-auto max-w-[150px] object-contain block dark:hidden drop-shadow-sm"
            />
            <img
              src="/branding/brand_wordmark_dark.png"
              alt="Tony's Music"
              className="h-8 w-auto max-w-[150px] object-contain hidden dark:block drop-shadow-[0_2px_12px_rgba(250,36,60,0.25)]"
            />
            <span title="Verified Devotional Music Platform">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
            </span>
          </div>
        </Link>

        {/* Search Input - Expands evenly in the center with equal gaps */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center flex-1 min-w-0 max-w-sm md:max-w-md lg:w-96"
        >
          <div className="absolute left-2.5 sm:left-3 pointer-events-none text-[#FA243C]">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#F2F2F7] dark:bg-[#1C1C1E] hover:bg-white dark:hover:bg-[#252528] focus:bg-white dark:focus:bg-[#252528] text-xs sm:text-sm text-[#1D1D1F] dark:text-white placeholder-[#86868B] dark:placeholder-[#A1A1AA] rounded-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 border border-[#E5E5EA] dark:border-[#2C2C2E] focus:border-[#D4A017] focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right: Quick Action & Profile Pill */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Light / Dark Mode Toggle (Desktop only, mobile automatically follows phone OS setting) */}
          <ThemeToggle className="hidden md:inline-flex" />

          {/* Bookings / Ministry CTA (Desktop) */}
          <Link
            to="/bookings"
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F2F7] hover:bg-[#FEE2E2] border border-[#D4A017]/40 text-[#D4A017] hover:text-[#1D1D1F] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(212,160,23,0.15)] hover:scale-105"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Invite For Worship</span>
          </Link>

          {/* User Profile Pill / Auth */}
          <div className="relative shrink-0" ref={profileRef}>
            {user ? (
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#F2F2F7] hover:bg-[#FEE2E2] border border-[#E5E5EA] text-[#1D1D1F] transition-all"
                title={user.name}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FC3C44] to-[#FA243C] flex items-center justify-center font-bold text-xs text-[#1D1D1F] border border-[#D4A017]/40 shadow-sm shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-[#FC3C44] to-[#FA243C] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md hover:scale-105 shrink-0 border border-[#D4A017]/40"
                title="Log In"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Log In</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            {profileOpen && user && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#F2F2F7] border border-[#E5E5EA] shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-[#E5E5EA]">
                  <p className="font-bold text-[#1D1D1F] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#86868B] truncate">{user.email}</p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FEE2E2] text-[#1D1D1F] transition-colors"
                >
                  <User className="w-4 h-4 text-[#FA243C]" />
                  <span>Your Account</span>
                </Link>

                <Link
                  to="/library"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FEE2E2] text-[#D4A017] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>My Playlists & Library</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#FEE2E2] text-[#D4AF37] transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#D71A30]/10 text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scrollbar-none py-1 -mx-3 px-3 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                (tab as any).hideOnMobile ? 'hidden md:inline-flex' : 'inline-flex'
              } items-center ${
                isActive
                  ? 'bg-[#FA243C] text-white shadow-[0_0_15px_rgba(250,36,60,0.2)] border border-[#D4A017]/40'
                  : 'bg-[#F2F2F7] hover:bg-[#FEE2E2] text-[#86868B] hover:text-[#1D1D1F] border border-[#E5E5EA]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-telugu ml-1.5 text-[11px] opacity-75">{tab.te}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
export default TopBar;
