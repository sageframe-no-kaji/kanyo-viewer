import { useState, useEffect } from 'react';
import { getDateInTimezone } from '../utils/timezone';
import { api } from '../utils/api';

export default function WeekCalendar({ streamId, streamTimezone, selectedDate, onDateChange }) {
  const [weekDates, setWeekDates] = useState([]);
  const [datesWithEvents, setDatesWithEvents] = useState(new Set());
  const [weekStartDate, setWeekStartDate] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      const selected = new Date(selectedDate + 'T12:00:00');
      // Calculate week start (3 days before selected)
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
    <div className="bg-kanyo-card rounded-lg p-4">
      <div className="flex items-center gap-2">
        {/* Previous week button */}
        <button
          onClick={() => navigateWeek(-1)}
          className="p-2 rounded-lg bg-kanyo-gray-600 text-white hover:bg-kanyo-gray-500 transition-all"
          title="Previous week"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

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
                  py-3 px-2 rounded-lg text-center transition-all
                  ${isSelected
                    ? 'bg-kanyo-orange text-white font-semibold'
                    : isToday
                      ? 'bg-kanyo-gray-500 text-white font-semibold hover:bg-kanyo-gray-400'
                      : hasEvents
                        ? 'bg-kanyo-gray-600 text-kanyo-orange hover:bg-kanyo-gray-500'
                        : 'bg-kanyo-gray-600 text-kanyo-gray-100 hover:bg-kanyo-gray-500'
                  }
                `}
              >
                <div className="text-xs uppercase opacity-70">{item.dayOfWeek}</div>
                <div className="text-lg mt-1">{item.dayOfMonth}</div>
                {hasEvents && !isSelected && (
                  <div className="w-1 h-1 bg-kanyo-orange rounded-full mx-auto mt-1"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Next week button */}
        <button
          onClick={() => navigateWeek(1)}
          className="p-2 rounded-lg bg-kanyo-gray-600 text-white hover:bg-kanyo-gray-500 transition-all"
          title="Next week"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
