"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("./Utils");
var EntityQuery_1 = require("./EntityQuery");
var Rx = __importStar(require("rxjs"));
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
        return EntityQuery_1.EntityQuery.tryGetById(this.elems, id);
    };
    InMemoryRepository.prototype.getOneBy = function (query) {
        return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    };
    InMemoryRepository.prototype.removeAllBy = function (query) {
        return this.removeAll();
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
        return Rx.Observable.of(e);
    };
    SyncRxRepository.prototype.addMany = function (entities) {
        this.repo.addMany(entities);
        return Rx.Observable.of(entities);
    };
    SyncRxRepository.prototype.remove = function (e) {
        this.repo.remove(e);
        return Rx.Observable.of(e);
    };
    SyncRxRepository.prototype.removeAll = function () {
        this.repo.removeAll();
        return Rx.Observable.of([]);
    };
    SyncRxRepository.prototype.removeAllBy = function (query) {
        this.repo.removeAllBy(query);
        return Rx.Observable.from([]);
    };
    SyncRxRepository.prototype.update = function (e) {
        this.repo.update(e);
        return Rx.Observable.of(e);
    };
    SyncRxRepository.prototype.updateAll = function (e) {
        this.repo.updateAll(e);
        return Rx.Observable.of(e);
    };
    SyncRxRepository.prototype.getAll = function () {
        var elems = this.repo.getAll();
        return Rx.Observable.of(elems);
    };
    SyncRxRepository.prototype.getAllBy = function (query) {
        var elems = this.repo.getAllBy(query);
        return Rx.Observable.of(elems);
    };
    SyncRxRepository.prototype.getById = function (id) {
        return Rx.Observable.of(this.repo.getById(id));
    };
    SyncRxRepository.prototype.getOneBy = function (query) {
        return Rx.Observable.of(this.repo.getOneBy(query));
    };
    SyncRxRepository.prototype.asInMemoryRepository = function () {
        return this.repo;
    };
    return SyncRxRepository;
}());
exports.SyncRxRepository = SyncRxRepository;
var UnitRxRepository = /** @class */ (function () {
    function UnitRxRepository(repo) {
        var _this = this;
        this.repo = repo;
        this.updateOrCreate = function (value) {
            return _this.get(value.id).flatMap(function (maybeT) { return maybeT.caseOf({
                just: function (t) { return _this.repo.update(value); },
                nothing: function () { return _this.repo.add(value).catch(function (e) { return _this.updateOrCreate(value); }); }
            }); });
        };
        this.get = function (id) { return _this.repo.getById(id); };
    }
    return UnitRxRepository;
}());
exports.UnitRxRepository = UnitRxRepository;
//# sourceMappingURL=Repository.js.map