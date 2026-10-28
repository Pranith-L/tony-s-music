import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Youtube, Heart, Music, Mic, BookOpen, Quote, Calendar, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [lang, setLang] = useState<'EN' | 'TE'>('EN');

  return (
    <div className="space-y-12 max-w-[1400px] mx-auto">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Editorial Masthead with Language Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-sacred-gold/15 pb-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#D4A017] font-bold">
              {lang === 'EN' ? 'Ministry Journey & Profile' : 'పరిచర్య ప్రస్థానం • సాక్ష్యం'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading text-[#1D1D1F] dark:text-white font-bold">
              A Journey Rooted in Faith
            </h1>
            <p className="font-telugu text-sm text-[#FA243C] font-semibold">
              “స్వరము నాదే... స్తుతి దేవునికే • The voice is mine, the glory belongs to God”
            </p>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center gap-1.5 bg-[#F2F2F7] dark:bg-[#1C1C1E] p-1 rounded-full border border-[#E5E5EA] dark:border-white/10 self-start sm:self-auto text-xs">
            <button
              onClick={() => setLang('EN')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                lang === 'EN' ? 'bg-[#FA243C] text-white shadow' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              English Story
            </button>
            <button
              onClick={() => setLang('TE')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                lang === 'TE' ? 'bg-[#FA243C] text-white shadow' : 'text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-white'
              }`}
            >
              తెలుగు సాక్ష్యం
            </button>
          </div>
        </div>

        {/* Hero Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Portrait with Authentic Border */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl p-3.5 bg-white dark:bg-[#18181B] border border-[#E5E5EA] dark:border-white/10 shadow-2xl space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black shadow-inner">
                <img
                  src="/tony_prakash.jpg"
                  alt="Tony Prakash"
                  className="w-full h-full object-cover object-top filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                <div className="about-portrait-glass-badge absolute bottom-4 left-4 right-4 text-left p-3.5 rounded-2xl">
                  <span className="badge-title text-[10px] font-mono uppercase tracking-widest font-bold block drop-shadow-sm">
                    మూడు దశాబ్దాల ఆరాధనా పరిచర్య
                  </span>
                  <div className="py-1">
                    <img
                      src="/branding/signature_english_light.png"
                      alt="Rev. Tony Prakash"
                      className="h-9 sm:h-11 w-auto object-contain filter drop-shadow-sm"
                    />
                  </div>
                  <p className="badge-subtitle font-telugu text-xs font-bold mt-0.5 tracking-wide">
                    గాయకుడు • రచయిత • స్వరకర్త
                  </p>
                </div>
              </div>

              {/* Scriptural Memory Verse Banner */}
              <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 shadow-sm space-y-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FA243C] dark:text-[#D4A017] block">
                  యాకోబు దేవుడు • SCRIPTURE FOUNDATION
                </span>
                <p className="font-telugu text-sm font-semibold text-[#1D1D1F] dark:text-white leading-relaxed">
                  “యెహోవా నా బలము నా గానము; ఆయన నాకు రక్షణాయెను.”
                </p>
                <span className="text-xs font-mono font-medium text-[#86868B] dark:text-stone-400 block">
                  నిర్గమకాండము 15:2
                </span>
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            {lang === 'EN' ? (
              <div className="space-y-5 text-sm text-[#48484A] dark:text-stone-300 leading-relaxed font-normal">
                <blockquote className="p-5 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border-l-4 border-[#FA243C] dark:border-[#D4A017] italic text-base sm:text-lg text-[#1D1D1F] dark:text-white font-heading leading-relaxed shadow-sm">
                  “For over three decades, Tony Prakash has devoted himself to Telugu Christian devotional music. As a singer, lyricist, and composer, he creates songs that express faith and share messages of hope, praise, and devotion.”
                </blockquote>

                <p>
                  Before these songs were recorded in professional acoustic studios or sung before thousands at conventions, they were born in quiet rooms of prayer. The journey began not with a desire for commercial recognition, but with a deep, personal burden to worship the living God in our mother tongue—Telugu—with reverent melodies that touch the heart.
                </p>

                <p>
                  Across thirty years, songs such as <em className="font-semibold text-[#1D1D1F] dark:text-white">“Abrahamu Devudavu”</em>, <em className="font-semibold text-[#1D1D1F] dark:text-white">“Sree Yesu Nee Paadha Seva”</em>, and <em className="font-semibold text-[#1D1D1F] dark:text-white">“Viduvani Naa Yesaiah”</em> have become staples of congregational worship in churches across Hyderabad, Visakhapatnam, Guntur, Vijayawada, and Telugu-speaking fellowships worldwide.
                </p>

                <p>
                  Each composition emphasizes Biblical truth, acoustic clarity, and melodic simplicity so that whether a believer is praying in the quiet of midnight or singing with thousands in a gospel convention, the focus remains entirely on Jesus Christ.
                </p>
              </div>
            ) : (
              <div className="space-y-5 font-telugu text-sm text-[#48484A] dark:text-stone-300 leading-relaxed">
                <blockquote className="p-5 rounded-2xl bg-[#F5F5F7] dark:bg-white/5 border-l-4 border-[#FA243C] dark:border-[#D4A017] italic text-base sm:text-lg text-[#1D1D1F] dark:text-white leading-relaxed shadow-sm">
                  “మూడు దశాబ్దాలకు పైగా తెలుగు క్రైస్తవ భక్తి సంగీత పరిచర్యలో కొనసాగుతూ, గాయకుడిగా, రచయితగా, స్వరకర్తగా దేవుని నామ మహిమార్థమై అనేక ఆరాధనా కీర్తనలను అందించారు.”
                </blockquote>

                <p>
                  ఈ గీతాలు కేవలం స్టూడియోలలో రూపొందినవి కావు... ప్రభువు పాదాల చెంత మోకరించి కన్నీటితో చేసిన ప్రార్థనల్లో పుట్టినవి. ఎలాంటి ఆడంబరాలు లేకుండా, పరిశుద్ధ గ్రంథ వాక్య సత్యాలను ఆధారం చేసుకుని, తెలుగు భాష మాధుర్యంతో పరలోక ఆరాధనను ప్రతిబింబించేలా ఈ కీర్తనలు స్వరపరచబడ్డాయి.
                </p>

                <p>
                  “అబ్రహాము దేవుడవు”, “శ్రీ యేసు నీ పాద సేవ”, “విడువని నా యేసయ్య”, “అమ్మ ప్రేమ విలువైనది” వంటి కీర్తనలు ఎందరో విశ్వాసులకు కష్ట సమయాల్లో ఓదార్పును, విశ్వాస బలాన్ని అందించాయి.
                </p>

                <p>
                  ఈ పరిచర్య ముఖ్య ఉద్దేశం ఒక్కటే: ప్రతి హృదయం దేవుని వైపు తిరగాలి... ప్రతి స్వరము ఆయనను స్తుతించాలి.
                </p>
              </div>
            )}

            {/* Three Pastoral & Musical Roles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="rounded-2xl p-4 bg-[#F5F5F7] dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 space-y-2 shadow-sm">
                <Mic className="w-5 h-5 text-[#FA243C] dark:text-[#D4A017]" />
                <h4 className="font-heading text-base font-bold text-[#1D1D1F] dark:text-white">గాయకుడు • Singer</h4>
                <p className="text-xs text-[#86868B] dark:text-stone-300 leading-relaxed">
                  Leading congregations not into entertainment, but into genuine, reverent worship in His presence.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-[#F5F5F7] dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 space-y-2 shadow-sm">
                <BookOpen className="w-5 h-5 text-[#FA243C] dark:text-[#D4A017]" />
                <h4 className="font-heading text-base font-bold text-[#1D1D1F] dark:text-white">రచయిత • Lyricist</h4>
                <p className="text-xs text-[#86868B] dark:text-stone-300 leading-relaxed">
                  Scripturally rooted Telugu poetry woven with covenant promises, gratitude, and divine hope.
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-[#F5F5F7] dark:bg-white/5 border border-[#E5E5EA] dark:border-white/10 space-y-2 shadow-sm">
                <Music className="w-5 h-5 text-[#FA243C] dark:text-[#D4A017]" />
                <h4 className="font-heading text-base font-bold text-[#1D1D1F] dark:text-white">స్వరకర్త • Composer</h4>
                <p className="text-xs text-[#86868B] dark:text-stone-300 leading-relaxed">
                  Timeless acoustic melodies designed so that grandmothers, children, and choirs can sing together.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 flex flex-wrap items-center gap-4 border-t border-[#E5E5EA] dark:border-white/10">
              <Link
                to="/music"
                className="px-7 py-3 rounded-full bg-[#FA243C] hover:bg-[#D71A30] text-white font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-all shadow-md"
              >
                Listen to the Songs
              </Link>
              <Link
                to="/bookings"
                className="px-6 py-3 rounded-full bg-[#F2F2F7] dark:bg-white/10 border border-[#E5E5EA] dark:border-white/20 text-xs uppercase tracking-wider font-semibold text-[#1D1D1F] dark:text-white hover:text-[#FA243C] transition-colors"
              >
                Invite for Worship Gathering
              </Link>
              <a
                href="https://www.youtube.com/@RevTonyPrakashOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#FA243C] dark:text-[#D4A017] font-semibold hover:underline flex items-center gap-1.5 ml-auto"
              >
                <Youtube className="w-4 h-4 fill-current text-red-600" />
                <span>YouTube Channel</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
