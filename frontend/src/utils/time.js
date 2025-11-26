// Utilities for parsing/displaying dates in Korea Standard Time (KST)
export function toSeoulDate(input) {
  if (!input && input !== 0) return new Date(input);
  // if already a Date
  if (input instanceof Date) return input;
  const str = String(input);

  // If string already contains timezone info (Z or +/-HH:MM), parse directly
  if (/[zZ]$/.test(str) || /[+\-]\d{2}:?\d{2}$/.test(str)) {
    return new Date(str);
  }

  // Normalize common DB formats like 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDTHH:MM:SS'
  const isoLike = str.replace(' ', 'T');
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(isoLike)) {
    // Append +09:00 to treat the timestamp as KST
    return new Date(isoLike + '+09:00');
  }

  // Fallback: let Date parse it (may be local)
  return new Date(str);
}

export function formatSeoul(date, options = {}) {
  const d = toSeoulDate(date);
  return d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', ...options });
}
