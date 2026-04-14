/**
 * Attempt to parse a free-text date string and reformat it according to the
 * user's preferred format.  Falls back to the raw input when parsing fails.
 *
 * @param {string} raw        The date string as the user typed it.
 * @param {'raw'|'MDY'|'DMY'|'YMD'} formatPref  Display format preference.
 * @returns {string}
 */

const MONTH_NAMES = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
];
const MONTH_ABBR = [
  'jan','feb','mar','apr','may','jun',
  'jul','aug','sep','oct','nov','dec',
];
const MONTH_DISPLAY = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

function monthIndex(str) {
  const s = str.toLowerCase();
  let idx = MONTH_NAMES.indexOf(s);
  if (idx !== -1) return idx;
  idx = MONTH_ABBR.indexOf(s.substring(0, 3));
  return idx;
}

function expandYear(y) {
  if (y < 100) return y < 50 ? 2000 + y : 1900 + y;
  return y;
}

function fmt(monthIdx, day, year, pref) {
  switch (pref) {
    case 'DMY':  return `${day} ${MONTH_DISPLAY[monthIdx]} ${year}`;
    case 'YMD':  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'MDY':
    default:     return `${MONTH_DISPLAY[monthIdx]} ${day}, ${year}`;
  }
}

export function formatDate(raw, formatPref = 'raw') {
  if (!raw || formatPref === 'raw') return raw;
  const t = raw.trim();

  // "Month Day, Year" or "Month Day Year"
  let m = t.match(/^([a-zA-Z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/);
  if (m) {
    const mi = monthIndex(m[1]);
    const day = parseInt(m[2], 10);
    const year = expandYear(parseInt(m[3], 10));
    if (mi !== -1 && day >= 1 && day <= 31) return fmt(mi, day, year, formatPref);
  }

  // "Day Month Year"
  m = t.match(/^(\d{1,2})\s+([a-zA-Z]+),?\s+(\d{2,4})$/);
  if (m) {
    const day = parseInt(m[1], 10);
    const mi = monthIndex(m[2]);
    const year = expandYear(parseInt(m[3], 10));
    if (mi !== -1 && day >= 1 && day <= 31) return fmt(mi, day, year, formatPref);
  }

  // Numeric: A/B/C  or A-B-C  or A.B.C
  m = t.match(/^(\d{1,4})[/\-.](\d{1,2})[/\-.](\d{1,4})$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const c = parseInt(m[3], 10);
    let month, day, year;

    if (m[1].length === 4) {
      // Y-M-D
      year = a; month = b - 1; day = c;
    } else if (m[3].length === 4) {
      year = c;
      if (formatPref === 'DMY') { day = a; month = b - 1; }
      else { month = a - 1; day = b; } // MDY default
    } else {
      // 2-digit year in last position
      year = expandYear(c);
      if (formatPref === 'DMY') { day = a; month = b - 1; }
      else { month = a - 1; day = b; }
    }

    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return fmt(month, day, year, formatPref);
    }
  }

  // Year only
  m = t.match(/^(\d{4})$/);
  if (m) return t;

  return raw;
}
