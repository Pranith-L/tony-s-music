import generatedTracksData from './generatedTracks.json';
import { Track, Album, Video } from '../types/index.js';

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'album-na-asha',
    slug: 'na-asha',
    titleTelugu: 'నా ఆశ',
    titleEnglish: 'Naa Aasha (My Desire)',
    releaseYear: 2023,
    coverImage: '/covers/track_5_Asha_asha_track.jpg',
    description: "Rev. Tony Prakash's acclaimed devotional album featuring soul-stirring Telugu worship and adoration hymns.",
    isFeatured: true,
    status: 'PUBLISHED',
    _count: { tracks: 10 },
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
  },
  {
    id: 'album-nee-sannidhi',
    slug: 'nee-sannidhi',
    titleTelugu: 'నీ సన్నిధి',
    titleEnglish: 'Nee Sannidhi (In His Presence)',
    releaseYear: 2024,
    coverImage: '/covers/album_nee_sannidhi.jpg',
    description: 'Atmospheric worship and sacred Telugu hymns crafted for congregational reflection and intimate adoration.',
    isFeatured: true,
    status: 'PUBLISHED',
    _count: { tracks: 10 },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'album-neetho',
    slug: 'neetho',
    titleTelugu: 'నీతో',
    titleEnglish: 'Neetho (With You)',
    releaseYear: 2024,
    coverImage: '/covers/album_neetho.jpg',
    description: 'Soul-stirring worship and intimate communion hymns by Rev. Tony Prakash — “I will sing to the Lord all my life” (Psalm 104:33).',
    isFeatured: true,
    status: 'PUBLISHED',
    _count: { tracks: 11 },
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z',
  },
];

export const MOCK_TRACKS: Track[] = (generatedTracksData as unknown as Track[]);
import tonyVideosData from './tonyVideos.json';

export const MOCK_VIDEOS: Video[] = (tonyVideosData as unknown as Video[]);
