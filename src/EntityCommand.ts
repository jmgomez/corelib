import { Entity } from "./Entity";

export class EntityCommand <T extends Entity>{
    static updateField<T extends Entity, K extends keyof T>(e:T, key:K, value:any){
        e[key] = value;
        return e;
    } 
}