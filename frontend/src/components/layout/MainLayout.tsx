import React, { useState } from 'react';
import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { RightSidebar } from './RightSidebar.js';
import { BottomPlayer } from './BottomPlayer.js';
import { MobileNav } from './MobileNav.js';
import { FullscreenPlayer } from './FullscreenPlayer.js';
import { Link, useLocation } from 'react-router-dom';
import {
  X,
  Home,
  Search,
  Disc3,
  Video,
  Calendar,
  Sparkles,
  User,
  Shield,
  Library,
  Music,
  ListMusic,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useAnalytics } from '../../hooks/useAnalytics.js';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  useAnalytics();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <div className="flex h-screen h-[100dvh] w-screen overflow-hidden bg-[#07151D] text-[#EDF5F8] font-sans selection:bg-[#1B7C9D] selection:text-[#EDF5F8]">
      {/* 1. Left Navigation Sidebar (Desktop / Tablet) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* 2. Main Middle Viewport (Scrollable with TopBar & Page Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <TopBar onToggleMobileMenu={() => setMobileDrawerOpen(true)} />

        {/* Scrollable Page Content Area with overscroll containment */}
        <main className="flex-1 overflow-y-auto overscroll-y-contain overflow-x-hidden pb-32 sm:pb-36 px-4 sm:px-6 lg:px-8 pt-4">
          {children}
        </main>
      </div>

      {/* 3. Right Panel (Now Playing / Synced Lyrics / Queue) */}
      <RightSidebar />

      {/* 4. Desktop Docked Bottom Player Bar */}
      <div className="hidden md:block">
        <BottomPlayer />
      </div>

      {/* 5. Mobile Bottom Navigation & Floating Mini Player */}
      <MobileNav />

      {/* 6. Immersive Fullscreen Player Modal */}
      <FullscreenPlayer />

      {/* 7. Mobile Drawer Overlay for full navigation */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-fadeIn">
          <div className="p-4 flex items-center justify-between border-b border-[#1B7C9D]/30 bg-[#07151D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#09212C] via-[#0E5671] to-[#1B7C9D] border border-[#C9B27C] overflow-hidden flex items-center justify-center">
                <img
                  src="/tony_avatar_cutout.png"
                  alt="Tony Prakash"
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div>
                <span className="font-heading font-bold text-sm text-[#EDF5F8]">TONY'S MUSIC</span>
                <p className="font-telugu text-[10px] text-[#C9B27C]">టోనీ ప్రకాష్ భక్తి గీతాలు</p>
              </div>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="p-2 text-[#A5C1CC] hover:text-[#EDF5F8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname === '/'
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home • ముఖ్యాంశం</span>
            </Link>

            <Link
              to="/music"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname === '/music'
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Songs • పాటలు</span>
            </Link>

            <Link
              to="/tracks"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname === '/tracks'
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Disc3 className="w-4 h-4" />
              <span>Studio Tracks • ట్రాక్స్ (₹99)</span>
            </Link>

            <Link
              to="/library"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname.startsWith('/library')
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Library className="w-4 h-4" />
              <span>My Playlists • నా లైబ్రరీ</span>
            </Link>

            <Link
              to="/albums"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname.startsWith('/albums')
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>Albums • ఆల్బమ్‌లు</span>
            </Link>

            <Link
              to="/videos"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname === '/videos'
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Worship Videos • వీడియోలు</span>
            </Link>

            <Link
              to="/bookings"
              onClick={() => setMobileDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                location.pathname === '/bookings'
                  ? 'bg-[#1B7C9D] text-white'
                  : 'text-[#A5C1CC] hover:bg-[#0B222E]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Ministry Invites • ఆహ్వానాలు</span>
            </Link>

            <Link
              to="/membership"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#C9B27C] hover:bg-[#0B222E]"
            >
              <Sparkles className="w-4 h-4" />
              <span>One-Time Pass (₹299)</span>
            </Link>

            <div className="pt-4 border-t border-[#1B7C9D]/20 mt-4 space-y-1">
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#EDF5F8]"
                >
                  <User className="w-4 h-4 text-[#1B7C9D]" />
                  <span>My Account ({user.name})</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C9B27C]"
                >
                  <User className="w-4 h-4" />
                  <span>Log In / Register</span>
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-cyan-400"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MainLayout;
