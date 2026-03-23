/**
 * OT Calculation Engine
 * Implements all OT calculation rules for the payroll system
 */

import { calculateDuration, parseTime, roundToOneDecimal, roundToQuarterHours } from './timeUtils';

export interface AttendanceRecord {
  date: string;
  timeIn: string;
  timeOut: string;
  days: '1' | '1/2'; // 1 = full day, 1/2 = half day
  isOffDay: boolean; // Sunday or marked off day
  normalOTHrs: number; // Calculated
  doubleOTHrs: number; // Calculated
}

/**
 * Calculate OT for a single day
 * Implements all the complex business rules
 */
export function calculateDayOT(record: Omit<AttendanceRecord, 'normalOTHrs' | 'doubleOTHrs'>): {
  normalOTHrs: number;
  doubleOTHrs: number;
} {
  // Parse times
  const timeInParsed = parseTime(record.timeIn);
  const timeOutParsed = parseTime(record.timeOut);

  if (!timeInParsed || !timeOutParsed) {
    return { normalOTHrs: 0, doubleOTHrs: 0 };
  }

  // Determine if full day or half day
  const isFullDay = record.days === '1';

  // RULE: Minimum shift start time is 9:30 AM (class start)
  const SHIFT_START_MORNING = { hours: 9, minutes: 30 }; // 9:30 AM
  const SHIFT_START_AFTERNOON = { hours: 14, minutes: 30 }; // 2:30 PM (half day only)
  const SHIFT_END = { hours: 18, minutes: 30 }; // 6:30 PM

  // Determine actual start time
  let actualStartTime = timeInParsed;

  if (isFullDay) {
    // RULE 1: Full day - Never start before 9:30 AM
    // If arrives before 9:30, use 9:30
    // If arrives after 9:30, use actual time
    if (
      timeInParsed.hours < SHIFT_START_MORNING.hours ||
      (timeInParsed.hours === SHIFT_START_MORNING.hours &&
        timeInParsed.minutes < SHIFT_START_MORNING.minutes)
    ) {
      actualStartTime = SHIFT_START_MORNING;
    }
  } else {
    // RULE 2: Half day - Never start before 2:30 PM
    // If arrives before 2:30 PM, use 2:30 PM
    // If arrives after 2:30 PM, use actual time
    if (
      timeInParsed.hours < SHIFT_START_AFTERNOON.hours ||
      (timeInParsed.hours === SHIFT_START_AFTERNOON.hours &&
        timeInParsed.minutes < SHIFT_START_AFTERNOON.minutes)
    ) {
      actualStartTime = SHIFT_START_AFTERNOON;
    }
  }

  // Calculate total working hours
  const totalHours = calculateDuration(
    actualStartTime.hours,
    actualStartTime.minutes,
    timeOutParsed.hours,
    timeOutParsed.minutes
  );

  // Calculate based on day type
  if (record.isOffDay) {
    // SUNDAY / OFF DAY RULES
    // Entire shift is counted as Double OT (not 2x multiplier, just full day as OT)
    // Minimum start time is 9:30 AM for full day, 2:30 PM for half day
    // But we use ACTUAL start time if after minimum
    const doubleOTHrs = roundToQuarterHours(totalHours);
    const normalOTHrs = 0;

    return { normalOTHrs, doubleOTHrs };
  } else {
    // REGULAR/WORKING DAY
    // Full day: 9:30 to 6:30 = 9 hours normal, anything over = OT
    // Half day: 2:30 onwards = ALL time is OT (no normal working hours)
    let normalOTHrs = 0;
    
    if (isFullDay) {
      // Full day: subtract 9 normal working hours
      normalOTHrs = roundToQuarterHours(Math.max(0, totalHours - 9));
    } else {
      // Half day: ALL time from 14:30 is OT (no normal working hours deducted)
      normalOTHrs = roundToQuarterHours(totalHours);
    }
    
    const doubleOTHrs = 0;

    return { normalOTHrs, doubleOTHrs };
  }
}

/**
 * Calculate OT for multiple records
 */
export function calculateMultipleRecords(
  records: Omit<AttendanceRecord, 'normalOTHrs' | 'doubleOTHrs'>[]
): AttendanceRecord[] {
  return records.map((record) => {
    const { normalOTHrs, doubleOTHrs } = calculateDayOT(record);
    return {
      ...record,
      normalOTHrs,
      doubleOTHrs,
    };
  });
}

/**
 * Calculate total OT summary
 */
export function calculateOTSummary(records: AttendanceRecord[]) {
  let totalNormalOT = 0;
  let totalDoubleOT = 0;
  let totalDays = 0;
  let totalOffDays = 0;

  records.forEach((record) => {
    totalNormalOT += record.normalOTHrs;
    totalDoubleOT += record.doubleOTHrs;
    totalDays++;
    if (record.isOffDay) totalOffDays++;
  });

  return {
    totalNormalOT: roundToQuarterHours(totalNormalOT),
    totalDoubleOT: roundToQuarterHours(totalDoubleOT),
    totalDays,
    totalOffDays,
    totalOTHours: roundToQuarterHours(totalNormalOT + totalDoubleOT),
  };
}

/**
 * Validate a record
 */
export function validateRecord(record: Partial<AttendanceRecord>): string[] {
  const errors: string[] = [];

  if (!record.date) errors.push('Date is required');
  if (!record.timeIn) errors.push('Time In is required');
  if (!record.timeOut) errors.push('Time Out is required');
  if (!record.days) errors.push('Days must be specified');

  if (record.timeIn && record.timeOut) {
    const timeInParsed = parseTime(record.timeIn);
    const timeOutParsed = parseTime(record.timeOut);

    if (!timeInParsed) errors.push('Invalid Time In format');
    if (!timeOutParsed) errors.push('Invalid Time Out format');

    if (timeInParsed && timeOutParsed) {
      const durationMins =
        (timeOutParsed.hours * 60 + timeOutParsed.minutes) -
        (timeInParsed.hours * 60 + timeInParsed.minutes);

      if (durationMins <= 0 && durationMins > -24 * 60) {
        errors.push('Time Out must be after Time In');
      }
    }
  }

  return errors;
}
