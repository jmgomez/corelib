import {IReactiveRepository, IRepository} from "../Repository";
import * as TsMonad from 'tsmonad';
import * as fs from "fs";
import {connect, Db, MongoClient} from "mongodb";
import * as Bacon from 'baconjs';
import {Entity} from "../Entity";
import {EntityQuery} from "../EntityQuery";
import {MonadUtils} from "../Utils";

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
        console.log("Just wrote in the file");
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

    private loadFromFile(){
        if(!fs.existsSync(this.name))
            fs.writeFileSync(this.name, "[]");
        let json = fs.readFileSync(this.name, "UTF-8");

        return JSON.parse(json).map(this.fromJSON);

    }

}



export class MongoRepository<T extends Entity> implements IReactiveRepository<T> {
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
        return e;
    }
    fromMongoToEntity(e:any){
        e["id"] = e._id;
        delete e._id;
        return e;
    }
    fromMongoToEntities(e:any[]){
        return e.map(this.fromMongoToEntity);
    }



    executeCommandAndCloseConn<E,T>(cmd:(db:Db)=>Bacon.EventStream<E,T>){
        return cmd(this.db);
    }

    getAll(){
        let getAllCmd = (db:Db) => Bacon.fromPromise(db.collection(this.collection).find().map(this.fromMongoToEntity).toArray());
        return this.executeCommandAndCloseConn(getAllCmd);
    }

    getAllBy(query:any, exclude?:any){
        let getAllCmd = (db:Db) => Bacon.fromPromise(db.collection(this.collection).find(query, exclude).map(this.fromMongoToEntity).toArray());
        return this.executeCommandAndCloseConn(getAllCmd);
    }

    add(value: T){
        let addCmd = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).insertOne(this.toMongoEntity(value)))
            .map(r=>value); //Checks if there was an error
        return this.executeCommandAndCloseConn(addCmd);
    }
    addMany(values: T[]){
        let addCmd = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).insertMany(values.map(v=>this.toMongoEntity(v)))).map(val=>values);
        return this.executeCommandAndCloseConn(addCmd);
    }

    update(value: T) {
        let updateCmd = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).updateOne({_id:value.id}, this.toMongoEntity(value)))
            .map(r=>value); //Checks if there was an error
        return this.executeCommandAndCloseConn(updateCmd);
    }

    getById(id: string) : Bacon.EventStream<any, TsMonad.Maybe<T>>{ //MAYBE THIS WILL CAUSE SOME PROBLEMS
        let findOne = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).findOne({_id:id}));
        return this.executeCommandAndCloseConn(findOne).map(e=>MonadUtils.CreateMaybeFromNullable(e));
    }

    getOneBy(query: any) : Bacon.EventStream<any, TsMonad.Maybe<T>> { //MAYBE THIS WILL CAUSE SOME PROBLEMS
        return this.getAllBy(query).map(results=>MonadUtils.CreateMaybeFromFirstElementOfAnArray(results))
        // let findOne = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).findOne(query));
        // console.log(query, "Sacando uno")
        // return this.executeCommandAndCloseConn(findOne).map(e=>MonadUtils.CreateMaybeFromFirstElementOfAnArray(e));
    }

    remove(value: T) : Bacon.EventStream<any, any> {
        let removeCmd = (db:Db) => Bacon.fromPromise(db.collection(this.collection).deleteOne({_id:value.id}));
        return this.executeCommandAndCloseConn(removeCmd);
    }

    updateAll: (value: T[]) => Bacon.EventStream<any, T[]>;

    removeAllBy(query:any) : Bacon.EventStream<any, any>{
        let removeCmd = (db:Db) => Bacon.fromPromise(db.collection(this.collection).deleteMany(query));
        return this.executeCommandAndCloseConn(removeCmd);
    }
    removeAll: () => Bacon.EventStream<any, T[]>;
}