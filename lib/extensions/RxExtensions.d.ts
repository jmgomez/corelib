import { IRxRepository } from "../Repository";
import * as Rx from 'rxjs';
import { Entity } from "../Entity";
import { PromiseObservable } from "rxjs/observable/PromiseObservable";
declare module "rxjs/Observable" {
    interface Observable<T> {
        measure: (label: string, repoCaller?: IRxRepository<Entity>) => Observable<T>;
        notify: (body: string, error?: string) => Observable<T>;
        notifyWarning: (body: string, error?: string) => Observable<T>;
    }
}
export declare function measureStream<T>(this: PromiseObservable<T>, label: string, repoCaller: IRxRepository<Entity>): Rx.Observable<T>;
export declare function initExtensions(): void;
//# sourceMappingURL=RxExtensions.d.ts.map