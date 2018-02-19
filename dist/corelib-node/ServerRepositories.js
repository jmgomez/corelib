"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Bacon = require("baconjs");
const EntityQuery_1 = require("../EntityQuery");
const Utils_1 = require("../Utils");
class FileLocalRepository {
    constructor(name, fromJSON, optionalData) {
        this.name = name;
        this.fromJSON = fromJSON;
        this.entities = this.loadFromFile();
        if (optionalData)
            this.updateAll(optionalData);
    }
    getAll() {
        return this.entities;
    }
    addMany(entities) {
        entities.forEach(e => this.add(e));
    }
    persist() {
        let json = JSON.stringify(this.entities);
        fs.writeFileSync(this.name, json);
        console.log("Just wrote in the file");
    }
    add(entity) {
        this.entities.push(entity);
        this.persist();
    }
    update(entity) {
        this.entities = EntityQuery_1.EntityQuery.update(this.entities, entity);
        this.persist();
    }
    updateAll(entities) {
        this.entities = entities;
        this.persist();
    }
    remove(entity) {
        this.entities = EntityQuery_1.EntityQuery.delete(this.entities, entity);
        this.persist();
    }
    removeAll() {
        this.entities = [];
        this.persist();
    }
    removeAllBy(query) {
        this.entities = EntityQuery_1.EntityQuery.getDifference(this.entities, this.getAllBy(query));
        this.persist();
    }
    getAllBy(query) {
        return this.getAll().filter(query);
    }
    getById(id) {
        return EntityQuery_1.EntityQuery.tryGetById(this.entities, id);
    }
    getOneBy(query) {
        return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    }
    loadFromFile() {
        if (!fs.existsSync(this.name))
            fs.writeFileSync(this.name, "[]");
        let json = fs.readFileSync(this.name, "UTF-8");
        return JSON.parse(json).map(this.fromJSON);
    }
}
exports.FileLocalRepository = FileLocalRepository;
class MongoRepository {
    constructor(db, collection, fromJSON) {
        this.collection = collection;
        this.fromJSON = fromJSON;
        this.db = db;
    }
    toMongoEntity(e) {
        e["_id"] = e.id;
        delete e.id;
        return e;
    }
    fromMongoToEntity(e) {
        e["id"] = e._id;
        delete e._id;
        return e;
    }
    fromMongoToEntities(e) {
        return e.map(this.fromMongoToEntity);
    }
    executeCommandAndCloseConn(cmd) {
        return cmd(this.db);
    }
    getAll() {
        let getAllCmd = (db) => Bacon.fromPromise(db.collection(this.collection).find().map(this.fromMongoToEntity).toArray());
        return this.executeCommandAndCloseConn(getAllCmd);
    }
    getAllBy(query, exclude) {
        let getAllCmd = (db) => Bacon.fromPromise(db.collection(this.collection).find(query, exclude).map(this.fromMongoToEntity).toArray());
        return this.executeCommandAndCloseConn(getAllCmd);
    }
    add(value) {
        let addCmd = (db) => Bacon.fromPromise(db.collection(this.collection).insertOne(this.toMongoEntity(value)))
            .map(r => value); //Checks if there was an error
        return this.executeCommandAndCloseConn(addCmd);
    }
    addMany(values) {
        let addCmd = (db) => Bacon.fromPromise(db.collection(this.collection).insertMany(values.map(v => this.toMongoEntity(v)))).map(val => values);
        return this.executeCommandAndCloseConn(addCmd);
    }
    update(value) {
        let updateCmd = (db) => Bacon.fromPromise(db.collection(this.collection).updateOne({ _id: value.id }, this.toMongoEntity(value)))
            .map(r => value); //Checks if there was an error
        return this.executeCommandAndCloseConn(updateCmd);
    }
    getById(id) {
        let findOne = (db) => Bacon.fromPromise(db.collection(this.collection).findOne({ _id: id }));
        return this.executeCommandAndCloseConn(findOne).map(e => Utils_1.MonadUtils.CreateMaybeFromNullable(e));
    }
    getOneBy(query) {
        return this.getAllBy(query).map(results => Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(results));
        // let findOne = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).findOne(query));
        // console.log(query, "Sacando uno")
        // return this.executeCommandAndCloseConn(findOne).map(e=>MonadUtils.CreateMaybeFromFirstElementOfAnArray(e));
    }
    remove(value) {
        let removeCmd = (db) => Bacon.fromPromise(db.collection(this.collection).deleteOne({ _id: value.id }));
        return this.executeCommandAndCloseConn(removeCmd);
    }
    removeAllBy(query) {
        let removeCmd = (db) => Bacon.fromPromise(db.collection(this.collection).deleteMany(query));
        return this.executeCommandAndCloseConn(removeCmd);
    }
}
exports.MongoRepository = MongoRepository;
