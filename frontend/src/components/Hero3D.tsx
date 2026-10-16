import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Youtube,
  Calendar,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToMusic = () => {
    const el = document.getElementById('featured-music');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-sacred-midnight pt-16 pb-12 lg:pt-20 lg:pb-16">
      
      {/* Ambient Atmospheric Lighting matching teal, cool white & soft gold palette */}
      <div className="absolute inset-0 pointer-events-none stage-spotlight opacity-95" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-sacred-midnight via-transparent to-sacred-midnight/60" />
      
      {/* Deep teal and soft gold ambient spotlights in background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#0E5671]/20 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-[#1B7C9D]/12 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-[#C9B27C]/8 blur-[120px] pointer-events-none" />

      {/* Main Two-Column Layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT SIDE: Dad Cutout Seamlessly Blended with Circular Backdrop Disc */}
        <div className="lg:col-span-6 flex justify-center items-center relative order-1 -translate-y-2 sm:-translate-y-4 lg:-translate-y-6">
          
          <div className="relative w-full max-w-[440px] sm:max-w-[540px] lg:max-w-[620px] h-[520px] sm:h-[650px] lg:h-[750px] flex items-center justify-center">
            
            {/* 1. Luminous Circular Backdrop Disc in Oceanic Teal & Soft Gold Palette */}
            <div className="relative w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px] rounded-full bg-gradient-to-tr from-[#09212C] via-[#0E5671] to-[#1B7C9D]/90 border-2 border-[#C9B27C]/50 shadow-[0_0_100px_rgba(27,124,157,0.35)] flex items-center justify-center overflow-hidden">
              
              {/* Inner Concentric Glow Ring */}
              <div className="w-[86%] h-[86%] rounded-full border border-[#EDF5F8]/20" />
              
              {/* Subtle radial inner glow matching backdrop */}
              <div className="absolute inset-0 bg-radial-at-t from-[#EDF5F8]/15 via-transparent to-[#07151D]/60 pointer-events-none" />
            </div>

            {/* Outer Soft Gold Halo Glow Ring */}
            <div className="absolute w-[360px] h-[360px] sm:w-[484px] sm:h-[484px] lg:w-[568px] lg:h-[568px] rounded-full border border-[#C9B27C]/25 warm-halo animate-pulse-subtle pointer-events-none" />

            {/* 2. Floating Decorative Sparkles & Stars in Soft Gold */}
            <div className="absolute top-4 left-6 text-[#C9B27C] text-2xl animate-pulse pointer-events-none select-none">
              ✦
            </div>
            <div className="absolute top-16 right-4 text-[#EDF5F8]/80 text-xl pointer-events-none select-none">
              ✧
            </div>
            <div className="absolute bottom-20 left-2 text-[#C9B27C]/80 text-lg pointer-events-none select-none">
              ✦
            </div>
            <div className="absolute top-1/3 -left-4 text-[#1B7C9D] text-sm pointer-events-none select-none">
              ✧
            </div>

            {/* 3. Dad Cutout Image: Perfectly Blended with Zero Cut-off Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src="/dad_white_suit_cutout.png"
                alt="Rev. Tony Prakash - Telugu Devotional Worship"
                className="relative z-10 w-auto h-[350px] sm:h-[470px] lg:h-[540px] xl:h-[570px] -translate-y-2 sm:-translate-y-3 lg:-translate-y-4 max-w-none object-contain filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.85)] drop-shadow-[0_0_30px_rgba(27,124,157,0.3)] transition-transform duration-700 hover:scale-[1.02]"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 65%, transparent 97%)',
                }}
              />
            </div>

            {/* 4. Live Ministry Floating Pill Badge */}
            <div className="absolute bottom-3 right-2 sm:right-6 z-30 px-4 py-2 rounded-full bg-sacred-midnight/90 backdrop-blur-md border border-[#1B7C9D]/50 shadow-2xl flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B7C9D] animate-ping" />
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#EDF5F8] font-bold">
                Live Worship Ministry
              </span>
            </div>

            {/* 5. 30+ Years Ministry Tag on the Left Side of Hero Image */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-2 sm:-left-6 lg:-left-10 z-30 px-3.5 sm:px-4 py-2 rounded-full bg-sacred-midnight/90 backdrop-blur-md border border-[#C9B27C]/40 shadow-2xl flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9B27C]" />
              <span className="font-telugu text-[11px] sm:text-xs text-[#EDF5F8] font-semibold whitespace-nowrap">
                30+ వసంతాల పరిచర్య
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Beautiful Name Design (Telugu & English) + Scripture + Action Buttons */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-2">
          
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-sacred-charcoal/90 border border-[#1B7C9D]/40 backdrop-blur-md shadow-lg">
            <span className="text-[#C9B27C] text-xs">✦</span>
            <span className="text-[11px] font-mono tracking-widest text-[#EDF5F8] font-medium">
              <span className="font-semibold text-[#C9B27C]">Rev.</span> <span className="uppercase text-[#A5C1CC]">Tony Prakash Official</span> • తెలుగు క్రైస్తవ ఆరాధన
            </span>
          </div>

          {/* Regal Bilingual Typography Showcase */}
          <div className="space-y-4">
            
            {/* 1. Telugu Name (Grand, Soulful, Calligraphic Serifs with Rev.) */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-[#C9B27C]">
                <span>భక్తి గాన స్వరకర్త • గాయకుడు</span>
                <span className="text-[#EDF5F8]">✦</span>
              </div>
              <h1 className="font-telugu text-5xl sm:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-[#EDF5F8] via-[#E8DCB8] to-[#C9B27C] drop-shadow-[0_4px_30px_rgba(201,178,124,0.35)]">
                రెవ. టోనీ ప్రకాష్
              </h1>
            </div>

            {/* Elegant Ornamental Divider with Sacred Cross */}
            <div className="flex items-center gap-4 py-1 max-w-lg">
              <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#1B7C9D]/40 to-[#C9B27C]/80" />
              <div className="flex items-center gap-2 text-[#C9B27C]">
                <span className="text-xs">✦</span>
                <span className="text-base font-serif">✝</span>
                <span className="text-xs">✦</span>
              </div>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#C9B27C]/80 via-[#1B7C9D]/40 to-transparent" />
            </div>

            {/* 2. English Name with Rev. in Title Case */}
            <div>
              <h2 className="font-heading text-4xl sm:text-5xl xl:text-6xl font-normal tracking-[0.06em] text-[#EDF5F8] leading-tight">
                <span className="text-[#C9B27C] font-serif italic text-2xl sm:text-4xl mr-2.5 normal-case font-normal">
                  Rev.
                </span>
                <span className="gold-gradient-text font-medium uppercase">Tony Prakash</span>
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono tracking-widest uppercase text-[#A5C1CC] mt-1.5">
                <span>Devotional Singer</span>
                <span className="text-[#C9B27C]">•</span>
                <span>Lyricist</span>
                <span className="text-[#C9B27C]">•</span>
                <span>Composer</span>
              </div>
            </div>
          </div>

          {/* Scripture Verse Card */}
          <div className="border-l-2 border-[#C9B27C] pl-4 py-3 bg-sacred-espresso/60 rounded-r-2xl max-w-xl border-t border-b border-r border-[#1B7C9D]/20 shadow-lg">
            <p className="font-telugu text-xs sm:text-sm text-[#EDF5F8] italic leading-relaxed">
              “నా ప్రాణమా, యెహోవాను సన్నుతించుము — ఆయన చేసిన ఉపకారములలో దేనిని మరువకుము.”
            </p>
            <span className="text-[10px] font-mono uppercase text-[#C9B27C] block mt-1.5 font-semibold">
              కీర్తనలు 103:2 • Psalm 103:2
            </span>
          </div>

          {/* Prominent CTA Buttons (Filled with Teal #1B7C9D and hover #0E5671) */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              onClick={scrollToMusic}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1B7C9D] to-[#0E5671] hover:from-[#0E5671] hover:to-[#082836] text-[#EDF5F8] font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_0_30px_rgba(27,124,157,0.45)] hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ఆరాధనా గీతాలు (Listen Songs)</span>
            </button>

            <a
              href="https://www.youtube.com/@TonyPrakashOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-sacred-charcoal/90 border border-[#1B7C9D]/45 text-[#EDF5F8] text-xs tracking-wider uppercase font-semibold hover:border-[#C9B27C] hover:text-[#C9B27C] hover:bg-[#0E5671]/40 transition-all duration-300"
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>YouTube Ministry</span>
            </a>

            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-sacred-surface border border-[#1B7C9D]/30 text-[#A5C1CC] text-xs tracking-wider uppercase font-medium hover:text-[#C9B27C] hover:border-[#C9B27C]/50 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Invite for Event</span>
            </Link>
          </div>

          {/* Ministry Highlights Trust Strip */}
          <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#A5C1CC] border-t border-[#1B7C9D]/20">
            <span className="flex items-center gap-1.5 text-[#EDF5F8]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>30+ Years Devotional Ministry</span>
            </span>
            <span>•</span>
            <span className="font-telugu text-[#C9B27C] font-medium">
              గాయకుడు • రచయిత • స్వరకర్త
            </span>
            <span>•</span>
            <span>Live Convention Worship</span>
          </div>

        </div>

      </div>

      {/* Subtle Scroll Down Prompt */}
      <button
        onClick={scrollToMusic}
        aria-label="Scroll down to music"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 text-[#A5C1CC]/60 hover:text-[#C9B27C] transition-colors duration-300"
      >
        <span className="text-[9px] tracking-[0.25em] uppercase font-mono">Scroll Down</span>
        <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
      </button>

    </section>
  );
};

export const Hero3D = Hero;
