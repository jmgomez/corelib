import { Express, Router } from "express";
import * as http from "http";
import { Entity } from "../Entity";
import { Route } from "./Route";
export declare class Server {
    app: Express;
    server: http.Server;
    routes: Route<Entity>[];
    private port;
    constructor(port: number);
    protected setupRoutes(): void;
    addRouter(basePath: string, router: Router): void;
    addRoute(basePath: string, route: Route<Entity>): void;
    start(): void;
    end(): void;
}
//# sourceMappingURL=Server.d.ts.map