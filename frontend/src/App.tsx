import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { PlaylistProvider } from './context/PlaylistContext.js';
import { MainLayout } from './components/layout/MainLayout.js';

// Pages
import { Home } from './pages/Home.js';
import { MusicPage } from './pages/Music.js';
import { TracksPage } from './pages/Tracks.js';
import { AlbumsPage } from './pages/Albums.js';
import { AlbumDetailPage } from './pages/AlbumDetail.js';
import { LibraryPage } from './pages/Library.js';
import { VideosPage } from './pages/Videos.js';
import { AboutPage } from './pages/About.js';
import { BookingsPage } from './pages/Bookings.js';
import { MembershipPage } from './pages/Membership.js';
import { AccountPage } from './pages/Account.js';
import { AuthPage } from './pages/Auth.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';

const NotFound: React.FC = () => (
  <div className="py-24 text-center px-6 text-[#1D1D1F]">
    <div className="max-w-md mx-auto rounded-3xl p-10 bg-white border border-[#E5E5EA] space-y-4 shadow-xl">
      <span className="text-4xl font-serif text-[#FA243C]">404</span>
      <h2 className="text-2xl font-heading font-bold text-[#1D1D1F]">Page Not Found</h2>
      <p className="text-xs text-[#86868B]">
        The devotional song or page you requested does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FC3C44] to-[#FA243C] text-[#FFFFFF] text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-md"
      >
        Return to Home
      </Link>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <PlaylistProvider>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/music" element={<MusicPage />} />
                  <Route path="/tracks" element={<TracksPage />} />
                  <Route path="/library" element={<LibraryPage />} />
                  <Route path="/albums" element={<AlbumsPage />} />
                  <Route path="/albums/:slug" element={<AlbumDetailPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/membership" element={<MembershipPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </PlaylistProvider>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
