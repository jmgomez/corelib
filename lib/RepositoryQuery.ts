


import {IReactiveRepository} from './Repository';
import {Entity} from './Entity';
import * as querystring from 'querystring';

export class RepositoryQuery {
    static names = {MongoRepository:"MongoRepository", APIRepository: "APIRepository"};

    static isMongo<T extends Entity>(repo:IReactiveRepository<T>){
        return repo.constructor.name.includes("MongoRepository"); //this wont work on the client
    }

    static toMongoQuery(query:object){
        for(let key in query){
            if (query[key].includes(",")){
                query[key] = { $in: query[key].split(",") }
            }
        }
        return query;
    }

    static decideImpl<T extends Entity>(mongo:any, inMemory:any, repo:IReactiveRepository<T>){

        switch (repo.constructor.name){
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?"+querystring.stringify(mongo);
            default:
                return inMemory;
        }
    }

    static decideImplIcludingAPI<T extends Entity>(mongo:any,api:any, inMemory:any, repo:IReactiveRepository<T>){

        switch (repo.constructor.name){
            case this.names.MongoRepository:
                return mongo;
            case this.names.APIRepository:
                return "?"+querystring.stringify(api);
            default:
                if(this.isMongo(repo)) //This is because ScopeRepository. Will delete it ASAP.
                    return mongo;
                return inMemory;
        }
    }


}