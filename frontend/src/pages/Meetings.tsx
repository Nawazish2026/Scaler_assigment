import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, Mail, Video, XCircle } from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface Meeting {
  id: string;
  startDateTime: string;
  endDateTime: string;
  status: 'BOOKED' | 'CANCELLED';
  inviteeName: string;
  inviteeEmail: string;
  eventType: {
    name: string;
    durationMinutes: number;
    slug: string;
  };
}

export default function Meetings() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/meetings?type=${activeTab}`);
      setMeetings(response.data);
    } catch (error) {
      console.error('Failed to fetch meetings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [activeTab]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    setCancellingId(id);
    try {
      await api.patch(`/meetings/${id}/cancel`);
      // Optimistic update or refetch
      setMeetings(meetings.map(m =>
        m.id === id ? { ...m, status: 'CANCELLED' } : m
      ));
    } catch (error) {
      console.error('Failed to cancel meeting', error);
      alert('Failed to cancel meeting');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'CANCELLED'
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Scheduled Events</h2>
        <p className="text-text-secondary">View upcoming and past meetings.</p>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'upcoming'
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === 'past'
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            Past
          </button>
        </nav>
      </div>

      <div>
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-surface animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-text-secondary bg-surface rounded-xl border border-border border-dashed">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No {activeTab} meetings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-surface border border-border rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-start justify-between md:justify-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-lg text-text-primary">{format(new Date(meeting.startDateTime), 'MMMM d, yyyy')}</span>
                        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium", getStatusColor(meeting.status))}>
                          {meeting.status}
                        </span>
                      </div>
                      <div className="flex items-center text-text-secondary text-sm space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5" />
                          {format(new Date(meeting.startDateTime), 'h:mm a')} - {format(new Date(meeting.endDateTime), 'h:mm a')}
                        </div>
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-1.5" />
                          Google Meet
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:pl-16 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center text-sm text-text-secondary">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium text-text-primary mr-2">{meeting.inviteeName}</span>
                    </div>
                    <div className="flex items-center text-sm text-text-secondary">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{meeting.inviteeEmail}</span>
                    </div>
                  </div>
                </div>

                {meeting.status === 'BOOKED' && activeTab === 'upcoming' && (
                  <div className="flex items-center md:border-l border-border md:pl-6">
                    <button
                      onClick={() => handleCancel(meeting.id)}
                      disabled={cancellingId === meeting.id}
                      className="flex items-center text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {cancellingId === meeting.id ? (
                        'Cancelling...'
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
