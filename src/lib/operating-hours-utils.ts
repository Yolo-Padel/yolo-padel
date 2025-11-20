// src/lib/operating-hours-utils.ts

export interface OperatingHour {
  id: string;
  dayOfWeek: string;
  closed: boolean;
  slots: Array<{
    id: string;
    openHour: string;
    closeHour: string;
  }>;
}

export interface DayGroup {
  days: string[];
  timeSlots: string[];
  closed: boolean;
}

// Mapping day names in English
const DAY_NAMES: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
};

// Urutan hari dalam seminggu
const DAY_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7
};

/**
 * Format time from HH:mm to HH.mm format
 */
function formatTime(time: string): string {
  return time.replace(':', '.');
}

/**
 * Merge overlapping or consecutive time slots
 */
function mergeTimeSlots(slots: { openHour: string; closeHour: string }[]): string[] {
  if (slots.length === 0) return [];
  
  // Urutkan slot berdasarkan waktu buka
  const sortedSlots = [...slots].sort((a, b) => a.openHour.localeCompare(b.openHour));
  
  const merged: string[] = [];
  let currentStart = sortedSlots[0].openHour;
  let currentEnd = sortedSlots[0].closeHour;
  
  for (let i = 1; i < sortedSlots.length; i++) {
    const slot = sortedSlots[i];
    
    // Jika slot ini berurutan dengan slot sebelumnya
    if (slot.openHour === currentEnd) {
      currentEnd = slot.closeHour;
    } else {
      // Simpan slot yang sudah digabung dan mulai yang baru
      merged.push(`${formatTime(currentStart)}–${formatTime(currentEnd)}`);
      currentStart = slot.openHour;
      currentEnd = slot.closeHour;
    }
  }
  
  // Tambahkan slot terakhir
  merged.push(`${formatTime(currentStart)}–${formatTime(currentEnd)}`);
  
  return merged;
}

/**
 * Group days by the same operating schedule
 */
function groupDaysBySchedule(operatingHours: OperatingHour[]): DayGroup[] {
  const groups: DayGroup[] = [];
  
  for (const hour of operatingHours) {
    const timeSlots = hour.closed ? [] : mergeTimeSlots(hour.slots);
    
    // Find existing group with the same schedule
    const existingGroup = groups.find(group => {
      if (hour.closed && group.closed) return true;
      if (!hour.closed && !group.closed) {
        return group.timeSlots.join(',') === timeSlots.join(',');
      }
      return false;
    });
    
    if (existingGroup) {
      existingGroup.days.push(hour.dayOfWeek);
    } else {
      groups.push({
        days: [hour.dayOfWeek],
        timeSlots,
        closed: hour.closed
      });
    }
  }
  
  // Sort groups by the first day in each group
  groups.forEach(group => {
    group.days.sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
  });
  
  groups.sort((a, b) => DAY_ORDER[a.days[0]] - DAY_ORDER[b.days[0]]);
  
  return groups;
}

/**
 * Format day range (e.g., "Mon–Fri" or "Sat, Sun")
 */
function formatDayRange(days: string[]): string {
  // Sort days by their order in the week
  const sortedDays = days.sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);
  
  if (sortedDays.length === 1) {
    return DAY_NAMES[sortedDays[0]];
  }
  
  if (sortedDays.length === 2) {
    // Check if 2 days are consecutive
    const isConsecutive = DAY_ORDER[sortedDays[1]] === DAY_ORDER[sortedDays[0]] + 1;
    if (isConsecutive) {
      return `${DAY_NAMES[sortedDays[0]]}–${DAY_NAMES[sortedDays[1]]}`;
    } else {
      return sortedDays.map(day => DAY_NAMES[day]).join(', ');
    }
  }
  
  // For 3+ days, check if all are consecutive
  const isConsecutive = sortedDays.every((day, index) => {
    if (index === 0) return true;
    return DAY_ORDER[day] === DAY_ORDER[sortedDays[index - 1]] + 1;
  });
  
  if (isConsecutive) {
    return `${DAY_NAMES[sortedDays[0]]}–${DAY_NAMES[sortedDays[sortedDays.length - 1]]}`;
  }
  
  // If not consecutive, display with commas
  return sortedDays.map(day => DAY_NAMES[day]).join(', ');
}

/**
 * Fungsi utama untuk memformat jam operasional court
 * 
 * @param operatingHours Array jam operasional dari database
 * @param venueDefaultHours Jam operasional default venue (opsional)
 * @returns String yang diformat seperti "Sen–Jum 09.00–19.00, Sab–Min 09.00–22.00"
 */
export function formatOperatingHours(
  operatingHours: OperatingHour[] = [],
  venueDefaultHours?: { openHour: string; closeHour: string }
): string {
  // Jika tidak ada jam operasional dan ada default venue
  if (operatingHours.length === 0 && venueDefaultHours) {
    return `${formatTime(venueDefaultHours.openHour)}–${formatTime(venueDefaultHours.closeHour)}`;
  }
  
  // Jika tidak ada jam operasional sama sekali
  if (operatingHours.length === 0) {
    return 'No schedule available';
  }
  
  // Kelompokkan hari berdasarkan jadwal yang sama
  const groups = groupDaysBySchedule(operatingHours);
  
  // Format setiap grup
  const formattedGroups = groups.map(group => {
    const dayRange = formatDayRange(group.days);
    
    if (group.closed) {
      return `${dayRange} Closed`;
    }
    
    if (group.timeSlots.length === 0) {
      return `${dayRange} Tidak ada jadwal`;
    }
    
    return `${dayRange} ${group.timeSlots.join(', ')}`;
  });
  
  return formattedGroups.join(', ');
}

/**
 * Fungsi untuk mendapatkan status operasional saat ini
 */
export function getCurrentOperatingStatus(
  operatingHours: OperatingHour[] = [],
  currentTime?: Date
): 'open' | 'closed' | 'unknown' {
  if (operatingHours.length === 0) return 'unknown';
  
  const now = currentTime || new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const currentTimeStr = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todaySchedule = operatingHours.find(hour => hour.dayOfWeek === currentDay);
  
  if (!todaySchedule || todaySchedule.closed) {
    return 'closed';
  }
  
  // Cek apakah waktu saat ini dalam range jam buka
  const isOpen = todaySchedule.slots.some(slot => {
    return currentTimeStr >= slot.openHour && currentTimeStr <= slot.closeHour;
  });
  
  return isOpen ? 'open' : 'closed';
}