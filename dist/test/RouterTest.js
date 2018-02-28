"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var Repository_1 = require("../lib/Repository");
var Route_1 = require("../lib/corelib-node/Route");
it("should be able to create a new Entity", function (done) {
    var foo = { id: "foo:", title: "blabla" };
    var repo = new Repository_1.InMemoryRepository().toReactiveRepository();
    var route = new Route_1.Route(repo);
    var request = { body: foo, status:  };
    var response = {};
    route.create(request, response);
    repo.getById(foo.id).onValue(function (f) {
        chai_1.expect(foo).eq(f);
        done();
    });
});
//# sourceMappingURL=RouterTest.js.map