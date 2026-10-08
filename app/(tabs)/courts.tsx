import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Court, Booking, CourtReview } from '../../src/types.ts';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  DollarSign,
  Star,
  MessageSquare,
  Send,
  ThumbsUp,
  Check,
  User,
} from 'lucide-react';

const REVIEW_TAGS = [
  'Court Surface & Grip',
  'Night Lighting',
  'Management & Staff',
  'Net Quality & Tension',
  'Cleanliness & Restrooms',
  'Spectator Bleachers',
  'Equipment Rentals',
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: '1 / 5 · Poor - Needs Immediate Maintenance',
  2: '2 / 5 · Fair - Decent Playability',
  3: '3 / 5 · Good - Solid Standard Courts',
  4: '4 / 5 · Very Good - Great Surface & Helpful Staff',
  5: '5 / 5 · Championship Tier - Pristine Courts & Superb Management!',
};

export default function CourtsScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Court & Booking State
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [durationHours, setDurationHours] = useState(1);
  const [selectedCourtNum, setSelectedCourtNum] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('06:00 PM');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Rating & Review State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [courtToRate, setCourtToRate] = useState<Court | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Court Surface & Grip',
    'Management & Staff',
  ]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [expandedReviewsCourtId, setExpandedReviewsCourtId] = useState<string | null>(null);

  useEffect(() => {
    const loadCourts = async () => {
      try {
        const res = await api.courts.getCourts();
        setCourts(res.data || []);
      } catch (err) {
        console.error('Failed to load courts:', err);
      }
    };
    loadCourts();
  }, []);

  const handleOpenBooking = (court: Court) => {
    setSelectedCourt(court);
    setConfirmedBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenRatingModal = (court: Court) => {
    setCourtToRate(court);
    setRatingScore(5);
    setHoverRating(null);
    setCommentText('');
    setSelectedTags(['Court Surface & Grip', 'Management & Staff']);
    setIsRatingModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtToRate || !commentText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const res = await api.courts.addReview(courtToRate.id, {
        rating: ratingScore,
        comment: commentText.trim(),
        tags: selectedTags,
        user_name: user?.full_name || 'Verified Athlete',
        user_avatar: user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
        user_role: user?.rank_tier ? `${user.rank_tier} Athlete (ELO ${user.rank_points})` : 'Verified Player',
        user_id: user?.id,
      });

      // Update state locally
      if (res.court) {
        setCourts((prev) => prev.map((c) => (c.id === res.court.id ? res.court : c)));
      } else if (res.review) {
        setCourts((prev) =>
          prev.map((c) => {
            if (c.id === courtToRate.id) {
              const updatedRevs = [res.review, ...(c.reviews || [])];
              const avg = Number(
                (updatedRevs.reduce((acc, r) => acc + r.rating, 0) / updatedRevs.length).toFixed(1)
              );
              return {
                ...c,
                reviews: updatedRevs,
                reviews_count: updatedRevs.length,
                average_rating: avg,
              };
            }
            return c;
          })
        );
      }

      // Automatically expand reviews for this court so the player sees their comment
      setExpandedReviewsCourtId(courtToRate.id);

      // Trigger celebration confetti for high ratings!
      if (ratingScore >= 4) {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore if canvas blocked
        }
      }

      addNotification({
        title: `${ratingScore}-Star Review Submitted`,
        message: `Thank you for rating ${courtToRate.name}! Your management & court feedback is published.`,
        type: 'league',
        targetTab: 'courts',
        badge: `${ratingScore} ★ RATED`,
      });

      setIsRatingModalOpen(false);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleConfirmStripePayment = async () => {
    if (!selectedCourt || !user) return;
    setIsProcessingPayment(true);
    try {
      const intentRes = await api.payments.createPaymentIntent({
        courtId: selectedCourt.id,
        durationHours,
        courtNumber: selectedCourtNum,
      });

      // Confirm payment
      const confirmRes = await api.payments.confirmPayment(
        intentRes.booking.id,
        intentRes.paymentIntentId
      );

      setConfirmedBooking({
        ...intentRes.booking,
        payment_status: 'succeeded',
      });

      addNotification({
        title: `${selectedCourt.name} · Court #${selectedCourtNum} Reserved`,
        message: `Confirmed booking for ${selectedTimeSlot} (${durationHours} hr). Stripe payment verified. Access pass active.`,
        type: 'court',
        targetTab: 'courts',
        actionLabel: 'View Court Pass',
        badge: 'PAID · STRIPE',
      });
    } catch (err: any) {
      console.error('Booking payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const timeSlots = [
    '08:00 AM',
    '09:30 AM',
    '11:00 AM',
    '02:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:30 PM',
  ];

  return (
    <div className="flex flex-col space-y-4 pb-20 px-4 pt-3 max-w-2xl mx-auto w-full">
      {/* Header with Tagum Club Picture Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-5">
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src="/src/assets/images/tagum_pickleball_club_1790516250921.jpg"
            alt="Tagum City Pickleball Club"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow">
              <MapPin className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
              COURT RESERVATIONS
            </h1>
          </div>
        </div>
      </div>

      {/* Courts List */}
      <div className="space-y-4">
        {courts.map((court) => {
          const avgRating = court.average_rating || 4.8;
          const reviewsCount = court.reviews_count || court.reviews?.length || 0;
          const isExpanded = expandedReviewsCourtId === court.id;

          return (
            <div
              key={court.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg transition-all hover:border-slate-700"
            >
              {/* Court Image Banner */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                <img
                  src={court.image_url}
                  alt={court.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                    {court.is_indoor ? 'Indoor Facility' : 'Outdoor Pavilions'}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700">
                    {court.total_courts} Courts
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 text-right">
                  <span className="text-lg font-black text-white font-['JetBrains_Mono']">
                    ₱{court.hourly_rate}
                  </span>
                  <span className="text-xs text-slate-300 font-medium"> / hr</span>
                </div>
              </div>

              {/* Court Body */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{court.name}</h3>

                  {/* 1 to 5 Star Rating Badge */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-white font-mono">
                      {avgRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{court.address}</span>
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {court.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Rating & Review Interactive Row */}
                <div className="flex items-center justify-between gap-2 pt-2.5 mb-3.5 border-t border-slate-800/80 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenRatingModal(court)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 transition-all active:scale-95 shadow-sm"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Rate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedReviewsCourtId(isExpanded ? null : court.id)
                    }
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[11px] font-medium py-1 px-2 rounded-lg hover:bg-slate-800/50"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {isExpanded ? 'Hide Comments' : 'Comments'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Expandable Comments & Player Reviews Section */}
                {isExpanded && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{avgRating.toFixed(1)} Venue Rating</span>
                      </div>

                      <button
                        onClick={() => handleOpenRatingModal(court)}
                        className="text-[11px] text-emerald-400 font-bold hover:underline"
                      >
                        + Leave Review
                      </button>
                    </div>

                    {(!court.reviews || court.reviews.length === 0) ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No reviews yet for this court. Be the first player to rate the court & staff!
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-60 overflow-y-auto no-scrollbar pr-1">
                        {court.reviews.map((rev) => (
                          <div
                            key={rev.id}
                            className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={rev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80'}
                                  alt={rev.user_name}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                                />
                                <div>
                                  <span className="font-bold text-white text-[11px] block leading-none">
                                    {rev.user_name}
                                  </span>
                                  {rev.user_role && (
                                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                                      {rev.user_role}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Star Display */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Comment */}
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              "{rev.comment}"
                            </p>

                            {/* Tags */}
                            {rev.tags && rev.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {rev.tags.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reserve Court Action Button */}
                <button
                  onClick={() => handleOpenBooking(court)}
                  className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>RESERVER COURT</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RATE COURT & MANAGEMENT MODAL */}
      {isRatingModalOpen && courtToRate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRatingModalOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-['Cabinet_Grotesk'] leading-none">
                    Rate Court
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[220px] mt-0.5">
                    {courtToRate.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
              {/* 1 to 5 Star Interactive Rating */}
              <div className="text-center p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Select Rating (1 to 5 Stars)
                </label>

                {/* Stars Interactive Row */}
                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isFilled =
                      (hoverRating !== null ? hoverRating : ratingScore) >= starValue;

                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRatingScore(starValue)}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-slate-600 hover:scale-125 transition-transform active:scale-95 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic Rating Label */}
                <p className="text-[11px] font-bold text-amber-300 font-mono mt-2">
                  {RATING_DESCRIPTIONS[hoverRating !== null ? hoverRating : ratingScore]}
                </p>
              </div>

              {/* Aspect Tags Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Highlighted Aspects:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {REVIEW_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment & Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Your Comment & Review (Court, lighting, or staff management)
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share details about the court surface, evening night lighting, net tension, or facility staff hospitality..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  required
                />
              </div>

              {/* User Signature Pill */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Posting as: <strong className="text-white">{user?.full_name}</strong></span>
              </div>

              {/* Submit Controls */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !commentText.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STRIPE BOOKING MODAL */}
      {isBookingModalOpen && selectedCourt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>

            {!confirmedBooking ? (
              <div>
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    <CreditCard className="w-4 h-4" />
                    Stripe Direct Court Checkout
                  </div>
                  <h2 className="text-lg font-bold text-white">{selectedCourt.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCourt.address}</p>
                </div>

                {/* Court Number Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Specific Court Number
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: selectedCourt.total_courts }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedCourtNum(i + 1)}
                        className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                          selectedCourtNum === i + 1
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        Court #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setDurationHours(hours)}
                        className={`h-10 rounded-xl border text-xs font-bold transition-all ${
                          durationHours === hours
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {hours} {hours === 1 ? 'Hour' : 'Hours'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Picker */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Available Daytime & Night Lighting Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`h-9 px-2 rounded-xl border text-[11px] font-mono font-medium transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total and Stripe Pay Button */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Base Hourly Rate:</span>
                    <span>₱{selectedCourt.hourly_rate} / hr</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Court #{selectedCourtNum} Duration:</span>
                    <span>{durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Total Stripe Charge:</span>
                    <span className="text-lg font-black text-emerald-400 font-['JetBrains_Mono']">
                      ₱{selectedCourt.hourly_rate * durationHours}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmStripePayment}
                  disabled={isProcessingPayment}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessingPayment
                      ? 'Authorizing Stripe Payment...'
                      : `Authorize ₱${selectedCourt.hourly_rate * durationHours} via Stripe`}
                  </span>
                </button>
              </div>
            ) : (
              /* Success Confirmation */
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-white mb-1">Court Reservation Confirmed</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Payment verified via Stripe. Turnstile & lighting pass issued.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 mb-5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Venue:</span>
                    <span className="font-bold text-white">{selectedCourt.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Court:</span>
                    <span className="font-bold text-emerald-400">Court #{confirmedBooking.court_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time Slot:</span>
                    <span className="font-mono text-white">{selectedTimeSlot} ({durationHours} hrs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stripe Payment ID:</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {confirmedBooking.stripe_payment_intent_id || 'pi_live_authorized'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close & View Court Pass
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
