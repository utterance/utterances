// todo: take a dependency on some relative time library.

const thresholds = [
  1000, 'second',
  1000 * 60, 'minute',
  1000 * 60 * 60, 'hour',
  1000 * 60 * 60 * 24, 'day',
  1000 * 60 * 60 * 24 * 7, 'week',
  1000 * 60 * 60 * 24 * 27, 'month'
];

const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };

export function timeAgo(current: number, value: Date) {
  const elapsed = current - value.getTime();
  if (elapsed < 5000) {
    return 'just now';
  }
  let i = 0;
  while (i + 2 < thresholds.length && elapsed * 1.1 > thresholds[i + 2]) {
    i += 2;
  }

  const divisor = thresholds[i] as number;
  const text = thresholds[i + 1] as string;
  const units = Math.round(elapsed / divisor);

  if (units > 3 && i === thresholds.length - 2) {
    return `on ${value.toLocaleDateString(undefined, formatOptions)}`;
  }
  return units === 1 ? `${text === 'hour' ? 'an' : 'a'} ${text} ago` : `${units} ${text}s ago`;
}
