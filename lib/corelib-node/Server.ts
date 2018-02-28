import * as express from "express";
import {json, urlencoded} from "body-parser";
import {ErrorRequestHandler, Express, Request, RequestParamHandler, Response, Router} from "express";

import {
    InMemoryRepository, IReactiveRepository, IRepository,
    SyncReactiveRepository
} from "../Repository";
import * as fs from 'fs';
import {EntityQuery} from "../EntityQuery";

import * as http from "http";

import {NextFunction} from "express-serve-static-core";
import {Entity} from "../Entity";
import {Route} from "./Route";




const PORT: number = 8001;

export class Server {
    app: Express;
    server : http.Server;
    routes : Route<Entity>[];
    private port : number;

    constructor(port:number) {
        this.port = port;
        this.app = express();
        this.app.use(json({limit:"150mb", type:'application/json'}));
        this.app.use(urlencoded({ extended: true }));
        this.routes = [];
    }

    protected setupRoutes(): void {
      
    }

    public addRouter(basePath:string, router:Router){
        this.app.use(basePath, router);
    }

    public addRoute(basePath:string, route:Route<Entity>){
        this.routes.push(route)
        this.app.use(basePath, route.configureRouter());
    }

    public start(){
        this.setupRoutes();
        this.server = this.app.listen(this.port, () => {
            console.log("info", "--> Server successfully started at port %d", this.port);
        });
    }

    public end(){
        this.server.close();
        console.log("info", "--> Server closed. The port %d is available again", this.port);
    }
}









