import { Entity } from "./Entity";
export declare class EntityCommand<T extends Entity> {
    static updateField<T extends Entity, K extends keyof T>(e: T, key: K, value: any): T;
}
//# sourceMappingURL=EntityCommand.d.ts.map