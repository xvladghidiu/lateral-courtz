export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

export function formatTime(time: string): string {
  const [h] = time.split(":");
  const hour = parseInt(h!, 10);
  if (hour === 0) return "12:00 AM";
  if (hour < 12) return `${hour}:00 AM`;
  if (hour === 12) return "12:00 PM";
  return `${hour - 12}:00 PM`;
}
