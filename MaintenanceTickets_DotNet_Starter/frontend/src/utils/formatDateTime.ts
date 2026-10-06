const TIME_ZONE_DESIGNATOR = /(Z|[+-]\d{2}:\d{2})$/i;
const EXTRA_FRACTION_DIGITS = /(\.\d{3})\d+/;

const dateTimeFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Formats an API date in the user's local time.
 * The API stores UTC, but GET responses omit the zone designator, so such values are read as UTC.
 */
export function formatDateTime(apiDate: string): string {
  const withMilliseconds = apiDate.replace(EXTRA_FRACTION_DIGITS, '$1');
  const utcDate = TIME_ZONE_DESIGNATOR.test(withMilliseconds) ? withMilliseconds : `${withMilliseconds}Z`;
  const date = new Date(utcDate);
  return Number.isNaN(date.getTime()) ? apiDate : dateTimeFormatter.format(date);
}
