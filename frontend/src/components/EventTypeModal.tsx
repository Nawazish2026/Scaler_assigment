import { useState, useEffect } from 'react';
import { X, ChevronDown, Users, RotateCcw, UserPlus } from 'lucide-react';

interface EventType {
  id?: string;
  name: string;
  durationMinutes: number;
  slug?: string;
  userId?: string;
  eventCategory?: string;
}

interface EventTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventType) => Promise<void>;
  initialData?: EventType | null;
}

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hr', value: 60 },
];

const EVENT_CATEGORIES = [
  {
    id: 'one-on-one',
    name: 'One-on-one',
    description: '1 host → 1 invitee',
    detail: 'Good for coffee chats, 1:1 interviews, etc.',
    icon: Users,
  },
  {
    id: 'group',
    name: 'Group',
    description: '1 host → Multiple invitees',
    detail: 'Webinars, online classes, etc.',
    icon: UserPlus,
  },
  {
    id: 'round-robin',
    name: 'Round robin',
    description: 'Rotating hosts → 1 invitee',
    detail: 'Distribute meetings between team members',
    icon: RotateCcw,
  },
];

export default function EventTypeModal({ isOpen, onClose, onSubmit, initialData }: EventTypeModalProps) {
  const [step, setStep] = useState<'category' | 'details'>('category');
  const [formData, setFormData] = useState<EventType>({
    name: '',
    durationMinutes: 30,
    slug: '',
    eventCategory: 'one-on-one',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customDuration, setCustomDuration] = useState('');
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
        setStep('details'); // Skip category selection when editing
        // Check if duration is a custom value
        const isPreset = DURATION_OPTIONS.some(opt => opt.value === initialData.durationMinutes);
        if (!isPreset) {
          setShowCustomDuration(true);
          setCustomDuration(String(initialData.durationMinutes));
        }
      } else {
        setFormData({ name: '', durationMinutes: 30, slug: '', eventCategory: 'one-on-one' });
        setStep('category');
        setShowCustomDuration(false);
        setCustomDuration('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = { ...formData };
      if (showCustomDuration && customDuration) {
        submitData.durationMinutes = parseInt(customDuration) || 30;
      }
      await onSubmit(submitData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save event type');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (categoryId: string) => {
    setFormData({ ...formData, eventCategory: categoryId });
    setStep('details');
  };

  const handleDurationSelect = (value: number | 'custom') => {
    if (value === 'custom') {
      setShowCustomDuration(true);
      setDurationDropdownOpen(false);
    } else {
      setFormData({ ...formData, durationMinutes: value });
      setShowCustomDuration(false);
      setCustomDuration('');
      setDurationDropdownOpen(false);
    }
  };

  const getCurrentDurationLabel = () => {
    if (showCustomDuration && customDuration) {
      return `${customDuration} min`;
    }
    const found = DURATION_OPTIONS.find(opt => opt.value === formData.durationMinutes);
    return found ? found.label : `${formData.durationMinutes} min`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border bg-background/50">
          <h3 className="text-lg font-semibold text-text-primary">
            {initialData ? 'Edit Event Type' : step === 'category' ? 'Create New Event Type' : 'Event Details'}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'category' && !initialData ? (
          <div className="p-6">
            <p className="text-sm text-text-secondary mb-6">What kind of event is this?</p>
            <div className="space-y-3">
              {EVENT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => selectCategory(category.id)}
                  className={`w-full p-4 text-left border rounded-xl transition-all hover:border-primary/50 hover:bg-primary/5 ${formData.eventCategory === category.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <category.icon className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-primary">{category.name}</h4>
                      <p className="text-sm text-text-primary mt-0.5">{category.description}</p>
                      <p className="text-xs text-text-secondary mt-1">{category.detail}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            {/* Back to categories button (only for new events) */}
            {!initialData && (
              <button
                type="button"
                onClick={() => setStep('category')}
                className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
              >
                ← Change event type
              </button>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Event Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-600"
                placeholder="e.g. Quick Chat, Technical Interview"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Duration</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDurationDropdownOpen(!durationDropdownOpen)}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 flex items-center justify-between"
                >
                  <span>{getCurrentDurationLabel()}</span>
                  <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform ${durationDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {durationDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                    {DURATION_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleDurationSelect(option.value)}
                        className={`w-full px-4 py-3 text-left hover:bg-primary/10 flex items-center justify-between ${formData.durationMinutes === option.value && !showCustomDuration
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-primary'
                          }`}
                      >
                        <span>{option.label}</span>
                        {formData.durationMinutes === option.value && !showCustomDuration && (
                          <span className="text-primary">✓</span>
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleDurationSelect('custom')}
                      className={`w-full px-4 py-3 text-left hover:bg-primary/10 ${showCustomDuration ? 'bg-primary/10 text-primary' : 'text-text-primary'
                        }`}
                    >
                      Custom
                    </button>
                  </div>
                )}
              </div>

              {showCustomDuration && (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="w-24 px-4 py-2 bg-secondary/50 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="60"
                  />
                  <span className="text-text-secondary">minutes</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Booking Link (Slug)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-text-secondary/50">/book/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full pl-16 px-4 py-3 bg-secondary/50 border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-gray-600"
                  placeholder="my-meeting"
                />
              </div>
              <p className="text-xs text-text-secondary mt-2">Leave blank to auto-generate from name.</p>
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
