"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var querystring = __importStar(require("querystring"));
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
    RepositoryQuery.toInMemoryRepo = function (query) {
        return function (e) {
            for (var key in query)
                if (e[key] !== query[key])
                    return false;
            return true;
        };
    };
    RepositoryQuery.fromQueryStringTo = function (query, repo) {
        if (this.isMongo(repo))
            return this.toMongoQuery(query);
        return this.toInMemoryRepo(query);
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
                if (this.isMongo(repo)) //This is because ScopeRepository. Will delete it ASAP.
                    return mongo;
                return inMemory;
        }
    };
    RepositoryQuery.names = { MongoRepository: "MongoRepository", APIRepository: "APIRepository" };
    return RepositoryQuery;
}());
exports.RepositoryQuery = RepositoryQuery;
//# sourceMappingURL=RepositoryQuery.js.map