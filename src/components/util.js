"use strict";
exports.__esModule = true;
var slugify_1 = require("slugify");
var sha256_1 = require("sha256");
var luxon_1 = require("luxon");
var TWITTER_DATE_FORMAT = 'EEE MMM d HH:mm:ss ZZZ yyyy';
var parseDate = function (str) {
    var dt = luxon_1.DateTime.fromISO(str);
    if (!dt.isValid) {
        dt = luxon_1.DateTime.fromRFC2822(str);
    }
    if (!dt.isValid) {
        dt = luxon_1.DateTime.fromHTTP(str);
    }
    if (!dt.isValid) {
        dt = luxon_1.DateTime.fromSQL(str);
    }
    if (!dt.isValid) {
        dt = luxon_1.DateTime.fromString(str, TWITTER_DATE_FORMAT);
    }
    if (!dt.isValid) {
        dt = luxon_1.DateTime.fromMillis(parseInt(str));
    }
    return dt;
};
var formatDateString = function (str) {
    return str ? parseDate(str).toLocaleString(luxon_1.DateTime.DATETIME_MED) : '';
};
var slugize = function (str) {
    return (0, slugify_1["default"])(str, { lower: true, strict: true, locale: 'en' });
};
var hash8 = function (str) {
    return (0, sha256_1["default"])(str).substring(0, 8);
};
function getPathFor(user, path) {
    var defaultPath = user.username ? user.username : hash8(user.email);
    var finalPath = path ? path : defaultPath;
    // TODO check user can do this
    return finalPath;
}
exports["default"] = {
    parseDate: parseDate,
    formatDateString: formatDateString,
    slugize: slugize,
    hash8: hash8,
    getPathFor: getPathFor
};
