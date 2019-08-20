import * as Rx from 'rxjs';
import * as TsMonad from "tsmonad";
import { Either, Maybe } from "tsmonad";
export declare class DynamicHelpers {
}
export declare class ObjectUtils {
    static getConstructorName(obj: object): string;
    static removeIntersectionProps<T, K extends T>(field: K, props: T): K;
    static addFunctionsToPrototype: (baseType: any, functionsModule: any) => void;
    private static resolvePathAsArray;
    private static extractValue;
    static expandObjectFromPath: (path: string, obj: any) => TsMonad.Maybe<any>;
    static assignValueToObjectFromPath: (path: string, obj: any, val: any) => void;
}
export declare class RxUtils {
    static funCache<T>(funcToBeCached: () => Rx.Observable<T>, expiresInMs: number): Rx.Observable<T>;
}
export declare class MonadUtils {
    static sequenceMb<T>(entities: Maybe<T>[]): Maybe<T[]>;
    static sequenceMbIgnoringNothing<T>(entities: Maybe<T>[]): Maybe<T[]>;
    static reverseMaybe<T, K>(mb: Maybe<T>, defaultValue: K): TsMonad.Maybe<K>;
    static mbConcat<T>(mba: Maybe<T>[], mbb: Maybe<T>): Maybe<T>[];
    static mbConcatR<T>(mba: Maybe<T[]>, mbb: Maybe<T[]>): Maybe<T[]>;
    static sequenceA<T>(mentities: Maybe<T[]>): Maybe<T>[];
    static unwrapMbListSafely<T>(mbEntities: Maybe<T[]>): T[];
    static mbJoinArr<T>(mb: Maybe<Maybe<T>[]>): Maybe<T>[];
    static Ignore(): void;
    static CreateMaybeFromNullable<T>(value?: T): TsMonad.Maybe<T>;
    static CreateMaybeFromArray<T>(value: T[]): TsMonad.Maybe<T[]>;
    static CreateMaybeFromFirstElementOfAnArray<T>(value: T[]): TsMonad.Maybe<T>;
    static mbJoinRx<T>(mbval: Maybe<Rx.Observable<T>>): Rx.Observable<Maybe<T>>;
    static eitherJoinRx<L, R>(either: Either<L, Rx.Observable<R>>): Rx.Observable<Either<L, R>>;
    static mapToRxFallback<T>(mb: Maybe<T>, func: () => Rx.Observable<Maybe<T>>): Rx.Observable<TsMonad.Maybe<T>>;
    static booleanToMaybe<T>(value: T, condition: boolean): TsMonad.Maybe<T>;
    static mapLeft<L, R, T>(either: Either<L, R>, fun: (L: any) => T): Either<T, R>;
    static fromEitherToMaybe<L, R>(either: Either<L, R>): TsMonad.Maybe<R>;
    static sequence<L, R>(entries: TsMonad.Either<L, R>[]): TsMonad.Either<L, R[]>;
    static reduceLeftToRx<L, R>(data: TsMonad.Either<L, Rx.Observable<TsMonad.Either<L, R>>>): Rx.Observable<TsMonad.Either<L, R>>;
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
export declare class BooleanUtils {
    static alwaysTrue(): boolean;
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
    static getDifferenceInDays(a: Date | string, b: Date | string): number;
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
export declare class TextReplacer {
    readonly args: TextReplacerConstructorArgs;
    constructor(args: TextReplacerConstructorArgs);
    replace(text: string): string;
    static createArgs(text: string, word: string, replacement: string, escapeLietral: any): {
        text: string;
        word: string;
        replacement: string;
        escapeOpenerLiteral: any;
        escapeCloserLiteral: any;
    };
    static replace(args: ReplaceArgs): string;
    private static replaceWithRegex;
    private static replaceWithEscape;
    private static checkArgs;
    private static checkText;
}
interface TextReplacerConstructorArgs {
    word: string;
    replacement: string;
    escapeOpenerLiteral?: string;
    escapeCloserLiteral?: string;
}
interface ReplaceArgs extends TextReplacerConstructorArgs {
    text: string;
}
export {};
//# sourceMappingURL=Utils.d.ts.map