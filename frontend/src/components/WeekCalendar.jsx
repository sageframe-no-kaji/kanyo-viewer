import { useState, useEffect } from 'react';
import { getDateInTimezone } from '../utils/timezone';

export default function WeekCalendar({ streamTimezone, selectedDate, onDateChange }) {
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    generateWeekDates();
  }, [selectedDate, streamTimezone]);

  function generateWeekDates() {
    if (!streamTimezone || !selectedDate) return;

    const dates = [];
    const selected = new Date(selectedDate + 'T12:00:00');

    // Generate 7 days centered on selected date
    for (let i = -3; i <= 3; i++) {
      const date = new Date(selected);
      date.setDate(date.getDate() + i);
      dates.push({
        date: getDateInTimezone(date, streamTimezone),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: streamTimezone }),
        dayOfMonth: date.getDate()
      });
    }

    setWeekDates(dates);
  }

  const today = getDateInTimezone(new Date(), streamTimezone);

  return (
    <div className="bg-kanyo-card rounded-lg p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((item) => {
          const isSelected = item.date === selectedDate;
          const isToday = item.date === today;

          return (
            <button
              key={item.date}
              onClick={() => onDateChange(item.date)}
              className={`
                py-3 px-2 rounded-lg text-center transition-all
                ${isSelected
                  ? 'bg-kanyo-orange text-white font-semibold'
                  : isToday
                    ? 'bg-kanyo-gray-500 text-kanyo-orange font-semibold hover:bg-kanyo-gray-400'
                    : 'bg-kanyo-gray-600 text-kanyo-gray-100 hover:bg-kanyo-gray-500'
                }
              `}
            >
              <div className="text-xs uppercase">{item.dayOfWeek}</div>
              <div className="text-lg mt-1">{item.dayOfMonth}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
