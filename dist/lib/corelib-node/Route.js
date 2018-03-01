"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var R = require("ramda");
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
                req['entities'] = entities;
                next();
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
            "";
        };
        this.getAllBy = function (req, res) {
            var query = req.query;
            "";
            var stream = _this.repo.getAllBy(RepositoryQuery_1.RepositoryQuery.fromQueryStringTo(query, _this.repo));
            stream.onValue(function (v) { return res.status(200).json(v); });
            stream.onError(function (e) { return res.status(500).send(e); });
        };
        this.deleteAllBy = function (req, res) {
            var query = req.query;
            var stream = _this.repo.removeAllBy(RepositoryQuery_1.RepositoryQuery.fromQueryStringTo(query, _this.repo));
            stream.onValue(function (v) { return res.status(200).json(v); });
            stream.onError(function (e) { return res.status(500).send(e); });
        };
        this.getById = function (req, res) {
            // let id = req.params.id;
            // let maybeEntity = EntityQuery.tryGetById(this.getEntities(req), id);
            // maybeEntity.caseOf({
            //     just: entity=> res.status(200).json(entity),
            //     nothing: () => res.sendStatus(404)
            // });
            //
            var sendEntity = function (e) {
                return res.status(200).json(e);
            };
            var partialGetOrNotFound = function (maybeEntity) { return _this.executeOrNotFound(maybeEntity, res, sendEntity); };
            R.compose(partialGetOrNotFound, _this.tryGetByIdParam)(req);
        };
        this.update = function (req, res) {
            var updateFromRepo = function (e) {
                var stream = _this.repo.update(req.body);
                stream.onValue(function (e) {
                    return res.status(200).json(e);
                });
                stream.onError(function (e) { return res.status(500).send(e); });
            };
            var partialGetOrNotFound = function (maybeEntity) { return _this.executeOrNotFound(maybeEntity, res, updateFromRepo); };
            R.compose(partialGetOrNotFound, _this.tryGetByIdParam)(req);
        };
        this.delete = function (req, res) {
            var deleteFromRepo = function (e) {
                var stream = _this.repo.remove(e);
                stream.onValue(function (e) {
                    res.status(200).json(e);
                    return Bacon.End;
                });
                stream.onError(function (e) { return res.status(500).send(e); });
            };
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
        router.route("/").get(this.getAll).post(this.create).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/deleteall").get(this.deleteAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/getallby").get(this.getAllBy).options(NodeUtils_1.NodeUtils.okOptions);
        router.route("/:id").all(this.setEntities).get(this.getById).put(this.update).delete(this.delete).options(NodeUtils_1.NodeUtils.okOptions);
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
//# sourceMappingURL=Route.js.map