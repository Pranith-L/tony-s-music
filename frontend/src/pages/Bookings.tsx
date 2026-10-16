import React, { useState } from 'react';
import {
  Calendar,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Heart,
  Users,
} from 'lucide-react';
import { api } from '../services/api.js';

export const BookingsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    eventType: 'Church Worship Event',
    organization: '',
    eventDate: '',
    preferredTime: '',
    city: '',
    venue: '',
    expectedAudience: '',
    message: '',
    consentGiven: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReference, setSubmittedReference] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eventTypes = [
    'Church Worship Event • సంఘ ఆరాధనా కూడిక',
    'Christian Conference • సువార్త మహాసభలు',
    'Concert & Praise Rally • స్తుతి గాన ఆరాధన',
    'Special Programme / Revival • ప్రత్యేక ప్రార్థన కూడిక',
    'Private / Family Thanksgiving • కృతజ్ఞతా ప్రార్థన',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.consentGiven) {
      setErrorMsg('Please confirm your consent to be contacted regarding this ministry gathering.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.bookings.submit(formData);
      setSubmittedReference(res.referenceNo);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Pastoral Greeting & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sacred-charcoal border border-sacred-gold/30 text-xs font-mono uppercase tracking-widest text-sacred-gold font-medium">
            <Heart className="w-3.5 h-3.5 text-sacred-gold" />
            <span>వందనములు • Praise the Lord</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading text-sacred-ivory font-normal">
            Let’s Make Your Event a Time of Worship
          </h1>
          <p className="font-telugu text-base text-sacred-goldLight font-medium">
            “సంఘ కూడికలకు, సువార్త సభలకు రెవ. టోనీ ప్రకాష్ గారిని ఆహ్వానించడానికి”
          </p>
          <p className="text-xs sm:text-sm text-sacred-ivoryMuted max-w-xl mx-auto leading-relaxed pt-1">
            Whether you are planning a Sunday church anniversary, a three-day revival convention, or an open-air gospel rally, we consider it a sacred privilege to stand alongside your fellowship in unhurried praise and prayer.
          </p>
        </div>

        {/* Confirmation Screen */}
        {submittedReference ? (
          <div className="editorial-card rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl border border-sacred-gold animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-sacred-gold/15 border border-sacred-gold flex items-center justify-center text-sacred-gold mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sacred-gold">
                వందనములు • Request Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading text-sacred-ivory font-medium">
                Thank You for Inviting Us
              </h2>
              <p className="font-telugu text-sm text-sacred-goldLight">
                మీ ప్రార్థన కూడిక వివరాలు మా పరిచర్య సమన్వయ బృందానికి చేరాయి.
              </p>
              <p className="text-xs sm:text-sm text-sacred-ivoryMuted max-w-lg mx-auto leading-relaxed">
                Our coordination team will review the proposed date and connect with you directly by phone and WhatsApp to discuss travel, schedule, and acoustic sound arrangements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sacred-charcoal/90 border border-sacred-gold/40 max-w-md mx-auto">
              <div className="text-[11px] text-sacred-ivoryMuted uppercase font-mono tracking-wider">
                Official Booking Reference
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-sacred-goldLight mt-1">
                {submittedReference}
              </div>
            </div>

            <p className="text-[11px] text-sacred-ivoryMuted/70 italic max-w-md mx-auto">
              * Please note: Submitting this form initiates communication and does not represent a confirmed date until finalized between both parties.
            </p>

            <button
              onClick={() => {
                setSubmittedReference(null);
                setFormData({
                  fullName: '',
                  email: '',
                  phone: '',
                  eventType: 'Church Worship Event',
                  organization: '',
                  eventDate: '',
                  preferredTime: '',
                  city: '',
                  venue: '',
                  expectedAudience: '',
                  message: '',
                  consentGiven: false,
                });
              }}
              className="px-6 py-2.5 rounded-full bg-sacred-charcoal border border-sacred-gold/40 text-xs font-semibold uppercase tracking-wider text-sacred-gold hover:bg-sacred-gold/15 transition-colors"
            >
              Submit Another Gathering Enquiry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Form Container */}
            <div className="lg:col-span-8 editorial-card rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Contact Name / Pastor Name <span className="text-sacred-gold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pastor K. John / Samuel"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Phone Number & WhatsApp <span className="text-sacred-gold">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98480 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Email Address <span className="text-sacred-gold">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="pastor@church.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Type of Gathering <span className="text-sacred-gold">*</span>
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory focus:outline-none focus:border-sacred-gold"
                    >
                      {eventTypes.map((t) => (
                        <option key={t} value={t} className="bg-sacred-midnight">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-sacred-ivory">
                    Church or Fellowship Name <span className="text-sacred-ivoryMuted font-light">(e.g. Grace Baptist Church, Guntur)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bethel Gospel Church"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Proposed Date <span className="text-sacred-gold">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory focus:outline-none focus:border-sacred-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Preferred Time <span className="text-sacred-ivoryMuted font-light">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 6:30 PM (Evening Service)"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      City / Town <span className="text-sacred-gold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vijayawada, Hyderabad, Visakhapatnam..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-sacred-ivory">
                      Approximate Congregation Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 500 – 1200 believers"
                      value={formData.expectedAudience}
                      onChange={(e) => setFormData({ ...formData, expectedAudience: e.target.value })}
                      className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-sacred-ivory">
                    Gathering Notes & Prayer Burden <span className="text-sacred-gold">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the occasion (e.g. 25th Church Anniversary, Youth Revival, Sunday Gospel Meeting), sound system arrangements, and any specific devotional songs desired..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-sacred-charcoal border border-sacred-gold/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-sacred-ivory placeholder-sacred-ivoryMuted/40 focus:outline-none focus:border-sacred-gold"
                  />
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="consentBooking"
                    required
                    checked={formData.consentGiven}
                    onChange={(e) => setFormData({ ...formData, consentGiven: e.target.checked })}
                    className="mt-1 rounded bg-sacred-charcoal border-sacred-gold text-sacred-gold focus:ring-0"
                  />
                  <label htmlFor="consentBooking" className="text-xs text-sacred-ivoryMuted leading-relaxed cursor-pointer">
                    I confirm this is an authentic church / gathering invitation and consent to being contacted by phone, WhatsApp, or email to coordinate dates.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-full bg-gold-gradient text-sacred-midnight font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Submit Worship Event Invitation'}</span>
                </button>
              </form>
            </div>

            {/* Sidebar with Pastoral Guidance & WhatsApp */}
            <div className="lg:col-span-4 space-y-6">
              <div className="editorial-card rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase font-semibold text-sacred-gold">
                  <Phone className="w-4 h-4" />
                  <span>Direct WhatsApp Line</span>
                </div>
                <p className="text-xs text-sacred-ivoryMuted leading-relaxed">
                  For urgent coordination or to confirm dates directly with Bro. Tony Prakash’s ministry team:
                </p>
                <a
                  href="https://wa.me/919440100000?text=Praise%20the%20Lord%20Bro.%20Tony%20Prakash%2C%20we%20would%20like%20to%20invite%20you%20for%20our%20worship%20gathering."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider transition-colors shadow"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="editorial-card rounded-3xl p-6 space-y-3.5 text-xs text-sacred-ivoryMuted">
                <div className="flex items-center gap-2 text-sacred-gold font-mono uppercase font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Preparation Notes</span>
                </div>
                <p className="leading-relaxed">
                  • <strong>Acoustics:</strong> A clear acoustic sound system suitable for lead vocal, harmonium / keyboard, and rhythm is requested.
                </p>
                <p className="leading-relaxed">
                  • <strong>Prayer:</strong> We join with your leadership in prayer beforehand that souls will be drawn to Christ.
                </p>
                <p className="leading-relaxed">
                  • <strong>Privacy:</strong> We never share church contact details with outside agencies.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
