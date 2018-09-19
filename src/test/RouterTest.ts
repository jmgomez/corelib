import { expect} from "chai";
import {InMemoryRepository} from "../Repository";
import {Route} from "../corelib-node/Route";
import { Request, Response } from 'express';
import Socket = NodeJS.Socket;

type Foo = { id:string, title:string}


it("should be able to create a new Entity", (done)=>{
    let foo = { id: "foo:", title: "blabla" };
    let repo = new InMemoryRepository<Foo>().toRxRepository();
    let route = new Route(repo);
    let request : any = { body: foo,  };
    let response : any = { status: ()=>{ return {json:()=>{}}} };

    route.create(request, response);

    repo.getById(foo.id).map((f:any)=>f.value).subscribe(f=>{

       expect(foo).eq(f);
       done();
    });
});


it("should be able to modify a entity", (done)=>{
    let foo = { id: "foo:", title: "blabla" };
    let modifiedText = "lol";
    let repo = new InMemoryRepository<Foo>([foo]).toRxRepository();
    let route = new Route(repo);
    let request : any = { body: { id: "foo:", title: modifiedText }, params: { id: foo.id}, entities: [foo]  };
    let response : any = { status: ()=>{ return {json:(e)=>{console.log(e)}}} };

    route.update(request, response);


    repo.getById(foo.id).map((f:any)=>f.value).subscribe(f=>{
        expect(f.title).eq(modifiedText);
        done();
    });
});
