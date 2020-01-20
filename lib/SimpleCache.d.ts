import * as Rx from "rxjs";
import { Maybe } from "tsmonad";
export declare class SimpleCache<T> {
    data: T;
    getValue: () => Rx.Observable<T>;
    invalidateCachePolicy: () => Rx.Observable<any>;
    static timePolicyFromRx(delay: number): () => Rx.Observable<number>;
    static create<T>(getValue: () => Rx.Observable<T>, invalidateCachePolicy: () => Rx.Observable<any>): SimpleCache<T>;
    cleanCache(): void;
    tryGet<T>(): Maybe<T>;
    get(): Rx.Observable<Maybe<T>>;
    set(value: T): void;
    del(): void;
}
//# sourceMappingURL=SimpleCache.d.ts.map