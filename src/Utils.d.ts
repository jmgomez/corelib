import * as TsMonad from "tsmonad";
export declare class DynamicHelpers {
}
export declare class ObjectUtils {
    static addFunctionsToPrototype: (baseType: any, functionsModule: any) => void;
    private static resolvePathAsArray;
    private static extractValue;
    static expandObjectFromPath: (path: string, obj: any) => TsMonad.Maybe<any>;
    static assignValueToObjectFromPath: (path: string, obj: any, val: any) => void;
}
export declare class RXUtils {
}
export declare class MonadUtils {
    static Ignore(): void;
    static CreateMaybeFromNullable<T>(value?: T): TsMonad.Maybe<T>;
    static CreateMaybeFromArray<T>(value: T[]): TsMonad.Maybe<T[]>;
    static CreateMaybeFromFirstElementOfAnArray<T>(value: T[]): TsMonad.Maybe<T>;
}
export declare class NumberUtils {
    static generateNextId(elements: any[]): number;
    static generateNextIdForListOfString(elements: string[]): number;
    static generateNextIdFromString(element: string): number;
    static generateRandomId(): string;
    static generateCapUIID(): string;
    static isInInterval(a: Number, b: Number, n: Number): boolean;
    static getPercentage(timecards: number, totalTimecards: number): number;
}
export declare class StringUtils {
    static empty: string;
    static from<T>(value: T): string;
    static toCamelcase(str: string): string;
    static replaceAll(str: string, search: string, replacement: string): string;
    static replaceMany(strs: string[], search: string, replacement: string): string;
    static parseCCBoolean(value: string): boolean;
    static capitalizeFirstLetter(str: string): string;
    static test(arg1: any, arg2: any): any;
    static countWords(s: string): number;
    static format: (...args: any[]) => any;
    static stringContains(str: string, keyword: string): boolean;
    static isNullOrEmpty(str: string): boolean;
    static parseServerContent(str: string): string;
    static splitEmails(emails: string): string[];
}
export declare class DateUtils {
    static measureExecution(name: string, fun: () => any): any;
    static concatZeroIfItOnlyHaveOneDigit(n: number): string;
    static getDateAsString(date: Date): string;
    static getDateFromString(d: string): Date;
    static getDateTimeFromString(d: string): Date;
    static getDateAndHoursAsStringITKFormat(date: Date): string;
    static calculateQuarter(m: number): 1 | 4 | 2 | 3;
    static getDateAndHoursAsStringJSFormat(date: Date): string;
    static FromITKFormatToJsFormat(date: string): string;
    static getDateWithNDaysFromToday(n: number): Date;
    static getDateWithNDaysAhead(n: number): Date;
    static isDateStrictLess(a: Date, b: Date): boolean;
    static getDateWithNDaysAheadFromDate(date: Date, n: number): Date;
    static GetNow(): Date;
    static getFirstDayOfCurrentMonth(): Date;
    static getLastDayOfCurrentMonth(): Date;
    static getDateWithNDaysFrom(days: number, date: Date): Date;
    static createDate(year: number, month: number, day: number): Date;
    static areDatesEqual(a: Date, b: Date): boolean;
    static IsOlder(a: Date, b: Date): boolean;
    static IsNewer(a: Date, b: Date): boolean;
    static getDifferenceInMs(a: Date, b: Date): number;
    static getDifferenceInDays(a: Date, b: Date): number;
}
export declare class Period {
    static DEFAULT_DAYS_INTERVAL: number;
    private from;
    private to;
    constructor(from: Date, to: Date);
    getFrom(): Date;
    getTo(): Date;
    length(): number;
    getDateInPeriod(index: number): Date;
    getIndexOf(date: Date): number;
    toString(): string;
    isDateInPeriod(date: Date): boolean;
    static createNewPeriodWith(to: Date): Period;
    static getCurrentMonthPeriod(): Period;
    static getCurrentMonthPeriodUntilToday(): Period;
    static getInitialPeriod(): Period;
    static getNextPeriodFrom(lastPeriod: Period): Period;
    static areEquals(a: Period, b: Period): boolean;
    static fromJSON(json: any): Period;
    toCompatibleJSON(): {
        from: string;
        to: string;
    };
}
//# sourceMappingURL=Utils.d.ts.map