// import { SyncReactiveRepository } from '../../Repository';
// import {expect, assert} from "chai";
// import {Server} from "../../corelib-node/Server";
// import {Route} from "../../corelib-node/Route";
// import {
//     APIRepository, InMemoryRepository, IRxRepository, ReqHelper,
//     } from "../../Repository";
// import {fromJSON} from "../../Mappers";
// import {RequestHelperNodeImpl} from "../../corelib-node/ReqHelper";
// import * as querystring from "querystring";
// type Foo = { id:string, title:string}
// describe("Server CRUD", ()=>{
//     let serverEndPoint =  "http://localhost:9000/";
//     let server : Server;
//     let apiRepo : APIRepository<Foo>;
//     let repo : IRxRepository<Foo>;
//     before(()=>{
//         apiRepo = new APIRepository<Foo>(serverEndPoint+"foo/",  RequestHelperNodeImpl);
//         server = new Server(9000);
//         repo = new InMemoryRepository<Foo>([]).toRxRepository();
//         let route = new Route(repo);
//         server.addRoute("/foo", route);
//         server.start();
//     });
//CONSTRUCT A SYNC RXREPISUITORY
//     after(()=>{
//         server.end();
//     });
//     it("Should create a new entity", done => {
//         let foo = { id: "foo", title: "blabla" };
//         apiRepo.add(foo).subscribe(v=>{
//             expect(foo.title).eq(v.title);
//             done();
//         });
//     });
//     it("Should modify an existing entity", done => {
//         let foo = { id: "foo", title: "blabla" };
//         (<SyncReactiveRepository<Foo>> (repo as any)).asInMemoryRepository().elems = [foo];
//         let modifiedText = "lol";
//         apiRepo.update({ id: "foo", title: modifiedText }).subscribe(v=>{
//             expect(v.title).eq(modifiedText);
//             done();
//         })
//     });
//     it("Should be able to retrieve an existing entity by its id", done => {
//         let foo = { id: "foo", title: "blabla" };
//         (<SyncReactiveRepository<Foo>> (repo as any)).asInMemoryRepository().elems = [foo];
//         let stream = apiRepo.getById("foo").map((f:any)=>f.value as Foo);
//         stream.subscribe((v)=>{
//             expect(v.title).eq(foo.title);
//             done();
//         })
//     });
//     it("Should be able to query a set of entities", done => {
//         let foos = [{ id: "foo", title: "lo" }, { id: "foo2", title: "query" }, { id: "foo3", title: "query" }];
//         (<SyncReactiveRepository<Foo>> (repo as any)).asInMemoryRepository().elems = foos;
//         let query = "?"+querystring.stringify({title:"query"})
//         let stream = apiRepo.getAllBy(query);
//         stream.subscribe((v)=>{
//             expect(v.length).eq(2);
//             done();
//         })
//     });
// })
//# sourceMappingURL=ServerTest.js.map