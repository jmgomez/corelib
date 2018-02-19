Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const uuid = require("uuid");
const TsMonad = require("tsmonad");
class MonadUtils {
    static Ignore() {
    }
    static CreateMaybeFromNullable(value) {
        if (value == null || value == undefined || value == "undefined")
            return TsMonad.Maybe.nothing();
        return TsMonad.Maybe.maybe(value);
    }
    static CreateMaybeFromArray(value) {
        if (value.length == 0)
            return TsMonad.Maybe.nothing();
        return TsMonad.Maybe.maybe(value);
    }
    static CreateMaybeFromFirstElementOfAnArray(value) {
        if (value.length == 0)
            return TsMonad.Maybe.nothing();
        return MonadUtils.CreateMaybeFromNullable(value[0]);
    }
}
exports.MonadUtils = MonadUtils;
class BaconUtils {
    static createStreamWithError(stream, onError) {
        stream.onError(onError);
        return stream;
    }
}
exports.BaconUtils = BaconUtils;
class NumberUtils {
    //Element should have an id property
    static generateNextId(elements) {
        return _(elements).any() ? _(elements.map(n => n.id)).max() + 1 : 1;
    }
    static generateNextIdForListOfString(elements) {
        return _(elements).any() ? _(elements.map(n => NumberUtils.generateNextIdFromString(n))).max() + 1 : 1;
    }
    static generateNextIdFromString(element) {
        let regex = /\d+/g;
        let result = element.match(regex);
        if (result != null)
            return parseInt(_(result).last()) + 1;
        return 1;
    }
    static generateRandomId() {
        return uuid.v1();
    }
    static generateCapUIID() {
        return this.generateRandomId().toUpperCase();
    }
    static isInInterval(a, b, n) {
        return n >= a && n <= b;
    }
    static getPercentage(timecards, totalTimecards) {
        if (totalTimecards == 0)
            return 0;
        return parseInt(((timecards * 100) / totalTimecards).toString());
    }
}
exports.NumberUtils = NumberUtils;
class StringUtils {
    static from(value) {
        let type = typeof value;
        if (type === "string")
            return value;
        if (type === "boolean")
            return value ? "True" : "False";
        throw new Error("Parse not implemented for " + type);
    }
    static toCamelcase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }
    static replaceAll(str, search, replacement) {
        return str.split(search).join(replacement);
    }
    static replaceMany(strs, search, replacement) {
        return strs.reduce((a, b) => this.replaceAll(b, a, replacement));
    }
    static parseCCBoolean(value) {
        return value.toLowerCase() === "true";
    }
    static capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    static countWords(s) {
        s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
        s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
        s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
        return s.split(' ').length;
    }
    static stringContains(str, keyword) {
        if (str === undefined || str === null)
            return false;
        return str.toLowerCase().search(keyword.toLowerCase()) > -1;
    }
    static isNullOrEmpty(str) {
        return str == null || str == "";
    }
    static parseServerContent(str) {
        return str.split('ITK_CRLF')
            .filter(line => line.trim().length)
            .map(line => {
            if (line.match(/-{2,}/g))
                return '';
            if (line.match(/[A-Z]{4,}/g) &&
                line.indexOf('NOT ALLOWED') < 0 &&
                line.indexOf('DID YOU KNOW') < 0 &&
                line.indexOf('READY TO SUBMIT') < 0)
                return '<h3>' + line + '</h3>';
            return '<p>' + line + '</p>';
        })
            .join('');
    }
    static splitEmails(emails) {
        return emails.split(",").map(e => e.trim());
    }
}
StringUtils.empty = "";
StringUtils.format = function (...args) {
    let s = arguments[0];
    for (let i = 0; i < arguments.length - 1; i++) {
        let reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};
exports.StringUtils = StringUtils;
class DateUtils {
    static measureExecution(name, fun) {
        console.time(name);
        let toReturn = fun();
        console.timeEnd(name);
        return toReturn;
    }
    static concatZeroIfItOnlyHaveOneDigit(n) {
        if (n < 10)
            return "0" + n.toString();
        else
            return n.toString();
    }
    static getDateAsString(date) {
        let year = date.getUTCFullYear().toString();
        let month = DateUtils.concatZeroIfItOnlyHaveOneDigit((date.getUTCMonth() + 1)); //INDEX starts in 0. Jan == 0
        let day = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCDate());
        let dateAsString = year + "-" + month + "-" + day;
        return dateAsString;
    }
    static getDateFromString(d) {
        let [year, month, day] = d.split("-").map(x => parseInt(x));
        return new Date(year, month - 1, day);
    }
    static getDateTimeFromString(d) {
        return new Date(d);
    }
    static getDateAndHoursAsStringITKFormat(date) {
        return DateUtils.getDateAsString(date) + "T" + TimeUtils.getHourAsString(date);
    }
    static calculateQuarter(m) {
        if (m < 4)
            return 1;
        if (m < 7)
            return 2;
        if (m < 10)
            return 3;
        return 4;
    }
    static getDateAndHoursAsStringJSFormat(date) {
        return DateUtils.getDateAsString(date) + " " + TimeUtils.getHourAsString(date);
    }
    static FromITKFormatToJsFormat(date) {
        return date.replace("T", " ");
    }
    static getDateWithNDaysFromToday(n) {
        return DateUtils.getDateWithNDaysFrom(n, new Date());
    }
    static getDateWithNDaysAhead(n) {
        return DateUtils.getDateWithNDaysFromToday(-n);
    }
    static isDateStrictLess(a, b) {
        return (a > b && !DateUtils.areDatesEqual(a, b));
    }
    static getDateWithNDaysAheadFromDate(date, n) {
        return DateUtils.getDateWithNDaysFrom(-n, date);
    }
    static GetNow() {
        return new Date();
    }
    static getFirstDayOfCurrentMonth() {
        let now = DateUtils.GetNow();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    static getLastDayOfCurrentMonth() {
        let lastDayBuilder = DateUtils.GetNow();
        lastDayBuilder.setMonth(lastDayBuilder.getMonth() + 1);
        lastDayBuilder.setDate(-1);
        return lastDayBuilder;
    }
    static getDateWithNDaysFrom(days, date) {
        let d = new Date(date.getTime());
        d.setTime(date.getTime() - days * 86400000);
        return d;
    }
    static createDate(year, month, day) {
        return new Date(year, month - 1, day);
    }
    static areDatesEqual(a, b) {
        let msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate());
        let msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate());
        return msDateA == msDateB;
    }
    static IsOlder(a, b) {
        let msDateA = DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        let msDateB = DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA < msDateB;
    }
    static IsNewer(a, b) {
        let msDateA = DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        let msDateB = DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA > msDateB;
    }
    static getDifferenceInDays(a, b) {
        let days = new Date(a - b).getDate() - 1;
        return days;
    }
}
exports.DateUtils = DateUtils;
class Period {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    getFrom() {
        return this.from;
    }
    getTo() {
        return this.to;
    }
    length() {
        return DateUtils.getDifferenceInDays(this.from, this.to);
    }
    getDateInPeriod(index) {
        let dat = new Date(this.getFrom().getTime());
        dat.setDate(dat.getDate() + index);
        if (this.isDateInPeriod(dat))
            return dat;
        throw new Error("The index is out of the date interval");
    }
    getIndexOf(date) {
        if (!this.isDateInPeriod(date))
            throw new Error("The index is out of the date interval");
        return DateUtils.getDifferenceInDays(date, this.from);
    }
    toString() {
        return `${this.getFrom().toString()} - ${this.getTo().toString()}`;
    }
    isDateInPeriod(date) {
        return this.from <= date && this.to >= date
            || DateUtils.areDatesEqual(this.to, date) || DateUtils.areDatesEqual(this.from, date);
    }
    static createNewPeriodWith(to) {
        return new Period(DateUtils.getDateWithNDaysFrom(Period.DEFAULT_DAYS_INTERVAL, to), to);
    }
    static getCurrentMonthPeriod() {
        return new Period(DateUtils.getFirstDayOfCurrentMonth(), DateUtils.getLastDayOfCurrentMonth());
    }
    static getCurrentMonthPeriodUntilToday() {
        return new Period(DateUtils.getFirstDayOfCurrentMonth(), DateUtils.GetNow());
    }
    static getInitialPeriod() {
        return Period.createNewPeriodWith(new Date());
    }
    static getNextPeriodFrom(lastPeriod) {
        return Period.createNewPeriodWith(lastPeriod.getFrom());
    }
    static areEquals(a, b) {
        return a.getFrom().getDay() === b.getFrom().getDay() &&
            a.getFrom().getMonth() === b.getFrom().getMonth() &&
            a.getFrom().getFullYear() === b.getFrom().getFullYear() &&
            a.getTo().getDay() === b.getTo().getDay() &&
            a.getTo().getMonth() === b.getTo().getMonth() &&
            a.getTo().getFullYear() === b.getTo().getFullYear();
    }
    static fromJSON(json) {
        return new Period(DateUtils.getDateTimeFromString(json.from), DateUtils.getDateTimeFromString(json.to));
    }
    toCompatibleJSON() {
        return {
            from: DateUtils.getDateAsString(this.from),
            to: DateUtils.getDateAsString(this.from),
        };
    }
}
Period.DEFAULT_DAYS_INTERVAL = 10;
exports.Period = Period;
class TimeUtils {
    static getHourAsString(date) {
        let hour = date.getUTCHours().toString();
        let minutes = date.getUTCMinutes().toString();
        let seconds = date.getUTCSeconds().toString();
        let milliseconds = date.getUTCMilliseconds().toString();
        return hour + ":" + minutes + ":" + seconds + "." + milliseconds;
    }
    static getDefaultTimeInterval() {
        return 500;
    }
    static getTimeFormatted(date) {
        let hour = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCHours());
        let minutes = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCMinutes());
        let seconds = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCSeconds());
        if (isNaN(parseInt(hour)))
            return null;
        return hour + ":" + minutes + ":" + seconds;
    }
    static getTimezoneOffset(date) {
        let offset = date.getTimezoneOffset();
        let sign = (offset > 0) ? "-" : "+";
        let padWithLeadingZero = function (value) {
            return value < 10 ? '0' + value : value;
        };
        return sign + padWithLeadingZero(Math.floor(Math.abs(offset) / 60)) + ":" + padWithLeadingZero(offset % 60);
    }
}
//# sourceMappingURL=Utils.js.map