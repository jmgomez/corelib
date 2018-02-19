/// <reference types="express" />
/// <reference types="node" />
import { Express, Router } from "express";
import * as http from "http";
export declare class Server {
    app: Express;
    server: http.Server;
    private port;
    constructor(port: number);
    protected setupRoutes(): void;
    addRoute(basePath: string, router: Router): void;
    start(): void;
    end(): void;
}
