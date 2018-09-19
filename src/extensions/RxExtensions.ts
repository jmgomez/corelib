import { IRxRepository } from "../Repository";
import * as Rx from 'rxjs'; 
import { Entity } from "../Entity";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";

declare module "rxjs/Observable" {

    export interface Observable<T> {
            measure: (label: string,  repoCaller?: IRxRepository<Entity>) => Observable<T>;
            notify: ( body: string, error?:string)=> Observable<T>;
            notifyWarning: ( body: string, error?:string)=> Observable<T>;
            
        }
    }
   
export function measureStream<T>(this: PromiseObservable<T>, label: string, repoCaller: IRxRepository<Entity>) {
        // let stream: PromiseObservable<T> = this as any;
        console.time(label);
        return this.map(result => {
            console.timeEnd(label);
            if(repoCaller){
                let r = repoCaller as any;
                if (r.db != undefined) {
                      Rx.Observable.fromPromise(r.db.command({ getLastRequestStatistics: 1 })).subscribe(console.log, e=> console.log("this is mongo"));
                }
            }
            return result;
        })
}


export function initExtensions(){
   
    Rx.Observable.prototype.measure = measureStream; 
}

initExtensions();