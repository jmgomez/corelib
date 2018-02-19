"use strict";
const express_1 = require("express");
const Repository_1 = require("../core/Repository");
const Query_1 = require("../core/Query");
const Utils_1 = require("../core/Utils");
const Models_1 = require("../core/Models");
const Models_2 = require("./Models");
const ServerValidation_1 = require("./ServerValidation");
function okOptions(req, res) {
    res.sendStatus(200);
}
;
function routerFor(repo, fromJSON) {
    let router = express_1.Router();
    router.route("/")
        .get((req, res) => {
        res.status(200).json(repo.getAll());
    })
        .post((req, res) => {
        let newEntity = fromJSON(req.body);
        newEntity.id = Utils_1.NumberUtils.generateRandomId();
        repo.add(newEntity);
        res.status(201).json(newEntity);
    });
    router.route("/:id")
        .all((req, res, next) => {
        Query_1.EntityQuery.tryGetById(repo.getAll(), req.params.id).caseOf({
            just: e => next(),
            nothing: () => { res.sendStatus(404); }
        });
    })
        .get((req, res) => {
        let id = req.params.id;
        res.status(200).json(Query_1.EntityQuery.getById(repo.getAll(), id));
    })
        .post((req, res) => {
        let updatedEntity = fromJSON(req.body);
        repo.update(updatedEntity);
        res.status(200).json(updatedEntity);
    })
        .delete((req, res) => {
        let id = req.params.id;
        let entity = Query_1.EntityQuery.getById(repo.getAll(), id);
        repo.remove(entity);
        res.sendStatus(200);
    });
    return router;
}
exports.routerFor = routerFor;
function rrouterFor(repo, fromJSON) {
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
            Query_1.EntityQuery.tryGetById(entities, req.params.id)
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
        let entity = Query_1.EntityQuery.getById(getEntitities(req), id);
        res.status(200).json(entity);
    })
        .put((req, res) => {
        let updatedEntity = fromJSON(req.body);
        repo.update(updatedEntity).onValue((e) => res.status(200).json(e));
    })
        .options(okOptions)
        .delete((req, res) => {
        let id = req.params.id;
        let entity = Query_1.EntityQuery.getById(getEntitities(req), id);
        repo.remove(entity).onValue(() => res.sendStatus(200));
    });
    return router;
}
exports.rrouterFor = rrouterFor;
function routerForSub(loginService, repo, fromJSON) {
    let router = express_1.Router();
    let getEntitities = (req) => req['entities'];
    router.route("/")
        .get((req, res) => repo.getAllBy(Repository_1.RepositoryQuery.getBySub(loginService.getCredentials().sub, repo)).onValue(entities => {
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
            Query_1.EntityQuery.tryGetById(entities, req.params.id)
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
        let entity = Query_1.EntityQuery.getById(getEntitities(req), id);
        res.status(200).json(entity);
    })
        .put((req, res) => {
        let updatedEntity = fromJSON(req.body);
        repo.update(updatedEntity).onValue((e) => res.status(200).json(e));
    })
        .options(okOptions)
        .delete((req, res) => {
        let id = req.params.id;
        let entity = Query_1.EntityQuery.getById(getEntitities(req), id);
        repo.remove(entity).onValue(() => res.sendStatus(200));
    });
    return router;
}
exports.routerForSub = routerForSub;
function getClientLogin() {
    let router = express_1.Router();
    router.route("/")
        .get((req, res) => {
        res.redirect("/");
    });
    return router;
}
exports.getClientLogin = getClientLogin;
function getLoginRouter(authService) {
    let router = express_1.Router();
    router.route("/")
        .options(okOptions)
        .post((req, res) => {
        let cred = Models_1.Credentials.fromJSON(req.body);
        console.log("The user sent these cred", cred);
        let token = authService.generateToken(cred);
        res.status(200).json(token);
    });
    return router;
}
exports.getLoginRouter = getLoginRouter;
function getValidatorRouter() {
    let router = express_1.Router();
    router.route("/").post((req, res) => {
        if (!(req.headers["sub_id"])) {
            res.statusMessage = "You must provide a number based sub_id in the headers";
            res.sendStatus(500);
            return;
        }
        let subscriptionId = parseInt(req.headers["sub_id"]);
        let validationStream = ServerValidation_1.ServerValidation.validateLegacy(subscriptionId, req.body);
        validationStream.onValue(msgs => {
            res.status(200).json(msgs);
        });
    }).options((req, res) => {
        res.sendStatus(200);
    });
    return router;
}
exports.getValidatorRouter = getValidatorRouter;
function getValidatorResultRouter() {
    let router = express_1.Router();
    router.route("/").post((req, res) => {
        if (!(req.headers["sub_id"])) {
            res.statusMessage = "You must provide a number based sub_id in the headers";
            res.sendStatus(500);
            return;
        }
        let subscriptionId = parseInt(req.headers["sub_id"]);
        ServerValidation_1.ServerValidation.requestValidate(Models_2.ServiceRequest.create(req.body), subscriptionId)
            .onValue(result => res.status(200).json(result));
    }).options((req, res) => {
        res.sendStatus(200);
    });
    return router;
}
exports.getValidatorResultRouter = getValidatorResultRouter;
