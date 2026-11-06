import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Music,
  Disc3,
  Video as VideoIcon,
  User as UserIcon,
  Sparkles,
  Calendar,
  Info,
  Menu,
  X,
  Search,
  LogOut,
  ShieldAlert,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { usePlayer } from '../context/PlayerContext.js';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { user, isAdmin, isSubscriber, logout } = useAuth();
  const { currentTrack, isPlaying } = usePlayer();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/music?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', te: 'ముఖ్యాంశం', path: '/' },
    { name: 'Music', te: 'పాటలు', path: '/music' },
    { name: 'Albums', te: 'ఆల్బమ్‌లు', path: '/albums' },
    { name: 'Videos', te: 'వీడియోలు', path: '/videos' },
    { name: 'About', te: 'పరిచర్య', path: '/about' },
    { name: 'Bookings', te: 'కూడికలు', path: '/bookings' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-sacred-midnight/95 backdrop-blur-xl border-b border-sacred-gold/15 py-3.5 shadow-2xl shadow-black/80'
            : 'bg-gradient-to-b from-sacred-midnight/90 to-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo / Tony's Music Masthead */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-9 h-9 rounded-full bg-sacred-charcoal border border-sacred-gold/40 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(198,165,101,0.15)]">
              {/* Sacred Cross Emblem */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-sacred-gold" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 5v14M7 9.5h10" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl tracking-wider text-sacred-ivory font-medium group-hover:text-sacred-gold transition-colors">
                TONY PRAKASH
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-sacred-gold/80 font-light">
                OFFICIAL • భక్తి సంగీతం
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs tracking-wider uppercase font-medium transition-all duration-200 relative py-1 flex flex-col items-center ${
                    isActive
                      ? 'text-sacred-gold font-semibold'
                      : 'text-sacred-ivory/70 hover:text-sacred-ivory'
                  }`}
                >
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 w-4 h-0.5 bg-sacred-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="p-2 rounded-full bg-sacred-charcoal/80 border border-white/5 text-sacred-ivory/70 hover:text-sacred-gold hover:border-sacred-gold/30 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Now Playing Pulse if audio is active */}
            {currentTrack && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-sacred-charcoal/90 border border-sacred-gold/30 text-[11px] text-sacred-gold">
                <Volume2 className="w-3 h-3 text-sacred-gold animate-pulse" />
                <span className="font-telugu max-w-[120px] truncate">{currentTrack.titleTelugu}</span>
              </div>
            )}

            {/* Membership Button */}
            <Link
              to="/membership"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sacred-gold/15 border border-sacred-gold/60 text-sacred-goldLight text-xs tracking-wider uppercase font-medium hover:bg-sacred-gold hover:text-sacred-midnight transition-all duration-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Membership</span>
              {isSubscriber && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
              )}
            </Link>

            {/* Admin shortcut if admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-mono font-medium flex items-center gap-1 hover:bg-amber-900 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Account / Sign In */}
            {user ? (
              <Link
                to="/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sacred-charcoal/80 border border-white/10 text-xs text-sacred-ivory hover:border-sacred-gold/40 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-sacred-gold" />
                <span className="max-w-[90px] truncate">{user.name}</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 rounded-full bg-sacred-charcoal/80 border border-white/10 text-sacred-ivory text-xs tracking-wider uppercase font-medium hover:border-sacred-gold/40 hover:text-sacred-gold transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="p-2 text-sacred-ivory/80"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 text-sacred-ivory hover:text-sacred-gold transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-28 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl editorial-card rounded-3xl p-6 relative border border-sacred-gold/30">
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 p-2 text-sacred-ivoryMuted hover:text-sacred-ivory"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-heading text-sacred-ivory mb-4">
              కీర్తనల వెతుకులాట • Search Songs
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search e.g. 'అబ్రహాము' or 'Abrahamu' or 'పాద సేవ'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sacred-charcoal border border-sacred-gold/40 rounded-xl px-4 py-3 pl-11 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/50 focus:outline-none focus:border-sacred-gold"
              />
              <Search className="w-4 h-4 text-sacred-gold absolute left-4 top-3.5" />
              <button
                type="submit"
                className="absolute right-2 top-2 px-3.5 py-1.5 rounded-lg bg-gold-gradient text-sacred-midnight text-xs font-semibold uppercase tracking-wider"
              >
                Search
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-sacred-ivoryMuted">
              <span>Quick searches:</span>
              <button onClick={() => setSearchQuery('అబ్రహాము')} className="text-sacred-gold hover:underline">
                అబ్రహాము దేవుడవు
              </button>
              <span>•</span>
              <button onClick={() => setSearchQuery('పాద సేవ')} className="text-sacred-gold hover:underline">
                శ్రీ యేసు నీ పాద సేవ
              </button>
              <span>•</span>
              <button onClick={() => setSearchQuery('విడువని')} className="text-sacred-gold hover:underline">
                విడువని నా యేసయ్య
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/95 backdrop-blur-2xl pt-24 px-6 flex flex-col justify-between pb-8 animate-in slide-in-from-right duration-300">
          <div className="space-y-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sacred-gold/15 text-sacred-gold border border-sacred-gold/30'
                      : 'text-sacred-ivory hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-base">{link.name}</span>
                    <span className="font-telugu text-xs text-sacred-gold/80">{link.te}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/10 space-y-3">
              <Link
                to="/membership"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold-gradient text-sacred-midnight font-semibold text-xs uppercase tracking-wider"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tony's VIP Pass</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-300 text-xs font-mono"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Control Centre</span>
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-sacred-ivory">{user.name}</div>
                  <div className="text-xs text-sacred-ivoryMuted">{user.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/account" className="px-3 py-1.5 rounded-lg bg-sacred-charcoal text-xs text-sacred-gold border border-sacred-gold/30">
                    Account
                  </Link>
                  <button onClick={logout} aria-label="Sign out" className="p-1.5 rounded-lg bg-sacred-charcoal text-red-400">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center justify-center w-full py-3 rounded-xl bg-sacred-charcoal border border-sacred-gold/30 text-xs font-medium text-sacred-ivory uppercase tracking-wider"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};
