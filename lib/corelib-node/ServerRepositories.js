"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Repository_1 = require("../Repository");
var Rx = __importStar(require("rxjs"));
var fs = __importStar(require("fs"));
var EntityQuery_1 = require("../EntityQuery");
var Utils_1 = require("../Utils");
var _ = __importStar(require("underscore"));
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
    FileLocalRepository.prototype.countBy = function (query) {
        return this.entities.filter(query).length;
    };
    FileLocalRepository.prototype.getRangeBy = function (query, skip, limit, exclude) {
        var elems = this.getAllBy(query);
        return _.range(skip, skip + limit).map(function (i) { return elems[i]; });
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
    FileLocalRepository.prototype.toRxRepository = function () {
        return new Repository_1.SyncRxRepository(this);
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
        var _this = this;
        this.fromMongoToEntity = function (e) {
            e["id"] = e._id;
            delete e._id;
            return e;
        };
        this.fromMongoToEntities = function (e) {
            return e.map(_this.fromMongoToEntity);
        };
        this.collection = collection;
        this.fromJSON = fromJSON;
        this.db = db;
    }
    MongoRepository.prototype.toMongoEntity = function (e) {
        e["_id"] = e.id;
        delete e.id;
        return e;
    };
    MongoRepository.prototype.executeCommandAndCloseConn = function (cmd) {
        return cmd(this.db);
    };
    MongoRepository.prototype.getAll = function () {
        var _this = this;
        var getAllCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).find().map(_this.fromMongoToEntity).toArray()); };
        return getAllCmd(this.db);
    };
    MongoRepository.prototype.getAllBy = function (query, exclude) {
        var _this = this;
        //let getAllCmd = (db:Db) => Rx.Observable.fromPromise(db.collection(this.collection).find(query, exclude).toArray())as Rx.Observable<T[]>;
        var getAllCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).find(query, exclude).map(_this.fromMongoToEntity).toArray()); };
        return getAllCmd(this.db);
    };
    MongoRepository.prototype.getAllByWithSteps = function (query, exclude) {
        var _this = this;
        var getCursor = function (skip, limit) {
            var cursor = _this.db.collection(_this.collection).find(query, exclude).map(_this.fromMongoToEntity);
            return Rx.Observable.fromPromise(cursor.skip(skip).limit(limit).toArray());
        };
        var generateSteps = function (step) {
            var countStream = Rx.Observable.fromPromise(_this.db.collection(_this.collection).find(query, exclude).count());
            return countStream.map(function (total) {
                var lastStep = total % step;
                var numberSteps = Number.parseInt((total / step));
                var steps = _.range(0, numberSteps).map(function (skipMult) { return [skipMult * step, step]; });
                steps.push([numberSteps * step, lastStep]);
                return steps;
            })
                .flatMap(function (steps) {
                var _a;
                var cursors = steps.map(function (step) { return getCursor(step[0], step[1]); });
                return (_a = Rx.Observable).zip.apply(_a, cursors).map(function (arr) { return arr.reduce(function (a, b) { return a.concat(b); }); });
            });
        };
        return generateSteps(1000);
    };
    MongoRepository.prototype.countBy = function (query) {
        return Rx.Observable.fromPromise(this.db.collection(this.collection).find(query).count());
    };
    MongoRepository.prototype.getRangeBy = function (query, skip, limit, exclude) {
        var _this = this;
        var getCursor = function (skip, limit) {
            var cursor = _this.db.collection(_this.collection).find(query, exclude).map(_this.fromMongoToEntity);
            return Rx.Observable.fromPromise(cursor.skip(skip).limit(limit).toArray());
        };
        return getCursor(skip, limit);
    };
    MongoRepository.prototype.add = function (value) {
        var _this = this;
        var addCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).insertOne(_this.toMongoEntity(value)))
            .map(function (r) { return _this.fromMongoToEntity(value); }); }; //Checks if there was an error
        return addCmd(this.db);
    };
    MongoRepository.prototype.addMany = function (values) {
        var _this = this;
        var addCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).insertMany(values.map(function (v) { return _this.toMongoEntity(v); }))).map(function (val) { return values; }); };
        return this.executeCommandAndCloseConn(addCmd);
    };
    MongoRepository.prototype.update = function (value) {
        var _this = this;
        var updateCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).updateOne({ _id: value.id }, { $set: _this.toMongoEntity(value) }))
            .map(function (r) {
            return _this.fromMongoToEntity(value);
        }); };
        return this.executeCommandAndCloseConn(updateCmd);
    };
    MongoRepository.prototype.getById = function (id) {
        var _this = this;
        var findOne = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).findOne({ _id: id })); };
        return this.executeCommandAndCloseConn(findOne).map(function (e) { return Utils_1.MonadUtils.CreateMaybeFromNullable(e).map(function (e) { return _this.fromMongoToEntity(e); }); });
    };
    MongoRepository.prototype.getOneBy = function (query) {
        var _this = this;
        var findOneBy = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).findOne(query)); };
        return this.executeCommandAndCloseConn(findOneBy).map(function (e) { return Utils_1.MonadUtils.CreateMaybeFromNullable(e).map(function (e) { return _this.fromMongoToEntity(e); }); });
    };
    MongoRepository.prototype.remove = function (value) {
        var _this = this;
        console.error("THE NAME OF THE COLLECTION IS:" + this.collection);
        var removeCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).deleteOne({ _id: value.id })); };
        return removeCmd(this.db);
    };
    MongoRepository.prototype.removeAllBy = function (query) {
        var _this = this;
        var removeCmd = function (db) { return Rx.Observable.fromPromise(db.collection(_this.collection).deleteMany(query)); };
        return this.executeCommandAndCloseConn(removeCmd);
    };
    return MongoRepository;
}());
exports.MongoRepository = MongoRepository;
//# sourceMappingURL=ServerRepositories.js.map