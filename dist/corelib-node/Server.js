"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const PORT = 8001;
class Server {
    constructor(port) {
        this.port = port;
        this.app = express();
        this.app.use(body_parser_1.json({ limit: "150mb", type: 'application/json' }));
        this.app.use(body_parser_1.urlencoded({ extended: true }));
    }
    setupRoutes() {
    }
    addRoute(basePath, router) {
        this.app.use(basePath, router);
    }
    start() {
        this.setupRoutes();
        this.server = this.app.listen(this.port, () => {
            console.log("info", "--> Server successfully started at port %d", this.port);
        });
    }
    end() {
        this.server.close();
        console.log("info", "--> Server closed. The port %d is available again", this.port);
    }
}
exports.Server = Server;
