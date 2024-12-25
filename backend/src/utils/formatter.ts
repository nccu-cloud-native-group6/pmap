export function toDateString(date: Date | undefined | null): string | null {
  if (date === null || date === undefined) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export function toTimeString(date: Date | undefined | null): string | null {
  if (date === null || date === undefined) {
    return null;
  }
  return date.toISOString().slice(11, 19);
}
