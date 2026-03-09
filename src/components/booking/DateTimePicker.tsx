'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sun, Moon, Sunset, Coffee, Loader2, XCircle } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { timeSlots } from '@/data/packages';
import { cn } from '@/lib/utils';
import { DayAvailability } from '@/lib/db/types';

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedSlot: string | null;
  onDateSelect: (date: Date) => void;
  onSlotSelect: (slot: string) => void;
}

export default function DateTimePicker({
  selectedDate,
  selectedSlot,
  onDateSelect,
  onSlotSelect,
}: DateTimePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [dayAvailability, setDayAvailability] = useState<DayAvailability | null>(null);
  const [loadingDaySlots, setLoadingDaySlots] = useState(false);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();
  const today = startOfDay(new Date());

  const slotIcons = {
    morning: Coffee,
    afternoon: Sun,
    evening: Sunset,
    night: Moon,
  };

  // Fetch availability for current month
  useEffect(() => {
    const fetchMonthAvailability = async () => {
      setLoadingAvailability(true);
      try {
        const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

        const response = await fetch(
          `/api/availability?startDate=${startDate}&endDate=${endDate}`
        );
        const data = await response.json();

        if (data.success) {
          setAvailability(data.availability || {});
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchMonthAvailability();
  }, [currentMonth]);

  // Fetch availability for selected date
  useEffect(() => {
    if (!selectedDate) {
      setDayAvailability(null);
      return;
    }

    const fetchDayAvailability = async () => {
      setLoadingDaySlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const response = await fetch(`/api/availability?date=${dateStr}`);
        const data = await response.json();

        if (data.success) {
          setDayAvailability(data.availability);
        }
      } catch (error) {
        console.error('Failed to fetch day availability:', error);
        // Default to all available if API fails
        setDayAvailability({
          date: format(selectedDate, 'yyyy-MM-dd'),
          slots: { morning: true, afternoon: true, evening: true, night: true },
        });
      } finally {
        setLoadingDaySlots(false);
      }
    };

    fetchDayAvailability();
  }, [selectedDate]);

  // Check if a date has any available slots
  const hasAvailableSlots = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvail = availability[dateStr];

    // If no data, assume available
    if (!dayAvail) return true;

    // Check if at least one slot is available
    return Object.values(dayAvail.slots).some((available) => available);
  };

  // Check if all slots are booked for a date
  const isFullyBooked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAvail = availability[dateStr];

    if (!dayAvail) return false;

    return !Object.values(dayAvail.slots).some((available) => available);
  };

  // Get slot availability for selected date
  const isSlotAvailable = (slotId: string): boolean => {
    if (!dayAvailability) return true;
    return dayAvailability.slots[slotId as keyof typeof dayAvailability.slots] ?? true;
  };

  return (
    <div className="space-y-8">
      {/* Calendar */}
      <div className="bg-terminal-dark border border-terminal-gray rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-green transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="text-white font-mono font-bold text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            {loadingAvailability && (
              <span className="text-terminal-muted text-xs font-mono flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading availability...
              </span>
            )}
          </div>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-terminal-gray/50 text-terminal-green transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-terminal-muted text-xs font-mono py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for alignment */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const isPast = isBefore(day, today);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            const fullyBooked = isFullyBooked(day);
            const isDisabled = isPast || fullyBooked;

            return (
              <motion.button
                key={day.toISOString()}
                whileHover={!isDisabled ? { scale: 1.1 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                onClick={() => !isDisabled && onDateSelect(day)}
                disabled={isDisabled}
                className={cn(
                  'aspect-square rounded-lg font-mono text-sm transition-all duration-200 relative',
                  isPast && 'text-terminal-muted/30 cursor-not-allowed',
                  fullyBooked && !isPast && 'text-terminal-red/50 cursor-not-allowed line-through',
                  !isDisabled && !isSelected && 'text-white hover:bg-terminal-gray/50',
                  isSelected && 'bg-terminal-green text-terminal-black font-bold',
                  isCurrentDay && !isSelected && 'ring-1 ring-terminal-green',
                  isWeekend && !isDisabled && !isSelected && 'text-terminal-blue'
                )}
              >
                {format(day, 'd')}
                {isWeekend && !isDisabled && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-terminal-blue" />
                )}
                {fullyBooked && !isPast && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-terminal-red" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-terminal-gray flex-wrap">
          <div className="flex items-center gap-2 text-xs font-mono text-terminal-muted">
            <div className="w-3 h-3 rounded-full bg-terminal-blue" />
            <span>Weekend (higher rate)</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-terminal-muted">
            <div className="w-3 h-3 rounded-full bg-terminal-red" />
            <span>Fully booked</span>
          </div>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-terminal-dark border border-terminal-gray rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-terminal-green font-mono font-bold">
              {'>'} Select time slot for {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            {loadingDaySlots && (
              <Loader2 className="w-4 h-4 text-terminal-green animate-spin" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timeSlots.map((slot) => {
              const Icon = slotIcons[slot.id as keyof typeof slotIcons];
              const isSelected = selectedSlot === slot.id;
              const available = isSlotAvailable(slot.id);

              return (
                <motion.button
                  key={slot.id}
                  whileHover={available ? { scale: 1.02 } : {}}
                  whileTap={available ? { scale: 0.98 } : {}}
                  onClick={() => available && onSlotSelect(slot.id)}
                  disabled={!available}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg border transition-all duration-200',
                    !available && 'opacity-50 cursor-not-allowed',
                    isSelected && available
                      ? 'border-terminal-green bg-terminal-green/10'
                      : 'border-terminal-gray hover:border-terminal-green/50',
                    !available && 'border-terminal-red/30 bg-terminal-red/5'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    isSelected && available ? 'bg-terminal-green text-terminal-black' : 'bg-terminal-gray/50 text-terminal-green',
                    !available && 'bg-terminal-red/20 text-terminal-red'
                  )}>
                    {available ? (
                      <Icon className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className={cn(
                      'font-mono font-bold',
                      isSelected && available ? 'text-terminal-green' : 'text-white',
                      !available && 'text-terminal-red'
                    )}>
                      {slot.label}
                    </p>
                    <p className="text-terminal-muted text-sm font-mono">{slot.time}</p>
                    {!available ? (
                      <span className="text-terminal-red text-xs font-mono">Already booked</span>
                    ) : slot.type === 'peak' ? (
                      <span className="text-terminal-yellow text-xs font-mono">Peak hours</span>
                    ) : null}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
