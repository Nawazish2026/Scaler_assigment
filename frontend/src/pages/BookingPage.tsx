import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../lib/api';
import { cn } from '../lib/utils';
import Calendar from '../components/Calendar';
import TimeSlots from '../components/TimeSlots';

interface EventType {
  id: string;
  name: string;          // Backend returns 'name', not 'title'
  durationMinutes: number; // Backend returns 'durationMinutes', not 'duration'
  slug: string;
  user?: { name: string; email: string };
}

export default function BookingPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !slug) return;

    setBookingLoading(true);
    try {
      await api.post(`/booking/event/${slug}/book`, {
        name: bookingForm.name,
        email: bookingForm.email,
        startDateTime: selectedSlot,
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book meeting');
    } finally {
      setBookingLoading(false);
    }
  };


  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/booking/event/${slug}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!slug || !selectedDate) return;

      setSlotsLoading(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await api.get(`/booking/event/${slug}/slots?date=${formattedDate}`);
        setAvailableSlots(response.data);
      } catch (err) {
        console.error('Failed to fetch slots', err);
      } finally {
        setSlotsLoading(false);
      }
    }

    if (selectedDate) {
      fetchSlots();
      setSelectedSlot(null);
    }
  }, [slug, selectedDate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="bg-card/50 border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/event-types" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-text-primary">Scheduler</span>
          </Link>
          <Link
            to="/event-types"
            className="text-sm text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-73px)]">
        {loading ? (
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-surface-hover" />
            <div className="h-4 w-32 bg-surface-hover rounded" />
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">{error}</div>
        ) : event ? (
          <div className="max-w-5xl w-full bg-card/50 backdrop-blur-sm border border-border rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden lg:h-[700px] transition-all duration-500">
            {/* Left: Event Details */}
            <div className="p-8 lg:p-10 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border bg-card/30">
              <h4 className="text-text-secondary text-sm font-semibold uppercase tracking-wider mb-8">
                {event.user?.name || 'Host'}
              </h4>
              <h1 className="text-3xl font-bold text-text-primary mb-6 leading-tight">{event.name}</h1>

              <div className="space-y-5 text-text-secondary font-medium">
                <div className="flex items-center group">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mr-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <span className="text-lg">🕒</span>
                  </div>
                  <span>{event.durationMinutes} min</span>
                </div>
                <div className="flex items-center group">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mr-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <span className="text-lg">🎥</span>
                  </div>
                  <span>Google Meet</span>
                </div>
              </div>
            </div>

            {/* Right: Calendar/Form */}
            <div className="p-6 lg:p-10 lg:w-2/3 bg-background/50 overflow-y-auto relative">
              {bookingSuccess ? (
                <div className="flex flex-col items-center justify-center h-full text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-lg shadow-green-500/10 border border-green-500/20">
                    ✅
                  </div>
                  <h2 className="text-3xl font-bold text-text-primary mb-3">Booking Confirmed!</h2>
                  <p className="text-text-secondary mb-8 text-lg">
                    You are scheduled with <span className="text-text-primary font-semibold">{event.name}</span>.<br />
                    <span className="text-sm opacity-70">A calendar invitation has been sent to your email address.</span>
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-95"
                  >
                    Book Another Meeting
                  </button>
                </div>
              ) : selectedSlot ? (
                <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="mb-8 flex items-center text-primary hover:text-primary/80 transition-colors font-medium -ml-2 px-2 py-1 rounded-lg hover:bg-primary/5 w-fit"
                  >
                    <span className="mr-2 text-xl">←</span> Back to Calendar
                  </button>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Enter Details</h2>
                    <p className="text-text-secondary">Please provide your details using the form below.</p>
                  </div>

                  <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-3">
                    <div className="text-2xl">📅</div>
                    <div>
                      <div className="text-sm text-text-secondary font-medium uppercase tracking-wide mb-1">
                        {format(new Date(selectedSlot), 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="text-lg font-bold text-text-primary">
                        {format(new Date(selectedSlot), 'h:mm a')} - {format(new Date(new Date(selectedSlot).getTime() + event.durationMinutes * 60000), 'h:mm a')}
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleBookMeeting} className="space-y-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-secondary">Your Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-input rounded-xl bg-surface/50 text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={bookingForm.name}
                        onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-text-secondary">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 border border-input rounded-xl bg-surface/50 text-text-primary placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={bookingForm.email}
                        onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.99]"
                    >
                      {bookingLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Confirming...
                        </span>
                      ) : 'Schedule Event'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <h2 className="text-2xl font-bold mb-8 sticky top-0 bg-background/95 backdrop-blur py-2 z-10">Select a Date & Time</h2>
                  <div className="flex flex-col md:flex-row gap-12 flex-1">
                    <div className={cn("transition-all duration-500", selectedDate ? "md:w-1/2" : "w-full flex justify-center")}>
                      <Calendar
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        className={selectedDate ? "mx-0" : "mx-auto scale-110 origin-top"}
                      />
                    </div>
                    {selectedDate && (
                      <div className="md:w-1/2 border-l border-border pl-12 animate-in fade-in slide-in-from-right-8 duration-500 overflow-hidden">
                        <h3 className="font-semibold text-text-secondary mb-4 uppercase text-xs tracking-wider">
                          {format(selectedDate, 'EEEE, MMM d')}
                        </h3>
                        <TimeSlots
                          selectedDate={selectedDate}
                          slots={availableSlots}
                          loading={slotsLoading}
                          selectedSlot={selectedSlot}
                          onSelectSlot={setSelectedSlot}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-text-primary bg-card px-8 py-6 rounded-2xl border border-border shadow-xl">Event not found</div>
        )}
      </div>
    </div>
  );
}
