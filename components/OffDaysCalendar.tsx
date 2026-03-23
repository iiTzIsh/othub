'use client';

import { useState, useEffect } from 'react';

interface OffDaysCalendarProps {
  onOffDaysChange: (offDays: Set<string>) => void;
  month: number;
  year: number;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function OffDaysCalendar({ onOffDaysChange, month, year }: OffDaysCalendarProps) {
  const [offDays, setOffDays] = useState<Set<string>>(new Set());
  const [displayMonth, setDisplayMonth] = useState(month);
  const [displayYear, setDisplayYear] = useState(year);

  useEffect(() => {
    const sundays = new Set<string>();
    const daysInMonth = displayMonth === 1 && displayYear % 4 === 0 ? 29 : DAYS_IN_MONTH[displayMonth];
    const firstDay = new Date(displayYear, displayMonth, 1).getDay();

    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = (firstDay + i - 1) % 7;
      if (dayOfWeek === 0) {
        sundays.add(String(i));
      }
    }

    setOffDays(sundays);
    onOffDaysChange(sundays);
  }, [displayMonth, displayYear]);

  const toggleOffDay = (day: string) => {
    const newOffDays = new Set(offDays);
    if (newOffDays.has(day)) {
      newOffDays.delete(day);
    } else {
      newOffDays.add(day);
    }
    setOffDays(newOffDays);
    onOffDaysChange(newOffDays);
  };

  const prevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const nextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const daysInMonth = displayMonth === 1 && displayYear % 4 === 0 ? 29 : DAYS_IN_MONTH[displayMonth];
  const firstDay = new Date(displayYear, displayMonth, 1).getDay();

  const days = [];
  const weeks = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <h2 style={{
        fontSize: '1.125rem',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>📅</span>
        Off Days
      </h2>

      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)'
      }}>
        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <button
            onClick={prevMonth}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#dbeafe',
              color: '#2563eb',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title="Previous month"
            onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
          >
            ←
          </button>
          <h3 style={{
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            flex: 1,
            fontSize: '1rem'
          }}>
            {MONTH_NAMES[displayMonth]} {displayYear}
          </h3>
          <button
            onClick={nextMonth}
            style={{
              padding: '0.5rem 0.75rem',
              background: '#dbeafe',
              color: '#2563eb',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title="Next month"
            onMouseEnter={(e) => e.currentTarget.style.background = '#bfdbfe'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#dbeafe'}
          >
            →
          </button>
        </div>

        {/* Weekday Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '0.25rem',
          marginBottom: '0.75rem'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              style={{
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#4b5563',
                fontSize: '0.75rem',
                background: '#f3f4f6',
                borderRadius: '0.25rem'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div>
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.25rem',
              marginBottom: '0.25rem'
            }}>
              {week.map((day, dayIdx) => {
                const isSunday = day && new Date(displayYear, displayMonth, day).getDay() === 0;
                const isOffDay = day && offDays.has(String(day));

                let buttonStyle: React.CSSProperties = {
                  height: '2rem',
                  borderRadius: '0.25rem',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease',
                  border: 'none',
                  cursor: day ? 'pointer' : 'default',
                  background: 'transparent'
                };

                if (day) {
                  if (isOffDay) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: '#ef4444',
                      color: 'white',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      fontWeight: 'bold'
                    };
                  } else if (isSunday) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: '#fbbf24',
                      color: '#1f2937',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      fontWeight: 'bold'
                    };
                  } else {
                    buttonStyle = {
                      ...buttonStyle,
                      background: '#f3f4f6',
                      color: '#4b5563'
                    };
                  }
                }

                return (
                  <button
                    key={`${weekIdx}-${dayIdx}`}
                    onClick={() => day && toggleOffDay(String(day))}
                    disabled={!day}
                    style={buttonStyle}
                    title={day ? `${MONTH_NAMES[displayMonth]} ${day}` : ''}
                    onMouseEnter={(e) => {
                      if (day && !isOffDay && !isSunday) {
                        e.currentTarget.style.background = '#e5e7eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day && !isOffDay && !isSunday) {
                        e.currentTarget.style.background = '#f3f4f6';
                      }
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button
        onClick={() => {
          setOffDays(new Set());
          onOffDaysChange(new Set());
        }}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#fee2e2',
          color: '#b91c1c',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'background 0.2s ease'
        }}
        title="Clear all selected off days"
        onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
      >
        🗑️ Clear Off Days
      </button>

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#ef4444' }}></div>
          <span style={{ color: '#4b5563' }}><strong>Red</strong> = Off Days (Double OT)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#fbbf24' }}></div>
          <span style={{ color: '#4b5563' }}><strong>Yellow</strong> = Sundays</span>
        </div>
      </div>
    </div>
  );
}
