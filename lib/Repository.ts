import * as Bacon from "baconjs";
import {Response} from 'node-fetch';
import * as TsMonad from 'tsmonad';
import {DateUtils, MonadUtils, Period} from "./Utils";
import {Entity } from "./Entity";
import * as querystring from "querystring";
import {EntityQuery} from "./EntityQuery";

export interface IRepository<T extends Entity>{
    add : (value:T) => void;
    addMany : (value:T[]) => void;
    update : (value:T) => void;
    updateAll : (value:T[]) => void;
    remove : (value:T) => void;
    removeAllBy : (query:any) => void;
    removeAll : () => void;
    getAll : ()=> T[];
    getAllBy: (query:any)=> T[];
    getById : (id:string) => TsMonad.Maybe<T>;
    getOneBy : (query:any) => TsMonad.Maybe<T>;
}

export type ReqHelper = {
    makeRequest: (url: string, method: string, data?: any, onError?:(r:Response)=>void) => Bacon.EventStream<any, any>
}

export class APIRepository<T extends Entity> implements IReactiveRepository<T>{

    endPoint : string;
    fromJSON:(json:any)=>T;
    private requestHelper: ReqHelper;

    onError(r:Response){
       console.error(r);
    }

    constructor(endPoint:string, fromJSON:(json:any)=>T,  reqHelper:ReqHelper){
        this.endPoint = endPoint;
        this.fromJSON = fromJSON;

        this.requestHelper = reqHelper;
    }

    getAll(){
        return this.requestHelper.makeRequest(this.endPoint, 'get', this.onError.bind(this)).map(vals=>vals.map(this.fromJSON));
    }

    add(entity:T){
        return this.requestHelper.makeRequest(this.endPoint, 'post', entity, this.onError.bind(this)).map(this.fromJSON);
    }
    addMany(entities:T[]){
        return this.requestHelper.makeRequest(this.endPoint, 'post', entities, this.onError.bind(this)).map(val=> val.map((v:T[])=>this.fromJSON));
    }

    update(entity:T){
        let path = this.endPoint+entity.id;
        return this.requestHelper.makeRequest(path, 'put', entity, this.onError.bind(this)).map(this.fromJSON);
    }

    remove(entity:T){
        let path = this.endPoint+entity.id;
        return this.requestHelper.makeRequest(path, 'delete', entity, this.onError.bind(this));
    }

    getById(id:string){
        let path = this.endPoint+id;
        return this.requestHelper.makeRequest(path, 'get', id, this.onError.bind(this))
            .map(val=>MonadUtils.CreateMaybeFromNullable(val));
    }

    removeAllBy(query:any) {
        return Bacon.fromArray([]);
    }

    getAllBy(query:any) : Bacon.EventStream<any, T[]>{
        let path = this.endPoint+"getallby"+query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this))
        // throw new Error("You don't have to query from the API. The server router will handle it. In the future it will be done through GraphQL");
        // return Bacon.fromArray([]);
    }

    updateAll: (value: T[]) => Bacon.EventStream<any, T[]>;

    removeAll: () => Bacon.EventStream<any, T[]>;

    getOneBy: () => Bacon.EventStream<any, TsMonad.Maybe<T>>;
}


export class InMemoryRepository<T extends Entity> implements IRepository<T>{
    elems : T[];

    constructor(elems?:T[]){
        this.elems = elems ? elems : [];
    }
    add(e: T){
        this.elems.push(e);
    }
    addMany(entities:T[]){
        entities.forEach(e=>this.add(e))
    }
    remove(e:T){
        this.elems = EntityQuery.delete(this.elems, e);
    }
    removeAll(){
        this.elems = [];
    }
    update(e:T){
        this.elems = EntityQuery.update(this.elems, e);
    }
    updateAll(e:T[]){
        this.elems = e;
    }
    getAll(){
        return this.elems;
    }
    getAllBy(query:any){
        return this.elems;
    }
    getById(id:string){
        console.log("Requesting by id", id, this.elems)
        return EntityQuery.tryGetById(this.elems, id);
    }
    getOneBy(query:any){
        return MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    }
    removeAllBy(query:any){
        return this.removeAll();
    }

    toReactiveRepository(){
        return new SyncReactiveRepository(this);
    }
}

export class SyncReactiveRepository<T extends Entity> implements IReactiveRepository<T> {
    repo:IRepository<T>;
    constructor(repo:IRepository<T>){
        this.repo = repo;
    }

    add(e: T){
       this.repo.add(e);
       return Bacon.fromArray([e]);
    }
    addMany(entities:T[]){
        this.repo.addMany(entities);
        return Bacon.later(0, entities)
    }
    remove(e:T){
        this.repo.remove(e);
        return Bacon.fromArray([""]);
    }
    removeAll(){
        this.repo.removeAll();
        return Bacon.fromArray([]);
    }
    removeAllBy(query:any){
        this.repo.removeAllBy(query);
        return Bacon.fromArray([]);
    }

    update(e:T){
        this.repo.update(e);
        return Bacon.fromArray([e]);
    }
    updateAll(e:T[]){
        this.repo.updateAll(e);
        return Bacon.fromArray([e]);
    }

    getAll() {
        let elems =  this.repo.getAll();
        return Bacon.fromArray([elems]);
    }

    getAllBy(query:any) : Bacon.EventStream<any, T[]>{
        let elems =<T[]> this.repo.getAllBy(query);
        return Bacon.later(0, elems);
    }
    getById(id:string){
        return Bacon.later(0, this.repo.getById(id));
    }
    getOneBy(query:any){
        return Bacon.later(0, this.repo.getOneBy(query));
    }
}


export interface IReactiveRepository<T extends Entity>{
    add : (value:T) => Bacon.EventStream<any, T>;
    addMany : (value:T[]) => Bacon.EventStream<any, T[]>;
    update : (value:T) => Bacon.EventStream<any, T>;
    updateAll : (value:T[]) => Bacon.EventStream<any, T[]>;
    remove : (value:T) => Bacon.EventStream<any, any>;
    removeAllBy: (query:any) => Bacon.EventStream<any, any>;
    removeAll: ()=> Bacon.EventStream<any, T[]>;
    getAll: ()=> Bacon.EventStream<any, T[]>;
    getAllBy: (query:any)=> Bacon.EventStream<any, T[]>;
    getById : (id:string) => Bacon.EventStream<any, TsMonad.Maybe<T>>;
    getOneBy : (query:any) => Bacon.EventStream<any, TsMonad.Maybe<T>>;

}


