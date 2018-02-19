/// <reference types="express" />
import { IReactiveRepository } from "../Repository";
import { Entity } from "../Entity";
import { Router } from "express";
export declare function routerFor<T extends Entity>(repo: IReactiveRepository<T>, fromJSON: (json: any) => T): Router;
