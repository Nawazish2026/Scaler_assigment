import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

interface DayAvailability {
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
}

interface AvailabilityData {
  timeZone: string;
  days: DayAvailability[];
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const DEFAULT_START = '09:00';
const DEFAULT_END = '17:00';

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [timeZone, setTimeZone] = useState('UTC');
  const [schedule, setSchedule] = useState<{ [key: number]: { enabled: boolean, start: string, end: string } }>({});

  const MOCK_USER_ID = 'demo-user-id';

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await api.get(`/availability?userId=${MOCK_USER_ID}`);
      const data: AvailabilityData | null = response.data;

      // Initialize schedule state
      const initialSchedule: any = {};
      DAYS_OF_WEEK.forEach((_, index) => {
        initialSchedule[index] = { enabled: false, start: DEFAULT_START, end: DEFAULT_END };
      });

      if (data) {
        setTimeZone(data.timeZone);
        data.days.forEach(day => {
          initialSchedule[day.dayOfWeek] = {
            enabled: true,
            start: day.startTime,
            end: day.endTime
          };
        });
      } else {
        // Default: Mon-Fri 9-5
        [1, 2, 3, 4, 5].forEach(day => {
          initialSchedule[day].enabled = true;
        });
        // Try to guess browser timezone
        setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      }

      setSchedule(initialSchedule);
    } catch (error) {
      console.error('Failed to load availability', error);
      setStatus({ type: 'error', message: 'Failed to load settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);

    const daysPayload: DayAvailability[] = [];
    Object.entries(schedule).forEach(([dayStr, config]) => {
      if (config.enabled) {
        daysPayload.push({
          dayOfWeek: parseInt(dayStr),
          startTime: config.start,
          endTime: config.end
        });
      }
    });

    try {
      await api.put('/availability', {
        userId: MOCK_USER_ID,
        timeZone,
        days: daysPayload
      });
      setStatus({ type: 'success', message: 'Availability saved successfully.' });
    } catch (error) {
      console.error('Failed to save', error);
      setStatus({ type: 'error', message: 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], enabled: !prev[dayIndex].enabled }
    }));
  };

  const updateTime = (dayIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [dayIndex]: { ...prev[dayIndex], [field]: value }
    }));
  };

  if (loading) {
    return <div className="text-center py-12 text-text-secondary">Loading availability...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">Availability</h2>
        <p className="text-text-secondary">Configure your weekly hours and timezone.</p>
      </div>

      {status && (
        <div className={`p-4 rounded-lg flex items-center ${status.type === 'success' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
          {status.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
          {status.message}
        </div>
      )}

      {/* Timezone Section */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">Time Zone</label>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-secondary/50 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {Intl.supportedValuesOf('timeZone').map(tz => (
            <option key={tz} value={tz}>{tz}</option>
          ))}
        </select>
      </div>

      {/* Schedule Section */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg">Weekly Hours</h3>
        </div>

        <div className="divide-y divide-border">
          {DAYS_OF_WEEK.map((dayName, index) => {
            const config = schedule[index];
            return (
              <div key={dayName} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-secondary/20 transition-colors">
                <div className="flex items-center mb-2 sm:mb-0 w-32">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => toggleDay(index)}
                    className="w-5 h-5 rounded border-gray-600 bg-secondary text-primary focus:ring-primary/50 mr-3"
                  />
                  <span className={`font-medium ${config.enabled ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {dayName}
                  </span>
                </div>

                <div className="flex-1 flex items-center sm:justify-end space-x-2">
                  {config.enabled ? (
                    <>
                      <input
                        type="time"
                        value={config.start}
                        onChange={(e) => updateTime(index, 'start', e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-text-secondary">-</span>
                      <input
                        type="time"
                        value={config.end}
                        onChange={(e) => updateTime(index, 'end', e.target.value)}
                        className="px-3 py-1.5 bg-background border border-border rounded text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </>
                  ) : (
                    <span className="text-sm text-text-disabled italic pl-2">Unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
