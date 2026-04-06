export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}
