import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, Edit2, Trash2, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import EventTypeModal from '../components/EventTypeModal';

interface EventType {
  id: string;
  name: string;
  durationMinutes: number;
  slug: string;
  userId?: string;
}

export default function Dashboard() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Auto-open modal if ?create=true is in URL (from sidebar Create button)
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setEditingEvent(null);
      setIsModalOpen(true);
      // Clear the URL parameter
      navigate('/event-types', { replace: true });
    }
  }, [searchParams, navigate]);

  // No mock user ID needed - backend handles default user assignment

  const fetchEventTypes = async () => {
    try {
      const response = await api.get('/event-types');
      setEventTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch event types', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  const handleCreate = async (data: any) => {
    await api.post('/event-types', data); // Backend now auto-assigns userId
    await fetchEventTypes();
  };

  const handleUpdate = async (data: any) => {
    if (!editingEvent) return;
    await api.put(`/event-types/${editingEvent.id}`, data);
    await fetchEventTypes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;
    try {
      await api.delete(`/event-types/${id}`);
      setEventTypes(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete event type');
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventType) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Event Types</h2>
          <p className="text-text-secondary">Create and manage your meeting types.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/20"
        >
          + New Event Type
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-text-secondary">Loading...</div>
      ) : eventTypes.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
          <h3 className="text-lg font-medium text-text-primary mb-2">No event types yet</h3>
          <p className="text-text-secondary mb-6">Create your first event type to get started.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Create Event Type
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((event) => (
            <div key={event.id} className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group relative overflow-hidden">
              {/* Top color bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-text-primary">{event.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => openEditModal(event)} className="p-1.5 text-text-secondary hover:text-white hover:bg-secondary rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(event.id)} className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-secondary rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-sm text-text-secondary mb-6">
                <Clock className="w-4 h-4 mr-2" />
                <span>{event.durationMinutes} mins, One-on-One</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <Link
                  to={`/book/${event.slug}`}
                  target="_blank"
                  className="text-primary text-sm font-medium hover:underline flex items-center"
                >
                  View booking page
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/book/${event.slug}`)}
                  className="text-xs text-text-secondary hover:text-white transition-colors"
                >
                  Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EventTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={editingEvent ? handleUpdate : handleCreate}
        initialData={editingEvent}
      />
    </div>
  );
}
