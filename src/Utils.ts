import moment from 'moment';
import _ from "underscore";
import * as Rx from 'rxjs'
import * as uuid from "uuid";
import * as TsMonad from "tsmonad";
import {Either, Maybe} from "tsmonad";

//This will be use to add functions that will be read using reflection in escenarios 
//of metaprogramming.
export class DynamicHelpers {

}

export class ObjectUtils {
    static getConstructorName (obj:object){
        if(obj.constructor.name == undefined)
            Object.defineProperty(Function.prototype, 'name', {
                get: function() {
                    var funcNameRegex = /function\s([^(]{1,})\(/;
                    var results = (funcNameRegex).exec((this).toString());
                    return (results && results.length > 1) ? results[1].trim() : "";
                },
                set: function(value) {}
            });

        return obj.constructor.name;
    }

    static removeIntersectionProps<T, K extends T>(field:K, props:T){
        let copy = JSON.parse(JSON.stringify(field)) as K;
        
        let deleteProp = p => delete copy[p]
        Object.keys(props)
               .forEach(deleteProp)
               
        return copy;
    }

    static addFunctionsToPrototype = (baseType:any, functionsModule:any) => {
        Object.keys(functionsModule)
            .filter(key=> ObjectUtils.getConstructorName((functionsModule[key] as any)) == "Function")
            .forEach(key=>{
                let func = functionsModule[key];
                if(!baseType.prototype[key])
                baseType.prototype[key] = function(args) { return func(this, args)};
            })
        }
    private static resolvePathAsArray = (pathValue:string[], obj:any) => {
        //array format => functionName, pathToArg1...pathToArgN
        let args = _.tail(pathValue).map(path=>ObjectUtils.extractValue(path, obj))
        let funName = _.head(pathValue); 
        let dynH = new DynamicHelpers();
        let val = (dynH[funName] as Function).call(_.head(args),... _.tail(args));
        return val;
    }

    private static extractValue = (path:string, obj:any) => {
        let index = (obj,i) => obj[i];
        let isPathArray = path.startsWith("[") && path.endsWith("]");
        let isObject = (path === "this");
        if(isPathArray)
            return ObjectUtils.resolvePathAsArray(JSON.parse(path), obj)

        let expandObject = ()=>  isObject ? obj : path.split('.').reduce(index, obj);

        return expandObject();

    }

    static expandObjectFromPath = (path:string, obj:any) => {  //retrieve the path (objext.innerObject) to the actual value
        try{
            
            let expandedObject = ObjectUtils.extractValue(path, obj);
            if(expandedObject && ObjectUtils.getConstructorName(expandedObject) == "Function"){
                let pathToField = _.tail(path.split('.').reverse()).reverse().reduce((a,b)=> a.concat(b));
                expandedObject = expandedObject.bind(obj[pathToField])();
            }
            return MonadUtils.CreateMaybeFromNullable(expandedObject);
        } catch(e){
            // console.warn(e);
            // console.error("FALLA EN ", path, obj)
            return TsMonad.Maybe.nothing();
        }
    }

    static assignValueToObjectFromPath = (path:string, obj:any, val:any) =>{
        let maxDeep = path.split('.').length - 1;
        let index = (obj,key, i) => { 
            if(maxDeep == i)
                obj[key] = val;
            return obj[key];
        }
        let expandObject = ()=> path.split('.').reduce(index, obj);
        expandObject();
    
    }
}

export class RXUtils {
    
}
export class MonadUtils {


    static sequenceMb<T>(entities: Maybe<T>[]): Maybe<T[]> {
        let acc = [] as T[];
        let nothing = false;
        entities.forEach(e => e.caseOf({
            nothing: () => { nothing = true },
            just: e => acc.push(e)
        }));
        if ((nothing)) {
            console.log("REACH NOTHING")
            return Maybe.nothing<T[]>();
        }
        console.log("ACC ", acc)
        return Maybe.just(acc);

    }

    static mbConcat<T>(mba:Maybe<T>[], mbb:Maybe<T>) : Maybe<T>[]{
        return mba.concat(mbb)
    }

    static mbConcatR<T>(mba:Maybe<T[]>, mbb:Maybe<T[]>) : Maybe<T[]>{

        return mba.bind(m=>mbb.map(m2=> m.concat(m2)))
    }

    static sequenceA<T>(mentities: Maybe<T[]>): Maybe<T>[] {
        return mentities.caseOf({
            nothing: ()=> [Maybe.nothing<T>()],
            just: values => values.map(v=>Maybe.just(v))
        })

    }

    static mbJoinArr<T>(mb : Maybe<Maybe<T>[]>) : Maybe<T>[] {
        return mb.caseOf({
            nothing: ()=> [Maybe.nothing<T>()],
            just: m => m
        })
    }


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

    public static mbJoinRx <T> (mbval: Maybe<Rx.Observable<T>>) : Rx.Observable<Maybe<T>>{
        return mbval.caseOf({
           just: val => { 
               let b = val.map(Maybe.maybe)
               return b;
           },
           nothing: ()=> Rx.Observable.from([Maybe.nothing<T>()])  
       })
    }
   

    static eitherJoinRx<L, R>(either : Either<L, Rx.Observable<R>>) : Rx.Observable<Either<L, R>>{
        return either.caseOf({
             left : left => Rx.Observable.from([Either.left<L,R>(left)]),
             right : right => right.map(r => Either.right<L,R>(r))
         })
     }
     
    public static mapToRxFallback<T>(mb: Maybe<T>, func:()=> Rx.Observable<Maybe<T>>){
        return mb.caseOf({
                just: (val) => Rx.Observable.of(Maybe.maybe(val)),
                nothing: ()=> func(),
                });
    }

    public static booleanToMaybe<T> (value:T, condition:boolean) {
        return condition ? TsMonad.Maybe.maybe(value) : TsMonad.Maybe.nothing<T>();
    }
    
    public static mapLeft<L,R, T>(either: Either<L,R>, fun:(L)=>T) : Either<T,R> {
        return either.caseOf({
            left: l => Either.left<T,R>(fun(l)),
            right: r=> Either.right<T,R>(r),
        }); 
    }
    
    public static fromEitherToMaybe<L,R>(either:Either<L,R>){
        return either.caseOf({
            left: l=> Maybe.nothing<R>(),
            right: r => Maybe.maybe(r)
        })
    }

    static sequence<L, R>(entries: TsMonad.Either<L, R>[]): TsMonad.Either<L, R[]> {
        let acc = [];
        let errors = [];
        entries.map(e => e.caseOf({
            left: msg => errors.push(msg),
            right: te => acc.push(te)
        }));
        if (_.any(errors))
            return TsMonad.Either.left(_.first(errors))
        return TsMonad.Either.right(acc);

    }


    static reduceLeftToRx <L,R>( data: TsMonad.Either<L, Rx.Observable< TsMonad.Either<L, R>>>) : Rx.Observable< TsMonad.Either<L, R>>{
        return data.caseOf({
            left: l => Rx.Observable.of(TsMonad.Either.left(l)),
            right: r => r
        })
        
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

    public static test(arg1, arg2){
        return arg1 + arg2;
    }

    public static countWords(s:string){
        if (StringUtils.isNullOrEmpty(s))
            return 0;

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

    public static getDifferenceInMs(a:Date, b:Date){
        return Math.abs(a.valueOf() - b.valueOf());
    }

    public static getDifferenceInDays(a:Date | string, b:Date | string){
        const days = moment(b, "L").diff(moment(a, "L"), 'days');

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


export class TextReplacer {

    readonly args: TextReplacerConstructorArgs;

    constructor(args: TextReplacerConstructorArgs) {
        this.args = {...args};
    }

    replace(text: string) {
        return TextReplacer.replace({text, ...this.args});
    }
    static createArgs(text:string,
                      word: string,
                      replacement: string,
                      escapeLietral){
        return {
            text: text,
            word: word,
            replacement: replacement,
            escapeOpenerLiteral : escapeLietral,
            escapeCloserLiteral : escapeLietral
        }

    }

    static replace(args: ReplaceArgs): string {

        this.checkText(args.text);
        this.checkArgs(args);

        // no replacement needed
        if (args.text.length == 0 || args.word == args.replacement)
            return args.text;

        const areEscapeLiteralsDefined = args.escapeOpenerLiteral != null && args.escapeCloserLiteral != null;

        // no escape literals, no special case needed. we just use standard regex replacement
        if (!areEscapeLiteralsDefined)
            return this.replaceWithRegex(args);

        return this.replaceWithEscape(args);
    }

    private static replaceWithRegex(args: {text: string, word: string, replacement: string}) {
        return args.text.replace(new RegExp(args.word, "g"), args.replacement);
    }

    private static replaceWithEscape(args: ReplaceArgs): string {
        // word position
        let jw = 0;

        let lastWordPost: number;

        // means the first part of the word matched before
        let isReplaceActive = false;

        let result = "";

        // means a opener escape char was detected before
        let isEscapeActive = false;

        // we use this to track for not matching closer literal, to reprocess the last part of the text
        let lastOpenerPos: number;

        for (let jt = 0; jt < args.text.length; jt++) {

            const t = args.text.charAt(jt);

            if (isEscapeActive && t == args.escapeCloserLiteral) {
                result += args.text.substring(lastOpenerPos, jt + 1);
                isEscapeActive = false;
                lastOpenerPos = null;
                continue;
            }

            if (isEscapeActive && t != args.escapeCloserLiteral) {
                continue;
            }

            if (!isEscapeActive && t == args.escapeOpenerLiteral) {
                isEscapeActive = true;
                lastOpenerPos = jt;
                continue;
            }

            // !isEscapeActive && t != args.escapeOpenerLiteral

            const w = args.word.charAt(jw);

            if (isReplaceActive && t == w && (jw == args.word.length - 1)) {
                isReplaceActive = false;
                lastWordPost = null;
                jw = 0;
                result += args.replacement;
                continue;
            }

            if (isReplaceActive && t == w && (jw < args.word.length - 1)) {
                jw += 1;
                continue;
            }

            if (isReplaceActive && t != w) {
                result += args.text.substring(lastWordPost, jt + 1);
                isReplaceActive = false;
                lastWordPost = null;
                jw = 0;
                continue;
            }

            // !isReplaceActive

            if (t == w) {
                isReplaceActive = true;
                lastWordPost = jt;
                jw = 1;
                continue;
            }

            result += t;

        }

        // the closing escape literal was not found, so the unfinished escaped part hast to be reprocessed as standard text
        if (isEscapeActive) {
            const lastPart = args.text.substring(lastOpenerPos);

            const lastPartReplaced = this.replaceWithRegex({...args, text: lastPart} as any);
            result += lastPartReplaced;
        }

        return result;
    }

    private static checkArgs(args: TextReplacerConstructorArgs) {
        if (args.word == null || args.word.length == 0)
            throw "Word must be defined";

        if (args.replacement == null || args.replacement.length == 0)
            throw "Replacement must be defined";

        if ((args.escapeOpenerLiteral == null) != (args.escapeCloserLiteral == null))
            throw "Either define literals or not";

        if (args.escapeOpenerLiteral != null && args.escapeOpenerLiteral.length == 0)
            throw "Empty opener literal is not valid";

        if (args.escapeCloserLiteral != null && args.escapeCloserLiteral.length == 0)
            throw "Empty closer literal is not valid";

        if (args.escapeOpenerLiteral != null && args.word.indexOf(args.escapeOpenerLiteral) != -1)
            throw "Escape literals are not allowed inside the word that is going to be replaced";

        if (args.escapeCloserLiteral != null && args.word.indexOf(args.escapeCloserLiteral) != -1)
            throw "Escape literals are not allowed inside the word that is going to be replaced";

        if (args.escapeOpenerLiteral != null && args.escapeOpenerLiteral.length > 1)
            throw "Escape literals are only allowed to be one character size";

        if (args.escapeCloserLiteral != null && args.escapeCloserLiteral.length > 1)
            throw "Escape literals are only allowed to be one character size";
    }

    private static checkText(text: string) {
        if (text == null)
            throw "Text must be defined";
    }
}

interface TextReplacerConstructorArgs {
    word: string,
    replacement: string,
    escapeOpenerLiteral?: string,
    escapeCloserLiteral?: string
}

interface ReplaceArgs extends TextReplacerConstructorArgs {
    text: string
}