import slugify from 'slugify';
import sha256 from 'sha256';
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

const slugize = (str:string) => {
  return slugify(str, {lower: true, strict: true, locale: 'en'});
}

const hash8 = (str:string) => {
  return sha256(str).substring(0,8);
}

function getPathFor(user, path) {
	let defaultPath = user.username ? user.username : hash8(user.email);
	let finalPath = path ? path : defaultPath;
	// TODO check user can do this
	return finalPath;
}

export default {
    parseDate,
    formatDateString,
    slugize,
    hash8,
    getPathFor
}