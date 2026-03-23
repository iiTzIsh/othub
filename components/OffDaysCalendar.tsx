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
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ color: 'var(--primary)' }}>◷</span>
        Off Days
      </h2>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)'
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
              background: 'var(--surface-alt)',
              color: 'var(--text)',
              fontWeight: 700,
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title="Previous month"
            onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
          >
            ←
          </button>
          <h3 style={{
            fontWeight: 700,
            color: 'var(--text)',
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
              background: 'var(--surface-alt)',
              color: 'var(--text)',
              fontWeight: 700,
              border: '1px solid var(--border)',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              transition: 'background 0.2s ease'
            }}
            title="Next month"
            onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f7'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
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
                fontWeight: 600,
                color: 'var(--text-muted)',
                fontSize: '0.75rem',
                background: 'var(--surface-alt)',
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
                      background: 'var(--primary)',
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(30, 58, 138, 0.25)',
                      fontWeight: 700
                    };
                  } else if (isSunday) {
                    buttonStyle = {
                      ...buttonStyle,
                      background: '#e2e8f0',
                      color: '#0f172a',
                      fontWeight: 700
                    };
                  } else {
                    buttonStyle = {
                      ...buttonStyle,
                      background: 'var(--surface-alt)',
                      color: 'var(--text-muted)'
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
                        e.currentTarget.style.background = '#edf2f7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (day && !isOffDay && !isSunday) {
                        e.currentTarget.style.background = 'var(--surface-alt)';
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
          background: 'var(--surface-alt)',
          color: 'var(--text)',
          fontWeight: 600,
          border: '1px solid var(--border)',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          transition: 'background 0.2s ease'
        }}
        title="Clear all selected off days"
        onMouseEnter={(e) => e.currentTarget.style.background = '#eef2f7'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface-alt)'}
      >
        Clear Off Days
      </button>

      {/* Legend */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        background: 'var(--surface-alt)',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: 'var(--primary)' }}></div>
          <span style={{ color: 'var(--text-muted)' }}><strong>Blue</strong> = Off Days (Double OT)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#e2e8f0' }}></div>
          <span style={{ color: 'var(--text-muted)' }}><strong>Gray</strong> = Sundays</span>
        </div>
      </div>
    </div>
  );
}
