/**
 * Time Utility Functions
 * Parse, format, and calculate time durations
 */

/**
 * Parse time string in 24-hour or 12-hour format
 * Supports: "14:30", "14:30 ", "2:30 PM", "2:30PM", "9:30am", etc.
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== 'string') return null;

  const cleaned = timeStr.trim().toUpperCase();

  // Try 24-hour format first: "14:30"
  const time24Match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (time24Match) {
    const hours = parseInt(time24Match[1]);
    const minutes = parseInt(time24Match[2]);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }

  // Try 12-hour format: "2:30 PM", "2:30PM", "2:30 AM"
  const time12Match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (time12Match) {
    let hours = parseInt(time12Match[1]);
    const minutes = parseInt(time12Match[2]);
    const period = time12Match[3];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes >= 60) return null;

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return { hours, minutes };
  }

  return null;
}

/**
 * Format time object to HH:MM format
 */
export function formatTime(hours: number, minutes: number): string {
  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Convert time to minutes since midnight
 */
export function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time object
 */
export function minutesToTime(minutes: number): { hours: number; minutes: number } {
  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  };
}

/**
 * Calculate duration between two times in hours (decimal)
 * Handles times that cross midnight (e.g., 10 PM to 6 AM next day)
 */
export function calculateDuration(
  startHours: number,
  startMinutes: number,
  endHours: number,
  endMinutes: number
): number {
  const startMins = timeToMinutes(startHours, startMinutes);
  let endMins = timeToMinutes(endHours, endMinutes);

  // If end time is less than start time, assume it's next day
  if (endMins <= startMins) {
    endMins += 24 * 60;
  }

  const durationMins = endMins - startMins;
  // Return exact hours (no rounding yet - quarter-hour rounding will be applied later)
  return durationMins / 60;
}

/**
 * Round decimal hours to 1 decimal place
 */
export function roundToOneDecimal(hours: number): number {
  return Math.round(hours * 10) / 10;
}

/**
 * Round hours to quarter-hour increments (0.00, 0.25, 0.50, 0.75)
 * Used for OT calculations with grace periods:
 * - ≤ 15 min: round to 0.00 hrs
 * - > 15 to ≤ 30 min: round to 0.25 hrs
 * - > 30 to ≤ 45 min: round to 0.50 hrs
 * - > 45 min: round to 0.75 hrs
 */
export function roundToQuarterHours(hours: number): number {
  // Get the decimal part (fractional hours)
  const fractional = hours - Math.floor(hours);
  
  // Convert fractional hours to minutes (0-60)
  const minutes = fractional * 60;
  
  // Determine which quarter to round to based on minutes:
  // 0-15 min → 0.00 hrs
  // 16-30 min → 0.25 hrs
  // 31-45 min → 0.50 hrs
  // 46-60 min → 0.75 hrs
  let quarterHours = 0;
  if (minutes > 45) {
    quarterHours = 0.75;  // 46-60 minutes
  } else if (minutes > 30) {
    quarterHours = 0.50;  // 31-45 minutes
  } else if (minutes > 15) {
    quarterHours = 0.25;  // 16-30 minutes
  } else {
    quarterHours = 0.00;  // 0-15 minutes
  }
  
  // Return whole hours + quarter hours
  return Math.floor(hours) + quarterHours;
}
