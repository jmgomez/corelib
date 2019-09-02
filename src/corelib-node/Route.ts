import * as TsMonad from 'tsmonad';
import * as R from 'ramda'
import { IRepository, IRxRepository} from "../Repository";

import {EntityQuery} from "../EntityQuery";
import { DateUtils, MonadUtils, NumberUtils, Period} from "../Utils";

import {Entity} from "../Entity";
import {NodeUtils} from "./NodeUtils";
import {Router, Request, Response, NextFunction} from "express";
import {RepositoryQuery} from "../RepositoryQuery";



export class Route<T extends Entity> {
    repo: IRxRepository<T>;

    constructor(repo: IRxRepository<T>) {
        this.repo = repo;

    }

    configureRouter<T extends Entity>(): Router {
        let router = Router();
        router.route("/").get(this.getAll).post(this.create).delete(this.deleteAll).options(NodeUtils.okOptions);
        router.route("/deleteall").get(this.deleteAllBy).options(NodeUtils.okOptions);
        router.route("/deleteallby").delete(this.deleteAllBy).options(NodeUtils.okOptions);
        router.route("/getallby").get(this.getAllBy).options(NodeUtils.okOptions);
        router.route("/:id").all(this.setEntities).get(this.getById).put(this.update).delete(this.delete).options(NodeUtils.okOptions);
        return router;
    }

    getEntities = (req: any) => <Entity[]>req['entities'];
    setEntities = (req: Request, res: Response, next: NextFunction) => {
        this.repo.getAll().subscribe(entities => {
            (req as any)['entities'] = entities;
            next();
        });
    };

    getAll = (req: Request, res: Response) => {
        this.repo.getAll().subscribe(entities => {
            return res.status(200).json(entities);
        })
    };

    deleteAll = (req: Request, res: Response) => {
        this.repo.removeAll().subscribe(entities => {
            return res.status(200);
        })
    };

    create = (req: Request, res: Response) => {  //one or more
         Array.isArray(req.body) ?
              this.repo.addMany(req.body).subscribe(NodeUtils.writeResponse(res, 201), NodeUtils.writeError(res))
            : this.repo.add(req.body).subscribe(NodeUtils.writeResponse(res, 201), NodeUtils.writeError(res));
    };

    getAllBy = (req: Request, res: Response) => {
        let query = req.query;
        this.repo.getAllBy(RepositoryQuery.fromQueryStringTo(query, this.repo))
            .subscribe(NodeUtils.writeResponse(res), NodeUtils.writeError(res));
    };


    deleteAllBy = (req: Request, res: Response) => {
        let query = req.query;
        this.repo.removeAllBy(RepositoryQuery.fromQueryStringTo(query, this.repo))
        .subscribe(NodeUtils.writeResponse(res), NodeUtils.writeError(res));
    };

    getById = (req: Request, res: Response)  => {
        console.log("GETTING BY ID")
        let partialGetOrNotFound =  (maybeEntity:TsMonad.Maybe<T>) => this.executeOrNotFound(maybeEntity, res, NodeUtils.writeResponse(res));
        R.compose(partialGetOrNotFound, this.tryGetByIdParam)(req)
    };

    update = (req: Request, res: Response) => {
        let updateFromRepo = (e:T) => this.repo.update(req.body).subscribe(NodeUtils.writeResponse(res), NodeUtils.writeError(res));
        let partialGetOrNotFound =  (maybeEntity:TsMonad.Maybe<T>) => this.executeOrNotFound(maybeEntity, res, updateFromRepo);
        R.compose(partialGetOrNotFound, this.tryGetByIdParam)(req);
    };


    delete = (req: Request, res: Response) => {
        let deleteFromRepo = (e:T) => this.repo.remove(e).subscribe(NodeUtils.writeResponse(res), NodeUtils.writeError(res));
        let partialGetOrNotFound =  (maybeEntity:TsMonad.Maybe<T>) => this.executeOrNotFound(maybeEntity, res, deleteFromRepo);
        R.compose(partialGetOrNotFound, this.tryGetByIdParam)(req);
    };



    private executeOrNotFound = (maybeEntity:TsMonad.Maybe<T>, res:Response, getEntity:(e:T)=>void) => {
        maybeEntity.caseOf({
            just: (e) => {
                getEntity(e);
            },
            nothing: () => {
                res.sendStatus(404);
            }
        });
    };

    private tryGetByIdParam = (req:Request) => {
        let id = req.params.id;
        return EntityQuery.tryGetById(this.getEntities(req), id);
    };

}




