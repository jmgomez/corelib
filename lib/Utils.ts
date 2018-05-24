import * as _ from "underscore";
import * as uuid from "uuid";
import * as TsMonad from "tsmonad";
import * as Bacon from 'baconjs'
import * as Rx from "rxjs/Rx";
import EventStream = Bacon.EventStream;


export class RXUtils {
    static fromStream <T>(stream:EventStream<any, T>) : Rx.Observable<T>{
        return Rx.Observable.create((observer:Rx.Subject<T>) => {
            stream.onValue(v=>observer.next(v));
            stream.onEnd(()=>observer.complete())
            stream.onError(e=> observer.error(e))
        });
    }

    static toStream<T>(observable:Rx.Observable<T>) : EventStream<any, T>{
        let bus = new Bacon.Bus<any, T>();
        observable.subscribe(v=>bus.push(v), e=>bus.error(e), ()=>bus.end())
        return bus;


    }

}
export class MonadUtils {
    public static Ignore() {
    }
    public static CreateMaybeFromNullable<T>(value? : T){
        if(value == null || value == undefined || (<any>value) == "undefined") return TsMonad.Maybe.nothing<T>();
        return TsMonad.Maybe.maybe(value);
    }
    public static CreateMaybeFromArray<T>(value : T[]){
        if(value.length == 0 ) return TsMonad.Maybe.nothing<T[]>();

        return TsMonad.Maybe.maybe(value);
    }
    public static CreateMaybeFromFirstElementOfAnArray<T>(value : T[]){
        if(value.length == 0 ) return TsMonad.Maybe.nothing<T>();
        return MonadUtils.CreateMaybeFromNullable(value[0]);
    }
}

export class BaconUtils {
    static createStreamWithError<T>(stream:Bacon.EventStream<any, T>, onError:(e:any)=>void){
        stream.onError(onError);
        return stream;
    }
}

export class NumberUtils {
    //Element should have an id property
    static generateNextId(elements:any[]){
        return _(elements).any()? _(elements.map(n=>n.id)).max() + 1 : 1;
    }
    static generateNextIdForListOfString(elements:string[]){
        return _(elements).any()? _(elements.map(n=>NumberUtils.generateNextIdFromString(n))).max() + 1 : 1;
    }
    static generateNextIdFromString(element:string){
        let regex = /\d+/g;
        let result = element.match(regex);
        if (result!=null)
            return parseInt(<string>_(result).last()) + 1;
        return 1;
    }
    static generateRandomId(){
        return uuid.v1();
    }
    static generateCapUIID(){
        return this.generateRandomId().toUpperCase();
    }

    static isInInterval(a: Number, b: Number, n: Number) {
        return n >= a && n <= b;
    }

    static getPercentage(timecards: number, totalTimecards: number) {
        if(totalTimecards==0) return 0;
        return parseInt(((timecards*100)/totalTimecards).toString());
    }
}
export class StringUtils {

    public static empty = "";
    public static from<T>(value:T) {
        let type = typeof value;
        if(type === "string") return (value as any) as string;
        if(type === "boolean") return value ? "True" : "False";

        throw new Error("Parse not implemented for " + type);
    }
    public static toCamelcase(str:string){
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }
    public static replaceAll(str:string, search:string, replacement:string){
        return str.split(search).join(replacement);
    }
    public static replaceMany(strs:string[], search:string, replacement:string){
        return strs.reduce((a,b)=>this.replaceAll(b, a, replacement));
    }
    public static parseCCBoolean(value:string){
        return value.toLowerCase() === "true";
    }

    public static capitalizeFirstLetter(str:string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static countWords(s:string){
        s = s.replace(/(^\s*)|(\s*$)/gi,"");//exclude  start and end white-space
        s = s.replace(/[ ]{2,}/gi," ");//2 or more space to 1
        s = s.replace(/\n /,"\n"); // exclude newline with a start spacing
        return s.split(' ').length;
    }

    public static format = function( ...args: any[]) {
        let s = arguments[0];
        for (let i = 0; i < arguments.length - 1; i++) {
            let reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }
        return s;
    };

    public static stringContains(str: string, keyword: string) {
        if(str === undefined || str === null) return false;
        return str.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    };


    public static isNullOrEmpty(str:string){
        return str == null || str == "";
    }

    public static parseServerContent(str:string) {
        return str.split('ITK_CRLF')
            .filter(line => line.trim().length)
            .map(line => {
                if( line.match(/-{2,}/g))
                    return '';
                if( line.match(/[A-Z]{4,}/g) &&
                    line.indexOf('NOT ALLOWED') < 0 &&
                    line.indexOf('DID YOU KNOW') < 0 &&
                    line.indexOf('READY TO SUBMIT') < 0)
                    return '<h3>' + line + '</h3>';

                return '<p>' + line + '</p>';
            })
            .join('');
    }

    static splitEmails(emails: string) {
        return emails.split(",").map(e=>e.trim());
    }
}

export class DateUtils {
    public static measureExecution(name:string, fun: ()=>any){
        console.time(name);
        let toReturn = fun();
        console.timeEnd(name)
        return toReturn;
    }

    public static concatZeroIfItOnlyHaveOneDigit(n:number){
        if(n<10) return "0"+n.toString();
        else return n.toString();
    }

    public static getDateAsString(date:Date){
        let year = date.getUTCFullYear ().toString();
        let month = DateUtils.concatZeroIfItOnlyHaveOneDigit((date.getUTCMonth() +1)); //INDEX starts in 0. Jan == 0
        let day = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCDate());
        let dateAsString = year + "-"+ month + "-" + day;

        return dateAsString;
    }

    public static getDateFromString(d:string){ //The format is YEAR-MONTH-DAY
        let [year, month, day] = d.split("-").map(x=>parseInt(x));
        return new Date(year, month-1, day);
    }
    public static getDateTimeFromString(d:string){
        return new Date(d);
    }


    public static getDateAndHoursAsStringITKFormat(date:Date){
        return DateUtils.getDateAsString(date) + "T" + TimeUtils.getHourAsString(date);
    }

    public static calculateQuarter (m:number){
        if(m<4) return 1;
        if(m<7) return 2;
        if(m<10) return 3;
        return 4;
    }


    public static getDateAndHoursAsStringJSFormat(date:Date){
        return DateUtils.getDateAsString(date) + " " + TimeUtils.getHourAsString(date);
    }

    public static FromITKFormatToJsFormat(date:string){
        return date.replace("T", " ");
    }

    public static getDateWithNDaysFromToday(n:number){
        return DateUtils.getDateWithNDaysFrom(n, new Date());
    }

    public static getDateWithNDaysAhead(n:number){
        return DateUtils.getDateWithNDaysFromToday(-n);
    }
    public static isDateStrictLess(a:Date, b:Date){
        return ( a > b && !DateUtils.areDatesEqual(a, b));
    }
    public static getDateWithNDaysAheadFromDate(date:Date, n:number){
        return DateUtils.getDateWithNDaysFrom(-n, date);
    }

    public static GetNow(){
        return new Date();
    }
    public static getFirstDayOfCurrentMonth(){
        let now = DateUtils.GetNow();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    public static getLastDayOfCurrentMonth(){
        let lastDayBuilder = DateUtils.GetNow();
        lastDayBuilder.setMonth(lastDayBuilder.getMonth() + 1);
        lastDayBuilder.setDate(-1);
        return lastDayBuilder;
    }

    public static getDateWithNDaysFrom(days:number, date:Date){
        let d = new Date(date.getTime());
        d.setTime( date.getTime() - days * 86400000 );
        return d;
    }

    public static createDate(year:number, month:number, day:number){
        return new Date(year, month-1, day);
    }

    public static areDatesEqual(a:Date, b:Date) {
        let msDateA =  Date.UTC(a.getFullYear(), a.getMonth()+1, a.getDate());
        let msDateB =  Date.UTC(b.getFullYear(), b.getMonth()+1, b.getDate());
        return msDateA == msDateB;
    }

    public static IsOlder(a:Date, b:Date) {
        let msDateA =  DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        let msDateB =  DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA < msDateB;
    }

    public static IsNewer(a:Date, b:Date) {
        let msDateA =  DateUtils.createDate(a.getFullYear(), a.getMonth(), a.getDate());
        let msDateB =  DateUtils.createDate(b.getFullYear(), b.getMonth(), b.getDate());
        return msDateA > msDateB;
    }


    public static getDifferenceInDays(a:Date, b:Date){
        let days = new Date(<any>a - <any>b).getDate() - 1;
        return days;
    }
}


export class Period {
    static DEFAULT_DAYS_INTERVAL = 10;
    private from: Date;
    private to: Date;

    constructor(from: Date, to: Date) {
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

    getDateInPeriod(index: number) {
        let dat = new Date(this.getFrom().getTime());
        dat.setDate(dat.getDate() + index);
        if (this.isDateInPeriod(dat))
            return dat;
        throw new Error("The index is out of the date interval");
    }

    getIndexOf(date: Date) {
        if (!this.isDateInPeriod(date))
            throw new Error("The index is out of the date interval");
        return DateUtils.getDifferenceInDays(date, this.from);
    }
    toString(){
        return `${this.getFrom().toString()} - ${this.getTo().toString()}`;
    }
    isDateInPeriod(date: Date) {
        return this.from <= date && this.to >= date
            || DateUtils.areDatesEqual(this.to, date) || DateUtils.areDatesEqual(this.from, date);
    }

    static createNewPeriodWith(to: Date) {
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

    static getNextPeriodFrom(lastPeriod: Period) {
        return Period.createNewPeriodWith(lastPeriod.getFrom());
    }

    static areEquals(a: Period, b: Period) {
        return a.getFrom().getDay() === b.getFrom().getDay() &&
            a.getFrom().getMonth() === b.getFrom().getMonth() &&
            a.getFrom().getFullYear() === b.getFrom().getFullYear() &&
            a.getTo().getDay() === b.getTo().getDay() &&
            a.getTo().getMonth() === b.getTo().getMonth() &&
            a.getTo().getFullYear() === b.getTo().getFullYear();
    }

    static fromJSON(json:any){
        return new Period(DateUtils.getDateTimeFromString(json.from), DateUtils.getDateTimeFromString(json.to));
    }
    toCompatibleJSON(){
        return {
            from: DateUtils.getDateAsString(this.from),
            to: DateUtils.getDateAsString(this.from),
        }
    }

}

class TimeUtils {
    public static getHourAsString(date:Date){
        let hour = date.getUTCHours ().toString();
        let minutes = date.getUTCMinutes().toString();
        let seconds = date.getUTCSeconds().toString();
        let milliseconds = date.getUTCMilliseconds().toString();
        return hour + ":"+ minutes + ":" + seconds +"." + milliseconds;
    }

    public static getDefaultTimeInterval(){
        return 500;
    }

    public static getTimeFormatted(date:Date){
        let hour = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCHours ());
        let minutes = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCMinutes());
        let seconds = DateUtils.concatZeroIfItOnlyHaveOneDigit(date.getUTCSeconds());
        if (isNaN(parseInt(hour))) return null;
        return hour + ":"+ minutes + ":" + seconds;
    }

    public static getTimezoneOffset(date:Date) {
        let offset = date.getTimezoneOffset();
        let sign = (offset > 0) ? "-" : "+";
        let padWithLeadingZero = function (value:Number) {
            return value < 10 ? '0' + value : value;
        };
        return sign + padWithLeadingZero(Math.floor(Math.abs(offset) / 60)) + ":" + padWithLeadingZero(offset % 60);
    }
}