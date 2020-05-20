import {Response} from 'node-fetch';
import * as TsMonad from 'tsmonad';
import {DateUtils, MonadUtils, Period} from "./Utils";
import {Entity } from "./Entity";
import * as querystring from "querystring";
import {EntityQuery} from "./EntityQuery";
import * as Rx from "rxjs";
import * as _ from 'underscore'

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
    countBy : (query:any) => number;
    getRangeBy : (query:any, skip:number, limit:number) =>T[];
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
        let path = this.endPoint+"deleteallby"+query;
        return this.requestHelper.makeRequest(path, 'delete', {}, this.onError.bind(this))
    }
    getAllBy(query:any){
        let path = this.endPoint+"getallby"+query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this))
        // throw new Error("You don't have to query from the API. The server router will handle it. In the future it will be done through GraphQL");
        // return Bacon.fromArray([]);
    }
    getRangeBy(query:any, skip:number, limit:number){
        let path = `${this.endPoint}rangeby${query}&skip=${skip}&limit=${limit}`;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this))
    }
    countBy(query:any){
        let path = this.endPoint+"countby"+query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this))
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
        return EntityQuery.tryGetById(this.elems, id);
    }
    getOneBy(query:any){
        return MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    }
    removeAllBy(query:any){
        return this.removeAll();
    }

    countBy(query:any) {
        return this.elems.filter(query).length;
    }

    getRangeBy(query:any, skip:number, limit:number, exclude?:any) {
        let elems = this.getAllBy(query);
       return _.range(skip, skip + limit).map(i=>elems[i]);
    }

    toRxRepository() {
        return new SyncRxRepository(this);
    }

    static createAsRxRepo<T extends Entity>(){
        return new InMemoryRepository<T>().toRxRepository();
    }
}

export class SyncRxRepository<T extends Entity> implements  IRxRepository<T> {
    repo:IRepository<T>;
    constructor(repo:IRepository<T>){
        this.repo = repo;
    }

    add(e: T){
        this.repo.add(e);
        return Rx.Observable.of(e);
    }
    addMany(entities:T[]){
        this.repo.addMany(entities);
        return Rx.Observable.of(entities)
    }
    remove(e:T){
        this.repo.remove(e);
        return Rx.Observable.of(e);
    }
    removeAll(){
        this.repo.removeAll();
        return Rx.Observable.of([]);
    }
    removeAllBy(query:any){
        this.repo.removeAllBy(query);
        return Rx.Observable.from([]);
    }

    update(e:T){
        this.repo.update(e);
        return Rx.Observable.of(e);
    }
    updateAll(e:T[]){
        this.repo.updateAll(e);
        return Rx.Observable.of(e);
    }

    getAll() {
        let elems =  this.repo.getAll();
        return Rx.Observable.of(elems);
    }

    getAllBy(query:any) {
        let elems =<T[]> this.repo.getAllBy(query);
        return Rx.Observable.of(elems);
    }
    getById(id:string){
        return Rx.Observable.of(this.repo.getById(id));
    }
    getOneBy(query:any){
        return Rx.Observable.of(this.repo.getOneBy(query));
    }
    countBy(query:any) {
        return Rx.Observable.of(this.repo.countBy(query));
    }

    getRangeBy(query:any, skip:number, limit:number) {
       return Rx.Observable.of(this.repo.getRangeBy(query, skip, limit));
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
    countBy : (query:any) =>  Rx.Observable<number>;
    getRangeBy : (query:any, skip:number, limit:number) => Rx.Observable<T[]>;
}


export class UnitRxRepository<T extends Entity> {
    constructor(private repo : IRxRepository<T>){}
    
    updateOrCreate = (value:T)=>
       this.get(value.id).flatMap(maybeT=> maybeT.caseOf({
           just: t=> this.repo.update(value),
           nothing: ()=> this.repo.add(value).catch(e=> this.updateOrCreate(value))
       })).catch(e=>{
           console.log("Fails trying to update. Probably because the entity does not exist yet. Enforcing the creation")
          return this.repo.add(value);
       });

    get = (id:string)=>  this.repo.getById(id) ; 
}
