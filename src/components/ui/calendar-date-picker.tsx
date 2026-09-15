import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarDatePickerProps {
  value?: Date | DateRange | null;
  onChange?: (val: any) => void;
  isRange?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarDatePicker: React.FC<CalendarDatePickerProps> = ({
  value,
  onChange,
  isRange = false,
  label,
  placeholder = 'Selecione uma data...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Current calendar view month/year
  const today = new Date();
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Internal selection state
  const [singleDate, setSingleDate] = useState<Date | null>(
    value instanceof Date ? value : !isRange ? new Date() : null
  );
  const [rangeDate, setRangeDate] = useState<DateRange>(
    value && 'start' in (value as any)
      ? (value as DateRange)
      : { start: new Date(), end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!isRange) {
      setSingleDate(selected);
      if (onChange) onChange(selected);
      setIsOpen(false);
    } else {
      if (!rangeDate.start || (rangeDate.start && rangeDate.end)) {
        // Start new range
        const nextRange = { start: selected, end: null };
        setRangeDate(nextRange);
        if (onChange) onChange(nextRange);
      } else if (rangeDate.start && !rangeDate.end) {
        let start = rangeDate.start;
        let end = selected;
        if (selected < start) {
          end = start;
          start = selected;
        }
        const nextRange = { start, end };
        setRangeDate(nextRange);
        if (onChange) onChange(nextRange);
        setIsOpen(false);
      }
    }
  };

  const isSelected = (day: number) => {
    const target = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    if (!isRange) {
      return singleDate && target.toDateString() === singleDate.toDateString();
    }
    if (rangeDate.start && target.toDateString() === rangeDate.start.toDateString()) return true;
    if (rangeDate.end && target.toDateString() === rangeDate.end.toDateString()) return true;
    return false;
  };

  const isInRange = (day: number) => {
    if (!isRange || !rangeDate.start || !rangeDate.end) return false;
    const target = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).getTime();
    const start = new Date(rangeDate.start.getFullYear(), rangeDate.start.getMonth(), rangeDate.start.getDate()).getTime();
    const end = new Date(rangeDate.end.getFullYear(), rangeDate.end.getMonth(), rangeDate.end.getDate()).getTime();
    return target > start && target < end;
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const totalDays = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const displayString = isRange
    ? rangeDate.start
      ? `${formatDate(rangeDate.start)} ${rangeDate.end ? `— ${formatDate(rangeDate.end)}` : '(Selecione o fim)'}`
      : placeholder
    : singleDate
    ? formatDate(singleDate)
    : placeholder;

  return (
    <div ref={containerRef} className={`relative flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#EEDC9A]" />
          <span>{label}</span>
        </label>
      )}

      {/* Input Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-900/80 border border-white/10 hover:border-white/20 text-neutral-200 text-xs sm:text-sm font-medium transition-all shadow-inner focus:outline-none focus:border-[#EEDC9A]/60"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <span className="truncate">{displayString}</span>
        </div>
        <CalendarIcon className="w-4 h-4 text-[#EEDC9A] flex-shrink-0 ml-2" />
      </button>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-[300px] sm:w-[320px] p-4 rounded-2xl bg-[#0c0c0e] border border-white/15 shadow-2xl backdrop-blur-2xl text-white"
          >
            {/* Header with Month / Year Navigation */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-[#EEDC9A] font-syne">
                {MONTH_NAMES[month]} {year}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {WEEK_DAYS.map((wd) => (
                <span key={wd} className="text-[11px] font-semibold text-neutral-500 uppercase">
                  {wd}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {Array.from({ length: totalDays }).map((_, i) => {
                const day = i + 1;
                const sel = isSelected(day);
                const inRange = isInRange(day);
                const tod = isToday(day);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all relative ${
                      sel
                        ? 'bg-[#EEDC9A] text-black font-bold shadow-lg shadow-[#EEDC9A]/20 scale-105 z-10'
                        : inRange
                        ? 'bg-[#EEDC9A]/20 text-[#EEDC9A] rounded-none'
                        : tod
                        ? 'border border-[#EEDC9A]/50 text-[#EEDC9A] hover:bg-white/10'
                        : 'text-neutral-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Quick action bar */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  if (!isRange) {
                    setSingleDate(now);
                    if (onChange) onChange(now);
                  } else {
                    const r = { start: now, end: new Date(now.getTime() + 7 * 86400000) };
                    setRangeDate(r);
                    if (onChange) onChange(r);
                  }
                  setIsOpen(false);
                }}
                className="text-[#EEDC9A] hover:underline font-semibold"
              >
                Definir Hoje
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarDatePicker;
