import { useState, useEffect } from 'react';
import { getDateInTimezone } from '../utils/timezone';
import { api } from '../utils/api';

export default function WeekCalendar({ streamId, streamTimezone, selectedDate, onDateChange }) {
  const [weekDates, setWeekDates] = useState([]);
  const [datesWithEvents, setDatesWithEvents] = useState(new Set());
  const [weekStartDate, setWeekStartDate] = useState(null);

  useEffect(() => {
    if (selectedDate && !weekStartDate) {
      // Only set initial week start, don't recenter on date change
      const selected = new Date(selectedDate + 'T12:00:00');
      const weekStart = new Date(selected);
      weekStart.setDate(weekStart.getDate() - 3);
      setWeekStartDate(weekStart);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (weekStartDate && streamTimezone) {
      generateWeekDates();
      loadDatesWithEvents();
    }
  }, [weekStartDate, streamTimezone]);

  function generateWeekDates() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      dates.push({
        date: getDateInTimezone(date, streamTimezone),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: streamTimezone }),
        dayOfMonth: date.getDate()
      });
    }
    setWeekDates(dates);
  }

  async function loadDatesWithEvents() {
    try {
      const startDate = getDateInTimezone(weekStartDate, streamTimezone);
      const endDate = getDateInTimezone(
        new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000),
        streamTimezone
      );

      const response = await api.getDatesWithEvents(streamId, startDate, endDate);
      setDatesWithEvents(new Set(response.dates || []));
    } catch (error) {
      console.error('Error loading dates with events:', error);
    }
  }

  function navigateWeek(direction) {
    const newStart = new Date(weekStartDate);
    newStart.setDate(newStart.getDate() + (direction * 7));
    setWeekStartDate(newStart);

    // Auto-select middle date of new week
    const middleDate = new Date(newStart);
    middleDate.setDate(middleDate.getDate() + 3);
    onDateChange(getDateInTimezone(middleDate, streamTimezone));
  }

  const today = getDateInTimezone(new Date(), streamTimezone);

  return (
    <div className="bg-kanyo-card rounded-lg p-2">
      <div className="flex items-center gap-2">
        {/* Previous week button with month abbreviation */}
        <div className="relative pt-3">
          {/* Month abbreviation above arrow */}
          <div className="absolute -top-2 left-0 right-0 text-center text-[11px] font-semibold text-kanyo-text">
            {(() => {
              const date = new Date(selectedDate + 'T00:00:00');
              return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            })()}
          </div>
          <button
            onClick={() => navigateWeek(-1)}
            className="p-1.5 rounded-lg bg-kanyo-button-bg text-kanyo-text hover:bg-kanyo-button-hover transition-all border border-kanyo-gray-500"
            title="Previous week"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Week days */}
        <div className="flex-1 grid grid-cols-7 gap-2">
          {weekDates.map((item) => {
            const isSelected = item.date === selectedDate;
            const isToday = item.date === today;
            const hasEvents = datesWithEvents.has(item.date);

            return (
              <button
                key={item.date}
                onClick={() => onDateChange(item.date)}
                className={`
                  py-1 px-1.5 rounded-lg text-center transition-all
                  ${isSelected
                    ? 'bg-kanyo-orange text-white font-semibold'
                    : isToday
                      ? 'bg-kanyo-button-bg text-kanyo-text font-semibold hover:bg-kanyo-button-hover border border-kanyo-gray-500'
                      : hasEvents
                        ? 'bg-kanyo-button-bg text-kanyo-orange hover:bg-kanyo-button-hover border border-kanyo-gray-500'
                        : 'bg-kanyo-button-bg text-kanyo-gray-100 hover:bg-kanyo-button-hover border border-kanyo-gray-500'
                  }
                `}
              >
                <div className="text-[10px] uppercase opacity-70">{item.dayOfWeek}</div>
                <div className="text-sm mt-0.5">{item.dayOfMonth}</div>
                <div className={`w-1 h-1 rounded-full mx-auto mt-0.5 ${
                  hasEvents && !isSelected ? 'bg-kanyo-orange' : 'bg-transparent'
                }`}></div>
              </button>
            );
          })}
        </div>

        {/* Next week button with year */}
        <div className="relative pt-3">
          {/* Year above arrow */}
          <div className="absolute -top-2 left-0 right-0 text-center text-[11px] font-semibold text-kanyo-text">
            {(() => {
              const date = new Date(selectedDate + 'T00:00:00');
              return date.getFullYear();
            })()}
          </div>
          <button
            onClick={() => navigateWeek(1)}
            className="p-1.5 rounded-lg bg-kanyo-button-bg text-kanyo-text hover:bg-kanyo-button-hover transition-all border border-kanyo-gray-500"
            title="Next week"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
