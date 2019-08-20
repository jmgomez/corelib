import { MonadUtils } from "./Utils";
import * as Rx from "rxjs";
import { Maybe } from "tsmonad";

export class SimpleCache<T> {
    data : T;
    getValue : ()=>Rx.Observable<T>
    invalidateCachePolicy: ()=>Rx.Observable<any>;

    static timePolicyFromRx (delay:number){
        return () => Rx.Observable.timer(0, delay)
    }

    static create<T>( getValue : ()=>Rx.Observable<T>, invalidateCachePolicy: ()=>Rx.Observable<any>)   {
        let simpleCache = new SimpleCache<T>();
        simpleCache.getValue = getValue;
        simpleCache.invalidateCachePolicy = invalidateCachePolicy;
        simpleCache.invalidateCachePolicy()
            .subscribe(d => {
                    simpleCache.data = null;
        })
        return simpleCache;
    }

    cleanCache(){
        this.data = null;
    }

    tryGet<T>(){
        return MonadUtils.CreateMaybeFromNullable(this.data);
    }

    get() : Rx.Observable<Maybe<T>>{
       return MonadUtils.mapToRxFallback(this.tryGet(), 
                                         () => this.getValue()
                                                .do(dataToCache => { this.data = dataToCache})
                                                .map(MonadUtils.CreateMaybeFromNullable))
                       
    }
    set(value:T){
        this.data = value;
    }
    del(){
        this.data = null;
    }
}

