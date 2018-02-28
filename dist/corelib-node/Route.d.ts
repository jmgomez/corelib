/// <reference types="express" />
import { IReactiveRepository } from "../Repository";
import { Entity } from "../Entity";
import { Router, Request, Response, NextFunction } from "express";
export declare class Route<T extends Entity> {
    repo: IReactiveRepository<T>;
    constructor(repo: IReactiveRepository<T>);
    configureRouter<T extends Entity>(): Router;
    getEntities: (req: any) => Entity[];
    setEntities: (req: Request, res: Response, next: NextFunction) => void;
    getAll: (req: Request, res: Response) => void;
    create: (req: Request, res: Response) => void;
    getAllBy: (req: Request, res: Response) => void;
    deleteAllBy: (req: Request, res: Response) => void;
    getById: (req: Request, res: Response) => void;
    update: (req: Request, res: Response) => void;
    delete: (req: Request, res: Response) => void;
    private getOrNotFound;
    private tryGetByIdParam;
}
export declare function routerFor<T extends Entity>(repo: IReactiveRepository<T>, fromJSON: (json: any) => T): Router;
