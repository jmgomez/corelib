import { IRxRepository } from "../Repository";
import { Entity } from "../Entity";
import { Router } from "express";
export declare class Route<T extends Entity> {
    repo: IRxRepository<T>;
    constructor(repo: IRxRepository<T>);
    configureRouter<T extends Entity>(): Router;
    getEntities: (req: any) => Entity[];
    setEntities: (req: any, res: any, next: any) => void;
    getAll: (req: any, res: any) => void;
    deleteAll: (req: any, res: any) => void;
    create: (req: any, res: any) => void;
    getAllBy: (req: any, res: any) => void;
    deleteAllBy: (req: any, res: any) => void;
    getById: (req: any, res: any) => void;
    update: (req: any, res: any) => void;
    delete: (req: any, res: any) => void;
    private executeOrNotFound;
    private tryGetByIdParam;
}
//# sourceMappingURL=Route.d.ts.map