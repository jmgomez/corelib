import * as TsMonad from 'tsmonad';
import { Entity } from "./Entity";
export declare class EntityQuery {
    static equals<T extends Entity>(a: T, b: T): boolean;
    static getBy<T extends Entity>(entities: T[], entity: T): any;
    static tryGetById<T extends Entity>(entities: T[], id: string): TsMonad.Maybe<T>;
    static getById<T extends Entity>(entities: T[], id: string): T;
    static exists<T extends Entity>(entities: T[], e: T): any;
    static existsById<T extends Entity>(entities: T[], id: string): any;
    static update<T extends Entity>(entities: T[], entity: T): T[];
    static delete<T extends Entity>(entities: T[], entity: T): T[];
    static getDifference<T extends Entity>(entities: T[], entitiesToRemove: T[]): T[];
    static union<T extends Entity>(E1: T[], E2: T[], areEqual: (entity1: T, entity2: T) => boolean): T[];
}
//# sourceMappingURL=EntityQuery.d.ts.map