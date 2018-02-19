"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EntityQuery_1 = require("../EntityQuery");
const NodeUtils_1 = require("./NodeUtils");
const express_1 = require("express");
function routerFor(repo, fromJSON) {
    let router = express_1.Router();
    let getEntitities = (req) => req['entities'];
    router.route("/")
        .get((req, res) => repo.getAll().onValue(entities => {
        return res.status(200).json(entities);
    }))
        .post((req, res) => {
        let newEntity = fromJSON(req.body);
        repo.add(newEntity)
            .onValue(e => res.status(201).json(newEntity));
    });
    router.route("/:id")
        .all((req, res, next) => {
        repo.getAll().onValue(entities => {
            EntityQuery_1.EntityQuery.tryGetById(entities, req.params.id)
                .caseOf({
                just: e => {
                    req['entities'] = entities;
                    next();
                },
                nothing: () => {
                    res.sendStatus(404);
                }
            });
        });
    })
        .get((req, res) => {
        let id = req.params.id;
        let entity = EntityQuery_1.EntityQuery.getById(getEntitities(req), id);
        res.status(200).json(entity);
    })
        .put((req, res) => {
        let updatedEntity = fromJSON(req.body);
        repo.update(updatedEntity).onValue((e) => res.status(200).json(e));
    })
        .options(NodeUtils_1.NodeUtils.okOptions)
        .delete((req, res) => {
        let id = req.params.id;
        let entity = EntityQuery_1.EntityQuery.getById(getEntitities(req), id);
        repo.remove(entity).onValue(() => res.sendStatus(200));
    });
    return router;
}
exports.routerFor = routerFor;
