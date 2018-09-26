"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Repository_1 = require("../Repository");
var Route_1 = require("../corelib-node/Route");
it("should be able to create a new Entity", function (done) {
    var foo = { id: "foo:", title: "blabla" };
    var repo = new Repository_1.InMemoryRepository().toRxRepository();
    var route = new Route_1.Route(repo);
    var request = { body: foo, };
    var response = { status: function () { return { json: function () { } }; } };
    route.create(request, response);
    repo.getById(foo.id).map(function (f) { return f.value; }).subscribe(function (f) {
        chai_1.expect(foo).eq(f);
        done();
    });
});
it("should be able to modify a entity", function (done) {
    var foo = { id: "foo:", title: "blabla" };
    var modifiedText = "lol";
    var repo = new Repository_1.InMemoryRepository([foo]).toRxRepository();
    var route = new Route_1.Route(repo);
    var request = { body: { id: "foo:", title: modifiedText }, params: { id: foo.id }, entities: [foo] };
    var response = { status: function () { return { json: function (e) { console.log(e); } }; } };
    route.update(request, response);
    repo.getById(foo.id).map(function (f) { return f.value; }).subscribe(function (f) {
        chai_1.expect(f.title).eq(modifiedText);
        done();
    });
});
//# sourceMappingURL=RouterTest.js.map