"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityQuery_1 = require("../EntityQuery");
var NodeUtils_1 = require("./NodeUtils");
var express_1 = require("express");
var RepositoryQuery_1 = require("../RepositoryQuery");
var Route = /** @class */ (function () {
    function Route(repo) {
        var _this = this;
        this.getEntities = function (req) { return req['entities']; };
        this.setEntities = function (req, res, next) {
            _this.repo.getAll().onValue(function (entities) {
                EntityQuery_1.EntityQuery.tryGetById(entities, req.params.id)
                    .caseOf({
                    just: function (e) {
                        req['entities'] = entities;
                        next();
                    },
                    nothing: function () {
                        res.sendStatus(404);
                    }
                });
            });
        };
        this.getAll = function (req, res) {
            _this.repo.getAll().onValue(function (entities) {
                return res.status(200).json(entities);
            });
        };
        this.create = function (req, res) {
            var stream = Array.isArray(req.body) ?
                _this.repo.addMany(req.body)
                : _this.repo.add(req.body);
            stream.onValue(function (e) { return res.status(201).json(req.body); });
        };
        this.getAllBy = function (req, res) {
            var query = req.query;
            var stream = _this.repo.getAllBy(RepositoryQuery_1.RepositoryQuery.toMongoQuery(query));
            stream.onValue(function (v) { return res.status(200).json(v); });
            stream.onError(function (e) { return res.status(500).send(e); });
        };
        this.deleteAllBy = function (req, res) {
            var query = req.query;
            var stream = _this.repo.removeAllBy(RepositoryQuery_1.RepositoryQuery.toMongoQuery(query));
            stream.onValue(function (v) { return res.status(200).json(v); });
            stream.onError(function (e) { return res.status(500).send(e); });
        };
        this.getById = function (req, res) {
            var id = req.params.id;
            var entity = EntityQuery_1.EntityQuery.getById(_this.getEntities(req), id);
            res.status(200).json(entity);
        };
        this.update = function (req, res) {
            _this.repo.update(req.body).onValue(function (e) {
                return res.status(200).json(e);
            });
        };
        this.delete = function (req, res) {
            var id = req.params.id;
            var entity = EntityQuery_1.EntityQuery.getById(_this.getEntities(req), id);
            _this.repo.remove(entity).onValue(function () { return res.sendStatus(200); });
        };
        this.repo = repo;
    }
    Route.prototype.configureRouter = function () {
        var router = express_1.Router();
        router.route("/").get(this.getAll).post(this.create).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/:id").all(this.setEntities).get(this.getById).put(this.update).delete(this.delete).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/deleteall").get(this.deleteAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/getallby").get(this.getAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        return router;
    };
    return Route;
}());
exports.Route = Route;
function routerFor(repo, fromJSON) {
    var router = express_1.Router();
    var getEntitities = function (req) { return req['entities']; };
    router.route("/")
        .get(function (req, res) {
        return repo.getAll().onValue(function (entities) {
            return res.status(200).json(entities);
        });
    })
        .post(function (req, res) {
        var newEntity = fromJSON(req.body);
        repo.add(newEntity)
            .onValue(function (e) { return res.status(201).json(newEntity); });
    });
    router.route("/:id")
        .all(function (req, res, next) {
        repo.getAll().onValue(function (entities) {
            EntityQuery_1.EntityQuery.tryGetById(entities, req.params.id)
                .caseOf({
                just: function (e) {
                    req['entities'] = entities;
                    next();
                },
                nothing: function () {
                    res.sendStatus(404);
                }
            });
        });
    })
        .get(function (req, res) {
        var id = req.params.id;
        var entity = EntityQuery_1.EntityQuery.getById(getEntitities(req), id);
        res.status(200).json(entity);
    })
        .put(function (req, res) {
        var updatedEntity = fromJSON(req.body);
        repo.update(updatedEntity).onValue(function (e) {
            return res.status(200).json(e);
        });
    })
        .options(NodeUtils_1.NodeUtils.okOptions)
        .delete(function (req, res) {
        var id = req.params.id;
        var entity = EntityQuery_1.EntityQuery.getById(getEntitities(req), id);
        repo.remove(entity).onValue(function () { return res.sendStatus(200); });
    });
    return router;
}
exports.routerFor = routerFor;
