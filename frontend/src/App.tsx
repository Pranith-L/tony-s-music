import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { PlaylistProvider } from './context/PlaylistContext.js';
import { OfflineProvider } from './context/OfflineContext.js';
import { MainLayout } from './components/layout/MainLayout.js';

// Core Pages
import { Home } from './pages/Home.js';
import { MusicPage } from './pages/Music.js';
import { TracksPage } from './pages/Tracks.js';
import { AlbumsPage } from './pages/Albums.js';
import { AlbumDetailPage } from './pages/AlbumDetail.js';
import { LibraryPage } from './pages/Library.js';
import { AccountPage } from './pages/Account.js';
import { AuthPage } from './pages/Auth.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { AdminRoute } from './routes/AdminRoute.js';

// Code-split heavy routes for optimal bundle chunking
const AdminDashboard = React.lazy(() =>
  import('./pages/admin/AdminDashboard.js').then((m) => ({ default: m.AdminDashboard }))
);
const VideosPage = React.lazy(() =>
  import('./pages/Videos.js').then((m) => ({ default: m.VideosPage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/About.js').then((m) => ({ default: m.AboutPage }))
);
const BookingsPage = React.lazy(() =>
  import('./pages/Bookings.js').then((m) => ({ default: m.BookingsPage }))
);
const MembershipPage = React.lazy(() =>
  import('./pages/Membership.js').then((m) => ({ default: m.MembershipPage }))
);
const PaymentReturnPage = React.lazy(() =>
  import('./pages/PaymentReturn.js').then((m) => ({ default: m.PaymentReturnPage }))
);

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
          <OfflineProvider>
            <PlayerProvider>
              <PlaylistProvider>
                <MainLayout>
                  <React.Suspense
                    fallback={
                      <div className="py-24 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#FA243C] border-t-transparent rounded-full animate-spin" />
                      </div>
                    }
                  >
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
                      <Route path="/payment-return" element={<PaymentReturnPage />} />
                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <AccountPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route
                        path="/admin"
                        element={
                          <AdminRoute>
                            <AdminDashboard />
                          </AdminRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </React.Suspense>
                </MainLayout>
              </PlaylistProvider>
            </PlayerProvider>
          </OfflineProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
