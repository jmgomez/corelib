"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var body_parser_1 = require("body-parser");
var Utils_1 = require("../Utils");
var PORT = 8001;
var Server = /** @class */ (function () {
    function Server(port) {
        this.port = port;
        this.app = express();
        this.app.use(body_parser_1.json({ limit: "150mb", type: 'application/json' }));
        this.app.use(body_parser_1.urlencoded({ extended: true }));
        this.routes = [];
    }
    Server.prototype.setupRoutes = function () {
    };
    Server.prototype.addRouter = function (basePath, router) {
        this.app.use(basePath, router);
    };
    Server.prototype.addRoute = function (basePath, route) {
        this.routes.push(route);
        this.app.use(basePath, route.configureRouter());
    };
    Server.prototype.start = function () {
        var _this = this;
        this.setupRoutes();
        process.on("warning", function (e) {
            if (e.name == "MaxListenersExceededWarning" && e.type)
                console.log("EVENT NAME: ", e.type);
        });
        this.server = this.app.listen(this.port, function () {
            console.log("info", "--> Server " + Utils_1.ObjectUtils.getConstructorName(_this) + " successfully started at port %d", _this.port);
        });
    };
    Server.prototype.end = function () {
        this.server.close();
        console.log("info", "--> Server closed. The port %d is available again", this.port);
    };
    return Server;
}());
exports.Server = Server;
//# sourceMappingURL=Server.js.map