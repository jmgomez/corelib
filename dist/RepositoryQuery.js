"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = require("querystring");
var RepositoryQuery = /** @class */ (function () {
    function RepositoryQuery() {
    }
    RepositoryQuery.isMongo = function (repo) {
        return repo.constructor["name"].includes("MongoRepository"); //this wont work on the client
    };
    RepositoryQuery.toMongoQuery = function (query) {
        for (var key in query) {
            if (query[key].includes(",")) {
                query[key] = { $in: query[key].split(",") };
            }
        }
        return query;
    };
    RepositoryQuery.decideImpl = function (mongo, inMemory, repo) {
        switch (repo.constructor["name"]) {
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?" + querystring.stringify(mongo);
            default:
                return inMemory;
        }
    };
    RepositoryQuery.decideImplIcludingAPI = function (mongo, api, inMemory, repo) {
        switch (repo.constructor["name"]) {
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?" + querystring.stringify(api);
            default:
                if (this.isMongo(repo))
                    return mongo;
                return inMemory;
        }
    };
    RepositoryQuery.names = { MongoRepository: "MongoRepository", APIRepository: "APIRepository" };
    return RepositoryQuery;
}());
exports.RepositoryQuery = RepositoryQuery;
