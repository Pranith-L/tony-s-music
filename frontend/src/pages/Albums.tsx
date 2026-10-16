import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Disc3, Play, ChevronRight, Sparkles } from 'lucide-react';
import { Album } from '../types/index.js';
import { api } from '../services/api.js';

export const AlbumsPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const data = await api.albums.getAll();
        setAlbums(data);
      } catch (err) {
        console.error('Failed to load albums:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlbums();
  }, []);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C9B27C] font-semibold font-mono">
          <Disc3 className="w-4 h-4 text-[#1B7C9D]" />
          <span>Complete Discography • ఆల్బమ్‌లు</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#EDF5F8]">
          Telugu Devotional Albums & Songbooks
        </h1>
        <p className="text-xs sm:text-sm text-[#A5C1CC] max-w-2xl leading-relaxed">
          Explore devotional studio collections released by Rev. Tony Prakash across thirty years of ministry. Click any album to stream, explore tracklists, and view verified lyrics.
        </p>
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-[#1B7C9D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#A5C1CC]">Loading albums...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/albums/${album.slug}`}
              className="group p-4 rounded-2xl bg-[#0B222E]/80 hover:bg-[#12303E] border border-[#1B7C9D]/20 hover:border-[#1B7C9D]/50 transition-all duration-300 shadow-lg space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#0F2B38] mb-3 shadow-md border border-[#1B7C9D]/30">
                  <img
                    src={album.coverImage}
                    alt={album.titleEnglish}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-[#C9B27C] border border-[#C9B27C]/30">
                    {album.releaseYear}
                  </div>
                  {/* Floating Play Button on Hover */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-gradient-to-tr from-[#1B7C9D] to-[#0E5671] text-[#EDF5F8] flex items-center justify-center shadow-xl border border-[#C9B27C]/50 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="font-telugu text-base sm:text-lg font-bold text-[#EDF5F8] group-hover:text-[#1B7C9D] transition-colors leading-tight">
                    {album.titleTelugu}
                  </h2>
                  <h3 className="text-xs text-[#A5C1CC] truncate">
                    {album.titleEnglish}
                  </h3>
                  <p className="text-[11px] text-[#A5C1CC]/80 line-clamp-2 mt-2 leading-relaxed">
                    {album.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1B7C9D]/15 flex items-center justify-between text-xs text-[#C9B27C] font-semibold">
                <span>{album._count?.tracks || album.tracks?.length || 4} Songs</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-[#1B7C9D]">
                  <span>Listen</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
