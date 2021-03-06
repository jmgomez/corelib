import { IRxRepository } from './Repository';
import { Entity } from './Entity';
export declare class RepositoryQuery {
    static names: {
        MongoRepository: string;
        APIRepository: string;
    };
    static isMongo<T extends Entity>(repo: IRxRepository<T>): boolean;
    static toMongoQuery(query: object): object;
    static toInMemoryRepo(query: object): (e: Entity) => boolean;
    static fromQueryStringTo<T extends Entity>(query: object, repo: any): object;
    static decideImpl<T extends Entity>(mongo: any, inMemory: any, repo: any): any;
    static decideImplIcludingAPI<T extends Entity>(mongo: any, api: any, inMemory: any, repo: IRxRepository<T>): any;
}
//# sourceMappingURL=RepositoryQuery.d.ts.map