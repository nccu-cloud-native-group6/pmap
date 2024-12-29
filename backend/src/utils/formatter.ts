import logger from '../Logger/index.js';

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

export function combinedDateAndTime(date: string, time: string): string {
  const dt = new Date(`${date.split(' ')[0]}T${time}`);
  return dt.toISOString();
}

export function timestampToIsoDate(
  dtStr: string | null | undefined,
): string | null {
  if (dtStr === null || dtStr === undefined) {
    return null;
  }

  try {
    return new Date(dtStr).toISOString().slice(0, 10);
  } catch (error) {
    logger.error('dtStrToIsoStr fail' + error);
    return null;
  }
}
