import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

interface TimeSlotsProps {
  selectedDate: Date;
  slots: string[];
  loading: boolean;
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export default function TimeSlots({ selectedDate: _selectedDate, slots, loading, selectedSlot, onSelectSlot }: TimeSlotsProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-text-secondary animate-pulse">Checking availability...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-surface/30 rounded-xl border border-border/50 border-dashed">
        <p className="text-text-primary font-medium mb-1">No slots available</p>
        <p className="text-sm text-text-secondary">Please try another date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pr-2 max-h-[480px] overflow-y-auto custom-scrollbar">
      <p className="text-sm font-medium text-text-secondary mb-4 uppercase tracking-wider sticky top-0 bg-background/95 backdrop-blur py-2 z-10 block md:hidden">
        Available Times
      </p>
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot;
        return (
          <button
            key={slot}
            onClick={() => onSelectSlot(slot)}
            className={cn(
              "w-full py-3 px-4 rounded-xl border font-medium text-base transition-all duration-200 flex items-center justify-center group relative overflow-hidden",
              isSelected
                ? "bg-text-primary text-background border-text-primary shadow-lg scale-[1.02]"
                : "bg-surface border-border text-primary hover:border-primary hover:bg-surface-hover active:scale-[0.98]"
            )}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            )}
            {format(new Date(slot), 'h:mm a')}
          </button>
        )
      })}
    </div>
  );
}
