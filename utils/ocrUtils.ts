/**
 * OCR Utilities
 * Parse extracted text from ChatGPT into attendance records
 */

/**
 * Parse attendance data from structured AI-formatted text
 * Expected format:
 * Date: 1, In: 09:30, Out: 18:30, Days: 1
 * Date: 2, In: 09:30, Out: 18:30, Days: 1/2
 */
export function parseOCRText(text: string): Array<{
  date: string;
  timeIn: string;
  timeOut: string;
  days: '1' | '1/2';
}> {
  if (!text) return [];

  const records: Array<{
    date: string;
    timeIn: string;
    timeOut: string;
    days: '1' | '1/2';
  }> = [];

  // Split by newlines
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match pattern: Date: X, In: HH:MM, Out: HH:MM, Days: Y
    const match = trimmed.match(
      /Date:\s*(\d{1,2}),?\s*In:\s*([\d:]+),?\s*Out:\s*([\d:]+),?\s*Days:\s*(1(?:\/2)?)/i
    );

    if (match) {
      const [, date, timeIn, timeOut, days] = match;

      // Validate
      if (date && timeIn && timeOut && days) {
        records.push({
          date: date.trim(),
          timeIn: timeIn.trim(),
          timeOut: timeOut.trim(),
          days: (days.trim() as '1' | '1/2'),
        });
      }
    }
  }

  return records;
}

/**
 * Parse JSON structured data from ChatGPT response
 */
export function parseJSONResponse(
  jsonStr: string
): Array<{
  date: string;
  timeIn: string;
  timeOut: string;
  days: '1' | '1/2';
}> {
  try {
    // Clean markdown code blocks if present
    const cleaned = jsonStr
      .replace(/^```json\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    const data = JSON.parse(cleaned);

    if (Array.isArray(data)) {
      return data.map((item) => ({
        date: String(item.date || ''),
        timeIn: String(item.timeIn || item.time_in || ''),
        timeOut: String(item.timeOut || item.time_out || ''),
        days: (item.days === '1/2' ? '1/2' : '1') as '1' | '1/2',
      }));
    }
  } catch (error) {
    // Silently handle parse errors - invalid JSON will return empty array
  }

  return [];
}
