import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { cn } from '../lib/utils';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  className?: string;
}

export default function Calendar({ selectedDate, onSelectDate, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn("w-full max-w-[350px] mx-auto", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-lg text-text-primary">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={prevMonth}
            disabled={isBefore(currentMonth, startOfMonth(new Date()))}
            className="p-1 hover:bg-surface-hover rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-surface-hover rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-text-secondary py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDateToday = isToday(day);
          const isDisabled = isBefore(day, startOfDay(new Date()));

          return (
            <button
              key={day.toString()}
              onClick={() => !isDisabled && onSelectDate(day)}
              disabled={isDisabled}
              className={cn(
                "h-10 w-10 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all relative",
                !isCurrentMonth && "text-text-tertiary opacity-50",
                isCurrentMonth && "text-text-primary hover:bg-primary/10 hover:text-primary",
                isSelected && "bg-primary text-white hover:bg-primary hover:text-white",
                isDateToday && !isSelected && "text-primary font-bold after:content-[''] after:absolute after:bottom-1 after:w-1 after:h-1 after:bg-primary after:rounded-full",
                isDisabled && "opacity-25 hover:bg-transparent hover:text-text-tertiary cursor-not-allowed"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
