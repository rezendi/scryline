import { DateTime } from 'luxon';

const TWITTER_DATE_FORMAT = 'EEE MMM d HH:mm:ss ZZZ yyyy';

const parseDate = (str:string) => {
  let dt = DateTime.fromISO(str);
  if (!dt.isValid) { dt = DateTime.fromRFC2822(str); }
  if (!dt.isValid) { dt = DateTime.fromHTTP(str); }
  if (!dt.isValid) { dt = DateTime.fromSQL(str); }
  if (!dt.isValid) { dt = DateTime.fromString(str, TWITTER_DATE_FORMAT); }
  if (!dt.isValid) { dt = DateTime.fromMillis(parseInt(str)); }
  return dt;
}

const formatDateString = (str:string) => {
  return str ? parseDate(str).toLocaleString(DateTime.DATETIME_MED) : '';
}

export default {
    parseDate,
    formatDateString
}