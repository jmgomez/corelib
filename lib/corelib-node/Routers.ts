import * as TsMonad from 'tsmonad';
import {IReactiveRepository, IRepository } from "../Repository";

import {EntityQuery} from "../EntityQuery";
import {BaconUtils, DateUtils, MonadUtils, NumberUtils, Period} from "../Utils";

import EventStream = Bacon.EventStream;
import {Entity} from "../Entity";
import {NodeUtils} from "./NodeUtils";
import {Router, Request, Response, NextFunction} from "express";
import {RepositoryQuery} from "../RepositoryQuery";



export class Route<T extends Entity>{
    repo : IReactiveRepository<T>;
    private constructor(repo:IReactiveRepository<T>){
        this.repo = repo;

    }

    configureRouter<T extends Entity>() : Router{
        let router = Router();
        router.route("/").get(this.getAll).post(this.create).options(NodeUtils.okOptions);
        router.route("/:id").all(this.setEntities).get(this.getById).put(this.update).delete(this.delete).options(NodeUtils.okOptions);
        router.route("/deleteall").get(this.deleteAllBy).options(NodeUtils.okOptions);
        router.route("/getallby").get(this.getAllBy).options(NodeUtils.okOptions);
        return router;
    }

    getEntities = (req:any)=> <Entity[]>req['entities'];
    setEntities = (req:Request, res:Response, next: NextFunction) => {
        this.repo.getAll().onValue(entities=> {
            EntityQuery.tryGetById(entities, req.params.id)
                .caseOf({
                    just: e => {
                        (req as any)['entities'] = entities;
                        next();
                    },
                    nothing: () => {
                        res.sendStatus(404);
                    }
                });
        });
    };

    getAll = (req:Request, res:Response) => {
        this.repo.getAll().onValue(entities=> {
            return res.status(200).json(entities);
        })
    };

    create = (req:Request, res:Response) =>{  //one or more
        let stream : EventStream<any, any> = Array.isArray(req.body) ?
            this.repo.addMany(req.body)
            : this.repo.add(req.body);
        stream.onValue(e=>res.status(201).json(req.body));
    };

    getAllBy = (req:Request, res:Response) =>{
        let query = req.query;
        let stream = this.repo.getAllBy(RepositoryQuery.toMongoQuery(query));
        stream.onValue(v=> res.status(200).json(v));
        stream.onError(e=> res.status(500).send(e));
    };

    deleteAllBy = (req:Request, res:Response) =>{
        let query = req.query;
        let stream = this.repo.removeAllBy(RepositoryQuery.toMongoQuery(query));
        stream.onValue(v=> res.status(200).json(v));
        stream.onError(e=> res.status(500).send(e));
    };

    getById = (req:Request, res:Response) =>{
        let id = req.params.id;
        let entity = EntityQuery.getById(this.getEntities(req), id) as T;
        res.status(200).json(entity);
    };

    update = (req:Request, res:Response) =>{
        this.repo.update(req.body).onValue((e)=>
            res.status(200).json(e));
    };

    delete = (req:Request, res:Response) =>{
        let id = req.params.id;
        let entity = EntityQuery.getById(this.getEntities(req), id) as T;
        this.repo.remove(entity).onValue(()=>res.sendStatus(200));
    };

}

export function routerFor<T extends Entity>(repo:IReactiveRepository<T>, fromJSON:(json:any)=>T) : Router{
    let router = Router();
    let getEntitities = (req:any)=> <Entity[]>req['entities'];

    router.route("/")
        .get((req, res)=>
            repo.getAll().onValue(entities=> {
                return res.status(200).json(entities);
            })
        )
        .post((req, res)=>{
            let newEntity = fromJSON(req.body);
            repo.add(newEntity)
                .onValue(e=>res.status(201).json(newEntity));
        });

    router.route("/:id")
        .all((req, res, next)=>{
            repo.getAll().onValue(entities=> {
                EntityQuery.tryGetById(entities, req.params.id)
                    .caseOf({
                        just: e => {
                            (req as any)['entities'] = entities;
                            next();
                        },
                        nothing: () => {
                            res.sendStatus(404);
                        }
                });
            });
        })
        .get((req,res)=>{
            let id = req.params.id;
            let entity = EntityQuery.getById(getEntitities(req), id) as T;
            res.status(200).json(entity);
        })
        .put((req,res)=>{
            let updatedEntity = fromJSON(req.body);
            repo.update(updatedEntity).onValue((e)=>
                res.status(200).json(e));

        })
        .options(NodeUtils.okOptions)
        .delete((req, res)=>{
            let id = req.params.id;
            let entity = EntityQuery.getById(getEntitities(req), id) as T;
            repo.remove(entity).onValue(()=>res.sendStatus(200));

        });
    return router;
}






