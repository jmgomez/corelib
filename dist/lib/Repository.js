"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Bacon = require("baconjs");
var Utils_1 = require("./Utils");
var EntityQuery_1 = require("./EntityQuery");
var Rx = require("rxjs/Rx");
var APIRepository = /** @class */ (function () {
    function APIRepository(endPoint, reqHelper) {
        var _this = this;
        this.removeAll = function () {
            return _this.requestHelper.makeRequest(_this.endPoint, 'delete', _this.onError.bind(_this));
        };
        this.endPoint = endPoint;
        this.requestHelper = reqHelper;
    }
    APIRepository.prototype.onError = function (r) {
        console.error(r);
        console.error(r);
    };
    APIRepository.prototype.getAll = function () {
        return this.requestHelper.makeRequest(this.endPoint, 'get', this.onError.bind(this));
    };
    APIRepository.prototype.add = function (entity) {
        return this.requestHelper.makeRequest(this.endPoint, 'post', entity, this.onError.bind(this));
    };
    APIRepository.prototype.addMany = function (entities) {
        return this.requestHelper.makeRequest(this.endPoint, 'post', entities, this.onError.bind(this));
    };
    APIRepository.prototype.update = function (entity) {
        var path = this.endPoint + entity.id;
        return this.requestHelper.makeRequest(path, 'put', entity, this.onError.bind(this));
    };
    APIRepository.prototype.remove = function (entity) {
        var path = this.endPoint + entity.id;
        return this.requestHelper.makeRequest(path, 'delete', entity, this.onError.bind(this));
    };
    APIRepository.prototype.getById = function (id) {
        var path = this.endPoint + id;
        return this.requestHelper.makeRequest(path, 'get', id, this.onError.bind(this))
            .map(function (val) { return Utils_1.MonadUtils.CreateMaybeFromNullable(val); });
    };
    APIRepository.prototype.removeAllBy = function (query) {
        return Rx.Observable.of([]);
    };
    APIRepository.prototype.getAllBy = function (query) {
        var path = this.endPoint + "getallby" + query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this));
        // throw new Error("You don't have to query from the API. The server router will handle it. In the future it will be done through GraphQL");
        // return Bacon.fromArray([]);
    };
    return APIRepository;
}());
exports.APIRepository = APIRepository;
var InMemoryRepository = /** @class */ (function () {
    function InMemoryRepository(elems) {
        this.elems = elems ? elems : [];
    }
    InMemoryRepository.prototype.add = function (e) {
        this.elems.push(e);
    };
    InMemoryRepository.prototype.addMany = function (entities) {
        var _this = this;
        entities.forEach(function (e) { return _this.add(e); });
    };
    InMemoryRepository.prototype.remove = function (e) {
        this.elems = EntityQuery_1.EntityQuery.delete(this.elems, e);
    };
    InMemoryRepository.prototype.removeAll = function () {
        this.elems = [];
    };
    InMemoryRepository.prototype.update = function (e) {
        this.elems = EntityQuery_1.EntityQuery.update(this.elems, e);
    };
    InMemoryRepository.prototype.updateAll = function (e) {
        this.elems = e;
    };
    InMemoryRepository.prototype.getAll = function () {
        return this.elems;
    };
    InMemoryRepository.prototype.getAllBy = function (query) {
        return this.elems.filter(query);
    };
    InMemoryRepository.prototype.getById = function (id) {
        console.log("Requesting by id", id, this.elems);
        return EntityQuery_1.EntityQuery.tryGetById(this.elems, id);
    };
    InMemoryRepository.prototype.getOneBy = function (query) {
        return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    };
    InMemoryRepository.prototype.removeAllBy = function (query) {
        return this.removeAll();
    };
    InMemoryRepository.prototype.toReactiveRepository = function () {
        return new SyncReactiveRepository(this);
    };
    InMemoryRepository.prototype.toRxRepository = function () {
        return new SyncRxRepository(this);
    };
    return InMemoryRepository;
}());
exports.InMemoryRepository = InMemoryRepository;
var SyncRxRepository = /** @class */ (function () {
    function SyncRxRepository(repo) {
        this.repo = repo;
    }
    SyncRxRepository.prototype.add = function (e) {
        this.repo.add(e);
        return Rx.Observable.from([e]);
    };
    SyncRxRepository.prototype.addMany = function (entities) {
        this.repo.addMany(entities);
        return Rx.Observable.from([entities]);
    };
    SyncRxRepository.prototype.remove = function (e) {
        this.repo.remove(e);
        return Rx.Observable.from([]);
    };
    SyncRxRepository.prototype.removeAll = function () {
        this.repo.removeAll();
        return Rx.Observable.from([]);
    };
    SyncRxRepository.prototype.removeAllBy = function (query) {
        this.repo.removeAllBy(query);
        return Rx.Observable.from([]);
    };
    SyncRxRepository.prototype.update = function (e) {
        this.repo.update(e);
        return Rx.Observable.from([e]);
    };
    SyncRxRepository.prototype.updateAll = function (e) {
        this.repo.updateAll(e);
        return Rx.Observable.from([e]);
    };
    SyncRxRepository.prototype.getAll = function () {
        var elems = this.repo.getAll();
        return Rx.Observable.from([elems]);
    };
    SyncRxRepository.prototype.getAllBy = function (query) {
        var elems = this.repo.getAllBy(query);
        return Rx.Observable.from([elems]);
    };
    SyncRxRepository.prototype.getById = function (id) {
        return Rx.Observable.from([this.repo.getById(id)]);
    };
    SyncRxRepository.prototype.getOneBy = function (query) {
        return Rx.Observable.from([this.repo.getOneBy(query)]);
    };
    SyncRxRepository.prototype.asInMemoryRepository = function () {
        return this.repo;
    };
    return SyncRxRepository;
}());
exports.SyncRxRepository = SyncRxRepository;
var SyncReactiveRepository = /** @class */ (function () {
    function SyncReactiveRepository(repo) {
        this.repo = repo;
    }
    SyncReactiveRepository.prototype.add = function (e) {
        this.repo.add(e);
        return Bacon.fromArray([e]);
    };
    SyncReactiveRepository.prototype.addMany = function (entities) {
        this.repo.addMany(entities);
        return Bacon.later(0, entities);
    };
    SyncReactiveRepository.prototype.remove = function (e) {
        this.repo.remove(e);
        return Bacon.fromArray([""]);
    };
    SyncReactiveRepository.prototype.removeAll = function () {
        this.repo.removeAll();
        return Bacon.fromArray([]);
    };
    SyncReactiveRepository.prototype.removeAllBy = function (query) {
        this.repo.removeAllBy(query);
        return Bacon.fromArray([]);
    };
    SyncReactiveRepository.prototype.update = function (e) {
        this.repo.update(e);
        return Bacon.fromArray([e]);
    };
    SyncReactiveRepository.prototype.updateAll = function (e) {
        this.repo.updateAll(e);
        return Bacon.fromArray([e]);
    };
    SyncReactiveRepository.prototype.getAll = function () {
        var elems = this.repo.getAll();
        return Bacon.fromArray([elems]);
    };
    SyncReactiveRepository.prototype.getAllBy = function (query) {
        var elems = this.repo.getAllBy(query);
        return Bacon.later(0, elems);
    };
    SyncReactiveRepository.prototype.getById = function (id) {
        return Bacon.later(0, this.repo.getById(id));
    };
    SyncReactiveRepository.prototype.getOneBy = function (query) {
        return Bacon.later(0, this.repo.getOneBy(query));
    };
    SyncReactiveRepository.prototype.asInMemoryRepository = function () {
        return this.repo;
    };
    return SyncReactiveRepository;
}());
exports.SyncReactiveRepository = SyncReactiveRepository;
var ReactiveFromRxRepository = /** @class */ (function () {
    function ReactiveFromRxRepository(repo) {
        this.repo = repo;
    }
    ReactiveFromRxRepository.prototype.add = function (e) {
        return Utils_1.RXUtils.toStream(this.repo.add(e));
    };
    ReactiveFromRxRepository.prototype.addMany = function (entities) {
        return Utils_1.RXUtils.toStream(this.repo.addMany(entities));
    };
    ReactiveFromRxRepository.prototype.remove = function (e) {
        return Utils_1.RXUtils.toStream(this.repo.remove(e));
    };
    ReactiveFromRxRepository.prototype.removeAll = function () {
        return Utils_1.RXUtils.toStream(this.repo.removeAll());
    };
    ReactiveFromRxRepository.prototype.removeAllBy = function (query) {
        return Utils_1.RXUtils.toStream(this.repo.removeAllBy(query));
    };
    ReactiveFromRxRepository.prototype.update = function (e) {
        return Utils_1.RXUtils.toStream(this.repo.update(e));
    };
    ReactiveFromRxRepository.prototype.updateAll = function (e) {
        return Utils_1.RXUtils.toStream(this.repo.updateAll(e));
    };
    ReactiveFromRxRepository.prototype.getAll = function () {
        return Utils_1.RXUtils.toStream(this.repo.getAll());
    };
    ReactiveFromRxRepository.prototype.getAllBy = function (query) {
        return Utils_1.RXUtils.toStream(this.repo.getAllBy(query));
    };
    ReactiveFromRxRepository.prototype.getById = function (id) {
        return Utils_1.RXUtils.toStream(this.repo.getById(id));
        ;
    };
    ReactiveFromRxRepository.prototype.getOneBy = function (query) {
        return Utils_1.RXUtils.toStream(this.repo.getOneBy(query));
    };
    ReactiveFromRxRepository.create = function (reactiveRepo) {
        return new ReactiveFromRxRepository(reactiveRepo);
    };
    return ReactiveFromRxRepository;
}());
exports.ReactiveFromRxRepository = ReactiveFromRxRepository;
var RxFromReactiveRepository = /** @class */ (function () {
    function RxFromReactiveRepository(repo) {
        this.repo = repo;
    }
    RxFromReactiveRepository.prototype.add = function (e) {
        return Utils_1.RXUtils.fromStream(this.repo.add(e));
    };
    RxFromReactiveRepository.prototype.addMany = function (entities) {
        return Utils_1.RXUtils.fromStream(this.repo.addMany(entities));
    };
    RxFromReactiveRepository.prototype.remove = function (e) {
        return Utils_1.RXUtils.fromStream(this.repo.remove(e));
    };
    RxFromReactiveRepository.prototype.removeAll = function () {
        return Utils_1.RXUtils.fromStream(this.repo.removeAll());
    };
    RxFromReactiveRepository.prototype.removeAllBy = function (query) {
        return Utils_1.RXUtils.fromStream(this.repo.removeAllBy(query));
    };
    RxFromReactiveRepository.prototype.update = function (e) {
        return Utils_1.RXUtils.fromStream(this.repo.update(e));
    };
    RxFromReactiveRepository.prototype.updateAll = function (e) {
        return Utils_1.RXUtils.fromStream(this.repo.updateAll(e));
    };
    RxFromReactiveRepository.prototype.getAll = function () {
        return Utils_1.RXUtils.fromStream(this.repo.getAll());
    };
    RxFromReactiveRepository.prototype.getAllBy = function (query) {
        return Utils_1.RXUtils.fromStream(this.repo.getAllBy(query));
    };
    RxFromReactiveRepository.prototype.getById = function (id) {
        return Utils_1.RXUtils.fromStream(this.repo.getById(id));
        ;
    };
    RxFromReactiveRepository.prototype.getOneBy = function (query) {
        return Utils_1.RXUtils.fromStream(this.repo.getOneBy(query));
    };
    RxFromReactiveRepository.create = function (reactiveRepo) {
        return new RxFromReactiveRepository(reactiveRepo);
    };
    return RxFromReactiveRepository;
}());
exports.RxFromReactiveRepository = RxFromReactiveRepository;
//# sourceMappingURL=Repository.js.map