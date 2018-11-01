"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var underscore_1 = __importDefault(require("underscore"));
var uuid = __importStar(require("uuid"));
var TsMonad = __importStar(require("tsmonad"));
//This will be use to add functions that will be read using reflection in escenarios 
//of metaprogramming.
var DynamicHelpers = /** @class */ (function () {
    function DynamicHelpers() {
    }
    return DynamicHelpers;
}());
exports.DynamicHelpers = DynamicHelpers;
var ObjectUtils = /** @class */ (function () {
    function ObjectUtils() {
    }
    ObjectUtils.addFunctionsToPrototype = function (baseType, functionsModule) {
        Object.keys(functionsModule)
            .filter(function (key) { return functionsModule[key].constructor.name == "Function"; })
            .forEach(function (key) {
            var func = functionsModule[key];
            if (!baseType.prototype[key])
                baseType.prototype[key] = function (args) { return func(this, args); };
        });
    };
    ObjectUtils.resolvePathAsArray = function (pathValue, obj) {
        var _a;
        //array format => functionName, pathToArg1...pathToArgN
        var args = underscore_1.default.tail(pathValue).map(function (path) { return ObjectUtils.extractValue(path, obj); });
        var funName = underscore_1.default.head(pathValue);
        var dynH = new DynamicHelpers();
        var val = (_a = dynH[funName]).call.apply(_a, [underscore_1.default.head(args)].concat(underscore_1.default.tail(args)));
        return val;
    };
    ObjectUtils.extractValue = function (path, obj) {
        var index = function (obj, i) { return obj[i]; };
        var isPathArray = path.startsWith("[") && path.endsWith("]");
        var isObject = (path === "this");
        if (isPathArray)
            return ObjectUtils.resolvePathAsArray(JSON.parse(path), obj);
        var expandObject = function () { return isObject ? obj : path.split('.').reduce(index, obj); };
        return expandObject();
    };
    ObjectUtils.expandObjectFromPath = function (path, obj) {
        try {
            var expandedObject = ObjectUtils.extractValue(path, obj);
            if (expandedObject && expandedObject.constructor.name == "Function") {
                var pathToField = underscore_1.default.tail(path.split('.').reverse()).reverse().reduce(function (a, b) { return a.concat(b); });
                expandedObject = expandedObject.bind(obj[pathToField])();
            }
            return MonadUtils.CreateMaybeFromNullable(expandedObject);
        }
        catch (e) {
            // console.warn(e);
            return TsMonad.Maybe.nothing();
        }
    };
    ObjectUtils.assignValueToObjectFromPath = function (path, obj, val) {
        var maxDeep = path.split('.').length - 1;
        var index = function (obj, key, i) {
            if (maxDeep == i)
                obj[key] = val;
            return obj[key];
        };
        var expandObject = function () { return path.split('.').reduce(index, obj); };
        expandObject();
    };
    return ObjectUtils;
}());
exports.ObjectUtils = ObjectUtils;
var RXUtils = /** @class */ (function () {
    function RXUtils() {
    }
    return RXUtils;
}());
exports.RXUtils = RXUtils;
var MonadUtils = /** @class */ (function () {
    function MonadUtils() {
    }
    MonadUtils.Ignore = function () {
    };
    MonadUtils.CreateMaybeFromNullable = function (value) {
        if (value == null || value == undefined || value == "undefined")
            return TsMonad.Maybe.nothing();
        return TsMonad.Maybe.maybe(value);
    };
    MonadUtils.CreateMaybeFromArray = function (value) {
        if (value.length == 0)
            return TsMonad.Maybe.nothing();
        return TsMonad.Maybe.maybe(value);
    };
    MonadUtils.CreateMaybeFromFirstElementOfAnArray = function (value) {
        if (value.length == 0)
            return TsMonad.Maybe.nothing();
        return MonadUtils.CreateMaybeFromNullable(value[0]);
    };
    return MonadUtils;
}());
exports.MonadUtils = MonadUtils;
var NumberUtils = /** @class */ (function () {
    function NumberUtils() {
    }
    //Element should have an id property
    NumberUtils.generateNextId = function (elements) {
        return underscore_1.default(elements).any() ? underscore_1.default(elements.map(function (n) { return n.id; })).max() + 1 : 1;
    };
    NumberUtils.generateNextIdForListOfString = function (elements) {
        return underscore_1.default(elements).any() ? underscore_1.default(elements.map(function (n) { return NumberUtils.generateNextIdFromString(n); })).max() + 1 : 1;
    };
    NumberUtils.generateNextIdFromString = function (element) {
        var regex = /\d+/g;
        var result = element.match(regex);
        if (result != null)
            return parseInt(underscore_1.default(result).last()) + 1;
        return 1;
    };
    NumberUtils.generateRandomId = function () {
        return uuid.v1();
    };
    NumberUtils.generateCapUIID = function () {
        return this.generateRandomId().toUpperCase();
    };
    NumberUtils.isInInterval = function (a, b, n) {
        return n >= a && n <= b;
    };
    NumberUtils.getPercentage = function (timecards, totalTimecards) {
        if (totalTimecards == 0)
            return 0;
        return parseInt(((timecards * 100) / totalTimecards).toString());
    };
    return NumberUtils;
}());
exports.NumberUtils = NumberUtils;
var StringUtils = /** @class */ (function () {
    function StringUtils() {
    }
    StringUtils.from = function (value) {
        var type = typeof value;
        if (type === "string")
            return value;
        if (type === "boolean")
            return value ? "True" : "False";
        throw new Error("Parse not implemented for " + type);
    };
    StringUtils.toCamelcase = function (str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    };
    StringUtils.replaceAll = function (str, search, replacement) {
        return str.split(search).join(replacement);
    };
    StringUtils.replaceMany = function (strs, search, replacement) {
        var _this = this;
        return strs.reduce(function (a, b) { return _this.replaceAll(b, a, replacement); });
    };
    StringUtils.parseCCBoolean = function (value) {
        return value.toLowerCase() === "true";
    };
    StringUtils.capitalizeFirstLetter = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    StringUtils.test = function (arg1, arg2) {
        return arg1 + arg2;
    };
    StringUtils.countWords = function (s) {
        s = s.replace(/(^\s*)|(\s*$)/gi, ""); //exclude  start and end white-space
        s = s.replace(/[ ]{2,}/gi, " "); //2 or more space to 1
        s = s.replace(/\n /, "\n"); // exclude newline with a start spacing
        return s.split(' ').length;
    };
    StringUtils.stringContains = function (str, keyword) {
        if (str === undefined || str === null)
            return false;
        return str.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    };
    ;
    StringUtils.isNullOrEmpty = function (str) {
        return str == null || str == "";
    };
    StringUtils.parseServerContent = function (str) {
        return str.split('ITK_CRLF')
            .filter(function (line) { return line.trim().length; })
            .map(function (line) {
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
    };
    StringUtils.splitEmails = function (emails) {
        return emails.split(",").map(function (e) { return e.trim(); });
    };
    StringUtils.empty = "";
    StringUtils.format = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    };
    return StringUtils;
}());
exports.StringUtils = StringUtils;
var DateUtils = /** @class */ (function () {
    function DateUtils() {
    }
    DateUtils.measureExecution = function (name, fun) {
        console.time(name);
        var toReturn = fun();
        console.timeEnd(name);
        return toReturn;
    };
    DateUtils.concatZeroIfItOnlyHaveOneDigit = function (n) {
        if (n < 10)
            return "0" + n.toString();
        else
            return n.toString();
    };
    DateUtils.getDateAsString = function (date) {
        var year = date.getUTCFullYear().toString();
        var month = DateUtils.concatZeroIfItOnlyHaveOneDigit((date.getUTCMonth() + 1)); //INDEX starts in 0. Jan == 0
        var day = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCDate());
        var dateAsString = year + "-" + month + "-" + day;
        return dateAsString;
    };
    DateUtils.getDateFromString = function (d) {
        var _a = d.split("-").map(function (x) { return parseInt(x); }), year = _a[0], month = _a[1], day = _a[2];
        return new Date(year, month - 1, day);
    };
    DateUtils.getDateTimeFromString = function (d) {
        return new Date(d);
    };
    DateUtils.getDateAndHoursAsStringITKFormat = function (date) {
        return DateUtils.getDateAsString(date) + "T" + TimeUtils.getHourAsString(date);
    };
    DateUtils.calculateQuarter = function (m) {
        if (m < 4)
            return 1;
        if (m < 7)
            return 2;
        if (m < 10)
            return 3;
        return 4;
    };
    DateUtils.getDateAndHoursAsStringJSFormat = function (date) {
        return DateUtils.getDateAsString(date) + " " + TimeUtils.getHourAsString(date);
    };
    DateUtils.FromITKFormatToJsFormat = function (date) {
        return date.replace("T", " ");
    };
    DateUtils.getDateWithNDaysFromToday = function (n) {
        return DateUtils.getDateWithNDaysFrom(n, new Date());
    };
    DateUtils.getDateWithNDaysAhead = function (n) {
        return DateUtils.getDateWithNDaysFromToday(-n);
    };
    DateUtils.isDateStrictLess = function (a, b) {
        return (a > b && !DateUtils.areDatesEqual(a, b));
    };
    DateUtils.getDateWithNDaysAheadFromDate = function (date, n) {
        return DateUtils.getDateWithNDaysFrom(-n, date);
    };
    DateUtils.GetNow = function () {
        return new Date();
    };
    DateUtils.getFirstDayOfCurrentMonth = function () {
        var now = DateUtils.GetNow();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };
    DateUtils.getLastDayOfCurrentMonth = function () {
        var lastDayBuilder = DateUtils.GetNow();
        lastDayBuilder.setMonth(lastDayBuilder.getMonth() + 1);
        lastDayBuilder.setDate(-1);
        return lastDayBuilder;
    };
    DateUtils.getDateWithNDaysFrom = function (days, date) {
        var d = new Date(date.getTime());
        d.setTime(date.getTime() - days * 86400000);
        return d;
    };
    DateUtils.createDate = function (year, month, day) {
        return new Date(year, month - 1, day);
    };
    DateUtils.areDatesEqual = function (a, b) {
        var msDateA = Date.UTC(a.getFullYear(), a.getMonth() + 1, a.getDate());
        var msDateB = Date.UTC(b.getFullYear(), b.getMonth() + 1, b.getDate());
        return msDateA == msDateB;
    };
    DateUtils.IsOlder = function (a, b) {
        var msDateA = DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        var msDateB = DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA < msDateB;
    };
    DateUtils.IsNewer = function (a, b) {
        var msDateA = DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        var msDateB = DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA > msDateB;
    };
    DateUtils.getDifferenceInMs = function (a, b) {
        return Math.abs(a.valueOf() - b.valueOf());
    };
    DateUtils.getDifferenceInDays = function (a, b) {
        var days = new Date(a - b).getDate() - 1;
        return days;
    };
    return DateUtils;
}());
exports.DateUtils = DateUtils;
var Period = /** @class */ (function () {
    function Period(from, to) {
        this.from = from;
        this.to = to;
    }
    Period.prototype.getFrom = function () {
        return this.from;
    };
    Period.prototype.getTo = function () {
        return this.to;
    };
    Period.prototype.length = function () {
        return DateUtils.getDifferenceInDays(this.from, this.to);
    };
    Period.prototype.getDateInPeriod = function (index) {
        var dat = new Date(this.getFrom().getTime());
        dat.setDate(dat.getDate() + index);
        if (this.isDateInPeriod(dat))
            return dat;
        throw new Error("The index is out of the date interval");
    };
    Period.prototype.getIndexOf = function (date) {
        if (!this.isDateInPeriod(date))
            throw new Error("The index is out of the date interval");
        return DateUtils.getDifferenceInDays(date, this.from);
    };
    Period.prototype.toString = function () {
        return this.getFrom().toString() + " - " + this.getTo().toString();
    };
    Period.prototype.isDateInPeriod = function (date) {
        return this.from <= date && this.to >= date
            || DateUtils.areDatesEqual(this.to, date) || DateUtils.areDatesEqual(this.from, date);
    };
    Period.createNewPeriodWith = function (to) {
        return new Period(DateUtils.getDateWithNDaysFrom(Period.DEFAULT_DAYS_INTERVAL, to), to);
    };
    Period.getCurrentMonthPeriod = function () {
        return new Period(DateUtils.getFirstDayOfCurrentMonth(), DateUtils.getLastDayOfCurrentMonth());
    };
    Period.getCurrentMonthPeriodUntilToday = function () {
        return new Period(DateUtils.getFirstDayOfCurrentMonth(), DateUtils.GetNow());
    };
    Period.getInitialPeriod = function () {
        return Period.createNewPeriodWith(new Date());
    };
    Period.getNextPeriodFrom = function (lastPeriod) {
        return Period.createNewPeriodWith(lastPeriod.getFrom());
    };
    Period.areEquals = function (a, b) {
        return a.getFrom().getDay() === b.getFrom().getDay() &&
            a.getFrom().getMonth() === b.getFrom().getMonth() &&
            a.getFrom().getFullYear() === b.getFrom().getFullYear() &&
            a.getTo().getDay() === b.getTo().getDay() &&
            a.getTo().getMonth() === b.getTo().getMonth() &&
            a.getTo().getFullYear() === b.getTo().getFullYear();
    };
    Period.fromJSON = function (json) {
        return new Period(DateUtils.getDateTimeFromString(json.from), DateUtils.getDateTimeFromString(json.to));
    };
    Period.prototype.toCompatibleJSON = function () {
        return {
            from: DateUtils.getDateAsString(this.from),
            to: DateUtils.getDateAsString(this.from),
        };
    };
    Period.DEFAULT_DAYS_INTERVAL = 10;
    return Period;
}());
exports.Period = Period;
var TimeUtils = /** @class */ (function () {
    function TimeUtils() {
    }
    TimeUtils.getHourAsString = function (date) {
        var hour = date.getUTCHours().toString();
        var minutes = date.getUTCMinutes().toString();
        var seconds = date.getUTCSeconds().toString();
        var milliseconds = date.getUTCMilliseconds().toString();
        return hour + ":" + minutes + ":" + seconds + "." + milliseconds;
    };
    TimeUtils.getDefaultTimeInterval = function () {
        return 500;
    };
    TimeUtils.getTimeFormatted = function (date) {
        var hour = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCHours());
        var minutes = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCMinutes());
        var seconds = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCSeconds());
        if (isNaN(parseInt(hour)))
            return null;
        return hour + ":" + minutes + ":" + seconds;
    };
    TimeUtils.getTimezoneOffset = function (date) {
        var offset = date.getTimezoneOffset();
        var sign = (offset > 0) ? "-" : "+";
        var padWithLeadingZero = function (value) {
            return value < 10 ? '0' + value : value;
        };
        return sign + padWithLeadingZero(Math.floor(Math.abs(offset) / 60)) + ":" + padWithLeadingZero(offset % 60);
    };
    return TimeUtils;
}());
//# sourceMappingURL=Utils.js.map