import { ActivityCompletion, WorkSession } from '../types/index.js';

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
  activeDates: string[]; // List of YYYY-MM-DD
}

/**
 * Format a Date object into YYYY-MM-DD in the given timezone (defaults to UTC).
 */
export function getDateStringInTimezone(date: Date, timezone = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // returns 'YYYY-MM-DD'
  } catch {
    return date.toISOString().split('T')[0];
  }
}

/**
 * Calculate consecutive streaks and active dates from activity completions and completed work sessions.
 */
export function calculateStreak(
  completions: ActivityCompletion[],
  workSessions: WorkSession[],
  timezone = 'UTC'
): StreakInfo {
  const activeDateSet = new Set<string>();

  // Count completions
  for (const c of completions) {
    if (c.completion_status === 'completed') {
      const dateStr = getDateStringInTimezone(new Date(c.completed_at), timezone);
      activeDateSet.add(dateStr);
    }
  }

  // Count sessions where breaks were taken or session was completed
  for (const s of workSessions) {
    if (s.breaks_taken > 0 || s.status === 'completed') {
      const dateStr = getDateStringInTimezone(new Date(s.created_at), timezone);
      activeDateSet.add(dateStr);
    }
  }

  const sortedDates = Array.from(activeDateSet).sort(); // Ascending 'YYYY-MM-DD'
  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      isActiveToday: false,
      activeDates: [],
    };
  }

  const todayStr = getDateStringInTimezone(new Date(), timezone);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getDateStringInTimezone(yesterday, timezone);

  const isActiveToday = activeDateSet.has(todayStr);

  // Calculate longest streak across all history
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1] + 'T00:00:00Z');
    const curr = new Date(sortedDates[i] + 'T00:00:00Z');
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }

  // Calculate current streak backwards from today / yesterday
  let currentStreak = 0;
  if (isActiveToday || activeDateSet.has(yesterdayStr)) {
    let checkDate = isActiveToday ? new Date() : yesterday;
    while (true) {
      const checkStr = getDateStringInTimezone(checkDate, timezone);
      if (activeDateSet.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate: sortedDates[sortedDates.length - 1],
    isActiveToday,
    activeDates: sortedDates,
  };
}
