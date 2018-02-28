import * as Bacon from "baconjs";
import { Response } from 'node-fetch';
import * as TsMonad from 'tsmonad';
import { Entity } from "./Entity";
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
    makeRequest: (url: string, method: string, data?: any, onError?: (r: Response) => void) => Bacon.EventStream<any, any>;
};
export declare class APIRepository<T extends Entity> implements IReactiveRepository<T> {
    endPoint: string;
    fromJSON: (json: any) => T;
    private requestHelper;
    onError(r: Response): void;
    constructor(endPoint: string, fromJSON: (json: any) => T, reqHelper: ReqHelper);
    getAll(): Bacon.EventStream<any, any>;
    add(entity: T): Bacon.EventStream<any, T>;
    addMany(entities: T[]): Bacon.EventStream<any, any>;
    update(entity: T): Bacon.EventStream<any, T>;
    remove(entity: T): Bacon.EventStream<any, any>;
    getById(id: string): Bacon.EventStream<any, TsMonad.Maybe<any>>;
    removeAllBy(query: any): Bacon.EventStream<{}, any>;
    getAllBy(query: any): Bacon.EventStream<any, T[]>;
    updateAll: (value: T[]) => Bacon.EventStream<any, T[]>;
    removeAll: () => Bacon.EventStream<any, T[]>;
    getOneBy: () => Bacon.EventStream<any, TsMonad.Maybe<T>>;
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
