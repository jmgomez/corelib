/// <reference types="express" />
/// <reference types="node" />
import { Express, Router } from "express";
import * as http from "http";
import { Route } from "./Routers";
import { Entity } from "../Entity";
export declare class Server {
    app: Express;
    server: http.Server;
    private port;
    constructor(port: number);
    protected setupRoutes(): void;
    addRouter(basePath: string, router: Router): void;
    addRoute(basePath: string, route: Route<Entity>): void;
    start(): void;
    end(): void;
}
