"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Server_1 = require("../../lib/corelib-node/Server");
var Route_1 = require("../../lib/corelib-node/Route");
var Repository_1 = require("../../lib/Repository");
var Mappers_1 = require("../../lib/Mappers");
var ReqHelper_1 = require("../../lib/corelib-node/ReqHelper");
describe("Server CRUD", function () {
    var serverEndPoint = "http://localhost:9000/";
    var server;
    var apiRepo;
    var repo;
    before(function () {
        apiRepo = new Repository_1.APIRepository(serverEndPoint + "foo/", Mappers_1.fromJSON, ReqHelper_1.RequestHelperNodeImpl);
        server = new Server_1.Server(9000);
        repo = new Repository_1.InMemoryRepository([]).toReactiveRepository();
        var route = new Route_1.Route(repo);
        server.addRoute("/foo", route);
        server.start();
    });
    after(function () {
        server.end();
    });
    it("Should create a new entity", function (done) {
        var foo = { id: "foo", title: "blabla" };
        apiRepo.add(foo).onValue(function (v) {
            chai_1.expect(foo.title).eq(v.title);
            done();
        });
    });
    it.only("Should modify an existing entity", function (done) {
        var foo = { id: "foo", title: "blabla" };
        repo.asInMemoryRepository().elems = [foo];
        var modifiedText = "lol";
        apiRepo.update({ id: "foo", title: modifiedText }).onValue(function (v) {
            chai_1.expect(v.title).eq(modifiedText);
            done();
        });
    });
});
//# sourceMappingURL=ServerTest.js.map