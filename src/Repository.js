Object.defineProperty(exports, "__esModule", { value: true });
const Bacon = require("baconjs");
const Utils_1 = require("./Utils");
const EntityQuery_1 = require("./EntityQuery");
class APIRepository {
    constructor(endPoint, fromJSON, reqHelper) {
        this.endPoint = endPoint;
        this.fromJSON = fromJSON;
        this.requestHelper = reqHelper;
    }
    onError(r) {
        console.error(r);
    }
    getAll() {
        return this.requestHelper.makeRequest(this.endPoint, 'get', this.onError.bind(this)).map(vals => vals.map(this.fromJSON));
    }
    add(entity) {
        return this.requestHelper.makeRequest(this.endPoint, 'post', entity, this.onError.bind(this)).map(this.fromJSON);
    }
    addMany(entities) {
        return this.requestHelper.makeRequest(this.endPoint, 'post', entities, this.onError.bind(this)).map(val => val.map((v) => this.fromJSON));
    }
    update(entity) {
        let path = this.endPoint + entity.id;
        return this.requestHelper.makeRequest(path, 'put', entity, this.onError.bind(this)).map(this.fromJSON);
    }
    remove(entity) {
        let path = this.endPoint + entity.id;
        return this.requestHelper.makeRequest(path, 'delete', entity, this.onError.bind(this));
    }
    getById(id) {
        let path = this.endPoint + id;
        return this.requestHelper.makeRequest(path, 'get', id, this.onError.bind(this))
            .map(val => Utils_1.MonadUtils.CreateMaybeFromNullable(val));
    }
    removeAllBy(query) {
        return Bacon.fromArray([]);
    }
    getAllBy(query) {
        let path = this.endPoint + "getallby" + query;
        return this.requestHelper.makeRequest(path, 'get', {}, this.onError.bind(this));
        // throw new Error("You don't have to query from the API. The server router will handle it. In the future it will be done through GraphQL");
        // return Bacon.fromArray([]);
    }
}
exports.APIRepository = APIRepository;
class InMemoryRepository {
    constructor(elems) {
        this.elems = elems ? elems : [];
    }
    add(e) {
        this.elems.push(e);
    }
    addMany(entities) {
        entities.forEach(e => this.add(e));
    }
    remove(e) {
        this.elems = EntityQuery_1.EntityQuery.delete(this.elems, e);
    }
    removeAll() {
        this.elems = [];
    }
    update(e) {
        this.elems = EntityQuery_1.EntityQuery.update(this.elems, e);
    }
    updateAll(e) {
        this.elems = e;
    }
    getAll() {
        return this.elems;
    }
    getAllBy(query) {
        return this.elems;
    }
    getById(id) {
        console.log("Requesting by id", id, this.elems);
        return EntityQuery_1.EntityQuery.tryGetById(this.elems, id);
    }
    getOneBy(query) {
        return Utils_1.MonadUtils.CreateMaybeFromFirstElementOfAnArray(this.getAllBy(query));
    }
    removeAllBy(query) {
        return this.removeAll();
    }
}
exports.InMemoryRepository = InMemoryRepository;
class SyncReactiveRepository {
    constructor(repo) {
        this.repo = repo;
    }
    add(e) {
        this.repo.add(e);
        return Bacon.fromArray([e]);
    }
    addMany(entities) {
        this.repo.addMany(entities);
        return Bacon.later(0, entities);
    }
    remove(e) {
        this.repo.remove(e);
        return Bacon.fromArray([""]);
    }
    removeAll() {
        this.repo.removeAll();
        return Bacon.fromArray([]);
    }
    removeAllBy(query) {
        this.repo.removeAllBy(query);
        return Bacon.fromArray([]);
    }
    update(e) {
        this.repo.update(e);
        return Bacon.fromArray([e]);
    }
    updateAll(e) {
        this.repo.updateAll(e);
        return Bacon.fromArray([e]);
    }
    getAll() {
        let elems = this.repo.getAll();
        return Bacon.fromArray([elems]);
    }
    getAllBy(query) {
        let elems = this.repo.getAllBy(query);
        return Bacon.later(0, elems);
    }
    getById(id) {
        return Bacon.later(0, this.repo.getById(id));
    }
    getOneBy(query) {
        return Bacon.later(0, this.repo.getOneBy(query));
    }
}
exports.SyncReactiveRepository = SyncReactiveRepository;
//# sourceMappingURL=Repository.js.map