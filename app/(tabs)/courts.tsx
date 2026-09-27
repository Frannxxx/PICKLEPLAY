import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { api } from '../../services/api.ts';
import { Court, Booking } from '../../src/types.ts';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  X,
  Lock,
  DollarSign,
} from 'lucide-react';

export default function CourtsScreen() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [durationHours, setDurationHours] = useState(1);
  const [selectedCourtNum, setSelectedCourtNum] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('06:00 PM');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

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
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow">
                <MapPin className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black text-white tracking-tight font-['Cabinet_Grotesk']">
                COURT RESERVATIONS
              </h1>
            </div>
            <span className="text-xs text-emerald-300 font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow">
              Tagum City, PH
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            Championship verified venues in Tagum City, Davao del Norte with official DUPR cameras, Stripe checkout, and night lighting.
          </p>
        </div>
      </div>

      {/* Courts List */}
      <div className="space-y-4">
        {courts.map((court) => (
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
              <h3 className="text-base font-bold text-white mb-1">{court.name}</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{court.address}</span>
              </p>

              {/* Amenities */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {court.amenities.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/60"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenBooking(court)}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Reserve Court & Pay with Stripe</span>
              </button>
            </div>
          </div>
        ))}
      </div>

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
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedCourtNum === i + 1
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        Court #{i + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Reservation Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTimeSlot(time)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                          selectedTimeSlot === time
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Session Duration
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setDurationHours(hrs)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          durationHours === hrs
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {hrs} Hour{hrs > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>
                      Court Fee (₱{selectedCourt.hourly_rate} × {durationHours} hr)
                    </span>
                    <span className="font-mono text-white">
                      ₱{(selectedCourt.hourly_rate * durationHours).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Facility Maintenance & Lights</span>
                    <span className="font-mono text-emerald-400">INCLUDED</span>
                  </div>
                  <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-sm text-white">
                    <span>Total Stripe Checkout</span>
                    <span className="font-mono text-emerald-400">
                      ₱{(selectedCourt.hourly_rate * durationHours).toFixed(2)} PHP
                    </span>
                  </div>
                </div>

                {/* Stripe Simulator Input preview */}
                <div className="mb-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      Stripe Encrypted Payment Sheet
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">LIVE READY</span>
                  </div>
                  <div className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300 text-xs font-mono">
                    <span>•••• •••• •••• 4242</span>
                    <span className="text-slate-500">12/28 · CVC</span>
                  </div>
                </div>

                {/* Submit Payment CTA */}
                <button
                  onClick={handleConfirmStripePayment}
                  disabled={isProcessingPayment}
                  className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <span>Processing Stripe Transaction...</span>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>
                        Authorize & Pay ₱{(selectedCourt.hourly_rate * durationHours).toFixed(2)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* SUCCESS STATE */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Court Pass Confirmed!</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Your reservation is verified and synced with court access gates.
                </p>

                {/* Digital Ticket Pass */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Facility:</span>
                    <span className="font-bold text-white">{selectedCourt.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Assigned:</span>
                    <span className="font-bold text-emerald-400">Court #{selectedCourtNum}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="font-mono text-white">
                      Today, {selectedTimeSlot} ({durationHours}h)
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Stripe Payment:</span>
                    <span className="font-mono text-slate-300">
                      {confirmedBooking.stripe_payment_intent_id}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Close Pass & View Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
