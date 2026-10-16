import React from 'react';
import { Link } from 'react-router-dom';
import { Youtube, Mail, Phone, Heart, Sparkles, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-sacred-midnight border-t border-sacred-gold/20 pt-16 pb-28 text-sacred-ivoryMuted text-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand & Ministry */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full sacred-glass border border-sacred-gold/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-sacred-gold" />
            </div>
            <span className="font-heading text-lg tracking-wider text-sacred-ivory font-medium">
              TONY PRAKASH OFFICIAL
            </span>
          </div>
          <p className="text-xs leading-relaxed text-sacred-ivoryMuted">
            Dedicated to uplifting hearts through Telugu Christian devotional music, worship compositions, and sacred songwriting.
          </p>
          <div className="text-xs font-telugu text-sacred-gold pt-1">
            “నా ప్రాణమా ప్రభుని స్తుతించు — ఆయన చేసిన మేలులను మరవకు.”
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-sacred-gold font-semibold mb-4">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/music" className="hover:text-sacred-gold transition-colors">
                Complete Music Catalogue
              </Link>
            </li>
            <li>
              <Link to="/albums" className="hover:text-sacred-gold transition-colors">
                Albums & Devotional Collections
              </Link>
            </li>
            <li>
              <Link to="/videos" className="hover:text-sacred-gold transition-colors">
                Watch Official Videos
              </Link>
            </li>
            <li>
              <Link to="/membership" className="hover:text-sacred-gold transition-colors">
                Tony's VIP Pass (₹299/mo)
              </Link>
            </li>
            <li>
              <Link to="/bookings" className="hover:text-sacred-gold transition-colors">
                Book Worship Programme / Enquiries
              </Link>
            </li>
          </ul>
        </div>

        {/* Official Channels */}
        <div>
          <h4 className="text-xs uppercase tracking-widest text-sacred-gold font-semibold mb-4">
            Official Channels
          </h4>
          <ul className="space-y-3 text-xs">
            <li>
              <a
                href="https://www.youtube.com/@TonyPrakashOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-sacred-gold transition-colors"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube @TonyPrakashOfficial</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sacred-gold" />
              <span>ministry@tonyprakash.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sacred-gold" />
              <span>WhatsApp: +91 94401 00000</span>
            </li>
          </ul>
        </div>

        {/* Transparency & Rights Notice */}
        <div className="space-y-3 text-xs">
          <h4 className="text-xs uppercase tracking-widest text-sacred-gold font-semibold mb-2">
            Tony's Music Standard
          </h4>
          <p className="text-[11px] leading-relaxed">
            All songs, lyrics, and compositions presented are verified ministry works. Audio downloads require entitlement confirmation or active subscription.
          </p>
          <div className="pt-2 text-[10px] text-sacred-ivoryMuted/60">
            Secure Payments via Razorpay. Integer paise accounting. No unauthorized media ripping.
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          © {new Date().getFullYear()} Tony Prakash Official. All glory to God. All rights reserved.
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span>Crafted with devotion for Telugu Christian worship</span>
          <Heart className="w-3 h-3 text-red-400 fill-current ml-1" />
        </div>
      </div>
    </footer>
  );
};
