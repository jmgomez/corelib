import {expect, assert} from "chai";
import {Server} from "../../lib/corelib-node/Server";
import {Route} from "../../lib/corelib-node/Route";
import {
    APIRepository, InMemoryRepository, IReactiveRepository, ReqHelper,
    SyncReactiveRepository
} from "../../lib/Repository";
import {fromJSON} from "../../lib/Mappers";
import {RequestHelperNodeImpl} from "../../lib/corelib-node/ReqHelper";
import * as querystring from "querystring";

type Foo = { id:string, title:string}

describe("Server CRUD", ()=>{
    let serverEndPoint =  "http://localhost:9000/";
    let server : Server;
    let apiRepo : APIRepository<Foo>;
    let repo : IReactiveRepository<Foo>;

    before(()=>{
        apiRepo = new APIRepository<Foo>(serverEndPoint+"foo/", fromJSON,  RequestHelperNodeImpl);
        server = new Server(9000);
        repo = new InMemoryRepository<Foo>([]).toReactiveRepository();
        let route = new Route(repo);
        server.addRoute("/foo", route);
        server.start();
    });

    after(()=>{
        server.end();
    });


    it("Should create a new entity", done => {
        let foo = { id: "foo", title: "blabla" };

        apiRepo.add(foo).onValue(v=>{
            expect(foo.title).eq(v.title);
            done();
        });

    });


    it("Should modify an existing entity", done => {
        let foo = { id: "foo", title: "blabla" };

        (repo as SyncReactiveRepository<Foo>).asInMemoryRepository().elems = [foo];

        let modifiedText = "lol";

        apiRepo.update({ id: "foo", title: modifiedText }).onValue(v=>{
            expect(v.title).eq(modifiedText);
            done();
        })

    });

    it("Should be able to retrieve an existing entity by its id", done => {
        let foo = { id: "foo", title: "blabla" };

        (repo as SyncReactiveRepository<Foo>).asInMemoryRepository().elems = [foo];

        let stream = apiRepo.getById("foo").map((f:any)=>f.value as Foo);
        stream.onValue((v)=>{
            expect(v.title).eq(foo.title);
            done();
        })
    });

    it("Should be able to query a set of entities", done => {
        let foos = [{ id: "foo", title: "lo" }, { id: "foo2", title: "query" }, { id: "foo3", title: "query" }];
        (repo as SyncReactiveRepository<Foo>).asInMemoryRepository().elems = foos;
        let query = "?"+querystring.stringify({title:"query"})
        let stream = apiRepo.getAllBy(query);
        stream.onValue((v)=>{
            expect(v.length).eq(2);
            done();
        })
    });


})