import { IRepository, IRxRepository, SyncRxRepository } from "../Repository";
import * as Rx from "rxjs/Rx";
import * as TsMonad from 'tsmonad';
import { Db } from "mongodb";
import { Entity } from "../Entity";
export declare class FileLocalRepository<T extends Entity> implements IRepository<T> {
    entities: T[];
    name: string;
    fromJSON: (json: any) => T;
    constructor(name: string, fromJSON: (json: any) => T, optionalData?: T[]);
    getAll(): T[];
    addMany(entities: T[]): void;
    persist(): void;
    add(entity: T): void;
    update(entity: T): void;
    updateAll(entities: T[]): void;
    remove(entity: T): void;
    removeAll(): void;
    removeAllBy(query: any): void;
    getAllBy(query: any): T[];
    getById(id: string): TsMonad.Maybe<T>;
    getOneBy(query: any): TsMonad.Maybe<T>;
    toRxRepository(): SyncRxRepository<T>;
    private loadFromFile;
}
export declare class MongoRepository<T extends Entity> implements IRxRepository<T> {
    fromJSON: (json: any) => T;
    collection: string;
    db: Db;
    constructor(db: Db, collection: string, fromJSON: (json: any) => T);
    toMongoEntity<E extends {
        id: string;
    }>(e: E): E;
    fromMongoToEntity: (e: any) => T;
    fromMongoToEntities: (e: any[]) => T[];
    executeCommandAndCloseConn<E, T>(cmd: (db: Db) => Rx.Observable<T>): Rx.Observable<T>;
    getAll(): Rx.Observable<T[]>;
    getAllBy(query: any, exclude?: any): Rx.Observable<T[]>;
    add(value: T): Rx.Observable<T>;
    addMany(values: T[]): Rx.Observable<T[]>;
    update(value: T): Rx.Observable<T>;
    getById(id: string): Rx.Observable<TsMonad.Maybe<T>>;
    getOneBy(query: any): Rx.Observable<TsMonad.Maybe<T>>;
    remove(value: T): Rx.Observable<any>;
    updateAll: (value: T[]) => Rx.Observable<T[]>;
    removeAllBy(query: any): Rx.Observable<any>;
    removeAll: () => Rx.Observable<any>;
}
//# sourceMappingURL=ServerRepositories.d.ts.map