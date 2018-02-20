"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EntityQuery_1 = require("../EntityQuery");
var NodeUtils_1 = require("./NodeUtils");
var express_1 = require("express");
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
