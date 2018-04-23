import * as Bacon from "baconjs";
import { Response } from 'node-fetch';
import * as TsMonad from 'tsmonad';
import { Entity } from "./Entity";
import * as Rx from "rxjs/Rx";
export interface IRepository<T extends Entity> {
    add: (value: T) => void;
    addMany: (value: T[]) => void;
    update: (value: T) => void;
    updateAll: (value: T[]) => void;
    remove: (value: T) => void;
    removeAllBy: (query: any) => void;
    removeAll: () => void;
    getAll: () => T[];
    getAllBy: (query: any) => T[];
    getById: (id: string) => TsMonad.Maybe<T>;
    getOneBy: (query: any) => TsMonad.Maybe<T>;
}
export declare type ReqHelper = {
    makeRequest: (url: string, method: string, data?: any, onError?: (r: Response) => void) => Rx.Observable<any>;
};
export declare class APIRepository<T extends Entity> implements IRxRepository<T> {
    endPoint: string;
    private requestHelper;
    onError(r: Response): void;
    constructor(endPoint: string, reqHelper: ReqHelper);
    getAll(): Rx.Observable<any>;
    add(entity: T): Rx.Observable<any>;
    addMany(entities: T[]): Rx.Observable<any>;
    update(entity: T): Rx.Observable<any>;
    remove(entity: T): Rx.Observable<any>;
    getById(id: string): Rx.Observable<TsMonad.Maybe<any>>;
    removeAllBy(query: any): Rx.Observable<any[]>;
    getAllBy(query: any): Rx.Observable<any>;
    updateAll: (value: T[]) => Rx.Observable<T[]>;
    removeAll: () => Rx.Observable<any>;
    getOneBy: () => Rx.Observable<TsMonad.Maybe<T>>;
}
export declare class InMemoryRepository<T extends Entity> implements IRepository<T> {
    elems: T[];
    constructor(elems?: T[]);
    add(e: T): void;
    addMany(entities: T[]): void;
    remove(e: T): void;
    removeAll(): void;
    update(e: T): void;
    updateAll(e: T[]): void;
    getAll(): T[];
    getAllBy(query: any): T[];
    getById(id: string): TsMonad.Maybe<T>;
    getOneBy(query: any): TsMonad.Maybe<T>;
    removeAllBy(query: any): void;
    toReactiveRepository(): SyncReactiveRepository<T>;
    toRxRepository(): SyncRxRepository<T>;
}
export declare class SyncRxRepository<T extends Entity> implements IRxRepository<T> {
    repo: IRepository<T>;
    constructor(repo: IRepository<T>);
    add(e: T): Rx.Observable<T>;
    addMany(entities: T[]): Rx.Observable<T[]>;
    remove(e: T): Rx.Observable<any>;
    removeAll(): Rx.Observable<any>;
    removeAllBy(query: any): Rx.Observable<any>;
    update(e: T): Rx.Observable<T>;
    updateAll(e: T[]): Rx.Observable<T[]>;
    getAll(): Rx.Observable<T[]>;
    getAllBy(query: any): Rx.Observable<T[]>;
    getById(id: string): Rx.Observable<TsMonad.Maybe<T>>;
    getOneBy(query: any): Rx.Observable<TsMonad.Maybe<T>>;
    asInMemoryRepository(): InMemoryRepository<T>;
}
export declare class SyncReactiveRepository<T extends Entity> implements IReactiveRepository<T> {
    repo: IRepository<T>;
    constructor(repo: IRepository<T>);
    add(e: T): Bacon.EventStream<{}, T>;
    addMany(entities: T[]): Bacon.EventStream<{}, T[]>;
    remove(e: T): Bacon.EventStream<{}, string>;
    removeAll(): Bacon.EventStream<{}, any>;
    removeAllBy(query: any): Bacon.EventStream<{}, any>;
    update(e: T): Bacon.EventStream<{}, T>;
    updateAll(e: T[]): Bacon.EventStream<{}, T[]>;
    getAll(): Bacon.EventStream<{}, T[]>;
    getAllBy(query: any): Bacon.EventStream<any, T[]>;
    getById(id: string): Bacon.EventStream<{}, TsMonad.Maybe<T>>;
    getOneBy(query: any): Bacon.EventStream<{}, TsMonad.Maybe<T>>;
    asInMemoryRepository(): InMemoryRepository<T>;
}
export interface IReactiveRepository<T extends Entity> {
    add: (value: T) => Bacon.EventStream<any, T>;
    addMany: (value: T[]) => Bacon.EventStream<any, T[]>;
    update: (value: T) => Bacon.EventStream<any, T>;
    updateAll: (value: T[]) => Bacon.EventStream<any, T[]>;
    remove: (value: T) => Bacon.EventStream<any, any>;
    removeAllBy: (query: any) => Bacon.EventStream<any, any>;
    removeAll: () => Bacon.EventStream<any, T[]>;
    getAll: () => Bacon.EventStream<any, T[]>;
    getAllBy: (query: any) => Bacon.EventStream<any, T[]>;
    getById: (id: string) => Bacon.EventStream<any, TsMonad.Maybe<T>>;
    getOneBy: (query: any) => Bacon.EventStream<any, TsMonad.Maybe<T>>;
}
export declare class ReactiveFromRxRepository<T extends Entity> implements IReactiveRepository<T> {
    repo: IRxRepository<T>;
    constructor(repo: IRxRepository<T>);
    add(e: T): Bacon.EventStream<any, T>;
    addMany(entities: T[]): Bacon.EventStream<any, T[]>;
    remove(e: T): Bacon.EventStream<any, any>;
    removeAll(): Bacon.EventStream<any, T[]>;
    removeAllBy(query: any): Bacon.EventStream<any, any>;
    update(e: T): Bacon.EventStream<any, T>;
    updateAll(e: T[]): Bacon.EventStream<any, T[]>;
    getAll(): Bacon.EventStream<any, T[]>;
    getAllBy(query: any): Bacon.EventStream<any, T[]>;
    getById(id: string): Bacon.EventStream<any, TsMonad.Maybe<T>>;
    getOneBy(query: any): Bacon.EventStream<any, TsMonad.Maybe<T>>;
    static create<T extends Entity>(reactiveRepo: IRxRepository<T>): ReactiveFromRxRepository<T>;
}
export declare class RxFromReactiveRepository<T extends Entity> implements IRxRepository<T> {
    repo: IReactiveRepository<T>;
    constructor(repo: IReactiveRepository<T>);
    add(e: T): Rx.Observable<T>;
    addMany(entities: T[]): Rx.Observable<T[]>;
    remove(e: T): Rx.Observable<any>;
    removeAll(): Rx.Observable<T[]>;
    removeAllBy(query: any): Rx.Observable<any>;
    update(e: T): Rx.Observable<T>;
    updateAll(e: T[]): Rx.Observable<T[]>;
    getAll(): Rx.Observable<T[]>;
    getAllBy(query: any): Rx.Observable<T[]>;
    getById(id: string): Rx.Observable<TsMonad.Maybe<T>>;
    getOneBy(query: any): Rx.Observable<TsMonad.Maybe<T>>;
    static create<T extends Entity>(reactiveRepo: IReactiveRepository<T>): RxFromReactiveRepository<T>;
}
export interface IRxRepository<T extends Entity> {
    add: (value: T) => Rx.Observable<T>;
    addMany: (value: T[]) => Rx.Observable<T[]>;
    update: (value: T) => Rx.Observable<T>;
    updateAll: (value: T[]) => Rx.Observable<T[]>;
    remove: (value: T) => Rx.Observable<any>;
    removeAllBy: (query: any) => Rx.Observable<any>;
    removeAll: () => Rx.Observable<T[]>;
    getAll: () => Rx.Observable<T[]>;
    getAllBy: (query: any) => Rx.Observable<T[]>;
    getById: (id: string) => Rx.Observable<TsMonad.Maybe<T>>;
    getOneBy: (query: any) => Rx.Observable<TsMonad.Maybe<T>>;
}
