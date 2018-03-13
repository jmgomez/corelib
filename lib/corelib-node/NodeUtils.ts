import { Request, Response } from 'express';

export class NodeUtils {
    static okOptions = (req:Request, res:Response) =>   {
            res.sendStatus(200);
    };

    static writeResponse = (res:Response, code?:number) => (val:any) => { res.status(code?code:200).json(val) };

    static writeError =  (res:Response) => NodeUtils.writeResponse(res, 500);


}