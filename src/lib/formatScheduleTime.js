export function formatTime12h(time24) {
  if (!time24 || typeof time24 !== 'string') return '';
  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time24;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return `${hours}:${minutes} ${period}`;
}

export function formatTimeRange(startTime, endTime) {
  const start = formatTime12h(startTime);
  const end = formatTime12h(endTime);
  if (!start || !end) return '';
  return `${start} – ${end}`;
}
