"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var R = __importStar(require("ramda"));
var EntityQuery_1 = require("../EntityQuery");
var NodeUtils_1 = require("./NodeUtils");
var express_1 = require("express");
var RepositoryQuery_1 = require("../RepositoryQuery");
var Route = /** @class */ (function () {
    function Route(repo) {
        var _this = this;
        this.getEntities = function (req) { return req['entities']; };
        this.setEntities = function (req, res, next) {
            _this.repo.getAll().subscribe(function (entities) {
                req['entities'] = entities;
                next();
            });
        };
        this.getAll = function (req, res) {
            _this.repo.getAll().subscribe(function (entities) {
                return res.status(200).json(entities);
            });
        };
        this.deleteAll = function (req, res) {
            _this.repo.removeAll().subscribe(function (entities) {
                return res.status(200);
            });
        };
        this.create = function (req, res) {
            Array.isArray(req.body) ?
                _this.repo.addMany(req.body).subscribe(NodeUtils_1.NodeUtils.writeResponse(res, 201), NodeUtils_1.NodeUtils.writeError(res))
                : _this.repo.add(req.body).subscribe(NodeUtils_1.NodeUtils.writeResponse(res, 201), NodeUtils_1.NodeUtils.writeError(res));
        };
        this.getAllBy = function (req, res) {
            var query = req.query;
            _this.repo.getAllBy(RepositoryQuery_1.RepositoryQuery.fromQueryStringTo(query, _this.repo))
                .subscribe(NodeUtils_1.NodeUtils.writeResponse(res), NodeUtils_1.NodeUtils.writeError(res));
        };
        this.deleteAllBy = function (req, res) {
            var query = req.query;
            _this.repo.removeAllBy(RepositoryQuery_1.RepositoryQuery.fromQueryStringTo(query, _this.repo))
                .subscribe(NodeUtils_1.NodeUtils.writeResponse(res), NodeUtils_1.NodeUtils.writeError(res));
        };
        this.getById = function (req, res) {
            var partialGetOrNotFound = function (maybeEntity) { return _this.executeOrNotFound(maybeEntity, res, NodeUtils_1.NodeUtils.writeResponse(res)); };
            R.compose(partialGetOrNotFound, _this.tryGetByIdParam)(req);
        };
        this.update = function (req, res) {
            var updateFromRepo = function (e) { return _this.repo.update(req.body).subscribe(NodeUtils_1.NodeUtils.writeResponse(res), NodeUtils_1.NodeUtils.writeError(res)); };
            var partialGetOrNotFound = function (maybeEntity) { return _this.executeOrNotFound(maybeEntity, res, updateFromRepo); };
            R.compose(partialGetOrNotFound, _this.tryGetByIdParam)(req);
        };
        this.delete = function (req, res) {
            var deleteFromRepo = function (e) { return _this.repo.remove(e).subscribe(NodeUtils_1.NodeUtils.writeResponse(res), NodeUtils_1.NodeUtils.writeError(res)); };
            var partialGetOrNotFound = function (maybeEntity) { return _this.executeOrNotFound(maybeEntity, res, deleteFromRepo); };
            R.compose(partialGetOrNotFound, _this.tryGetByIdParam)(req);
        };
        this.executeOrNotFound = function (maybeEntity, res, getEntity) {
            maybeEntity.caseOf({
                just: function (e) {
                    getEntity(e);
                },
                nothing: function () {
                    res.sendStatus(404);
                }
            });
        };
        this.tryGetByIdParam = function (req) {
            var id = req.params.id;
            return EntityQuery_1.EntityQuery.tryGetById(_this.getEntities(req), id);
        };
        this.repo = repo;
    }
    Route.prototype.configureRouter = function () {
        var router = express_1.Router();
        router.route("/").get(this.getAll).post(this.create).delete(this.deleteAll).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/deleteall").get(this.deleteAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/deleteallby").delete(this.deleteAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/getallby").get(this.getAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/:id").all(this.setEntities).get(this.getById).put(this.update).delete(this.delete).options(NodeUtils_1.NodeUtils.okOptions);
        return router;
    };
    return Route;
}());
exports.Route = Route;
//# sourceMappingURL=Route.js.map