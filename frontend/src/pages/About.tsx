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
            <span className="text-xs font-mono uppercase tracking-widest text-sacred-gold">
              {lang === 'EN' ? 'Ministry Journey & Profile' : 'పరిచర్య ప్రస్థానం • సాక్ష్యం'}
            </span>
            <h1 className="text-4xl sm:text-5xl font-heading text-sacred-ivory font-normal">
              A Journey Rooted in Faith
            </h1>
            <p className="font-telugu text-sm text-sacred-goldLight">
              “స్వరము నాదే... స్తుతి దేవునికే • The voice is mine, the glory belongs to God”
            </p>
          </div>

          {/* Bilingual Switcher */}
          <div className="flex items-center gap-1.5 bg-sacred-charcoal p-1 rounded-full border border-sacred-gold/30 self-start sm:self-auto text-xs">
            <button
              onClick={() => setLang('EN')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                lang === 'EN' ? 'bg-gold-gradient text-sacred-midnight font-bold shadow' : 'text-sacred-ivoryMuted hover:text-sacred-ivory'
              }`}
            >
              English Story
            </button>
            <button
              onClick={() => setLang('TE')}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${
                lang === 'TE' ? 'bg-gold-gradient text-sacred-midnight font-bold shadow' : 'text-sacred-ivoryMuted hover:text-sacred-ivory'
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
            <div className="editorial-card rounded-3xl p-3.5 shadow-2xl space-y-4">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sacred-espresso">
                <img
                  src="/tony_prakash.jpg"
                  alt="Tony Prakash"
                  className="w-full h-full object-cover object-top filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sacred-midnight via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-5 left-5 right-5 text-left">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sacred-gold">
                    మూడు దశాబ్దాల ఆరాధనా పరిచర్య
                  </span>
                  <h3 className="text-2xl font-heading text-sacred-ivory font-medium mt-0.5">
                    Tony Prakash
                  </h3>
                  <p className="font-telugu text-xs text-sacred-goldLight mt-1">
                    గాయకుడు • రచయిత • స్వరకర్త
                  </p>
                </div>
              </div>

              {/* Scriptural Memory Verse Banner */}
              <div className="p-3.5 rounded-xl bg-sacred-charcoal/80 border border-white/5 space-y-1">
                <span className="text-[10px] font-mono uppercase text-sacred-gold block">
                  యాకోబు దేవుడు • Scripture Foundation
                </span>
                <p className="font-telugu text-xs text-sacred-ivory/90 italic leading-relaxed">
                  “యెహోవా నా బలము నా గానము; ఆయన నాకు రక్షణాయెను.”
                </p>
                <span className="text-[10px] text-sacred-ivoryMuted/70 block">నిర్గమకాండము 15:2</span>
              </div>
            </div>
          </div>

          {/* Narrative Column */}
          <div className="lg:col-span-7 space-y-6">
            {lang === 'EN' ? (
              <div className="space-y-5 text-sm text-sacred-ivoryMuted leading-relaxed">
                <blockquote className="p-5 rounded-2xl bg-sacred-espresso/30 border-l-4 border-sacred-gold italic text-base sm:text-lg text-sacred-ivory font-heading leading-relaxed">
                  “For over three decades, Tony Prakash has devoted himself to Telugu Christian devotional music. As a singer, lyricist, and composer, he creates songs that express faith and share messages of hope, praise, and devotion.”
                </blockquote>

                <p>
                  Before these songs were recorded in professional acoustic studios or sung before thousands at conventions, they were born in quiet rooms of prayer. The journey began not with a desire for commercial recognition, but with a deep, personal burden to worship the living God in our mother tongue—Telugu—with reverent melodies that touch the heart.
                </p>

                <p>
                  Across thirty years, songs such as <em>“Abrahamu Devudavu”</em>, <em>“Sree Yesu Nee Paadha Seva”</em>, and <em>“Viduvani Naa Yesaiah”</em> have become staples of congregational worship in churches across Hyderabad, Visakhapatnam, Guntur, Vijayawada, and Telugu-speaking fellowships worldwide.
                </p>

                <p>
                  Each composition emphasizes Biblical truth, acoustic clarity, and melodic simplicity so that whether a believer is praying in the quiet of midnight or singing with thousands in a gospel convention, the focus remains entirely on Jesus Christ.
                </p>
              </div>
            ) : (
              <div className="space-y-5 font-telugu text-sm text-sacred-ivoryMuted leading-relaxed">
                <blockquote className="p-5 rounded-2xl bg-sacred-espresso/30 border-l-4 border-sacred-gold italic text-base sm:text-lg text-sacred-ivory leading-relaxed">
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
              <div className="editorial-card rounded-2xl p-4 space-y-2">
                <Mic className="w-5 h-5 text-sacred-gold" />
                <h4 className="font-heading text-base text-sacred-ivory">గాయకుడు • Singer</h4>
                <p className="text-xs text-sacred-ivoryMuted leading-relaxed">
                  Leading congregations not into entertainment, but into genuine, reverent worship in His presence.
                </p>
              </div>

              <div className="editorial-card rounded-2xl p-4 space-y-2">
                <BookOpen className="w-5 h-5 text-sacred-gold" />
                <h4 className="font-heading text-base text-sacred-ivory">రచయిత • Lyricist</h4>
                <p className="text-xs text-sacred-ivoryMuted leading-relaxed">
                  Scripturally rooted Telugu poetry woven with covenant promises, gratitude, and divine hope.
                </p>
              </div>

              <div className="editorial-card rounded-2xl p-4 space-y-2">
                <Music className="w-5 h-5 text-sacred-gold" />
                <h4 className="font-heading text-base text-sacred-ivory">స్వరకర్త • Composer</h4>
                <p className="text-xs text-sacred-ivoryMuted leading-relaxed">
                  Timeless acoustic melodies designed so that grandmothers, children, and choirs can sing together.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 flex flex-wrap items-center gap-4 border-t border-white/5">
              <Link
                to="/music"
                className="px-7 py-3 rounded-full bg-gold-gradient text-sacred-midnight font-semibold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
              >
                Listen to the Songs
              </Link>
              <Link
                to="/bookings"
                className="px-6 py-3 rounded-full bg-sacred-charcoal border border-sacred-gold/40 text-xs uppercase tracking-wider font-semibold text-sacred-ivory hover:text-sacred-gold transition-colors"
              >
                Invite for Worship Gathering
              </Link>
              <a
                href="https://www.youtube.com/@TonyPrakashOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sacred-gold hover:underline flex items-center gap-1.5 ml-auto"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Channel</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
