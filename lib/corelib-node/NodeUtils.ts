import { Request, Response } from 'express';

export class NodeUtils {
    static okOptions (req:Request, res:Response)    {
            res.sendStatus(200);
    }
}