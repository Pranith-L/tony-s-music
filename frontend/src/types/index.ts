export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
  isSubscriberActive?: boolean;
  activeSubscription?: Subscription | null;
  purchases?: Purchase[];
}

export interface Track {
  id: string;
  slug: string;
  titleTelugu: string;
  titleEnglish: string;
  albumId?: string | null;
  album?: {
    id: string;
    slug: string;
    titleTelugu: string;
    titleEnglish: string;
    coverImage: string;
  } | null;
  duration: string;
  category: 'Worship' | 'Devotional' | 'Praise' | 'Gospel' | 'Track' | string;
  isTrack?: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  isSubscriberOnly: boolean;
  isDownloadable: boolean;
  downloadPricePaise: number;
  rightsConfirmed: boolean;
  audioUrl: string;
  privateStorageKey?: string | null;
  coverImage?: string | null;
  lyricsTelugu?: string | null;
  lyricsEnglish?: string | null;
  composer: string;
  lyricist: string;
  singer: string;
  releaseYear: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Album {
  id: string;
  slug: string;
  titleTelugu: string;
  titleEnglish: string;
  coverImage: string;
  releaseYear: number;
  description?: string | null;
  isFeatured: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tracks?: Track[];
  _count?: {
    tracks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  youtubeId: string;
  title: string;
  category?: string;
  description?: string | null;
  thumbnail: string;
  embedUrl?: string;
  youtubeUrl?: string;
  duration: string;
  published?: string;
  views?: string;
  isFeatured: boolean;
  orderIndex: number;
  status: 'PUBLISHED' | 'UNLISTED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  referenceNo: string;
  fullName: string;
  email: string;
  phone: string;
  eventType: string;
  organization?: string | null;
  eventDate: string;
  preferredTime?: string | null;
  city: string;
  venue?: string | null;
  expectedAudience?: string | null;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'UNDER_DISCUSSION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  internalNotes?: string | null;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  amountPaise: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  razorpaySubscriptionId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  trackId: string;
  track?: Track;
  amountPaise: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  createdAt: string;
}

export interface AdminStats {
  totalPublishedTracks: number;
  totalAlbums: number;
  totalUsers: number;
  activeSubscriptions: number;
  individualPurchases: number;
  revenue: {
    totalPaise: number;
    totalRupees: number;
    subscriptionPaise: number;
    purchasePaise: number;
  };
  newBookings: number;
  confirmedBookings: number;
  totalVideos: number;
}
