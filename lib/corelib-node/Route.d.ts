import { IRxRepository } from "../Repository";
import { Entity } from "../Entity";
import { Router, Request, Response, NextFunction } from "express";
export declare class Route<T extends Entity> {
    repo: IRxRepository<T>;
    constructor(repo: IRxRepository<T>);
    configureRouter<T extends Entity>(): Router;
    getEntities: (req: any) => Entity[];
    setEntities: (req: Request, res: Response, next: NextFunction) => void;
    getAll: (req: Request, res: Response) => void;
    deleteAll: (req: Request, res: Response) => void;
    create: (req: Request, res: Response) => void;
    getAllBy: (req: Request, res: Response) => void;
    deleteAllBy: (req: Request, res: Response) => void;
    getById: (req: Request, res: Response) => void;
    update: (req: Request, res: Response) => void;
    delete: (req: Request, res: Response) => void;
    private executeOrNotFound;
    private tryGetByIdParam;
}
//# sourceMappingURL=Route.d.ts.map