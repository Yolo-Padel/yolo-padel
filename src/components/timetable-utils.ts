// Utility functions untuk timetable

// Generate time slots dari 06:00 sampai 23:00
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 6; hour < 24; hour++) {
    const time = `${String(hour).padStart(2, "0")}:00`;
    slots.push(time);
  }
  return slots;
}

// Format waktu untuk display: "06:00" -> "06.00"
export function formatTimeDisplay(time: string): string {
  return time.replace(":", ".");
}

// Format waktu untuk display dengan AM/PM: "06:00" -> "06.00AM"
export function formatTimeWithAMPM(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(displayHour).padStart(2, "0")}.${minutes}${ampm}`;
}

// Format waktu range: ["06:00", "07:00"] -> "06.00AM-07.00AM"
export function formatTimeRange(
  timeSlots: Array<{ openHour: string; closeHour: string }>
): string {
  if (timeSlots.length === 0) return "";
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  return `${formatTimeWithAMPM(first.openHour)}-${formatTimeWithAMPM(last.closeHour)}`;
}

// Get next hour: "06:00" -> "07:00"
export function getNextHour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const nextHour = (hours + 1) % 24;
  return `${String(nextHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Format operating hours: "10:00" -> "20:00" -> "10.00AM-20.00PM"
export function formatOperatingHours(openHour: string, closeHour: string): string {
  return `${formatTimeWithAMPM(openHour)}-${formatTimeWithAMPM(closeHour)}`;
}

