import { expect} from "chai";
import {InMemoryRepository} from "../lib/Repository";
import {Route} from "../lib/corelib-node/Route";
import { Request, Response } from 'express';
import Socket = NodeJS.Socket;

type Foo = { id:string, title:string}


it("should be able to create a new Entity", (done)=>{
    let foo = { id: "foo:", title: "blabla" };
    let repo = new InMemoryRepository<Foo>().toReactiveRepository();
    let route = new Route(repo);
    let request : any = { body: foo, status: };
    let response : any = {};

    route.create(request, response);

    repo.getById(foo.id).onValue(f=>{
       expect(foo).eq(f);
       done();
    });
});

