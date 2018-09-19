import {Response} from 'node-fetch';
import * as TsMonad from 'tsmonad';
import {DateUtils, MonadUtils, Period, RXUtils} from "./Utils";
import {Entity } from "./Entity";
import * as querystring from "querystring";
import {EntityQuery} from "./EntityQuery";
import * as Rx from "rxjs/Rx";

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
    makeRequest: (url: string, method: string, data?: any, onError?:(r:Response)=>void) => Rx.Observable<any>
}





export class APIRepository<T extends Entity> implements IRxRepository<T>{

    endPoint : string;
    private requestHelper: ReqHelper;

    onError(r:Response){
       console.error(r);
       console.error(r);
    }

    constructor(endPoint:string,  reqHelper:ReqHelper){
        this.endPoint = endPoint;
        this.requestHelper = reqHelper;
    }

    getAll(){
        return this.requestHelper.makeRequest(this.endPoint, 'get', this.onError.bind(this));
    }

    add(entity:T){
        return this.requestHelper.makeRequest(this.endPoint, 'post', entity, this.onError.bind(this));
    }
    addMany(entities:T[]){
        return this.requestHelper.makeRequest(this.endPoint, 'post', entities, this.onError.bind(this));
    }

    update(entity:T){
        let path = this.endPoint+entity.id;
        return this.requestHelper.makeRequest(path, 'put', entity, this.onError.bind(this));
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
        return Rx.Observable.of([]);
    }

    getAllBy(query:any){
        let path = this.endPoint+"getallby"+query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this))
        // throw new Error("You don't have to query from the API. The server router will handle it. In the future it will be done through GraphQL");
        // return Bacon.fromArray([]);
    }

    updateAll: (value: T[]) => Rx.Observable <T[]>;

    removeAll =() => {
        return this.requestHelper.makeRequest(this.endPoint, 'delete', this.onError.bind(this));
    };

    getOneBy: () =>  Rx.Observable <TsMonad.Maybe<T>>;
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
        return this.elems.filter(query);
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

    toRxRepository() {
        return new SyncRxRepository(this);
    }
}

export class SyncRxRepository<T extends Entity> implements  IRxRepository<T> {
    repo:IRepository<T>;
    constructor(repo:IRepository<T>){
        this.repo = repo;
    }

    add(e: T){
        this.repo.add(e);
        return Rx.Observable.from([e]);
    }
    addMany(entities:T[]){
        this.repo.addMany(entities);
        return Rx.Observable.from([entities])
    }
    remove(e:T){
        this.repo.remove(e);
        return Rx.Observable.from([]);
    }
    removeAll(){
        this.repo.removeAll();
        return Rx.Observable.from([]);
    }
    removeAllBy(query:any){
        this.repo.removeAllBy(query);
        return Rx.Observable.from([]);
    }

    update(e:T){
        this.repo.update(e);
        return Rx.Observable.from([e]);
    }
    updateAll(e:T[]){
        this.repo.updateAll(e);
        return Rx.Observable.from([e]);
    }

    getAll() {
        let elems =  this.repo.getAll();
        return Rx.Observable.from([elems]);
    }

    getAllBy(query:any) {
        let elems =<T[]> this.repo.getAllBy(query);
        return Rx.Observable.from([elems]);
    }
    getById(id:string){
        return Rx.Observable.from([this.repo.getById(id)]);
    }
    getOneBy(query:any){
        return Rx.Observable.from([this.repo.getOneBy(query)]);
    }

    asInMemoryRepository(){
        return this.repo as InMemoryRepository<T>;
    }
}


export interface IRxRepository <T extends Entity> {
    add : (value:T) => Rx.Observable<T>;
    addMany : (value:T[]) => Rx.Observable<T[]>;
    update : (value:T) => Rx.Observable<T>;
    updateAll : (value:T[]) => Rx.Observable<T[]>;
    remove : (value:T) => Rx.Observable<any>;
    removeAllBy: (query:any) => Rx.Observable<any>;
    removeAll: ()=> Rx.Observable<T[]>;
    getAll: ()=> Rx.Observable<T[]>;
    getAllBy: (query:any)=> Rx.Observable<T[]>;
    getById : (id:string) => Rx.Observable<TsMonad.Maybe<T>>;
    getOneBy : (query:any) => Rx.Observable<TsMonad.Maybe<T>>;
}

