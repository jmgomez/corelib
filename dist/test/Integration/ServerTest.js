"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Server_1 = require("../../lib/corelib-node/Server");
var Route_1 = require("../../lib/corelib-node/Route");
var Repository_1 = require("../../lib/Repository");
var ReqHelper_1 = require("../../lib/corelib-node/ReqHelper");
var querystring = require("querystring");
describe("Server CRUD", function () {
    var serverEndPoint = "http://localhost:9000/";
    var server;
    var apiRepo;
    var repo;
    before(function () {
        apiRepo = new Repository_1.APIRepository(serverEndPoint + "foo/", ReqHelper_1.RequestHelperNodeImpl);
        server = new Server_1.Server(9000);
        repo = new Repository_1.InMemoryRepository([]).toRxRepository();
        var route = new Route_1.Route(repo);
        server.addRoute("/foo", route);
        server.start();
    });
    after(function () {
        server.end();
    });
    it("Should create a new entity", function (done) {
        var foo = { id: "foo", title: "blabla" };
        apiRepo.add(foo).subscribe(function (v) {
            chai_1.expect(foo.title).eq(v.title);
            done();
        });
    });
    it("Should modify an existing entity", function (done) {
        var foo = { id: "foo", title: "blabla" };
        repo.asInMemoryRepository().elems = [foo];
        var modifiedText = "lol";
        apiRepo.update({ id: "foo", title: modifiedText }).subscribe(function (v) {
            chai_1.expect(v.title).eq(modifiedText);
            done();
        });
    });
    it("Should be able to retrieve an existing entity by its id", function (done) {
        var foo = { id: "foo", title: "blabla" };
        repo.asInMemoryRepository().elems = [foo];
        var stream = apiRepo.getById("foo").map(function (f) { return f.value; });
        stream.subscribe(function (v) {
            chai_1.expect(v.title).eq(foo.title);
            done();
        });
    });
    it("Should be able to query a set of entities", function (done) {
        var foos = [{ id: "foo", title: "lo" }, { id: "foo2", title: "query" }, { id: "foo3", title: "query" }];
        repo.asInMemoryRepository().elems = foos;
        var query = "?" + querystring.stringify({ title: "query" });
        var stream = apiRepo.getAllBy(query);
        stream.subscribe(function (v) {
            chai_1.expect(v.length).eq(2);
            done();
        });
    });
});
//# sourceMappingURL=ServerTest.js.map