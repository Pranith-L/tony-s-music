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
  Edit,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { AdminStats, Track, Album, Video, Booking } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
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
  const [bookingSearch, setBookingSearch] = useState('');

  // Setting save notification
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/auth?redirect=/admin');
      return;
    }
    loadAdminData();
  }, [isAdmin]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsData, tracksData, albumsData, videosData, bookingsData, usersData, paymentsRes, settingsRes] = await Promise.all([
        api.admin.getStats(),
        api.tracks.getAll({ includeDrafts: true }),
        api.albums.getAll(),
        api.videos.getAll(),
        api.bookings.getAll(),
        api.admin.getUsers(),
        api.admin.getPayments(),
        api.admin.getSettings(),
      ]);

      setStats(statsData);
      setTracks(tracksData);
      setAlbums(albumsData);
      setVideos(videosData);
      setBookings(bookingsData);
      setUsersList(usersData);
      setPaymentsData(paymentsRes);
      setSettings(settingsRes);
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

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-sacred-midnight pt-24 pb-28 px-4 sm:px-8 text-sacred-ivory">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sacred-glass rounded-2xl p-6 border border-sacred-gold/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-sacred-gold/50 flex items-center justify-center text-sacred-gold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-heading text-sacred-ivory font-medium">
                Tony Prakash Official Control Centre
              </h1>
              <p className="text-xs text-sacred-ivoryMuted">
                Secure Administrator Dashboard • Real Database Backed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              className="px-3 py-1.5 rounded-lg sacred-glass text-xs text-sacred-gold hover:bg-sacred-gold/15 transition-colors"
            >
              Refresh Data
            </button>
            <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
              Live DB
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-sacred-gold/15 pb-2 text-xs font-medium">
          {[
            { id: 'OVERVIEW', label: 'Overview & Stats', icon: Sparkles },
            { id: 'TRACKS', label: `Music Tracks (${tracks.length})`, icon: Music },
            { id: 'ALBUMS', label: `Albums (${albums.length})`, icon: Disc3 },
            { id: 'VIDEOS', label: `Videos (${videos.length})`, icon: VideoIcon },
            { id: 'BOOKINGS', label: `Event Bookings (${bookings.length})`, icon: Calendar },
            { id: 'PAYMENTS', label: 'Payments & Users', icon: CreditCard },
            { id: 'SETTINGS', label: 'Site Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gold-gradient text-sacred-midnight font-bold shadow'
                    : 'sacred-glass text-sacred-ivoryMuted hover:text-sacred-ivory'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && stats && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Real Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="sacred-glass rounded-2xl p-5 border border-white/10 space-y-2">
                <span className="text-[11px] text-sacred-ivoryMuted uppercase font-mono">Total Tracks</span>
                <div className="text-3xl font-mono font-bold text-sacred-ivory">
                  {stats.totalPublishedTracks}
                </div>
                <div className="text-[10px] text-sacred-gold">Published in Catalogue</div>
              </div>

              <div className="sacred-glass rounded-2xl p-5 border border-white/10 space-y-2">
                <span className="text-[11px] text-sacred-ivoryMuted uppercase font-mono">Active Subscriptions</span>
                <div className="text-3xl font-mono font-bold text-emerald-400">
                  {stats.activeSubscriptions}
                </div>
                <div className="text-[10px] text-sacred-ivoryMuted">₹299/mo Members</div>
              </div>

              <div className="sacred-glass rounded-2xl p-5 border border-white/10 space-y-2">
                <span className="text-[11px] text-sacred-ivoryMuted uppercase font-mono">Total Verified Revenue</span>
                <div className="text-3xl font-mono font-bold text-sacred-goldLight">
                  ₹{stats.revenue.totalRupees.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-mono text-sacred-ivoryMuted">
                  {stats.revenue.totalPaise} Paise
                </div>
              </div>

              <div className="sacred-glass rounded-2xl p-5 border border-white/10 space-y-2">
                <span className="text-[11px] text-sacred-ivoryMuted uppercase font-mono">New Bookings</span>
                <div className="text-3xl font-mono font-bold text-amber-400">
                  {stats.newBookings}
                </div>
                <div className="text-[10px] text-sacred-ivoryMuted">{stats.confirmedBookings} Confirmed Events</div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <div className="sacred-glass rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-sacred-gold uppercase tracking-wider">
                    Recent Worship Bookings
                  </h3>
                  <button
                    onClick={() => setActiveTab('BOOKINGS')}
                    className="text-xs text-sacred-ivoryMuted hover:text-sacred-gold"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-3 rounded-xl bg-sacred-charcoal/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-sacred-ivory">{b.fullName}</div>
                        <div className="text-[11px] text-sacred-ivoryMuted">{b.city} • {b.eventType}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        b.status === 'NEW' ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* YouTube Channel Status */}
              <div className="sacred-glass rounded-2xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-sacred-gold uppercase tracking-wider">
                    Official Channel Sync
                  </h3>
                  <a
                    href="https://www.youtube.com/@TonyPrakashOfficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>@TonyPrakashOfficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-sacred-ivoryMuted leading-relaxed">
                  {stats.totalVideos} videos indexed in the platform library. Public videos are streamed through standard YouTube players in full compliance with YouTube rights guidelines.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('VIDEOS')}
                    className="px-4 py-2 rounded-xl sacred-glass gold-border text-xs text-sacred-gold"
                  >
                    Manage Videos
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
              <h2 className="text-lg font-heading text-sacred-ivory">Music Catalogue Management</h2>
              <button
                onClick={() => setShowTrackForm(!showTrackForm)}
                className="px-4 py-2 rounded-full bg-gold-gradient text-sacred-midnight font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Track</span>
              </button>
            </div>

            {/* Add Track Form Modal / Accordion */}
            {showTrackForm && (
              <form onSubmit={handleCreateTrack} className="sacred-glass-glow rounded-2xl p-6 border border-sacred-gold/40 space-y-4">
                <h3 className="text-sm font-semibold text-sacred-gold uppercase tracking-wider">Add New Song</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-sacred-ivory mb-1">Telugu Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="శ్రీ యేసు నీ పాద సేవ"
                      value={trackForm.titleTelugu}
                      onChange={(e) => setTrackForm({ ...trackForm, titleTelugu: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sacred-ivory mb-1">English Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sree Yesu Nee Paadha Seva"
                      value={trackForm.titleEnglish}
                      onChange={(e) => setTrackForm({ ...trackForm, titleEnglish: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sacred-ivory mb-1">Audio URL *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://..."
                      value={trackForm.audioUrl}
                      onChange={(e) => setTrackForm({ ...trackForm, audioUrl: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sacred-ivory mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={trackForm.coverImage}
                      onChange={(e) => setTrackForm({ ...trackForm, coverImage: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sacred-ivory mb-1">Duration</label>
                    <input
                      type="text"
                      placeholder="5:42"
                      value={trackForm.duration}
                      onChange={(e) => setTrackForm({ ...trackForm, duration: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    />
                  </div>
                  <div>
                    <label className="block text-sacred-ivory mb-1">Category</label>
                    <select
                      value={trackForm.category}
                      onChange={(e) => setTrackForm({ ...trackForm, category: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-lg p-2.5 text-sacred-ivory"
                    >
                      <option value="Worship">Worship</option>
                      <option value="Devotional">Devotional</option>
                      <option value="Praise">Praise</option>
                      <option value="Gospel">Gospel</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackForm.isSubscriberOnly}
                      onChange={(e) => setTrackForm({ ...trackForm, isSubscriberOnly: e.target.checked })}
                      className="rounded bg-sacred-charcoal border-sacred-gold text-sacred-gold"
                    />
                    <span>Subscriber Exclusive Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackForm.rightsConfirmed}
                      onChange={(e) => setTrackForm({ ...trackForm, rightsConfirmed: e.target.checked })}
                      className="rounded bg-sacred-charcoal border-sacred-gold text-sacred-gold"
                    />
                    <span>Rights Officially Confirmed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trackForm.isFeatured}
                      onChange={(e) => setTrackForm({ ...trackForm, isFeatured: e.target.checked })}
                      className="rounded bg-sacred-charcoal border-sacred-gold text-sacred-gold"
                    />
                    <span>Feature on Homepage</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-gold-gradient text-sacred-midnight font-bold text-xs uppercase tracking-wider"
                  >
                    Save & Publish Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrackForm(false)}
                    className="px-4 py-2 rounded-full sacred-glass text-xs text-sacred-ivoryMuted"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tracks Table */}
            <div className="sacred-glass rounded-2xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sacred-surface text-sacred-gold font-mono uppercase border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Telugu Title</th>
                    <th className="p-3.5">English Title</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Rights Status</th>
                    <th className="p-3.5">Access</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tracks.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-telugu font-semibold">{t.titleTelugu}</td>
                      <td className="p-3.5 text-sacred-ivoryMuted">{t.titleEnglish}</td>
                      <td className="p-3.5">{t.category}</td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleRights(t)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            t.rightsConfirmed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-950 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {t.rightsConfirmed ? 'Confirmed' : 'Pending'}
                        </button>
                      </td>
                      <td className="p-3.5">
                        {t.isSubscriberOnly ? (
                          <span className="text-amber-400 font-medium">Subscriber Exclusive</span>
                        ) : (
                          <span className="text-sacred-ivoryMuted">Public</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleTrackStatus(t)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            t.status === 'PUBLISHED'
                              ? 'bg-emerald-950 text-emerald-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {t.status}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteTrack(t.id)}
                          className="p-1 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ALBUMS MANAGEMENT */}
        {activeTab === 'ALBUMS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-heading text-sacred-ivory">Albums & Discography</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {albums.map((a) => (
                <div key={a.id} className="sacred-glass rounded-2xl p-4 border border-white/10 space-y-3">
                  <div className="aspect-video rounded-xl overflow-hidden bg-sacred-surface">
                    <img src={a.coverImage} alt={a.titleEnglish} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-telugu text-lg font-semibold">{a.titleTelugu}</h3>
                  <div className="text-xs text-sacred-ivoryMuted">{a.titleEnglish} • {a.releaseYear}</div>
                  <p className="text-xs text-sacred-ivoryMuted/70 line-clamp-2">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: VIDEOS MANAGEMENT */}
        {activeTab === 'VIDEOS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-heading text-sacred-ivory">YouTube Videos Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div key={v.id} className="sacred-glass rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-semibold text-sacred-ivory line-clamp-2">{v.title}</div>
                  <div className="text-sacred-ivoryMuted font-mono">ID: {v.youtubeId}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BOOKINGS MANAGEMENT */}
        {activeTab === 'BOOKINGS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-heading text-sacred-ivory">Worship Event Enquiries</h2>
              <a
                href={api.bookings.getExportCsvUrl()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl sacred-glass gold-border text-xs text-sacred-gold hover:bg-sacred-gold/15 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </a>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['ALL', 'NEW', 'CONTACTED', 'UNDER_DISCUSSION', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1 rounded-lg ${
                    bookingFilter === st ? 'bg-gold-gradient text-sacred-midnight font-bold' : 'sacred-glass text-sacred-ivoryMuted'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="sacred-glass rounded-2xl border border-white/10 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-sacred-surface text-sacred-gold font-mono uppercase border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Ref No</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Event Type</th>
                    <th className="p-3.5">City & Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings
                    .filter((b) => (bookingFilter === 'ALL' ? true : b.status === bookingFilter))
                    .map((b) => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-sacred-gold">{b.referenceNo}</td>
                        <td className="p-3.5">
                          <div className="font-semibold text-sacred-ivory">{b.fullName}</div>
                          <div className="text-[11px] text-sacred-ivoryMuted">{b.phone} • {b.email}</div>
                        </td>
                        <td className="p-3.5">{b.eventType}</td>
                        <td className="p-3.5">
                          <div>{b.city}</div>
                          <div className="text-[11px] text-sacred-ivoryMuted">{b.eventDate}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            b.status === 'NEW' ? 'bg-amber-950 text-amber-300' :
                            b.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-300' :
                            'bg-zinc-800 text-zinc-300'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <select
                            value={b.status}
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className="bg-sacred-charcoal border border-sacred-gold/30 rounded-lg px-2 py-1 text-[11px] text-sacred-ivory focus:outline-none"
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
        )}

        {/* TAB 6: PAYMENTS & USERS */}
        {activeTab === 'PAYMENTS' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <h2 className="text-lg font-heading text-sacred-ivory">Registered Users & Payment Logs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Users list */}
              <div className="sacred-glass rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-xs font-semibold text-sacred-gold uppercase">Registered Listeners ({usersList.length})</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {usersList.map((u) => (
                    <div key={u.id} className="p-3 rounded-xl bg-sacred-charcoal/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-sacred-ivory">{u.name}</div>
                        <div className="text-[11px] text-sacred-ivoryMuted">{u.email}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          u.isSubscriberActive ? 'bg-emerald-950 text-emerald-300' : 'text-sacred-ivoryMuted'
                        }`}>
                          {u.isSubscriberActive ? 'Premium Member' : 'Free Listener'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Purchases Audit */}
              <div className="sacred-glass rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-xs font-semibold text-sacred-gold uppercase">
                  Single Track Purchases ({paymentsData.purchases.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {paymentsData.purchases.map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-sacred-charcoal/60 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-medium text-sacred-ivory">{p.track?.titleEnglish || 'Track Download'}</div>
                        <div className="text-[11px] text-sacred-ivoryMuted">{p.user?.name} ({p.user?.email})</div>
                      </div>
                      <div className="text-right font-mono text-emerald-400">
                        ₹{p.amountPaise / 100}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'SETTINGS' && (
          <div className="sacred-glass rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 max-w-3xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-heading text-sacred-ivory">Site Settings & Content Copy</h2>
              {saveStatus && (
                <span className="text-xs text-emerald-400 font-medium">{saveStatus}</span>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-sacred-ivory font-medium mb-1">WhatsApp Coordination Number</label>
                <input
                  type="text"
                  value={settings['whatsapp_number'] || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                  className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl p-3 text-sacred-ivory"
                />
              </div>

              <div>
                <label className="block text-sacred-ivory font-medium mb-1">Featured Artist Quote</label>
                <textarea
                  rows={3}
                  value={settings['artist_quote'] || ''}
                  onChange={(e) => setSettings({ ...settings, artist_quote: e.target.value })}
                  className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl p-3 text-sacred-ivory"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sacred-ivory font-medium mb-1">Subscription Price (Paise)</label>
                  <input
                    type="number"
                    value={settings['subscription_price_paise'] || '29900'}
                    onChange={(e) => setSettings({ ...settings, subscription_price_paise: e.target.value })}
                    className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl p-3 text-sacred-ivory"
                  />
                  <span className="text-[10px] text-sacred-ivoryMuted">29900 paise = ₹299</span>
                </div>

                <div>
                  <label className="block text-sacred-ivory font-medium mb-1">Track Download Price (Paise)</label>
                  <input
                    type="number"
                    value={settings['download_price_paise'] || '9900'}
                    onChange={(e) => setSettings({ ...settings, download_price_paise: e.target.value })}
                    className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl p-3 text-sacred-ivory"
                  />
                  <span className="text-[10px] text-sacred-ivoryMuted">9900 paise = ₹99</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-3 rounded-full bg-gold-gradient text-sacred-midnight font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
