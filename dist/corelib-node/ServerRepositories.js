"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var Bacon = require("baconjs");
var EntityQuery_1 = require("../EntityQuery");
var Utils_1 = require("../Utils");
var FileLocalRepository = /** @class */ (function () {
    function FileLocalRepository(name, fromJSON, optionalData) {
        this.name = name;
        this.fromJSON = fromJSON;
        this.entities = this.loadFromFile();
        if (optionalData)
            this.updateAll(optionalData);
    }
    FileLocalRepository.prototype.getAll = function () {
        return this.entities;
    };
    FileLocalRepository.prototype.addMany = function (entities) {
        var _this = this;
        entities.forEach(function (e) { return _this.add(e); });
    };
    FileLocalRepository.prototype.persist = function () {
        var json = JSON.stringify(this.entities);
        fs.writeFileSync(this.name, json);
        console.log("Just wrote in the file");
    };
    FileLocalRepository.prototype.add = function (entity) {
        this.entities.push(entity);
        this.persist();
    };
    FileLocalRepository.prototype.update = function (entity) {
        this.entities = EntityQuery_1.EntityQuery.update(this.entities, entity);
        this.persist();
    };
    FileLocalRepository.prototype.updateAll = function (entities) {
        this.entities = entities;
        this.persist();
    };
    FileLocalRepository.prototype.remove = function (entity) {
        this.entities = EntityQuery_1.EntityQuery.delete(this.entities, entity);
        this.persist();
    };
    FileLocalRepository.prototype.removeAll = function () {
        this.entities = [];
        this.persist();
    };
    FileLocalRepository.prototype.removeAllBy = function (query) {
        this.entities = EntityQuery_1.EntityQuery.getDifference(this.entities, this.getAllBy(query));
        this.persist();
    };
    FileLocalRepository.prototype.getAllBy = function (query) {
        return this.getAll().filter(query);
    };
    FileLocalRepository.prototype.getById = function (id) {
        return EntityQuery_1.EntityQuery.tryGetById(this.entities, id);
    };
    FileLocalRepository.prototype.getOneBy = function (query) {
        return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    };
    FileLocalRepository.prototype.loadFromFile = function () {
        if (!fs.existsSync(this.name))
            fs.writeFileSync(this.name, "[]");
        var json = fs.readFileSync(this.name, "UTF-8");
        return JSON.parse(json).map(this.fromJSON);
    };
    return FileLocalRepository;
}());
exports.FileLocalRepository = FileLocalRepository;
var MongoRepository = /** @class */ (function () {
    function MongoRepository(db, collection, fromJSON) {
        this.collection = collection;
        this.fromJSON = fromJSON;
        this.db = db;
    }
    MongoRepository.prototype.toMongoEntity = function (e) {
        e["_id"] = e.id;
        delete e.id;
        return e;
    };
    MongoRepository.prototype.fromMongoToEntity = function (e) {
        e["id"] = e._id;
        delete e._id;
        return e;
    };
    MongoRepository.prototype.fromMongoToEntities = function (e) {
        return e.map(this.fromMongoToEntity);
    };
    MongoRepository.prototype.executeCommandAndCloseConn = function (cmd) {
        return cmd(this.db);
    };
    MongoRepository.prototype.getAll = function () {
        var _this = this;
        var getAllCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).find().map(_this.fromMongoToEntity).toArray()); };
        return this.executeCommandAndCloseConn(getAllCmd);
    };
    MongoRepository.prototype.getAllBy = function (query, exclude) {
        var _this = this;
        var getAllCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).find(query, exclude).map(_this.fromMongoToEntity).toArray()); };
        return this.executeCommandAndCloseConn(getAllCmd);
    };
    MongoRepository.prototype.add = function (value) {
        var _this = this;
        var addCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).insertOne(_this.toMongoEntity(value)))
            .map(function (r) { return value; }); }; //Checks if there was an error
        return this.executeCommandAndCloseConn(addCmd);
    };
    MongoRepository.prototype.addMany = function (values) {
        var _this = this;
        var addCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).insertMany(values.map(function (v) { return _this.toMongoEntity(v); }))).map(function (val) { return values; }); };
        return this.executeCommandAndCloseConn(addCmd);
    };
    MongoRepository.prototype.update = function (value) {
        var _this = this;
        var updateCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).updateOne({ _id: value.id }, _this.toMongoEntity(value)))
            .map(function (r) { return value; }); }; //Checks if there was an error
        return this.executeCommandAndCloseConn(updateCmd);
    };
    MongoRepository.prototype.getById = function (id) {
        var _this = this;
        var findOne = function (db) { return Bacon.fromPromise(db.collection(_this.collection).findOne({ _id: id })); };
        return this.executeCommandAndCloseConn(findOne).map(function (e) { return Utils_1.MonadUtils.CreateMaybeFromNullable(e); });
    };
    MongoRepository.prototype.getOneBy = function (query) {
        return this.getAllBy(query).map(function (results) { return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(results); });
        // let findOne = (db:Db)=> Bacon.fromPromise(db.collection(this.collection).findOne(query));
        // console.log(query, "Sacando uno")
        // return this.executeCommandAndCloseConn(findOne).map(e=>MonadUtils.CreateMaybeFromFirstElementOfAnArray(e));
    };
    MongoRepository.prototype.remove = function (value) {
        var _this = this;
        var removeCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).deleteOne({ _id: value.id })); };
        return this.executeCommandAndCloseConn(removeCmd);
    };
    MongoRepository.prototype.removeAllBy = function (query) {
        var _this = this;
        var removeCmd = function (db) { return Bacon.fromPromise(db.collection(_this.collection).deleteMany(query)); };
        return this.executeCommandAndCloseConn(removeCmd);
    };
    return MongoRepository;
}());
exports.MongoRepository = MongoRepository;
