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
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface TopBarProps {
  onToggleMobileMenu: () => void;
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
    { label: "One-Time Pass (₹299)", te: 'లైఫ్‌టైమ్ పాస్', path: '/membership' },
  ];

  return (
    <header className="sticky top-0 z-20 w-full bg-[#0E0305]/90 backdrop-blur-xl border-b border-[#C41E3A]/20 px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col gap-1.5 sm:gap-2">
      {/* Top Main Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Left: Mobile Toggle & Desktop History Back/Forward */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A060A] border border-[#C41E3A]/30 text-[#FFFFFF] flex items-center justify-center hover:bg-[#340C14] transition-colors shrink-0"
            aria-label="Toggle menu"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Mobile Brand Monogram */}
          <Link to="/" className="md:hidden flex items-center gap-1 shrink-0">
            <span className="font-heading text-sm sm:text-base font-bold text-[#FFFFFF] tracking-tight">
              TONY'S <span className="text-[#C9B27C]">MUSIC</span>
            </span>
          </Link>


          {/* Search Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center flex-1 min-w-0 max-w-[170px] xs:max-w-[210px] sm:max-w-xs md:max-w-sm lg:w-96"
          >
            <div className="absolute left-2.5 sm:left-3 pointer-events-none text-[#C41E3A]">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#1A060A] hover:bg-[#26080F] focus:bg-[#26080F] text-xs sm:text-sm text-[#FFFFFF] placeholder-[#E2CBD0]/60 rounded-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 sm:py-2 border border-[#C41E3A]/30 focus:border-[#C9B27C] focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 text-[#E2CBD0] hover:text-[#FFFFFF]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Right: Quick Action & Profile Pill */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Bookings / Ministry CTA (Desktop) */}
          <Link
            to="/bookings"
            className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A060A] hover:bg-[#340C14] border border-[#C9B27C]/50 text-[#C9B27C] hover:text-[#FFFFFF] text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(201,178,124,0.15)] hover:scale-105"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Invite For Worship</span>
          </Link>

          {/* User Profile Pill / Auth */}
          <div className="relative shrink-0" ref={profileRef}>
            {user ? (
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#1A060A] hover:bg-[#340C14] border border-[#C41E3A]/40 text-[#FFFFFF] transition-all"
                title={user.name}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#C41E3A] to-[#8B1524] flex items-center justify-center font-bold text-xs text-[#FFFFFF] border border-[#C9B27C]/50 shadow-sm shrink-0">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="flex items-center justify-center gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r from-[#C41E3A] to-[#8B1524] hover:brightness-110 text-[#FFFFFF] text-xs font-bold transition-all shadow-md hover:scale-105 shrink-0 border border-[#C9B27C]/40"
                title="Log In"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Log In</span>
              </Link>
            )}

            {/* Profile Dropdown */}
            {profileOpen && user && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#1A060A] border border-[#C41E3A]/40 shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-[#C41E3A]/20">
                  <p className="font-bold text-[#FFFFFF] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#E2CBD0] truncate">{user.email}</p>
                </div>

                <Link
                  to="/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#340C14] text-[#FFFFFF] transition-colors"
                >
                  <User className="w-4 h-4 text-[#C41E3A]" />
                  <span>Your Account</span>
                </Link>

                <Link
                  to="/library"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#340C14] text-[#C9B27C] transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>My Playlists & Library</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#340C14] text-[#D4AF37] transition-colors"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
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
                isActive
                  ? 'bg-[#C41E3A] text-[#FFFFFF] shadow-[0_0_15px_rgba(27,124,157,0.4)] border border-[#C9B27C]/40'
                  : 'bg-[#1A060A] hover:bg-[#340C14] text-[#E2CBD0] hover:text-[#FFFFFF] border border-[#C41E3A]/20'
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
