import generatedTracksData from './generatedTracks.json';
import { Track, Album, Video } from '../types/index.js';

export const MOCK_ALBUMS: Album[] = [
  {
    id: 'album-neetho',
    slug: 'neetho',
    titleTelugu: 'నీతో',
    titleEnglish: 'Neetho (With You)',
    releaseYear: 2023,
    coverImage: '/covers/002_Nee_Prema_Naaku_Chalu.jpg',
    description: 'A deeply personal collection of devotion, prayer, and acoustic praise expressing continuous communion with God.',
    isFeatured: true,
    status: 'PUBLISHED',
    _count: { tracks: 4 },
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'album-deva-sannidhi',
    slug: 'deva-sannidhi',
    titleTelugu: 'దేవ సన్నిధి',
    titleEnglish: 'Deva Sannidhi (In His Presence)',
    releaseYear: 2024,
    coverImage: '/covers/020_Abraham_Devudavu.jpg',
    description: 'Atmospheric worship and sacred Telugu hymns crafted for congregational reflection and intimate adoration.',
    isFeatured: true,
    status: 'PUBLISHED',
    _count: { tracks: 3 },
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'album-journey-of-praise',
    slug: 'journey-of-praise',
    titleTelugu: 'కీర్తనల యాత్ర',
    titleEnglish: 'A Journey of Praise',
    releaseYear: 2022,
    coverImage: '/covers/010_Jayashali.jpg',
    description: 'Celebrated songs from decades of ministry, showcasing gratitude, divine healing, and enduring faith.',
    isFeatured: false,
    status: 'PUBLISHED',
    _count: { tracks: 3 },
    createdAt: '2022-05-20T00:00:00Z',
    updatedAt: '2022-05-20T00:00:00Z',
  },
];

export const MOCK_TRACKS: Track[] = (generatedTracksData as unknown as Track[]);
import tonyVideosData from './tonyVideos.json';

export const MOCK_VIDEOS: Video[] = (tonyVideosData as unknown as Video[]);
