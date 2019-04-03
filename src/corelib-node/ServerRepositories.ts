import { IRepository, IRxRepository, SyncRxRepository} from "../Repository";
import * as Rx from "rxjs";
import * as TsMonad from 'tsmonad';
import * as fs from "fs";
import {connect, Db, MongoClient, Cursor} from "mongodb";
import {Entity} from "../Entity";
import {EntityQuery} from "../EntityQuery";
import {MonadUtils} from "../Utils";
import _ from "underscore";

export class FileLocalRepository<T extends Entity> implements IRepository<T> {

    entities: T[];
    name : string;
    fromJSON : (json:any)=>T;
    constructor(name:string, fromJSON:(json:any)=>T, optionalData?:T[]){
        this.name = name;
        this.fromJSON = fromJSON;
        this.entities = this.loadFromFile();
        if(optionalData)
            this.updateAll(optionalData);
    }

    getAll() {
        return this.entities;
    }
    addMany(entities:T[]){
        entities.forEach(e=>this.add(e))
    }

    persist(){
        let json = JSON.stringify(this.entities);
        fs.writeFileSync(this.name, json);
    }

    add(entity: T) {
        this.entities.push(entity);
        this.persist();
    }

    update(entity:T){
        this.entities = EntityQuery.update(this.entities, entity);
        this.persist();
    }
    updateAll(entities:T[]){
        this.entities = entities;
        this.persist();
    }
    remove(entity: T) {
        this.entities = EntityQuery.delete(this.entities, entity);
        this.persist();
    }

    removeAll() {
        this.entities = [];
        this.persist();
    }
    removeAllBy(query:any){
        this.entities = EntityQuery.getDifference(this.entities, this.getAllBy(query));
        this.persist();
    }

    getAllBy(query:any){
        return this.getAll().filter(query);
    }

    getById(id:string) : TsMonad.Maybe<T>{

        return EntityQuery.tryGetById(this.entities, id);
    }

    getOneBy(query:any) :  TsMonad.Maybe<T> {
        return MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    }

    toRxRepository(){
        return new SyncRxRepository(this);
    }

    private loadFromFile(){
        if(!fs.existsSync(this.name))
            fs.writeFileSync(this.name, "[]");
        let json = fs.readFileSync(this.name, "UTF-8");

        return JSON.parse(json).map(this.fromJSON);
    }

}


export class MongoRepository<T extends Entity> implements  IRxRepository<T> {
    fromJSON : (json:any)=>T;
    collection : string;
    db : Db;


    constructor(db:Db, collection:string, fromJSON:(json:any)=>T){
        this.collection = collection;
        this.fromJSON = fromJSON;
        this.db = db;
    }

    toMongoEntity<E extends {id:string}>(e:E){
        e["_id"] = e.id;
        delete e.id;
        return e
    }
    fromMongoToEntity = (e:any) : T => {
        e["id"] = e._id;
        delete e._id;        
        return e;
    }
    fromMongoToEntities = (e:any[]) : T[] => {
        return e.map(this.fromMongoToEntity);
    }
  



    executeCommandAndCloseConn<E,T>(cmd:(db:Db)=>Rx.Observable<T>){
        return cmd(this.db);
    }

    getAll(){
        let getAllCmd = (db:Db) => Rx.Observable.fromPromise(db.collection(this.collection).find().map(this.fromMongoToEntity).toArray()) as Rx.Observable<T[]>;
        return getAllCmd(this.db);
    }

    getAllBy(query:any, exclude?:any){        
        let getAllCmd = (db:Db) => Rx.Observable.fromPromise(db.collection(this.collection).find(query, exclude).toArray())as Rx.Observable<T[]>;   
        return getAllCmd(this.db);
    }

    getAllByWithSteps(query:any, exclude?:any){    
                
        let getCursor =  (skip:number, limit:number) => {
            let cursor = this.db.collection(this.collection).find(query, exclude).map(this.fromMongoToEntity)
            return Rx.Observable.fromPromise(cursor.skip(skip).limit(limit).toArray());
        }

        let generateSteps = (step:number) => {
            let countStream = Rx.Observable.fromPromise(this.db.collection(this.collection).find(query, exclude).count());
            return countStream.map(total=>{
                let lastStep = total % step;
                let numberSteps = Number.parseInt((total / step) as any);
                let steps = _.range(0, numberSteps).map(skipMult => [skipMult*step, step] as [number, number])
                steps.push([numberSteps*step, lastStep]) 
               
                return steps
            })
            .flatMap(steps => {
                let cursors = steps.map(step=>getCursor(step[0], step[1]))
                return Rx.Observable.zip(... cursors).map( arr => arr.reduce((a,b)=>a.concat(b))) 
            })
           
        }
        return generateSteps(1000);
    }

    add(value: T){
        let addCmd = (db:Db)=> Rx.Observable.fromPromise(db.collection(this.collection).insertOne(this.toMongoEntity(value)))
            .map(r=> this.fromMongoToEntity(value)); //Checks if there was an error
        return addCmd(this.db);
    }
    addMany(values: T[]){
        let addCmd = (db:Db)=> Rx.Observable.fromPromise(db.collection(this.collection).insertMany(values.map(v=>this.toMongoEntity(v)))).map(val=>values);
        return this.executeCommandAndCloseConn(addCmd);
    }
 
    update(value: T) {
        let updateCmd = (db:Db)=>Rx.Observable.fromPromise(db.collection(this.collection).updateOne({_id:value.id}, {$set: this.toMongoEntity(value)}))
            .map(r=>{               
                return  this.fromMongoToEntity(value);
            });
        return this.executeCommandAndCloseConn(updateCmd);
    }

    getById(id: string) { //MAYBE THIS WILL CAUSE SOME PROBLEMS
        let findOne = (db:Db)=> Rx.Observable.fromPromise(db.collection(this.collection).findOne({_id:id}))
        return this.executeCommandAndCloseConn(findOne).map(e=>MonadUtils.CreateMaybeFromNullable(e).map(e=> this.fromMongoToEntity(e)));
    }

    getOneBy(query: any) {         
        let findOneBy = (db:Db)=> Rx.Observable.fromPromise(db.collection(this.collection).findOne(query))
        return this.executeCommandAndCloseConn(findOneBy).map(e=>MonadUtils.CreateMaybeFromNullable(e).map(e=> this.fromMongoToEntity(e)));    
             
    }

    remove(value: T) : Rx.Observable<any> {
        let removeCmd = (db:Db) => Rx.Observable.fromPromise(db.collection(this.collection).deleteOne({_id:value.id}));
        return removeCmd(this.db)
    }

    updateAll: (value: T[]) => Rx.Observable<T[]>;

    removeAllBy(query:any) : Rx.Observable<any> {
        let removeCmd = (db:Db) => Rx.Observable.fromPromise(db.collection(this.collection).deleteMany(query));
        return this.executeCommandAndCloseConn(removeCmd);
    }

    removeAll: () => Rx.Observable<any>;
}
