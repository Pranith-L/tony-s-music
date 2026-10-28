import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Music,
  Disc3,
  Video as VideoIcon,
  Calendar,
  CreditCard,
  Settings,
  Plus,
  Trash2,
  Download,
  Sparkles,
  ExternalLink,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { AdminStats, Track, Album, Video, Booking } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRACKS' | 'ALBUMS' | 'VIDEOS' | 'BOOKINGS' | 'PAYMENTS' | 'SETTINGS'>('OVERVIEW');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<{ purchases: any[]; subscriptions: any[] }>({ purchases: [], subscriptions: [] });
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Payment Approval Queue State
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [paymentActionMsg, setPaymentActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedUtrId, setCopiedUtrId] = useState<string | null>(null);
  const [isRefreshingPayments, setIsRefreshingPayments] = useState<boolean>(false);

  const refreshPayments = async () => {
    setIsRefreshingPayments(true);
    try {
      const paymentsRes = await api.admin.getPayments();
      setPaymentsData(paymentsRes);
    } catch (err) {
      console.error('Failed to refresh payments:', err);
    } finally {
      setIsRefreshingPayments(false);
    }
  };

  const handleCopyUtr = (id: string, utr: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(utr);
      setCopiedUtrId(id);
      setTimeout(() => setCopiedUtrId(null), 2000);
    }
  };

  const handleApprovePayment = async (type: 'PURCHASE' | 'SUBSCRIPTION', id: string) => {
    setApprovingId(id);
    setPaymentActionMsg(null);
    try {
      const res = await api.admin.approvePayment({ type, id });
      setPaymentActionMsg({ type: 'success', text: res.message || 'Payment successfully approved and access unlocked!' });
      await refreshPayments();
    } catch (err: any) {
      setPaymentActionMsg({ type: 'error', text: err.message || 'Failed to approve payment' });
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectPayment = async (type: 'PURCHASE' | 'SUBSCRIPTION', id: string) => {
    if (!window.confirm('Are you sure you want to reject this payment verification?')) return;
    setApprovingId(id);
    setPaymentActionMsg(null);
    try {
      const res = await api.admin.rejectPayment({ type, id });
      setPaymentActionMsg({ type: 'success', text: res.message || 'Payment rejected.' });
      await refreshPayments();
    } catch (err: any) {
      setPaymentActionMsg({ type: 'error', text: err.message || 'Failed to reject payment' });
    } finally {
      setApprovingId(null);
    }
  };

  // New Track Modal / Form State
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [trackForm, setTrackForm] = useState({
    titleTelugu: '',
    titleEnglish: '',
    albumId: '',
    duration: '5:30',
    category: 'Worship',
    isFeatured: false,
    isPopular: false,
    isSubscriberOnly: false,
    isDownloadable: true,
    downloadPricePaise: 9900,
    rightsConfirmed: true,
    audioUrl: '',
    coverImage: '',
    lyricsTelugu: '',
    lyricsEnglish: '',
    composer: 'Tony Prakash',
    lyricist: 'Tony Prakash',
    singer: 'Tony Prakash',
  });

  // Booking status filter
  const [bookingFilter, setBookingFilter] = useState('ALL');

  // Setting save notification
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAdmin) {
      navigate('/auth?redirect=/admin');
      return;
    }
    loadAdminData();
  }, [isAdmin, isAuthLoading]);

  // Real-time automatic polling when administrator is on PAYMENTS tab
  useEffect(() => {
    if (activeTab === 'PAYMENTS' && isAdmin) {
      refreshPayments();
      const interval = setInterval(refreshPayments, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, isAdmin]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        api.admin.getStats(),
        api.tracks.getAll({ includeDrafts: true }),
        api.albums.getAll(),
        api.videos.getAll(),
        api.bookings.getAll(),
        api.admin.getUsers(),
        api.admin.getPayments(),
        api.admin.getSettings(),
      ]);

      if (results[0].status === 'fulfilled') setStats(results[0].value);
      if (results[1].status === 'fulfilled') setTracks(results[1].value);
      if (results[2].status === 'fulfilled') setAlbums(results[2].value);
      if (results[3].status === 'fulfilled') setVideos(results[3].value);
      if (results[4].status === 'fulfilled') setBookings(results[4].value);
      if (results[5].status === 'fulfilled') setUsersList(results[5].value);
      if (results[6].status === 'fulfilled') setPaymentsData(results[6].value);
      if (results[7].status === 'fulfilled') setSettings(results[7].value);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Track Actions
  const handleCreateTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tracks.create({
        ...trackForm,
        category: trackForm.category as Track['category'],
        albumId: trackForm.albumId || null,
        downloadPricePaise: Number(trackForm.downloadPricePaise),
      });
      setShowTrackForm(false);
      setTrackForm({
        titleTelugu: '',
        titleEnglish: '',
        albumId: '',
        duration: '5:30',
        category: 'Worship',
        isFeatured: false,
        isPopular: false,
        isSubscriberOnly: false,
        isDownloadable: true,
        downloadPricePaise: 9900,
        rightsConfirmed: true,
        audioUrl: '',
        coverImage: '',
        lyricsTelugu: '',
        lyricsEnglish: '',
        composer: 'Tony Prakash',
        lyricist: 'Tony Prakash',
        singer: 'Tony Prakash',
      });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create track');
    }
  };

  const handleDeleteTrack = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return;
    try {
      await api.tracks.delete(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete track');
    }
  };

  const handleToggleTrackStatus = async (track: Track) => {
    const newStatus = track.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.tracks.update(track.id, { status: newStatus });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update track status');
    }
  };

  const handleToggleRights = async (track: Track) => {
    try {
      await api.tracks.update(track.id, { rightsConfirmed: !track.rightsConfirmed });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update rights confirmation');
    }
  };

  // Booking status update
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.bookings.updateStatus(bookingId, { status: newStatus });
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  // Settings save
  const handleSaveSettings = async () => {
    try {
      await api.admin.updateSettings(settings);
      setSaveStatus('Settings updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0E0E10] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#FA243C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0E0E10] pt-6 pb-28 px-4 sm:px-8 text-[#1D1D1F] dark:text-[#F4F4F5] transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-400/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-[#1D1D1F] dark:text-white">
                  Tony Prakash Official Control Centre
                </h1>
              </div>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1AA] mt-0.5">
                Secure Administrator Dashboard • Real PostgreSQL Database Backed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={loadAdminData}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-[#F2F2F7] dark:bg-[#202023] hover:bg-[#E5E5EA] dark:hover:bg-[#27272A] border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#1D1D1F] dark:text-[#F4F4F5] transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live DB</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        {(() => {
          const pendingPurchases = (paymentsData.purchases || []).filter((p: any) => p.status === 'PENDING');
          const pendingSubscriptions = (paymentsData.subscriptions || []).filter((s: any) => s.status === 'PENDING');
          const totalPending = pendingPurchases.length + pendingSubscriptions.length;

          return (
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 dark:bg-[#18181B] rounded-2xl border border-[#E5E5EA] dark:border-[#27272A] shadow-sm backdrop-blur-md">
              {[
                { id: 'OVERVIEW', label: 'Overview & Stats', icon: Sparkles },
                { id: 'TRACKS', label: `Music Tracks (${tracks.length})`, icon: Music },
                { id: 'ALBUMS', label: `Albums (${albums.length})`, icon: Disc3 },
                { id: 'VIDEOS', label: `Videos (${videos.length})`, icon: VideoIcon },
                { id: 'BOOKINGS', label: `Event Bookings (${bookings.length})`, icon: Calendar },
                { id: 'PAYMENTS', label: 'Payments & Approvals', icon: CreditCard, badge: totalPending },
                { id: 'SETTINGS', label: 'Site Settings', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FA243C] to-[#D71A30] text-white shadow-md shadow-[#FA243C]/25'
                        : 'text-[#86868B] dark:text-[#A1A1AA] hover:text-[#1D1D1F] dark:hover:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive
                          ? 'bg-white text-[#FA243C]'
                          : 'bg-amber-500 text-white animate-pulse'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && stats && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Real Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-2">
                <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider">
                  Total Tracks
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#1D1D1F] dark:text-white">
                  {stats.totalPublishedTracks}
                </div>
                <div className="text-xs text-amber-600 dark:text-[#F5D77F] font-medium">
                  Published in Catalogue
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-2">
                <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider">
                  Active Subscriptions
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.activeSubscriptions}
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1AA] font-medium">
                  ₹299/mo Members
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-2">
                <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider">
                  Total Verified Revenue
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-[#D4A017] dark:text-[#F5D77F]">
                  ₹{stats.revenue.totalRupees.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-mono text-[#86868B] dark:text-[#A1A1AA]">
                  {stats.revenue.totalPaise} Paise
                </div>
              </div>

              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-2">
                <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] uppercase font-mono font-semibold tracking-wider">
                  New Bookings
                </span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-amber-600 dark:text-amber-400">
                  {stats.newBookings}
                </div>
                <div className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                  {stats.confirmedBookings} Confirmed Events
                </div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider">
                    Recent Worship Bookings
                  </h3>
                  <button
                    onClick={() => setActiveTab('BOOKINGS')}
                    className="text-xs text-[#86868B] dark:text-[#A1A1AA] hover:text-[#FA243C] font-semibold"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2.5">
                  {bookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-xl bg-[#F9F9FB] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between text-xs hover:border-[#FA243C]/20 transition-all"
                    >
                      <div>
                        <div className="font-bold text-[#1D1D1F] dark:text-white">{b.fullName}</div>
                        <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] mt-0.5">
                          {b.city} • {b.eventType}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                          b.status === 'NEW'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Channel Status */}
              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider">
                    Official Channel Sync
                  </h3>
                  <a
                    href="https://www.youtube.com/@TonyPrakashOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#FA243C] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>@TonyPrakashOfficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1AA] leading-relaxed">
                  {stats.totalVideos} videos indexed in the platform library. Public videos are streamed through standard YouTube players in full compliance with YouTube rights guidelines.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('VIDEOS')}
                    className="px-4 py-2 rounded-xl bg-[#F2F2F7] dark:bg-[#202023] hover:bg-[#E5E5EA] dark:hover:bg-[#27272A] border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#1D1D1F] dark:text-white transition-all"
                  >
                    Manage Videos ({stats.totalVideos})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRACKS MANAGEMENT */}
        {activeTab === 'TRACKS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white">
                  Music Catalogue Management
                </h2>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                  Manage devotional songs, audio playback URLs, rights confirmation, and subscriber visibility.
                </p>
              </div>
              <button
                onClick={() => setShowTrackForm(!showTrackForm)}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FA243C] to-[#D71A30] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#FA243C]/25 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Track</span>
              </button>
            </div>

            {/* Add Track Form Modal / Accordion */}
            {showTrackForm && (
              <form onSubmit={handleCreateTrack} className="bg-white dark:bg-[#18181B] rounded-2xl p-6 sm:p-8 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-5">
                <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider">
                  Add New Song
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">Telugu Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="శ్రీ యేసు నీ పాద సేవ"
                      value={trackForm.titleTelugu}
                      onChange={(e) => setTrackForm({ ...trackForm, titleTelugu: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">English Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sree Yesu Nee Paadha Seva"
                      value={trackForm.titleEnglish}
                      onChange={(e) => setTrackForm({ ...trackForm, titleEnglish: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">Audio URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={trackForm.audioUrl}
                      onChange={(e) => setTrackForm({ ...trackForm, audioUrl: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={trackForm.coverImage}
                      onChange={(e) => setTrackForm({ ...trackForm, coverImage: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="5:42"
                      value={trackForm.duration}
                      onChange={(e) => setTrackForm({ ...trackForm, duration: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">Category</label>
                    <select
                      value={trackForm.category}
                      onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value })}
                      className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                    >
                      <option value="Worship">Worship</option>
                      <option value="Devotional">Devotional</option>
                      <option value="Praise">Praise</option>
                      <option value="Gospel">Gospel</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-[#1D1D1F] dark:text-white">
                    <input
                      type="checkbox"
                      checked={trackForm.isSubscriberOnly}
                      onChange={(e) => setTrackForm({ ...trackForm, isSubscriberOnly: e.target.checked })}
                      className="rounded accent-[#FA243C] w-4 h-4"
                    />
                    <span>Subscriber Exclusive Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-[#1D1D1F] dark:text-white">
                    <input
                      type="checkbox"
                      checked={trackForm.rightsConfirmed}
                      onChange={(e) => setTrackForm({ ...trackForm, rightsConfirmed: e.target.checked })}
                      className="rounded accent-[#FA243C] w-4 h-4"
                    />
                    <span>Rights Officially Confirmed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-[#1D1D1F] dark:text-white">
                    <input
                      type="checkbox"
                      checked={trackForm.isFeatured}
                      onChange={(e) => setTrackForm({ ...trackForm, isFeatured: e.target.checked })}
                      className="rounded accent-[#FA243C] w-4 h-4"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FA243C] to-[#D71A30] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#FA243C]/25 hover:brightness-110 active:scale-95 transition-all"
                  >
                    Save & Publish Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrackForm(false)}
                    className="px-5 py-2.5 rounded-full border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#86868B] dark:text-[#A1A1AA] hover:bg-[#F2F2F7] dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tracks Table */}
            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-[#E5E5EA] dark:border-[#27272A] overflow-hidden shadow-apple-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F9FB] dark:bg-[#202023] text-[#86868B] dark:text-[#A1A1AA] font-mono uppercase text-[11px] tracking-wider border-b border-[#E5E5EA] dark:border-[#27272A]">
                    <tr>
                      <th className="p-4">Telugu Title</th>
                      <th className="p-4">English Title</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Rights Status</th>
                      <th className="p-4">Access</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]/60 dark:divide-[#27272A]/60">
                    {tracks.map((t) => (
                      <tr key={t.id} className="hover:bg-[#F2F2F7] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 font-telugu font-bold text-[#D4A017] dark:text-[#F5D77F]">{t.titleTelugu}</td>
                        <td className="p-4 font-semibold text-[#1D1D1F] dark:text-white">{t.titleEnglish}</td>
                        <td className="p-4 text-[#86868B] dark:text-[#A1A1AA] font-medium">{t.category}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleRights(t)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                              t.rightsConfirmed
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                            }`}
                          >
                            {t.rightsConfirmed ? 'Confirmed' : 'Pending'}
                          </button>
                        </td>
                        <td className="p-4">
                          {t.isSubscriberOnly ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              Subscriber Exclusive
                            </span>
                          ) : (
                            <span className="text-[#86868B] dark:text-[#A1A1AA] text-xs">Public</span>
                          )}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleTrackStatus(t)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all ${
                              t.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : 'bg-[#F2F2F7] dark:bg-[#202023] text-[#86868B] dark:text-[#A1A1AA] border border-[#E5E5EA] dark:border-[#27272A]'
                            }`}
                          >
                            {t.status}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteTrack(t.id)}
                            className="p-1.5 hover:text-red-500 hover:bg-red-500/10 rounded-lg text-[#86868B] dark:text-[#A1A1AA] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALBUMS MANAGEMENT */}
        {activeTab === 'ALBUMS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white">
                Albums & Discography
              </h2>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                Official discography collections produced and sung by Rev. Tony Prakash.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {albums.map((a) => (
                <div key={a.id} className="bg-white dark:bg-[#18181B] rounded-2xl p-5 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#27272A]">
                    <img src={a.coverImage} alt={a.titleEnglish} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-telugu text-lg font-bold text-[#D4A017] dark:text-[#F5D77F]">{a.titleTelugu}</h3>
                  <div className="text-xs font-semibold text-[#1D1D1F] dark:text-white">{a.titleEnglish} • <span className="text-[#86868B] dark:text-[#A1A1AA] font-normal">{a.releaseYear}</span></div>
                  <p className="text-xs text-[#86868B] dark:text-[#A1A1AA] line-clamp-2 leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIDEOS MANAGEMENT */}
        {activeTab === 'VIDEOS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white">
                YouTube Videos Library
              </h2>
              <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                Official live recordings and musical sermons synchronized with YouTube.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div key={v.id} className="bg-white dark:bg-[#18181B] rounded-2xl p-4 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-3 text-xs">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black border border-[#E5E5EA] dark:border-[#27272A]">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-semibold text-[#1D1D1F] dark:text-white line-clamp-2 leading-snug">{v.title}</div>
                  <div className="text-[#86868B] dark:text-[#A1A1AA] font-mono text-[11px]">ID: {v.youtubeId}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BOOKINGS MANAGEMENT */}
        {activeTab === 'BOOKINGS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white">
                  Worship Event Enquiries
                </h2>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                  Manage concert invitations, youth conferences, and devotional ministry reservations.
                </p>
              </div>
              <a
                href={api.bookings.getExportCsvUrl()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#1D1D1F] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-[#202023] transition-colors shadow-sm self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-[#FA243C]" />
                <span>Export to CSV</span>
              </a>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['ALL', 'NEW', 'CONTACTED', 'UNDER_DISCUSSION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    bookingFilter === st
                      ? 'bg-gradient-to-r from-[#FA243C] to-[#D71A30] text-white shadow-sm'
                      : 'bg-white dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] text-[#86868B] dark:text-[#A1A1AA] hover:text-[#1D1D1F] dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-[#18181B] rounded-2xl border border-[#E5E5EA] dark:border-[#27272A] overflow-hidden shadow-apple-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F9F9FB] dark:bg-[#202023] text-[#86868B] dark:text-[#A1A1AA] font-mono uppercase text-[11px] tracking-wider border-b border-[#E5E5EA] dark:border-[#27272A]">
                    <tr>
                      <th className="p-4">Ref No</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Event Type</th>
                      <th className="p-4">City & Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA]/60 dark:divide-[#27272A]/60">
                    {bookings
                      .filter((b) => (bookingFilter === 'ALL' ? true : b.status === bookingFilter))
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-[#F2F2F7] dark:hover:bg-white/[0.03] transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-600 dark:text-[#F5D77F]">{b.referenceNo}</td>
                          <td className="p-4">
                            <div className="font-bold text-[#1D1D1F] dark:text-white">{b.fullName}</div>
                            <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] mt-0.5">{b.phone} • {b.email}</div>
                          </td>
                          <td className="p-4 text-[#1D1D1F] dark:text-white font-medium">{b.eventType}</td>
                          <td className="p-4">
                            <div className="text-[#1D1D1F] dark:text-white font-medium">{b.city}</div>
                            <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">{b.eventDate}</div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold ${
                                b.status === 'NEW'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  : b.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-[#F2F2F7] dark:bg-[#202023] text-[#86868B] dark:text-[#A1A1AA] border border-[#E5E5EA] dark:border-[#27272A]'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <select
                              value={b.status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                              className="bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl px-3 py-1.5 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="UNDER_DISCUSSION">UNDER_DISCUSSION</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PAYMENTS & VERIFICATIONS */}
        {activeTab === 'PAYMENTS' && (() => {
          const pendingPurchases = (paymentsData.purchases || []).filter((p: any) => p.status === 'PENDING');
          const pendingSubscriptions = (paymentsData.subscriptions || []).filter((s: any) => s.status === 'PENDING');
          const totalPending = pendingPurchases.length + pendingSubscriptions.length;

          return (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white flex items-center gap-2">
                    <span>UPI Payment Approvals & Audit Ledger</span>
                    {totalPending > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold animate-pulse">
                        {totalPending} Action{totalPending > 1 ? 's' : ''} Required
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                    Verify 12-digit UTR numbers against Rev. Tony Prakash PhonePe (+91 9841345007 / 9840345007@ybl) and unlock customer access.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshPayments}
                    disabled={isRefreshingPayments}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#18181B] border border-[#E5E5EA] dark:border-[#27272A] text-xs font-semibold text-[#1D1D1F] dark:text-white hover:bg-[#F2F2F7] dark:hover:bg-white/[0.05] transition-all shadow-sm disabled:opacity-50"
                    title="Refresh payments and verification queue"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingPayments ? 'animate-spin text-[#FA243C]' : 'text-[#86868B]'}`} />
                    <span>{isRefreshingPayments ? 'Refreshing...' : 'Refresh Queue'}</span>
                  </button>

                  {totalPending > 0 && (
                    <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Check PhonePe before clicking Approve</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Feedback Banner */}
              {paymentActionMsg && (
                <div
                  className={`p-4 rounded-2xl text-xs flex items-center gap-2 shadow-sm animate-in fade-in ${
                    paymentActionMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {paymentActionMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <span className="font-semibold">{paymentActionMsg.text}</span>
                </div>
              )}

              {/* Section 1: PENDING UPI VERIFICATIONS QUEUE */}
              <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {totalPending > 0 ? (
                      <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    )}
                    <h3 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Pending UPI Verifications Queue ({totalPending})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">
                    {totalPending === 0 ? 'All caught up' : 'Awaiting admin verification'}
                  </span>
                </div>

                {totalPending === 0 ? (
                  <div className="py-10 text-center space-y-2 border border-dashed border-[#E5E5EA] dark:border-[#27272A] rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-xs font-semibold text-[#1D1D1F] dark:text-white">
                      Zero Pending Verifications
                    </p>
                    <p className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">
                      Every submitted UPI transaction reference has been verified or reviewed.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5EA] dark:divide-[#27272A] border border-[#E5E5EA] dark:border-[#27272A] rounded-2xl overflow-hidden">
                    {/* Pending Subscriptions */}
                    {pendingSubscriptions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="p-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold text-[10px] uppercase">
                              VIP Lifetime Pass
                            </span>
                            <span className="font-bold text-[#1D1D1F] dark:text-white text-sm">
                              ₹{(sub.amountPaise / 100).toFixed(0)}
                            </span>
                            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">
                              • {new Date(sub.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-medium text-[#1D1D1F] dark:text-white">
                            Customer: <span className="font-bold">{sub.user?.name}</span> ({sub.user?.email})
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">Submitted UTR:</span>
                            <span className="font-mono font-bold text-[#1D1D1F] dark:text-white bg-white dark:bg-[#202023] px-2.5 py-1 rounded-md border border-amber-500/30 text-xs">
                              {sub.razorpayPaymentId || 'N/A'}
                            </span>
                            {sub.razorpayPaymentId && (
                              <button
                                type="button"
                                onClick={() => handleCopyUtr(sub.id, sub.razorpayPaymentId)}
                                className="px-2.5 py-1 rounded-md bg-white dark:bg-[#202023] hover:bg-[#FA243C] hover:text-white border border-gray-200 dark:border-gray-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                title="Copy UTR to paste in PhonePe"
                              >
                                {copiedUtrId === sub.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy UTR</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={approvingId === sub.id}
                            onClick={() => handleApprovePayment('SUBSCRIPTION', sub.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{approvingId === sub.id ? 'Approving...' : 'Approve & Unlock'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={approvingId === sub.id}
                            onClick={() => handleRejectPayment('SUBSCRIPTION', sub.id)}
                            className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pending Track Purchases */}
                    {pendingPurchases.map((pur: any) => (
                      <div
                        key={pur.id}
                        className="p-4 bg-amber-500/5 hover:bg-amber-500/10 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase">
                              Studio Track (₹99)
                            </span>
                            <span className="font-bold text-[#1D1D1F] dark:text-white text-sm">
                              {pur.track?.titleEnglish || 'Track Download'}
                            </span>
                            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">
                              • {new Date(pur.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-medium text-[#1D1D1F] dark:text-white">
                            Customer: <span className="font-bold">{pur.user?.name}</span> ({pur.user?.email})
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-[#86868B] dark:text-[#A1A1AA]">Submitted UTR:</span>
                            <span className="font-mono font-bold text-[#1D1D1F] dark:text-white bg-white dark:bg-[#202023] px-2.5 py-1 rounded-md border border-amber-500/30 text-xs">
                              {pur.razorpayPaymentId || 'N/A'}
                            </span>
                            {pur.razorpayPaymentId && (
                              <button
                                type="button"
                                onClick={() => handleCopyUtr(pur.id, pur.razorpayPaymentId)}
                                className="px-2.5 py-1 rounded-md bg-white dark:bg-[#202023] hover:bg-[#FA243C] hover:text-white border border-gray-200 dark:border-gray-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                title="Copy UTR to paste in PhonePe"
                              >
                                {copiedUtrId === pur.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy UTR</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={approvingId === pur.id}
                            onClick={() => handleApprovePayment('PURCHASE', pur.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50 transition-all"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{approvingId === pur.id ? 'Approving...' : 'Approve & Unlock'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={approvingId === pur.id}
                            onClick={() => handleRejectPayment('PURCHASE', pur.id)}
                            className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Audit History Ledger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lifetime Subscriptions Audit */}
                <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                  <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider flex items-center justify-between">
                    <span>VIP Lifetime Passes ({(paymentsData.subscriptions || []).length})</span>
                    <span className="text-[10px] font-normal text-[#86868B]">₹299 One-Time</span>
                  </h3>
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {(paymentsData.subscriptions || []).map((s: any) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl bg-[#F9F9FB] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between text-xs hover:border-[#FA243C]/20 transition-all"
                      >
                        <div>
                          <div className="font-bold text-[#1D1D1F] dark:text-white">{s.user?.name}</div>
                          <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] mt-0.5">{s.user?.email}</div>
                          {s.razorpayPaymentId && (
                            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                              UTR: {s.razorpayPaymentId}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : s.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}
                          >
                            {s.status}
                          </span>
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            ₹{(s.amountPaise / 100).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Single Track Purchases Audit */}
                <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                  <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider flex items-center justify-between">
                    <span>Single Track Purchases ({(paymentsData.purchases || []).length})</span>
                    <span className="text-[10px] font-normal text-[#86868B]">₹99 / Track</span>
                  </h3>
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {(paymentsData.purchases || []).map((p: any) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-[#F9F9FB] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between text-xs hover:border-[#FA243C]/20 transition-all"
                      >
                        <div>
                          <div className="font-bold text-[#1D1D1F] dark:text-white">
                            {p.track?.titleEnglish || 'Track Download'}
                          </div>
                          <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] mt-0.5">
                            {p.user?.name} ({p.user?.email})
                          </div>
                          {p.razorpayPaymentId && (
                            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                              UTR: {p.razorpayPaymentId}
                            </div>
                          )}
                        </div>
                        <div className="text-right space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                : p.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-600 border border-red-500/20'
                            }`}
                          >
                            {p.status}
                          </span>
                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            ₹{(p.amountPaise / 100).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Registered Listeners */}
              <div className="bg-white dark:bg-[#18181B] rounded-2xl p-6 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-4">
                <h3 className="text-xs font-bold text-[#D4A017] dark:text-[#F5D77F] uppercase tracking-wider">
                  All Registered Listeners ({usersList.length})
                </h3>
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {usersList.map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-[#F9F9FB] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] flex items-center justify-between text-xs hover:border-[#FA243C]/20 transition-all"
                    >
                      <div>
                        <div className="font-bold text-[#1D1D1F] dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-[#86868B] dark:text-[#A1A1AA] mt-0.5">{u.email}</div>
                      </div>
                      <div>
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                            u.isSubscriberActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'text-[#86868B] dark:text-[#A1A1AA]'
                          }`}
                        >
                          {u.isSubscriberActive ? 'VIP Member' : 'Free Listener'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 border border-[#E5E5EA] dark:border-[#27272A] shadow-apple-card space-y-6 max-w-3xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#1D1D1F] dark:text-white">
                  Site Settings & Content Copy
                </h2>
                <p className="text-xs text-[#86868B] dark:text-[#A1A1AA]">
                  Configure ministry contact coordinates, pricing tiers, and featured quotes.
                </p>
              </div>
              {saveStatus && (
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold animate-in fade-in">
                  {saveStatus}
                </span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">
                  WhatsApp Coordination Number
                </label>
                <input
                  type="text"
                  value={settings['whatsapp_number'] || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">
                  Featured Artist Quote
                </label>
                <textarea
                  rows={3}
                  value={settings['artist_quote'] || ''}
                  onChange={(e) => setSettings({ ...settings, artist_quote: e.target.value })}
                  className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">
                    Subscription Price (Paise)
                  </label>
                  <input
                    type="number"
                    value={settings['subscription_price_paise'] || '29900'}
                    onChange={(e) => setSettings({ ...settings, subscription_price_paise: e.target.value })}
                    className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                  />
                  <span className="text-[10px] text-[#86868B] dark:text-[#A1A1AA] mt-1 block">
                    29900 paise = ₹299
                  </span>
                </div>

                <div>
                  <label className="block text-[#1D1D1F] dark:text-white font-semibold mb-1">
                    Track Download Price (Paise)
                  </label>
                  <input
                    type="number"
                    value={settings['download_price_paise'] || '9900'}
                    onChange={(e) => setSettings({ ...settings, download_price_paise: e.target.value })}
                    className="w-full bg-[#F2F2F7] dark:bg-[#202023] border border-[#E5E5EA] dark:border-[#2C2C2E] rounded-xl p-3 text-xs text-[#1D1D1F] dark:text-white focus:border-[#FA243C] focus:outline-none transition-all"
                  />
                  <span className="text-[10px] text-[#86868B] dark:text-[#A1A1AA] mt-1 block">
                    9900 paise = ₹99
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FA243C] to-[#D71A30] text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2 shadow-lg shadow-[#FA243C]/25 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
