import * as TsMonad from 'tsmonad';
import {IReactiveRepository, IRepository } from "../Repository";

import {EntityQuery} from "../EntityQuery";
import {BaconUtils, DateUtils, MonadUtils, NumberUtils, Period} from "../Utils";

import EventStream = Bacon.EventStream;
import {Entity} from "../Entity";
import {NodeUtils} from "./NodeUtils";
import {Router} from "express";





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






