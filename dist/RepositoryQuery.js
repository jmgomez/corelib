"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const querystring = require("querystring");
class RepositoryQuery {
    static isMongo(repo) {
        return repo.constructor.name.includes("MongoRepository"); //this wont work on the client
    }
    static toMongoQuery(query) {
        for (let key in query) {
            if (query[key].includes(",")) {
                query[key] = { $in: query[key].split(",") };
            }
        }
        return query;
    }
    static decideImpl(mongo, inMemory, repo) {
        switch (repo.constructor.name) {
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?" + querystring.stringify(mongo);
            default:
                return inMemory;
        }
    }
    static decideImplIcludingAPI(mongo, api, inMemory, repo) {
        switch (repo.constructor.name) {
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?" + querystring.stringify(api);
            default:
                if (this.isMongo(repo))
                    return mongo;
                return inMemory;
        }
    }
}
RepositoryQuery.names = { MongoRepository: "MongoRepository", APIRepository: "APIRepository" };
exports.RepositoryQuery = RepositoryQuery;
